<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Repository\WalletLedgerRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\ProfessionalWalletRepository;
use App\Services\WalletService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Wallet')]
class WalletApiController extends AbstractController
{
    #[Route('/api/wallet', methods: ['GET'])]
    #[OA\Get(
        path: '/api/wallet',
        summary: 'Obtener información de la billetera y movimientos (solo profesionales)',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
            new OA\Parameter(name: 'limit', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 10)),
            new OA\Parameter(name: 'from', in: 'query', required: false, description: 'Fecha desde (Y-m-d)', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'to', in: 'query', required: false, description: 'Fecha hasta (Y-m-d)', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'q', in: 'query', required: false, description: 'Búsqueda por texto', schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Estado de la billetera y movimientos'),
            new OA\Response(response: 403, description: 'Acceso no permitido')
        ]
    )]
    public function getWallet(
        ProfessionalWalletRepository $walletRepository,
        WalletLedgerRepository $ledgerRepository,
        Request $request,
        WalletService $walletService
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof User || $user->getTypeAccount() !== 'professional') {
            return $this->json(['error' => 'Acceso no permitido'], 403);
        }

        $wallet = $walletService->getOrCreateWalletForProfessional($user);
        $page = max(1, $request->query->getInt('page', 1));
        $limit = max(1, min(100, $request->query->getInt('limit', 10)));
        $filters = [
            'startDate' => $request->query->get('from'),
            'endDate'   => $request->query->get('to'),
            'search'    => $request->query->get('q'),
        ];

        $ledgersData = $ledgerRepository->findLedgersForWallet($wallet, $filters, $page, $limit);

        $available = (float) $wallet->getAvailableBalance();
        $frozen    = (float) $wallet->getFrozenBalance();

        $movements = [];
        foreach ($ledgersData['data'] as $ledger) {
            /** 
             * @var \App\Entity\WalletLedger $ledger 
             */

            $payment = $ledger->getPayment();
            $booking = $payment?->getBooking();

            $conceptRaw = $ledger->getConcept() ? $ledger->getConcept()->value : 'N/A';

            $concept = $conceptRaw;
            if ($conceptRaw === 'INCOME_ON_HOLD') $concept = 'Ingreso Retenido';
            if ($conceptRaw === 'FUNDS_RELEASE') $concept = 'Liberación de Fondos';
            if ($conceptRaw === 'PAYMENT') $concept = 'Pago Recibido';
            if ($conceptRaw === 'WITHDRAWAL_REQUEST') $concept = 'Solicitud de Retiro';
            if ($conceptRaw === 'WITHDRAWAL_REJECTED') $concept = 'Inconvenientes con el retiro';
            if ($conceptRaw === 'WITHDRAWAL') $concept = 'Retiro';
            if ($conceptRaw === 'REFUND') $concept = 'Reembolso';
            if ($conceptRaw === 'ADJUSTMENT') $concept = 'Ajuste';

            $conceptEnMap = [
                'PAYMENT' => 'Payment Received',
                'WITHDRAWAL' => 'Withdrawal',
                'REFUND' => 'Refund',
                'ADJUSTMENT' => 'Adjustment',
                'INCOME_ON_HOLD' => 'Income on Hold',
                'FUNDS_RELEASE' => 'Funds Release',
                'WITHDRAWAL_REQUEST' => 'Withdrawal Request',
                'WITHDRAWAL_REJECTED' => 'Withdrawal Rejected',
            ];
            $conceptEn = $conceptEnMap[$conceptRaw] ?? $conceptRaw;

            $description = "Movimiento de Reserva";
            $descriptionEn = 'Movement of Reserve';

            if ($booking?->getReserveReason()) {
                $description = $booking?->getReserveReason();
                $descriptionEn = $booking?->getReserveReason();
            } elseif ($conceptRaw !== "INCOME_ON_HOLD" && $conceptRaw !== "FUNDS_RELEASE") {
                $description = 'Retiro de fondos';
                $descriptionEn = 'Withdrawal of funds';
            }

            $currency = $payment ? $payment->getCurrency() : 'UYU';

            $movements[] = [
                'uid'           => $ledger->getUid(),
                'amount'        => number_format((float) $ledger->getAmount(), 2, '.', ''),
                'amount_formatted' => number_format((float) $ledger->getAmount(), 2, '.', ','),
                'currency'      => $currency,
                'operationType' => $ledger->getOperationType(),
                'concept'       => $concept,
                'conceptEn'     => $conceptEn,
                'paymentUid'    => $payment?->getUid(),
                'bookingUid'    => $booking?->getUid(),
                'status'        => $payment?->getStatus()?->value ?? 'unknown',
                'description'   => $description,
                'descriptionEn' => $descriptionEn,
                'createdAt'     => $ledger->getCreatedAt()?->format(DATE_ATOM),
            ];
        }

        return $this->json([
            'wallet_uid' => $wallet->getUid(),
            'balance_available' => number_format($available, 2, '.', ''),
            'balance_frozen'    => number_format($frozen, 2, '.', ''),
            'balance_total'     => number_format($available + $frozen, 2, '.', ''),
            'currency'          => 'UYU',
            'movements' => [
                'data' => $movements,
                'meta' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total_items' => $ledgersData['total'],
                    'total_pages' => ceil($ledgersData['total'] / $limit),
                ]
            ]
        ]);
    }
}
