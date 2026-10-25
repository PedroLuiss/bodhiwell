<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Enum\TypeAccountEnum;
use App\Services\DashboardService;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use OpenApi\Attributes as OA;

#[Route('/api/dashboard')]
#[OA\Tag(name: 'Dashboard')]
final class DashboardController extends AbstractController
{
    public function __construct(private DashboardService $dashboardService, private LoggerInterface $logger) {}

    #[Route('/kpis', name: 'api_dashboard_kpis', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Get(
        path: '/api/dashboard/kpis',
        summary: 'Obtener indicadores (KPIs) para el panel de profesional',
        security: [['Bearer' => []]],
        responses: [
            new OA\Response(response: 200, description: 'KPIs del profesional'),
            new OA\Response(response: 401, description: 'No autorizado'),
            new OA\Response(response: 403, description: 'Solo profesionales')
        ]
    )]
    public function getKpis(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Autenticación requerida.'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        if ($user->getTypeAccount() !== TypeAccountEnum::PROFESSIONAL->value) {
            return $this->json(['error' => 'Acceso denegado: solo profesionales'], JsonResponse::HTTP_FORBIDDEN);
        }

        try {
            $kpis = $this->dashboardService->getKpisForUser($user);
            return $this->json(['data' => $kpis], JsonResponse::HTTP_OK);
        } catch (\Throwable $e) {
            $this->logger->error('Error al obtener KPIs', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return $this->json(['error' => 'Error interno al obtener KPIs.'], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/kpis-patient', name: 'api_dashboard_kpis_patient', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Get(
        path: '/api/dashboard/kpis-patient',
        summary: 'Obtener indicadores (KPIs) para el panel de consultante',
        security: [['Bearer' => []]],
        responses: [
            new OA\Response(response: 200, description: 'KPIs del consultante'),
            new OA\Response(response: 401, description: 'No autorizado'),
            new OA\Response(response: 403, description: 'Solo consultantes')
        ]
    )]
    public function getPatientKpis(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Autenticación requerida.'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        if ($user->getTypeAccount() !== TypeAccountEnum::PATIENT->value) {
            return $this->json(['error' => 'Acceso denegado: solo consultantes'], JsonResponse::HTTP_FORBIDDEN);
        }

        try {
            $kpis = $this->dashboardService->getPatientKpis($user);
            return $this->json(['data' => $kpis], JsonResponse::HTTP_OK);
        } catch (\Throwable $e) {
            $this->logger->error('Error al obtener KPIs de consultantes', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return $this->json(['error' => 'Error interno al obtener KPIs de consultantes.'], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
