<?php

namespace App\Services;

use App\Event\PaymentStatusChangedEvent;
use App\Entity\Booking;
use App\Entity\Payment;
use App\Entity\Transaction;
use App\Enum\PaymentStatusEnum;
use App\Enum\TransactionTypeEnum;
use App\Policy\DomainPolicy;
use App\Enum\BookingEnum;
use App\Services\Notification\NotificationManager;
use App\Enum\NotificationTypeEnum;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Ramsey\Uuid\Uuid;
use Symfony\Contracts\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use App\Mailer\BookingMailer;

final class PaymentService
{
    public function __construct(
        private EntityManagerInterface $em,
        private DomainPolicy $domainpolicy,
        private WalletService $walletService,
        private LoggerInterface $logger,
        private EventDispatcherInterface $eventDispatcher,
        private HttpClientInterface $httpClient,
        private NotificationManager $notificationManager,
        private BookingMailer $bookingMailer,
        private array $paymentAuthorizer,
        #[Autowire('%payment_authorizer%')]
        private bool $skipDomainPolicy = false,
    ) {}

    public function initiatePayment(Booking $booking, float $amount, string $currency, ?string $idempotencyKey = null, ?string $paymentMethod = null): array
    {
        if (!$this->skipDomainPolicy) {
            $this->domainpolicy->assertBookingEligible($booking);
            $this->domainpolicy->assertValidAmount((int) round($amount * 100), $currency);
        }

        if ($idempotencyKey !== null) {
            $existingTx = $this->em->getRepository(Transaction::class)
                ->findOneBy(['idempotencyKey' => $idempotencyKey]);

            if ($existingTx) {
                $existingPayment = $existingTx->getPayment();
                if ($existingPayment && $existingPayment->getBooking()?->getId() === $booking->getId()) {
                    return [
                        'payment' => $existingPayment,
                        'payment_url' => $existingTx->getPayload()['payment_url'] ?? null,
                    ];
                }
            }
        }

        $payment = new Payment();
        $payment->setUid(bin2hex(random_bytes(16)));
        $payment->setBooking($booking);
        $payment->setAmount($amount);
        $payment->setCurrency($currency);
        $payment->setPaymentMethod($paymentMethod);
        $payment->setStatus(PaymentStatusEnum::INITIATED);
        $payment->setCreatedAt(new \DateTimeImmutable());

        $this->em->persist($payment);

        try {
            $this->notificationManager->notifyUser(
                $booking->getPatientUser(),
                NotificationTypeEnum::PAYMENT,
                'Pago Iniciado',
                'Has iniciado el proceso de pago. (Estado: Iniciado).',
                ['booking_uid' => $booking->getUid()]
            );

            $this->bookingMailer->sendBookingInitiatedPayment($booking);
        } catch (\Throwable $e) {
            $this->logger->error('Failed to send pending payment notifications', [
                'error' => $e->getMessage()
            ]);
        }

        $redirectUri = rtrim($this->paymentAuthorizer['redirect_base_uri'], '/') . '/' . $booking->getUid() . '?isPayment=1';
        $clientInformation = [
            ['field' => 'IDENTIFICATION_TYPE', 'value' => $this->paymentAuthorizer['identification_type']],
            ['field' => 'IDENTIFICATION', 'value' => $booking->getPatientUser()?->getDni() ?? ''],
            ['field' => 'EMAIL', 'value' => $booking->getPatientUser()?->getEmail() ?? ''],
        ];
        $requestData = [
            'action' => $this->paymentAuthorizer['action'],
            'type' => $this->paymentAuthorizer['type'],
            'metaReference' => $booking->getUid(),
            'redirectUri' => $redirectUri,
            'commerceId' => $this->paymentAuthorizer['commerce_id'],
            'clientInformation' => $clientInformation,
            'doNotUseCallback' => $this->paymentAuthorizer['do_not_use_callback'],
            'limitIssuers' => $this->paymentAuthorizer['limit_issuers'],
            'fingerprint' => $this->paymentAuthorizer['fingerprint'],
        ];

        try {
            $response = $this->httpClient->request('POST', $this->paymentAuthorizer['base_url'] . $this->paymentAuthorizer['authorize_path'], [
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'json' => $requestData,
                'timeout' => $this->paymentAuthorizer['timeout'] ?? 10,
            ]);
            $result = $response->toArray();
            $paymentUrl = $result['authorize']['Uri'] ?? null;
            $authorizeId = $result['authorize']['Id'] ?? null;

            $sessionId = null;
            if (isset($result['Object']['Object']['SessionId'])) {
                $sessionId = $result['Object']['Object']['SessionId'];
            } elseif (isset($result['Object']['SessionId'])) {
                $sessionId = $result['Object']['SessionId'];
            } elseif (isset($result['sessionId'])) {
                $sessionId = $result['sessionId'];
            }

            if ($authorizeId !== null) {
                $payment->setPlexoPaymentId($authorizeId);
            }
            if ($sessionId !== null) {
                $payment->setPlexoTransactionId($sessionId);
            }

            $tx = new Transaction();
            $tx->setUid(Uuid::uuid4()->toString());
            $tx->setPayment($payment);
            $tx->setType(TransactionTypeEnum::INIT);
            $tx->setPayload([
                'payment_url' => $paymentUrl,
                'authorize_id' => $authorizeId,
                'session_id' => $sessionId,
                'microservice_response' => $result,
            ]);
            if ($idempotencyKey !== null) {
                $tx->setIdempotencyKey($idempotencyKey);
            }
            $tx->setCreatedAt(new \DateTimeImmutable());

            $this->em->persist($tx);
            $this->em->flush();

            return [
                'payment' => $payment,
                'payment_url' => $paymentUrl,
            ];
        } catch (\Throwable $e) {
            $this->logger->error('Payment microservice error', [
                'error' => $e->getMessage(),
                'bookingId' => $booking->getId(),
            ]);
            throw $e;
        }
    }

