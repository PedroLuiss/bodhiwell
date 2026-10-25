<?php

namespace App\Controller;

use App\Entity\Payment;
use App\Enum\PaymentStatusEnum;
use App\Services\PaymentService;
use App\Services\PermissionService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Testing')]
class TestingApiController extends AbstractController
{
    private PermissionService $permissionService;

    public function __construct(PermissionService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    #[Route('/api/testing-permission', name: 'api_testing_permissions', methods: ['POST'])]
    #[OA\Post(
        path: '/api/testing-permission',
        summary: 'Probar permisos de usuario (Admin)',
        security: [['Bearer' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Permisos válidos'),
            new OA\Response(response: 403, description: 'Acceso denegado')
        ]
    )]
    public function testingPermissions(Request $request): JsonResponse
    {
        try {
            $this->permissionService->hasRoleOrFail($request, 'ROLE_ADMIN');
            $this->permissionService->hasPermissionOrFail($request, 'USER', 'EDITAR');

            return new JsonResponse([
                'message' => 'Prueba completada! Usuario autenticado y con permisos adecuados.'
            ], JsonResponse::HTTP_OK);
        } catch (AccessDeniedException $e) {
            return new JsonResponse([
                'message' => $e->getMessage()
            ], JsonResponse::HTTP_FORBIDDEN);
        }
    }

    #[Route('/api/testing/payments/{uid}/simulate-status', name: 'api_testing_payment_status', methods: ['POST'])]
    #[OA\Post(
        path: '/api/testing/payments/{uid}/simulate-status',
        summary: 'Simular cambio de estado de un pago (Testing)',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'uid', in: 'path', required: true, description: 'UID del pago', schema: new OA\Schema(type: 'string'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'captured')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Estado actualizado'),
            new OA\Response(response: 404, description: 'Pago no encontrado')
        ]
    )]
    public function simulatePaymentStatus(
        string $uid,
        Request $request,
        EntityManagerInterface $em,
        PaymentService $paymentService
    ): JsonResponse {
        $payment = $em->getRepository(Payment::class)->findOneBy(['uid' => $uid]);
        if (!$payment) {
            return $this->json(['error' => 'Payment not found'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $statusStr = $data['status'] ?? null;

        if (!$statusStr) {
            return $this->json(['error' => 'Status is required (e.g., "captured", "approved")'], 400);
        }

        $newStatus = PaymentStatusEnum::tryFrom(strtolower($statusStr));
        if (!$newStatus) {
            return $this->json(['error' => 'Invalid status value'], 400);
        }

        try {
            $paymentService->updatePaymentStatus($payment, $newStatus);

            return $this->json([
                'message' => 'Payment status updated successfully',
                'payment_uid' => $payment->getUid(),
                'new_status' => $newStatus->value
            ]);
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }
}
