<?php

namespace App\Controller\Api;

use App\Services\WebhookProcessor;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Webhooks')]
class WebhookApiController extends AbstractController
{
    public function __construct(private RateLimiterFactory $plexoWebhookLimiter) {}

    #[Route('/api/webhooks/plexo', methods: ['POST'])]
    #[OA\Post(
        path: '/api/webhooks/plexo',
        summary: 'Recibir notificaciones (webhooks) de Plexo',
        responses: [
            new OA\Response(response: 200, description: 'Webhook procesado'),
            new OA\Response(response: 429, description: 'Demasiadas solicitudes')
        ]
    )]
    public function plexoWebhook(Request $request, WebhookProcessor $processor): JsonResponse
    {
        $key = $request->getClientIp() ?? 'unknown';
        $limiter = $this->plexoWebhookLimiter->create($key);
        $limit = $limiter->consume(1);

        if (!$limit->isAccepted()) {
            return new JsonResponse(['message' => 'Too many requests'], 429);
        }

        $result = $processor->handleRequest($request);
        return new JsonResponse(['message' => $result['message']], $result['status']);
    }
}
