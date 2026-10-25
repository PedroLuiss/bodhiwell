<?php

namespace App\Services;

use App\Entity\Payment;
use App\Entity\Transaction;
use App\Entity\Booking;
use App\Enum\PaymentStatusEnum;
use App\Enum\TransactionTypeEnum;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Request;
use Ramsey\Uuid\Uuid;

class WebhookProcessor
{
    public function __construct(
        private EntityManagerInterface $em,
        private PaymentService $paymentService,
        private WalletService $walletService,
        private LoggerInterface $logger,
        private string $webhookSecret
    ) {}

    public function handleRequest(Request $request): array
    {
        $raw = $request->getContent();
        $headers = $request->headers->all();

        $correlationId = bin2hex(random_bytes(8));
        $this->logger->info('Webhook received', [
            'correlationId' => $correlationId,
            'path' => $request->getPathInfo(),
        ]);

        if (!$this->isValidSignature($raw, $headers)) {
            $this->logger->warning('Plexo webhook invalid signature', ['headers' => $this->maskHeaders($headers), 'correlationId' => $correlationId]);
            return ['status' => 401, 'message' => 'Invalid signature'];
        }

        $data = json_decode($raw, true);
        if (!is_array($data)) {
            $this->logger->warning('Plexo webhook invalid json', []);
            return ['status' => 400, 'message' => 'Invalid JSON'];
        }

        $dataForPeek = json_decode($raw, true);
        if (!is_array($dataForPeek)) {
            $this->logger->warning('Plexo webhook invalid json', []);
            return ['status' => 400, 'message' => 'Invalid JSON'];
        }

        $eventIdPeek = $dataForPeek['event_id'] ?? $dataForPeek['id'] ?? null;
        if ($eventIdPeek) {
            $existing = $this->em->getRepository(\App\Entity\Transaction::class)
                ->findOneBy(['idempotencyKey' => $eventIdPeek]);
            if ($existing) {
                $this->logger->info('Duplicate webhook received', ['eventId' => $eventIdPeek, 'correlationId' => $correlationId]);
                return ['status' => 200, 'message' => 'duplicate'];
            }
        }

        try {
            $this->em->beginTransaction();
            $result = $this->processEvent($dataForPeek, $raw, $headers, $correlationId);
            $this->em->commit();
            return ['status' => 200, 'message' => $result];
        } catch (\Throwable $e) {
            $this->em->rollback();
            $this->logger->error('Plexo webhook processing failed', ['error' => $e->getMessage(), 'payload' => $this->maskSensitive($data), 'correlationId' => $correlationId]);
            return ['status' => 500, 'message' => 'processing error'];
        }
    }

    private function isValidSignature(string $rawBody, array $headers): bool
    {
        $sigHeader = 'x-plexo-signature';
        $tsHeader  = 'x-plexo-timestamp';

        $value = $headers[$sigHeader][0] ?? $headers[$sigHeader] ?? null;
        if (!$value) {
            return false;
        }

        $provided = is_array($value) ? ($value[0] ?? '') : (string) $value;
        $provided = trim($provided);
        if (str_starts_with($provided, 'sha256=')) {
            $provided = substr($provided, 7);
        }

        $tsVal = $headers[$tsHeader][0] ?? $headers[$tsHeader] ?? null;
        if ($tsVal !== null) {
            $ts = (int) (is_array($tsVal) ? ($tsVal[0] ?? 0) : $tsVal);
            if ($ts <= 0 || abs(time() - $ts) > 300) {
                return false;
            }
        }

        $secret = (string) $this->webhookSecret;
        $expectedHex = hash_hmac('sha256', $rawBody, (string) $secret);
        return hash_equals($expectedHex, $provided);
    }

