<?php

namespace App\Services;

use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class PlexoClient
{
    public function __construct(
        private HttpClientInterface $client,
        private LoggerInterface $logger,
        private string $authUrl,
        private string $apiUrl,
        private string $apiKey,
        private int $timeoutSeconds = 10,
        private int $maxRetries = 3,
        private string $clientName,
        private string $fingerprint,
        private string $pfxPath,
        private string $pfxPassword,
        private ?CorrelationIdProvider $correlation = null,
    ) {
        $this->authUrl = rtrim($this->authUrl, '/');
        $this->apiUrl  = rtrim($this->apiUrl, '/');

        $this->logger->info('Fingerprint in constructor', [
            'fingerprint' => $this->fingerprint,
        ]);
    }

    public function authorize(array $requestData): array|string
    {
        if ($this->clientName === '' || $this->fingerprint === '' || $this->pfxPath === '') {
            throw new \RuntimeException('Faltan clientName, fingerprint o certificado PFX');
        }

        $timestampMs = (int) round(microtime(true) * 1000);

        $object = [
            'Fingerprint' => $this->fingerprint,
            'Object' => [
                'Client'  => $this->clientName,
                'Request' => $requestData,
            ],
            'UTCUnixTimeExpiration' => $timestampMs + 60000,
        ];

        $signingJson = json_encode($object, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if ($signingJson === false) {
            throw new \RuntimeException('No se pudo serializar el objeto de autorización');
        }

        $signature = $this->signPayload($signingJson);

        $payload = [
            'Object'    => $object,
            'Signature' => $signature,
        ];


        return $this->postAuth('/Auth', $payload);
    }

    public function createPaymentIntent(array $payload): array
    {
        return $this->requestApi('POST', '/v1/payments', $payload);
    }

    public function getPaymentStatus(string $plexoPaymentId): array
    {
        return $this->requestApi('GET', '/v1/payments/' . urlencode($plexoPaymentId));
    }

    // ----------------- Helpers -----------------

    private function postAuth(string $path, array $json): array|string
    {
        $url = $this->authUrl . $path;
        $cid = $this->correlationId(); // <-- usar helper

        $response = $this->client->request('POST', $url, [
            'headers' => [
                'Content-Type'     => 'application/json',
                'Accept'           => 'application/json',
                'X-Correlation-Id' => $cid,
            ],
            'json'    => $json,
            'timeout' => $this->timeoutSeconds,
        ]);

        $status = $response->getStatusCode();
        $raw    = $response->getContent(false);

        $this->logger->info('Plexo Auth response', [
            'status' => $status,
            'raw'    => $raw,
            'correlationId' => $cid,
        ]);

        if ($status >= 200 && $status < 300) {
            $decoded = json_decode($raw, true);
            return $decoded ?? $raw;
        }

        throw new \RuntimeException(sprintf('HTTP %d from Plexo Auth', $status));
    }

    private function requestApi(string $method, string $path, array $json = []): array
    {
        $url = $this->apiUrl . $path;
        $cid = $this->correlationId(); // <-- usar helper

        $options = [
            'headers' => [
                'Authorization'    => 'Bearer ' . $this->apiKey,
                'Content-Type'     => 'application/json',
                'Accept'           => 'application/json',
                'X-Correlation-Id' => $cid,
            ],
            'timeout' => $this->timeoutSeconds,
        ];
        if ($json !== []) {
            $options['json'] = $json;
        }

        $response = $this->client->request($method, $url, $options);
        $status   = $response->getStatusCode();
        $raw      = $response->getContent(false);
        $data     = $raw !== '' ? json_decode($raw, true) : [];

        $this->logger->info('Plexo API response', [
            'status' => $status,
            'raw'    => $raw,
            'correlationId' => $cid,
        ]);

        if ($status >= 200 && $status < 300) {
            return $data;
        }

        throw new \RuntimeException(sprintf('HTTP %d from Plexo API', $status));
    }

    private function correlationId(): string
    {
        try {
            return $this->correlation?->getOrCreate() ?? bin2hex(random_bytes(8));
        } catch (\Throwable) {
            return bin2hex(random_bytes(8));
        }
    }

    private function signPayload(string $jsonPayload): string
    {
        $pkcs12 = @file_get_contents($this->pfxPath);
        if ($pkcs12 === false || $pkcs12 === '') {
            throw new \RuntimeException("No se pudo leer el PFX en {$this->pfxPath}");
        }
        $certs = [];
        if (!openssl_pkcs12_read($pkcs12, $certs, (string) $this->pfxPassword)) {
            throw new \RuntimeException('No se pudo parsear el PFX o password incorrecto');
        }
        if (empty($certs['pkey'])) {
            throw new \RuntimeException('No se encontró private key en el PFX');
        }
        $pkey = openssl_pkey_get_private($certs['pkey']);
        if ($pkey === false) {
            throw new \RuntimeException('Private key inválida en el PFX');
        }

        $ok = openssl_sign($jsonPayload, $signature, $pkey, OPENSSL_ALGO_SHA256);
        openssl_free_key($pkey);
        if ($ok !== true) {
            throw new \RuntimeException('No se pudo firmar el payload');
        }

        return base64_encode($signature);
    }

    /**
     * Simula un reembolso en Plexo para desarrollo.
     */
    public function refundPayment(string $paymentId, float $amount): array
    {
        $this->logger->info('Simulando reembolso en Plexo', [
            'paymentId' => $paymentId,
            'amount' => $amount,
        ]);

        return [
            'status' => 'success',
            'id' => 'refund_simulado_' . uniqid(),
            'amount' => $amount,
            'original_payment_id' => $paymentId,
        ];
    }
}