    public function updatePaymentStatus(Payment $payment, PaymentStatusEnum $newStatus, array $data = []): void
    {
        if (!$this->skipDomainPolicy) {
            $this->domainpolicy->assertValidTransition($payment, $newStatus);
        }

        $payment->setStatus($newStatus);
        $payment->setUpdatedAt(new \DateTimeImmutable());
        $this->em->persist($payment);
        $this->em->flush();

        $bookingRef = $payment->getBooking();
        $booking = $bookingRef instanceof Booking
            ? $bookingRef
            : $this->em->getRepository(Booking::class)->find((int) $bookingRef);

        if ($booking instanceof Booking) {
            $bookingNewStatus = null;
            $notificationToSend = null;

            switch ($newStatus) {
                case PaymentStatusEnum::APPROVED:
                    $bookingNewStatus = BookingEnum::CONFIRMED;
                    $notificationToSend = 'confirmed';
                    break;
                case PaymentStatusEnum::PENDING_PROVIDER:
                    $bookingNewStatus = BookingEnum::PENDING_PROVIDER;
                    break;
                case PaymentStatusEnum::REJECTED:
                    // Logic for Rejected
                    $rejectedCount = 0;
                    foreach ($booking->getPayments() as $p) {
                        if ($p->getStatus() === PaymentStatusEnum::REJECTED) {
                            $rejectedCount++;
                        }
                    }

                    if ($rejectedCount >= 3) {
                        $bookingNewStatus = BookingEnum::CANCELLED;
                        $notificationToSend = 'max_attempts';
                        $this->logger->info('Booking cancelled due to MAX_ATTEMPTS', ['booking_uid' => $booking->getUid()]);
                    } else {
                        $createdAt = $booking->getCreatedAt();
                        $now = new \DateTimeImmutable("America/Montevideo");
                        $interval = $now->diff($createdAt);
                        $minutes = ($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i;

                        if ($minutes <= 45) {
                            $bookingNewStatus = BookingEnum::WAITING_PAYMENT;
                        } else {
                            $bookingNewStatus = BookingEnum::CANCELLED;
                            $notificationToSend = 'cancelled_payment';
                        }
                    }
                    break;
                case PaymentStatusEnum::REFUNDED:
                default:
                    break;
            }

            if ($bookingNewStatus !== null && $booking->getStatus() !== $bookingNewStatus) {
                $booking->setStatus($bookingNewStatus);
                $this->em->persist($booking);
                $this->em->flush();

                if ($notificationToSend === 'confirmed') {
                    $this->notificationManager->notifyUser(
                        $booking->getProfessionalUser(),
                        NotificationTypeEnum::PAYMENT,
                        'Pago Recibido',
                        sprintf('Se ha recibido el pago para la reserva con %s %s.', $booking->getPatientUser()->getFirstName(), $booking->getPatientUser()->getLastName()),
                        ['booking_uid' => $booking->getUid()]
                    );

                    $this->notificationManager->notifyUser(
                        $booking->getPatientUser(),
                        NotificationTypeEnum::BOOKING,
                        'Reserva Confirmada',
                        sprintf('Tu pago ha sido procesado y tu cita con %s %s está confirmada.', $booking->getProfessionalUser()->getFirstName(), $booking->getProfessionalUser()->getLastName()),
                        ['booking_uid' => $booking->getUid()]
                    );

                    $this->bookingMailer->sendBookingConfirmed($booking);
                } elseif ($notificationToSend === 'max_attempts') {
                    $this->notificationManager->notifyUser(
                        $booking->getPatientUser(),
                        NotificationTypeEnum::BOOKING,
                        'Reserva Cancelada',
                        'Reserva cancelada por límite de intentos de pago, por favor, reintenta con otro slot disponible.',
                        ['booking_uid' => $booking->getUid()]
                    );
                    // Log already done above
                } elseif ($notificationToSend === 'cancelled_payment') {
                    // Standard cancellation notification
                    $this->notificationManager->notifyUser(
                        $booking->getPatientUser(),
                        NotificationTypeEnum::BOOKING,
                        'Reserva Cancelada',
                        sprintf('Tu reserva con %s %s ha sido cancelada debido a un problema con el pago.', $booking->getProfessionalUser()->getFirstName(), $booking->getProfessionalUser()->getLastName()),
                        ['booking_uid' => $booking->getUid()]
                    );
                }
            }

            // Wallet Credit (only on Approved) - NOW FREEZE FUNDS (New Logic BD-537)
            if ($newStatus === PaymentStatusEnum::APPROVED) {
                try {
                    $this->walletService->freezeFundsForBooking($booking);
                } catch (\Throwable $e) {
                    $this->logger->error('Wallet freeze funds failed after status update', [
                        'paymentUid' => $payment->getUid(),
                        'bookingUid' => $booking->getUid(),
                        'err' => $e->getMessage(),
                    ]);
                }
            }
        }

        $tx = new Transaction();
        $tx->setUid(Uuid::uuid4()->toString());
        $tx->setPayment($payment);
        $tx->setType($this->mapStatusToTransactionType($newStatus));
        $tx->setPayload($data);
        $tx->setCreatedAt(new \DateTimeImmutable());

        $this->em->persist($tx);
        $this->em->flush();
    }

    private function mapStatusToTransactionType(PaymentStatusEnum $status): TransactionTypeEnum
    {
        return match ($status) {
            PaymentStatusEnum::INITIATED => TransactionTypeEnum::INIT,
            PaymentStatusEnum::PROCESSING => TransactionTypeEnum::AUTH,
            PaymentStatusEnum::PENDING_PROVIDER => TransactionTypeEnum::CAPTURE,
            PaymentStatusEnum::APPROVED => TransactionTypeEnum::CAPTURE,
            PaymentStatusEnum::REJECTED => TransactionTypeEnum::REJECT,
            PaymentStatusEnum::REFUNDED => TransactionTypeEnum::REFUND,
            default => TransactionTypeEnum::INIT,
        };
    }
}
