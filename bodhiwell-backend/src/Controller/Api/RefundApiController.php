<?php

namespace App\Controller\Api;

use App\Entity\Refund;
use App\Entity\Booking;
use App\Entity\WalletLedger;
use App\Enum\PaymentStatusEnum;
use App\Services\RefundService;
use App\Repository\BookingRepository;
use App\Repository\UserRepository;
use App\Repository\RefundRepository;
use App\Repository\WalletLedgerRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use OpenApi\Attributes as OA;

#[Route('/api/refunds')]
#[OA\Tag(name: 'Refunds')]
class RefundApiController extends AbstractController
{
    public function __construct(
        private RefundService $refundService,
        private BookingRepository $bookingRepo,
        private UserRepository $userRepo,
        private RefundRepository $refundRepo,
        private WalletLedgerRepository $walletLedgerRepo,
    ) {}

    #[Route('', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Post(
        path: '/api/refunds',
        summary: 'Crear una solicitud de reembolso',
        security: [['Bearer' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'booking_uid', type: 'string', example: '7dac319d-d6cb-48d1-9c44-d6de838f79f6'),
                    new OA\Property(property: 'patient_uid', type: 'string', example: '5fc83f3b-5665-44e9-88e3-a87138b5df5d'),
                    new OA\Property(property: 'amount', type: 'number', example: 2000.00),
                    new OA\Property(property: 'reason', type: 'string', example: 'El profesional no se presentó'),
                    new OA\Property(property: 'refundMethod', type: 'string', example: 'bank_transfer')
                ],
                example: [
                    'booking_uid' => '7dac319d-d6cb-48d1-9c44-d6de838f79f6',
                    'patient_uid' => '5fc83f3b-5665-44e9-88e3-a87138b5df5d',
                    'amount' => 2000.00,
                    'reason' => 'El profesional no se presentó',
                    'refundMethod' => 'bank_transfer'
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Reembolso creado'),
            new OA\Response(response: 400, description: 'Datos inválidos o monto excedido'),
            new OA\Response(response: 404, description: 'Reserva o paciente no encontrado')
        ]
    )]
    public function create(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        $bookingUid = $data['booking_uid'] ?? null;
        $patientUid = $data['patient_uid'] ?? null;
        $amount = $data['amount'] ?? null;
        $reason = $data['reason'] ?? null;
        $refundMethod = $data['refundMethod'] ?? null;

        if (!$bookingUid || !$patientUid || !$amount || !$reason) {
            return $this->json(['error' => 'Faltan campos obligatorios (booking_uid, patient_uid, amount, reason)'], 400);
        }

        if (!is_numeric($amount) || (float)$amount <= 0) {
            return $this->json(['error' => 'El monto del reembolso debe ser numérico y mayor a cero'], 400);
        }
        $requestedAmountCents = (int) round((float)$amount * 100);

        $booking = $this->bookingRepo->findOneBy(['uid' => $bookingUid]);
        $patient = $this->userRepo->findOneBy(['uid' => $patientUid]);

        if (!$booking || !$patient) {
            return $this->json(['error' => 'Reserva o consultante no encontrados'], 404);
        }

        $professional = $booking->getProfessionalUser();
        if (!$professional) {
            return $this->json(['error' => 'La reserva no tiene profesional asignado'], 400);
        }

        $paidAmountCents = $this->calculateBookingPaidAmount($booking);
        if ($paidAmountCents <= 0) {
            return $this->json(['error' => 'La reserva no posee pagos capturados para reembolsar'], 400);
        }

        $alreadyRefundedCents = 0;
        foreach ($booking->getRefunds() as $existingRefund) {
            if ($existingRefund->getStatus() !== \App\Enum\RefundStatus::REJECTED) {
                $alreadyRefundedCents += $existingRefund->getAmount();
            }
        }

        $remainingRefundableCents = $paidAmountCents - $alreadyRefundedCents;

        if ($requestedAmountCents > $remainingRefundableCents) {
            return $this->json([
                'error' => sprintf(
                    'El monto solicitado (%.2f) supera el saldo remanente reembolsable (%.2f). Total pagado: %.2f',
                    $requestedAmountCents / 100,
                    $remainingRefundableCents / 100,
                    $paidAmountCents / 100
                )
            ], 400);
        }

        try {
            $refund = $this->refundService->createRefund($patient, $professional, $booking, $requestedAmountCents, $reason, null, $refundMethod);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }

        $wallet = $this->refundService->getWalletForProfessional($professional);
        $frozen = $wallet ? number_format($wallet->getFrozenBalance() / 100, 2, '.', '') : '0.00';

        return $this->json([
            'refund_id' => $refund->getUid(),
            'status' => $refund->getStatus(),
            'frozen_amount' => $frozen
        ], 201);
    }

    #[Route('', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Get(
        path: '/api/refunds',
        summary: 'Listar solicitudes de reembolso (opcionalmente filtrado por estado, paciente o reserva)',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 10)),
            new OA\Parameter(name: 'status', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'patient_uid', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'booking_uid', in: 'query', required: false, schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Lista de reembolsos')
        ]
    )]
    public function list(Request $request): Response
    {
        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('per_page', 10);
        $status = $request->query->get('status');
        $patientUid = $request->query->get('patient_uid');
        $bookingUid = $request->query->get('booking_uid');

        $criteria = [];
        if ($status) {
            $criteria['status'] = $status;
        }
        if ($patientUid) {
            $patient = $this->userRepo->findOneBy(['uid' => $patientUid]);
            if ($patient) $criteria['patient'] = $patient;
        }
        if ($bookingUid) {
            $booking = $this->bookingRepo->findOneBy(['uid' => $bookingUid]);
            if ($booking) $criteria['booking'] = $booking;
        }

        $offset = ($page - 1) * $limit;
        $refunds = $this->refundRepo->findBy($criteria, ['createdAt' => 'DESC'], $limit, $offset);

        $data = array_map(fn(Refund $r) => [
            'uid' => $r->getUid(),
            'booking_uid' => $r->getBooking()?->getUid(),
            'patient_uid' => $r->getPatient()?->getUid(),
            'professional_uid' => $r->getProfessional()?->getUid(),
            'amount' => $r->getAmount() / 100,
            'status' => $r->getStatus(),
            'created_at' => $r->getCreatedAt()->format('c'),
            'updated_at' => $r->getUpdatedAt()?->format('c'),
            'reason' => $r->getReason(),
        ], $refunds);

        return $this->json($data);
    }

    #[Route('/{uid}', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Get(
        path: '/api/refunds/{uid}',
        summary: 'Obtener detalle de una solicitud de reembolso por UID',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'uid', in: 'path', required: true, description: 'UID del reembolso', schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Detalle del reembolso'),
            new OA\Response(response: 404, description: 'Reembolso no encontrado')
        ]
    )]
    public function show(string $uid): Response
    {
        $refund = $this->refundRepo->findOneBy(['uid' => $uid]);
        if (!$refund) {
            $refund = $this->refundRepo->find($uid);
        }

        if (!$refund) {
            return $this->json(['error' => 'Reembolso no encontrado'], 404);
        }

        $ledgerEntries = [];
        $wallet = $this->refundService->getWalletForProfessional($refund->getProfessional());
        if ($wallet && $refund->getBooking() && $refund->getAmount() !== null) {
            $ledgerEntries = $this->walletLedgerRepo->findForRefund(
                $wallet,
                $refund->getBooking(),
                $refund->getAmount()
            );
        }

        return $this->json([
            'uid' => $refund->getUid(),
            'booking_uid' => $refund->getBooking()?->getUid(),
            'patient_uid' => $refund->getPatient()?->getUid(),
            'professional_uid' => $refund->getProfessional()?->getUid(),
            'amount' => $refund->getAmount() / 100,
            'status' => $refund->getStatus(),
            'created_at' => $refund->getCreatedAt()->format('c'),
            'updated_at' => $refund->getUpdatedAt()?->format('c'),
            'reason' => $refund->getReason(),
            'admin_note' => $refund->getAdminNote(),
            'ledger_entries' => array_map(fn(WalletLedger $ledger) => [
                'id' => $ledger->getUid(),
                'amount' => $ledger->getAmount() / 100,
                'operation_type' => $ledger->getOperationType(),
                'created_at' => $ledger->getCreatedAt()?->format('c'),
                'payment_id' => $ledger->getPayment()?->getUid(),
                'payment_status' => $ledger->getPayment()?->getStatus()?->value,
            ], $ledgerEntries),
        ]);
    }

    private function calculateBookingPaidAmount(Booking $booking): int
    {
        $totalCents = 0;

        foreach ($booking->getPayments() as $payment) {
            $status = $payment->getStatus();
            if (!$status instanceof PaymentStatusEnum) {
                continue;
            }

            if (!\in_array($status, [PaymentStatusEnum::CAPTURED, PaymentStatusEnum::PARTIALLY_CAPTURED], true)) {
                continue;
            }

            $amount = $payment->getAmount();
            if ($amount !== null) {
                $totalCents += $amount;
            }
        }

        return $totalCents;
    }
}