    private function processEvent(array $data, string $rawPayload, array $headers, string $correlationId): string
    {
        $eventId = $data['event_id'] ?? $data['id'] ?? null;
        $plexoPaymentId = $data['data']['payment_id'] ?? $data['data']['id'] ?? $data['payment_id'] ?? null;
        $status = strtoupper($data['data']['status'] ?? $data['status'] ?? '');

        if (!$eventId || !$plexoPaymentId || !$status) {
            $this->logger->warning('Plexo webhook missing fields', ['payload' => $data]);
            throw new \RuntimeException('Missing required fields');
        }

        $payment = $this->em->getRepository(Payment::class)
            ->findOneBy(['plexoPaymentId' => $plexoPaymentId]);

        if (!$payment) {
            $this->logger->warning('Plexo webhook payment not found', ['plexoPaymentId' => $plexoPaymentId, 'correlationId' => $correlationId]);
            throw new \RuntimeException('Payment not found');
        }

        $tx = new Transaction();
        $tx->setUid(Uuid::uuid4()->toString());
        $tx->setPayment($payment);
        $tx->setType($this->mapStatusToTxType($status));

        $initialPayload = [
            'correlationId' => $correlationId,
            'headers' => $this->maskHeaders($headers),
            'body' => $this->maskSensitive($data),
            'raw' => $rawPayload,
            'response' => [
                'status' => 202,
                'message' => 'accepted',
            ],
        ];

        $tx->setPayload($initialPayload);
        $tx->setIdempotencyKey($eventId);
        $tx->setCreatedAt(new \DateTimeImmutable());

        try {
            $this->em->persist($tx);
            $this->em->flush();
        } catch (\Doctrine\DBAL\Exception\UniqueConstraintViolationException $e) {
            $this->logger->info('Plexo webhook duplicate event ignored (unique constraint)', ['eventId' => $eventId, 'correlationId' => $correlationId]);
            return 'duplicate';
        }

        $newStatusEnum = $this->mapPlexoStatusToEnum($status);
        if ($newStatusEnum === null) {
            $this->logger->info('Plexo webhook status ignored', ['status' => $status, 'correlationId' => $correlationId]);

            // Update tx response to ignored
            $tx->setPayload(array_merge($tx->getPayload() ?? [], ['response' => ['status' => 200, 'message' => 'ignored_status']]));
            $this->em->persist($tx);
            $this->em->flush();

            return 'ignored_status';
        }

        $this->paymentServiceUpdate($payment, $newStatusEnum);

        /* Legacy logic disabled for BD-537
        if (in_array($newStatusEnum, [PaymentStatusEnum::CAPTURED, PaymentStatusEnum::PARTIALLY_CAPTURED], true)) {
            $bookingRaw = $payment->getBooking();
            $booking = $bookingRaw instanceof Booking
                ? $bookingRaw
                : $this->em->getRepository(Booking::class)->find((int)$bookingRaw);

            $professional = null;
            if ($booking instanceof Booking && method_exists($booking, 'getProfessionalUser')) {
                $professional = $booking->getProfessionalUser();
            }

            if ($professional) {
                try {
                    $this->walletService->creditWallet($professional, $payment);
                } catch (\Throwable $e) {
                    $this->logger->error('Webhook creditWallet failed', [
                        'paymentUid' => $payment->getUid(),
                        'bookingId' => $booking instanceof Booking ? $booking->getId() : $bookingRaw,
                        'err' => $e->getMessage(),
                    ]);
                }
            } else {
                $this->logger->warning('Professional not found for captured payment', [
                    'paymentUid' => $payment->getUid(),
                    'bookingRef' => $bookingRaw,
                ]);
            }
        }
        */

        $tx->setPayload(array_merge($tx->getPayload() ?? [], ['response' => ['status' => 200, 'message' => 'processed']]));
        $this->em->persist($tx);
        $this->em->flush();

        return 'processed';
    }

    private function maskSensitive(array $payload): array
    {
        $sensitiveKeys = ['card_number', 'cvv', 'pan', 'token', 'authorization'];
        array_walk_recursive($payload, function (&$value, $key) use ($sensitiveKeys) {
            if (in_array(strtolower((string)$key), $sensitiveKeys, true)) {
                $value = '***MASKED***';
            }
        });
        return $payload;
    }

    private function maskHeaders(array $headers): array
    {
        $blocked = ['authorization', 'x-api-key'];
        $out = [];
        foreach ($headers as $k => $v) {
            $lk = strtolower((string)$k);
            $out[$k] = in_array($lk, $blocked, true) ? ['***'] : $v;
        }
        return $out;
    }

    private function mapStatusToTxType(string $status): TransactionTypeEnum
    {
        return match ($status) {
            'INIT' => TransactionTypeEnum::INIT,
            'AUTHORIZED', 'AUTH' => TransactionTypeEnum::AUTH,
            'CAPTURED', 'CAPTURE' => TransactionTypeEnum::CAPTURE,
            'REJECTED', 'REJECT' => TransactionTypeEnum::REJECT,
            'REFUNDED', 'REFUND' => TransactionTypeEnum::REFUND,
            default => TransactionTypeEnum::INIT,
        };
    }

    private function mapPlexoStatusToEnum(string $status): ?PaymentStatusEnum
    {
        return match ($status) {
            'CAPTURED', 'CAPTURE' => PaymentStatusEnum::CAPTURED,
            'AUTHORIZED', 'AUTH' => PaymentStatusEnum::AUTHORIZED,
            'REJECTED', 'REJECT' => PaymentStatusEnum::REJECTED,
            'REFUNDED', 'REFUND' => PaymentStatusEnum::REFUNDED,
            default => null,
        };
    }

    private function paymentServiceUpdate(Payment $payment, PaymentStatusEnum $status): void
    {
        $this->paymentService->updatePaymentStatus($payment, $status);
    }
}
