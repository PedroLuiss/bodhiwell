<?php

namespace App\Controller;

use App\Entity\User;
use App\Enum\NotificationTypeEnum;
use App\Repository\NotificationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use OpenApi\Attributes as OA;

#[Route('/api/notifications')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
#[OA\Tag(name: 'Notifications')]
class NotificationController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private NotificationRepository $notificationRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        NotificationRepository $notificationRepository
    ) {
        $this->entityManager = $entityManager;
        $this->notificationRepository = $notificationRepository;
    }

    #[Route('/device-token', name: 'api_notifications_device_token', methods: ['POST'])]
    #[OA\Post(
        path: '/api/notifications/device-token',
        summary: 'Actualizar el token de dispositivo (FCM) del usuario',
        security: [['Bearer' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'token', type: 'string', example: 'fcm_token_generado_por_firebase_en_el_front')
                ],
                example: ['token' => 'fcm_token_generado_por_firebase_en_el_front']
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Token actualizado exitosamente'),
            new OA\Response(response: 400, description: 'Token requerido')
        ]
    )]
    public function updateDeviceToken(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);
        $token = $data['token'] ?? null;

        if (!$token) {
            return $this->json(['error' => 'Token is required'], Response::HTTP_BAD_REQUEST);
        }

        $user->setFcmToken($token);
        $this->entityManager->flush();

        return $this->json(['message' => 'Device token updated successfully']);
    }

    #[Route('', name: 'api_notifications_list', methods: ['GET'])]
    #[OA\Get(
        path: '/api/notifications',
        summary: 'Listar notificaciones del usuario con filtros y paginación',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', schema: new OA\Schema(type: 'integer', default: 1)),
            new OA\Parameter(name: 'limit', in: 'query', schema: new OA\Schema(type: 'integer', default: 20)),
            new OA\Parameter(name: 'search', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'type', in: 'query', schema: new OA\Schema(type: 'string', enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR'])),
            new OA\Parameter(name: 'prioritize_unread', in: 'query', schema: new OA\Schema(type: 'boolean', default: false))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Lista de notificaciones')
        ]
    )]
    public function list(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 20);
        $search = $request->query->get('search');
        $typeParam = $request->query->get('type');
        $prioritizeUnread = $request->query->getBoolean('prioritize_unread', false);

        $type = null;
        if ($typeParam) {
            $type = NotificationTypeEnum::tryFrom($typeParam);
        }

        $paginator = $this->notificationRepository->findByFilters($user, $search, $type, $page, $limit, $prioritizeUnread);
        $total = $paginator->count();
        $notifications = iterator_to_array($paginator);

        return $this->json([
            'data' => $notifications,
            'meta' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit),
            ]
        ], Response::HTTP_OK, [], ['groups' => 'notification:read']);
    }

    #[Route('/{uid}/read', name: 'api_notifications_mark_read', methods: ['PATCH'])]
    #[OA\Patch(
        path: '/api/notifications/{uid}/read',
        summary: 'Marcar una notificación específica como leída',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'uid', in: 'path', required: true, schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Notificación marcada como leída'),
            new OA\Response(response: 404, description: 'Notificación no encontrada'),
            new OA\Response(response: 403, description: 'Acceso denegado')
        ]
    )]
    public function markAsRead(string $uid): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $notification = $this->notificationRepository->findOneBy(['uid' => $uid]);

        if (!$notification) {
            return $this->json(['error' => 'Notification not found'], Response::HTTP_NOT_FOUND);
        }

        if ($notification->getUser() !== $user) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        if (!$notification->getReadAt()) {
            $notification->setReadAt(new \DateTimeImmutable());
            $this->entityManager->flush();
        }

        return $this->json(['message' => 'Notification marked as read']);
    }

    #[Route('/unread-count', name: 'api_notifications_unread_count', methods: ['GET'])]
    #[OA\Get(
        path: '/api/notifications/unread-count',
        summary: 'Obtener el contador de notificaciones no leídas',
        security: [['Bearer' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Contador de no leídas')
        ]
    )]
    public function unreadCount(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $count = $this->notificationRepository->count([
            'user' => $user,
            'readAt' => null
        ]);

        return $this->json(['count' => $count]);
    }
    #[Route('/read-all', name: 'api_notifications_mark_all_read', methods: ['PATCH'])]
    #[OA\Patch(
        path: '/api/notifications/read-all',
        summary: 'Marcar todas las notificaciones del usuario como leídas',
        security: [['Bearer' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Todas las notificaciones marcadas como leídas')
        ]
    )]
    public function markAllAsRead(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $count = $this->notificationRepository->markAllAsRead($user);

        return $this->json([
            'message' => 'All notifications marked as read',
            'updated_count' => $count
        ]);
    }
}
