<?php

namespace App\Controller;

use Ramsey\Uuid\Uuid;
use App\Entity\Booking;
use App\Entity\Payment;
use App\Entity\Transaction;
use App\Enum\BookingEnum;
use Psr\Log\LoggerInterface;
use App\Enum\PaymentStatusEnum;
use App\Enum\TransactionTypeEnum;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use OpenApi\Attributes as OA;

/**
 * Webhooks de Plexo
 *
 * Configuración en el panel de Plexo (comentarios informativos):
 * - URL de webhook para Instrument: https://TU-DOMINIO/webhook/plexo/instrument
 * - URL de webhook para Transaction: https://TU-DOMINIO/webhook/plexo/transaction
 * - Método: POST
 * - Contenido: JSON (application/json)
 * - Recomendado: habilitar reintentos y firma si el proveedor lo soporta (añadir validación más adelante).
 *
 * Nota: Estos endpoints por ahora sólo registran y validan que recibimos el payload.
 *       En el caso de Instrument, extraemos y guardamos el InstrumentToken en filesystem (var/)
 *       como ejemplo. Reemplazar por persistencia en DB cuando esté definido el modelo.
 */
#[OA\Tag(name: 'Webhooks')]
class WebhookPlexoController extends AbstractController
{
    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly EntityManagerInterface $em,
        private readonly HttpClientInterface $httpClient
    ) {}

    #[Route('/webhook/plexo/instrument', name: 'webhook_plexo_instrument', methods: ['POST'])]
    public function instrument(Request $request): Response
    {
        $raw = (string) $request->getContent();
        $payload = $this->decodeJson($raw);

        $this->logger->info('[Plexo] Instrument webhook recibido', [
            'path' => $request->getPathInfo(),
            'method' => $request->getMethod(),
            'query' => $request->query->all(),
            'headers' => $this->sanitizeHeaders($request->headers->all()),
            'raw' => $raw,
        ]);

        $instrumentToken = $this->extractInstrumentToken($payload);
        $sessionId = $this->extractSessionId($payload);

        if ($instrumentToken !== null && $sessionId !== null) {
            try {
                $this->processPurchaseFromInstrument($sessionId, $instrumentToken);
            } catch (\Throwable $e) {
                $this->logger->error('[Plexo] Error procesando compra desde instrument webhook', ['err' => $e->getMessage()]);
            }
        }

        if ($instrumentToken !== null) {
            try {
                $this->storeInstrumentToken($instrumentToken, $payload);
            } catch (\Throwable $e) {
                $this->logger->error('[Plexo] Error guardando InstrumentToken', [
                    'message' => $e->getMessage(),
                ]);
                return new JsonResponse([
                    'ok' => false,
                    'message' => 'Error al guardar InstrumentToken',
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        } else {
            $this->logger->warning('[Plexo] No se encontró InstrumentToken en el payload');
        }

        return new Response('OK');
    }

    private function extractSessionId(?array $payload): ?string
    {
        if ($payload === null) {
            return null;
        }
        // Common locations
        if (isset($payload['Object']['Object']['SessionId']) && is_string($payload['Object']['Object']['SessionId'])) {
            return $payload['Object']['Object']['SessionId'];
        }
        if (isset($payload['Object']['SessionId']) && is_string($payload['Object']['SessionId'])) {
            return $payload['Object']['SessionId'];
        }
        // Recursive search
        return $this->recursiveFindKey($payload, 'SessionId');
    }

    private function recursiveFindKey(array $data, string $keyName): ?string
    {
        foreach ($data as $k => $v) {
            if (is_array($v)) {
                $found = $this->recursiveFindKey($v, $keyName);
                if ($found) {
                    return $found;
                }
            } else {
                if (strcasecmp((string)$k, $keyName) === 0 && is_string($v)) {
                    return $v;
                }
            }
        }
        return null;
    }

    private function processPurchaseFromInstrument(string $sessionId, string $instrumentToken): void
    {
        /** @var Payment|null $payment */
        $payment = $this->em->getRepository(Payment::class)->findOneBy(['plexoPaymentId' => $sessionId]);
        if (!$payment instanceof Payment) {
            $this->logger->warning('[Plexo] No se encontró payment para sessionId', ['sessionId' => $sessionId]);
            return;
        }

        $amountCents = $payment->getAmount() ?? 0;
        $amount = $amountCents;
        $currency = $payment->getCurrency() ?? 'UYU';
        $invoiceNumber = $payment->getUid();
        $clientReferenceId = $payment->getBooking()?->getUid() ?? $payment->getUid();

        $purchasePayload = [
            'instrumentToken' => $instrumentToken,
            'amount' => $amount,
            'currencyId' => $currency,
            'installments' => 1,
            'invoiceNumber' => $invoiceNumber,
            'clientReferenceId' => $clientReferenceId,
            'items' => [
                ['Amount' => $amount, 'ClientItemReferenceId' => 'item-1']
            ],
            'financialInclusionType' => 'NONE',
            'tipAmount' => 0.0,
        ];

        $base = $this->getParameter('payment_authorizer')['base_url'] ?? null;
        if ($base === null) {
            $this->logger->error('[Plexo] payment_authorizer.base_url no configurado');
            return;
        }

        try {
            $resp = $this->httpClient->request('POST', rtrim($base, '/') . '/purchase', [
                'headers' => ['Content-Type' => 'application/json'],
                'json' => $purchasePayload,
                'timeout' => 15,
            ]);
            $data = $resp->toArray(false);
            $this->logger->info('[Plexo] Purchase response', ['sessionId' => $sessionId, 'response' => $data]);

            $purchase = $data['purchase'] ?? null;
            if (is_array($purchase)) {
                $transactionId = $purchase['TransactionId'] ?? ($purchase['Transactions']['Purchase']['Ticket'] ?? null);
                if ($transactionId !== null) {
                    $payment->setPlexoTransactionId((string) $transactionId);
                }

                try {
                    $tx = new Transaction();
                    $tx->setUid(Uuid::uuid4()->toString());
                    $tx->setPayment($payment);
                    $tx->setType(TransactionTypeEnum::CAPTURE);
                    $tx->setPayload(['purchase' => $purchase]);
                    $tx->setCreatedAt(new \DateTimeImmutable());

                    $this->em->persist($payment);
                    $this->em->persist($tx);
                    $this->em->flush();

                    $this->logger->info('[Plexo] Purchase persisted', ['paymentUid' => $payment->getUid(), 'transactionId' => $transactionId]);
                } catch (\Throwable $e) {
                    $this->logger->error('[Plexo] Error persisting purchase transaction', ['err' => $e->getMessage()]);
                }

                try {
                    // $payment->setPlexoTransactionId((string) $transactionId);
                    $payment->setStatus(PaymentStatusEnum::PROCESSING);
                    $this->em->persist($payment);

                    $booking = $payment->getBooking();
                    if ($booking instanceof Booking) {
                        $booking->setStatus(BookingEnum::PROCESSING);
                        $this->em->persist($booking);
                    }

                    $this->em->flush();
                } catch (\Throwable $th) {
                    $this->logger->error('[Plexo] Error updating payment with transactionId', ['err' => $th->getMessage()]);
                }
            }
        } catch (\Throwable $e) {
            $this->logger->error('[Plexo] Error calling purchase microservice', ['err' => $e->getMessage(), 'sessionId' => $sessionId]);
        }
    }

    #[Route('/webhook/plexo/transaction', name: 'webhook_plexo_transaction', methods: ['POST'])]
    public function transaction(Request $request): JsonResponse
    {
        $raw = (string) $request->getContent();
        $payload = $this->decodeJson($raw);

        $this->logger->info('[Plexo] Transaction webhook recibido', [
            'path' => $request->getPathInfo(),
            'method' => $request->getMethod(),
            'query' => $request->query->all(),
            'headers' => $this->sanitizeHeaders($request->headers->all()),
            'raw' => $raw,
        ]);

        return new JsonResponse([
            'ok' => true,
            'message' => 'Transaction webhook recibido',
        ], Response::HTTP_OK);
    }

    /**
     * Busca keys típicas del token en el payload; adaptable cuando Plexo comparta el esquema.
     * - instrumentToken | InstrumentToken | instrument_token
     * - payload.instrument.token
     */
    private function extractInstrumentToken(?array $payload): ?string
    {
        if ($payload === null) {
            return null;
        }

        // Búsqueda directa por keys comunes
        foreach (['instrumentToken', 'InstrumentToken', 'instrument_token'] as $k) {
            if (isset($payload[$k]) && is_string($payload[$k]) && $payload[$k] !== '') {
                return $payload[$k];
            }
        }

        // Búsqueda anidada típica: payload["instrument"]["token"]
        $instrument = $payload['instrument'] ?? $payload['Instrument'] ?? null;
        if (is_array($instrument)) {
            $token = $instrument['token'] ?? $instrument['Token'] ?? null;
            if (is_string($token) && $token !== '') {
                return $token;
            }
        }

        // Búsqueda recursiva segura por cualquier key que contenga "instrument" y "token"
        $found = $this->recursiveFindToken($payload);
        return is_string($found) && $found !== '' ? $found : null;
    }

    private function recursiveFindToken(array $data): ?string
    {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $candidate = $this->recursiveFindToken($value);
                if ($candidate) {
                    return $candidate;
                }
            } else {
                if (is_string($value)) {
                    $k = strtolower((string) $key);
                    if (str_contains($k, 'instrument') && str_contains($k, 'token')) {
                        return $value;
                    }
                }
            }
        }
        return null;
    }

    private function decodeJson(string $raw): ?array
    {
        if ($raw === '') {
            return null;
        }
        $data = json_decode($raw, true);
        return is_array($data) ? $data : null;
    }

    /**
     * Guarda el InstrumentToken en var/plexo/ como JSONL.
     * IMPORTANTE: Reemplazar por persistencia en DB cuando el dominio esté definido.
     */
    private function storeInstrumentToken(string $token, ?array $payload = null): void
    {
        /** @var string $projectDir */
        $projectDir = (string) $this->getParameter('kernel.project_dir');
        $dir = $projectDir . '/var/plexo';
        if (!is_dir($dir)) {
            if (!@mkdir($dir, 0775, true) && !is_dir($dir)) {
                throw new \RuntimeException(sprintf('No se pudo crear el directorio de almacenamiento: %s', $dir));
            }
        }

        $record = [
            'ts' => (new \DateTimeImmutable())->format(DATE_ATOM),
            'instrumentToken' => $token,
            'payloadHash' => $payload ? sha1(json_encode($payload)) : null,
        ];

        $file = $dir . '/instrument_tokens.jsonl';
        $ok = @file_put_contents($file, json_encode($record, JSON_UNESCAPED_SLASHES) . PHP_EOL, FILE_APPEND | LOCK_EX);
        if ($ok === false) {
            throw new \RuntimeException('No se pudo escribir el token en filesystem');
        }
    }

    /**
     * Evita loguear valores muy sensibles. Se puede ampliar la lista de cabeceras a ofuscar.
     */
    private function sanitizeHeaders(array $headers): array
    {
        $sensitive = ['authorization', 'x-signature', 'x-api-key'];
        $clean = [];
        foreach ($headers as $name => $values) {
            $lname = strtolower((string) $name);
            $clean[$name] = in_array($lname, $sensitive, true) ? ['***'] : $values;
        }
        return $clean;
    }
}
