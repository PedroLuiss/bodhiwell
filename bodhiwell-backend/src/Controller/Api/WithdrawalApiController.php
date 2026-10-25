<?php

namespace App\Controller\Api;

use App\Entity\Withdrawal;
use App\Enum\WithdrawalStatusEnum;
use App\Services\WithdrawalService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\ProfessionalWallet;
use App\Entity\User;
use App\Enum\WithdrawalMethodEnum;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use OpenApi\Attributes as OA;

#[Route('/api/withdrawals', name: 'api_withdrawals_')]
#[OA\Tag(name: 'Withdrawals')]
class WithdrawalApiController extends AbstractController
{
    public function __construct(private WithdrawalService $withdrawalService) {}

    #[Route('', name: 'list', methods: ['GET'])]
    #[OA\Get(
        path: '/api/withdrawals',
        summary: 'Listar solicitudes de retiro del usuario autenticado',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'order', in: 'query', required: false, description: 'Orden cronológico (ASC/DESC)', schema: new OA\Schema(type: 'string', default: 'DESC'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Lista de retiros'),
            new OA\Response(response: 401, description: 'No autorizado')
        ]
    )]
    public function list(Request $request, Security $security): JsonResponse
    {
        $user = $security->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Usuario no autenticado'], 401);
        }

        $order = $request->query->get('order', 'DESC');
        $withdrawals = $this->withdrawalService->getWithdrawalsByUser($user, $order);

        $data = array_map(function (Withdrawal $w) {
            $status = $w->getStatus();
            if ($status instanceof WithdrawalStatusEnum) {
                $status = $status->value;
            }
            return [
                'uid' => $w->getUid(),
                'amount' => $w->getAmount(),
                'status' => $status,
                'date' => $w->getCreatedAt()?->format('c'),
                'reason' => $w->getReason(),
                'method' => $w->getWithdrawalMethod()?->value,
            ];
        }, $withdrawals);

        return $this->json($data);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    #[OA\Post(
        path: '/api/withdrawals',
        summary: 'Solicitar un retiro de saldo',
        security: [['Bearer' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'amount', type: 'number', description: 'Monto a retirar', example: 5000.00),
                    new OA\Property(property: 'reason', type: 'string', description: 'Motivo del retiro', example: 'Pago de servicios'),
                    new OA\Property(property: 'dni', type: 'string', description: 'DNI del profesional para validación', example: '12345678'),
                    new OA\Property(property: 'withdrawalMethod', type: 'string', enum: ['bank_transfer', 'withdrawal_plexo'], example: 'bank_transfer')
                ],
                example: [
                    'amount' => 5000.00,
                    'reason' => 'Pago de servicios',
                    'dni' => '12345678',
                    'withdrawalMethod' => 'bank_transfer'
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Solicitud de retiro creada'),
            new OA\Response(response: 400, description: 'Datos inválidos o saldo insuficiente'),
            new OA\Response(response: 401, description: 'No autorizado'),
            new OA\Response(response: 403, description: 'No tiene billetera activa')
        ]
    )]
    public function create(Request $request, EntityManagerInterface $em, Security $security, ValidatorInterface $validator): JsonResponse
    {
        $user = $security->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Usuario no autenticado'], 401);
        }
        $user = $em->getRepository(User::class)->find($user->getId());
        $user->getWithdrawals()->count();

        $wallet = $em->getRepository(ProfessionalWallet::class)->findOneBy(['professional' => $user]);
        if (!$wallet) {
            return $this->json(['error' => 'No tienes una billetera profesional activa'], 403);
        }

        $data = json_decode($request->getContent(), true);

        $amount = $data['amount'] ?? null;
        $reason = $data['reason'] ?? null;
        $dni = $data['dni'] ?? null;
        $method = $data['withdrawalMethod'] ?? null;

        if (!$amount || !is_numeric($amount) || $amount <= 0) {
            return $this->json(['error' => 'Monto inválido'], 400);
        }

        $amountCents = (int) round($amount * 100);
        $minAmountCents = 5000;

        if ($amountCents < $minAmountCents) {
            return $this->json(['error' => "El monto mínimo de retiro es 50.00"], 400);
        }

        $availableBalance = (int) $wallet->getAvailableBalance();

        if ($amountCents > $availableBalance) {
            return $this->json(['error' => 'Saldo insuficiente'], 400);
        }

        if (!$user->getDni()) {
            return $this->json(['error' => 'Debes configurar tu DNI en tu perfil antes de retirar'], 400);
        }
        if ($dni !== $user->getDni()) {
            return $this->json(['error' => 'El DNI proporcionado no coincide con tu perfil'], 400);
        }

        $lastWithdrawal = $em->getRepository(Withdrawal::class)->findOneBy(
            ['professional' => $user],
            ['createdAt' => 'DESC']
        );

        if ($lastWithdrawal) {
            $diff = $lastWithdrawal->getCreatedAt()->diff(new \DateTimeImmutable());
            if ($diff->days < 1 && $diff->h < 24) {
                return $this->json(['error' => 'Solo puedes realizar un retiro cada 24 horas'], 400);
            }
        }

        $withdrawal = new Withdrawal();
        $withdrawal->setAmount($amountCents);
        $withdrawal->setProfessional($user);
        $withdrawal->setReason($reason);
        $withdrawal->setDni($dni);
        $withdrawal->setStatus(WithdrawalStatusEnum::PENDING);
        $withdrawal->setCreatedAt(new \DateTimeImmutable());

        if ($method) {
            try {
                $withdrawal->setWithdrawalMethod(WithdrawalMethodEnum::from($method));
            } catch (\ValueError $e) {
                return $this->json(['error' => 'Método de retiro inválido'], 400);
            }
        }

        $errors = $validator->validate($withdrawal);
        if (count($errors) > 0) {
            return $this->json(['error' => (string) $errors], 400);
        }

        $em->persist($withdrawal);
        $user->addWithdrawal($withdrawal);

        $em->flush();

        $wallet->setAvailableBalance($wallet->calculateAvailableBalance());
        $wallet->setFrozenBalance($wallet->calculateFrozenBalance());
        $em->persist($wallet);
        $em->flush();

        return $this->json([
            'message' => 'Solicitud de retiro creada exitosamente',
            'uid' => $withdrawal->getUid(),
            'status' => $withdrawal->getStatus()->value,
            'new_balance' => $wallet->getAvailableBalance(),
            'frozen_balance' => $wallet->getFrozenBalance()
        ], 201);
    }
}
