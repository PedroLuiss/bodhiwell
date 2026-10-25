<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Entity\Booking;
use App\Entity\Payment;
use App\Dto\PaymentListDTO;
use Psr\Log\LoggerInterface;
use App\Dto\PaymentStatusDTO;
use App\Dto\PaymentRequestDTO;
use App\Dto\PaymentResponseDTO;
use App\Enum\PaymentStatusEnum;
use App\Services\PaymentService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Payments')]
class PaymentApiController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private PaymentService $paymentService,
        private ValidatorInterface $validator,
        private LoggerInterface $logger,
        private HttpClientInterface $httpClient,
    ) {}

    #[Route('/api/bookings/{uid}/payments', methods: ['POST'])]
    #[OA\Post(
        path: '/api/bookings/{uid}/payments',
        summary: 'Iniciar un proceso de pago para una reserva',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'uid', in: 'path', required: true, description: 'UID de la reserva', schema: new OA\Schema(type: 'string'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'amount', type: 'number', example: 3000.00),
                    new OA\Property(property: 'currency', type: 'string', example: 'UYU'),
                    new OA\Property(property: 'paymentMethod', type: 'string', example: 'credit_card')
                ],
                example: [
                    'amount' => 3000.00,
                    'currency' => 'UYU',
                    'paymentMethod' => 'credit_card'
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Pago iniciado'),
            new OA\Response(response: 404, description: 'Reserva no encontrada'),
            new OA\Response(response: 502, description: 'Error con el proveedor de pagos')
        ]
    )]
    public function createPayment(string $uid, Request $request): JsonResponse
    {
        $booking = $this->em->getRepository(Booking::class)->findOneBy(['uid' => $uid]);
        if (!$booking) {
            return $this->json(['error' => 'Booking not found'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $dto = new PaymentRequestDTO();

        $professional = $booking->getProfessionalUser();
        $consultPrice = $professional?->getUserDetails()?->getConsultPrice();
        $amountUnits = $consultPrice !== null ? (float) $consultPrice : 500.0;
        $currency = 'UYU';

        $dto->amount = $amountUnits;
        $dto->currency = $currency;

        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->json(['errors' => (string) $errors], 400);
        }

        try {
            $idempotencyKey = $request->headers->get('Idempotency-Key') ?: $request->headers->get('Idempotency-Key');

            $result = $this->paymentService->initiatePayment($booking, $dto->amount, $dto->currency, $idempotencyKey, $dto->paymentMethod);
            $payment = $result['payment'];
            $paymentUrl = $result['payment_url'] ?? null;
            $response = new PaymentResponseDTO($payment->getUid(), $paymentUrl);
            return $this->json($response, 201);
        } catch (\Throwable $e) {
            $this->logger->error('Create payment failed', ['error' => $e->getMessage()]);
            return $this->json(['error' => 'Failed to create payment'], 502);
        }
    }

    #[Route('/api/payments', methods: ['GET'])]
    #[OA\Get(
        path: '/api/payments',
        summary: 'Listar pagos relacionados al usuario (como paciente o profesional)',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
            new OA\Parameter(name: 'limit', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 25)),
            new OA\Parameter(name: 'startDate', in: 'query', required: false, description: 'Fecha desde (Y-m-d)', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'endDate', in: 'query', required: false, description: 'Fecha hasta (Y-m-d)', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'paymentStatus', in: 'query', required: false, description: 'Estado del pago', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'bookingUid', in: 'query', required: false, description: 'Filtrar por UID de reserva', schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Lista de pagos'),
            new OA\Response(response: 403, description: 'Acceso no permitido')
        ]
    )]
    public function listPayments(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Acceso no permitido'], 403);
        }

        $page = max(1, (int) $request->query->get('page', 1));
        $limit = min(100, max(1, (int) $request->query->get('limit', 25)));
        $offset = ($page - 1) * $limit;

        $startDateRaw = $request->query->get('startDate');
        $endDateRaw = $request->query->get('endDate');
        $paymentStatus = $request->query->get('paymentStatus');
        $bookingUid = $request->query->get('bookingUid');

        $qb = $this->em->createQueryBuilder();
        $qb->select('p')
            ->from(Payment::class, 'p')
            ->join('p.booking', 'b')
            ->orderBy('p.createdAt', 'DESC');

        $qb->andWhere('b.patientUser = :userId OR b.professionalUser = :userId')
            ->setParameter('userId', $user->getId());

        if ($startDateRaw) {
            try {
                $start = new \DateTimeImmutable($startDateRaw);
                $qb->andWhere('p.createdAt >= :start')->setParameter('start', $start);
            } catch (\Exception $e) {
            }
        }

        if ($endDateRaw) {
            try {
                $end = new \DateTimeImmutable($endDateRaw);
                if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $endDateRaw)) {
                    $end = $end->setTime(23, 59, 59);
                }
                $qb->andWhere('p.createdAt <= :end')->setParameter('end', $end);
            } catch (\Exception $e) {
            }
        }

        if ($paymentStatus) {
            if (in_array($paymentStatus, PaymentStatusEnum::values(), true)) {
                $qb->andWhere('p.status = :status')->setParameter('status', $paymentStatus);
            }
        }

        if ($bookingUid) {
            $qb->andWhere('b.uid = :bookingUid')->setParameter('bookingUid', $bookingUid);
        }

        $qb->setFirstResult($offset)->setMaxResults($limit);

        $payments = $qb->getQuery()->getResult();

        $dtoList = array_map(static fn(Payment $p) => new PaymentListDTO($p), $payments);

        return $this->json([
            'page' => $page,
            'limit' => $limit,
            'count' => count($dtoList),
            'data' => $dtoList,
        ]);
    }

    #[Route('/api/payments/{uid}', methods: ['GET'])]
    #[OA\Get(
        path: '/api/payments/{uid}',
        summary: 'Obtener el estado detallado de un pago por UID',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'uid', in: 'path', required: true, schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Detalle del pago'),
            new OA\Response(response: 404, description: 'Pago no encontrado')
        ]
    )]
    public function getPayment(string $uid): JsonResponse
    {
        $payment = $this->em->getRepository(Payment::class)->findOneBy(['uid' => $uid]);
        if (!$payment) {
            return $this->json(['error' => 'Payment not found'], 404);
        }

        $currentStatus = $payment->getStatus()?->value ?? PaymentStatusEnum::PROCESSING->value;
        if (($currentStatus === PaymentStatusEnum::PROCESSING || $currentStatus === PaymentStatusEnum::PENDING_PROVIDER) && $payment->getPlexoTransactionId() !== null) {
            try {
                $base = $this->getParameter('payment_authorizer')['base_url'] ?? null;
                if ($base !== null) {
                    $res = $this->httpClient->request('POST', rtrim($base, '/') . '/status', [
                        'headers' => ['Content-Type' => 'application/json'],
                        'json' => ['reference' => $payment->getPlexoTransactionId(), 'mode' => 'transaction'],
                        'timeout' => 10,
                    ]);
                    $data = $res->toArray(false);
                    $statusBlock = $data['status'] ?? null;
                    if (is_array($statusBlock) && isset($statusBlock['CurrentState'])) {
                        $state = (int) $statusBlock['CurrentState'];

                        $newStatus = match ($state) {
                            1 => PaymentStatusEnum::PENDING_PROVIDER,
                            2 => PaymentStatusEnum::APPROVED,
                            3 => PaymentStatusEnum::REJECTED,
                            default => PaymentStatusEnum::PENDING_PROVIDER,
                        };

                        if ($newStatus !== $payment->getStatus()) {
                            try {
                                $this->paymentService->updatePaymentStatus($payment, $newStatus);
                            } catch (\Throwable $e) {
                                $this->logger->error('Failed to update payment status from microservice response', ['err' => $e->getMessage(), 'paymentUid' => $payment->getUid()]);
                            }
                        }
                    }
                }
            } catch (\Throwable $e) {
                $this->logger->error('Status microservice call failed', ['err' => $e->getMessage(), 'paymentUid' => $payment->getUid()]);
            }
        }

        $this->em->refresh($payment);

        $dto = new PaymentStatusDTO(
            $payment->getUid(),
            $payment->getStatus()?->value ?? PaymentStatusEnum::PROCESSING,
            $payment->getCurrency(),
            $payment->getAmount()
        );

        return $this->json($dto);
    }

    #[Route('/api/bookings/{uid}/payment-status', methods: ['GET'])]
    #[OA\Get(
        path: '/api/bookings/{uid}/payment-status',
        summary: 'Obtener el estado del último pago de una reserva',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'uid', in: 'path', required: true, description: 'UID de la reserva', schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Estado del pago'),
            new OA\Response(response: 404, description: 'Reserva no encontrada')
        ]
    )]
    public function getBookingPaymentStatus(string $uid): JsonResponse
    {
        $booking = $this->em->getRepository(Booking::class)->findOneBy(['uid' => $uid]);
        if (!$booking) {
            return $this->json(['error' => 'Booking not found'], 404);
        }

        $payments = $booking->getPayments()->toArray();
        if (empty($payments)) {
            return $this->json(['status' => 'no_payment'], 200);
        }

        usort($payments, function ($a, $b) {
            return $b->getCreatedAt() <=> $a->getCreatedAt();
        });
        $payment = $payments[0];

        $currentStatus = $payment->getStatus()?->value ?? PaymentStatusEnum::PROCESSING->value;

        $paymentMethod = null;
        $paymentCode = null;
        $paymentUrl = null;

        if (($currentStatus === PaymentStatusEnum::PROCESSING->value || $currentStatus === PaymentStatusEnum::PENDING_PROVIDER->value) && $payment->getPlexoTransactionId() !== null) {
            try {
                $base = $this->getParameter('payment_authorizer')['base_url'] ?? null;
                if ($base !== null) {
                    $res = $this->httpClient->request('POST', rtrim($base, '/') . '/status', [
                        'headers' => ['Content-Type' => 'application/json'],
                        'json' => ['reference' => $payment->getPlexoTransactionId(), 'mode' => 'transaction'],
                        'timeout' => 10,
                    ]);
                    $data = $res->toArray(false);
                    $statusBlock = $data['status'] ?? null;
                    if (is_array($statusBlock) && isset($statusBlock['CurrentState'])) {
                        $state = (int) $statusBlock['CurrentState'];
                        $purchaseStatus = $statusBlock['Transactions']['Purchase']['Status'] ?? null;
                        $paymentProcessorId = $statusBlock['FieldInformation']['PaymentProcessorId'] ?? null;

                        if ($paymentProcessorId === 'redpagos') {
                            $paymentMethod = 'redpagos';
                            $paymentCode = $statusBlock['PaymentCode']['Code'] ?? null;
                            $paymentUrl = $statusBlock['PaymentCode']['Url'] ?? null;
                        }

                        $newStatus = match (true) {
                            $state === 2 && $purchaseStatus === 999 => PaymentStatusEnum::REJECTED,
                            $state === 1 && $purchaseStatus === 2 && $paymentProcessorId === 'redpagos' => PaymentStatusEnum::PENDING_PROVIDER,
                            $state === 1 && $purchaseStatus === 0 => PaymentStatusEnum::APPROVED,
                            $state === 1 && $purchaseStatus !== null && $purchaseStatus > 0 => PaymentStatusEnum::REJECTED,
                            default => PaymentStatusEnum::PENDING_PROVIDER,
                        };

                        if ($newStatus !== $payment->getStatus()) {
                            try {
                                $this->paymentService->updatePaymentStatus($payment, $newStatus, $data);
                            } catch (\Throwable $e) {
                                $this->logger->error('Failed to update booking payment status from microservice response', ['err' => $e->getMessage(), 'paymentUid' => $payment->getUid()]);
                            }
                        }
                    }
                }
            } catch (\Throwable $e) {
                $this->logger->error('Status microservice call failed for booking payment', ['err' => $e->getMessage(), 'bookingUid' => $booking->getUid()]);
            }
        }

        $this->em->refresh($payment);

        $dto = new PaymentStatusDTO(
            $payment->getUid(),
            $payment->getStatus()?->value ?? PaymentStatusEnum::PENDING_PROVIDER,
            $payment->getCurrency(),
            $payment->getAmount(),
            $paymentMethod,
            $paymentCode,
            $paymentUrl
        );

        return $this->json($dto);
    }
}
