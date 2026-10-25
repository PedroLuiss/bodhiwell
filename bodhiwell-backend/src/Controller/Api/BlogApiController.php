<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Services\WordPressService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Psr\Log\LoggerInterface;
use OpenApi\Attributes as OA;

#[Route('/api/blog', name: 'api_blog_')]
#[OA\Tag(name: 'Blog')]
class BlogApiController extends AbstractController
{
    public function __construct(
        private WordPressService $wordPressService,
        private LoggerInterface $logger
    ) {}

    #[Route('/posts', name: 'list', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Get(
        path: '/api/blog/posts',
        summary: 'Listar entradas de blog del profesional autenticado',
        security: [['Bearer' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Lista de entradas'),
            new OA\Response(response: 401, description: 'No autorizado'),
            new OA\Response(response: 403, description: 'Solo profesionales')
        ]
    )]
    public function list(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        if ($user->getTypeAccount() !== 'professional') {
            return $this->json(['error' => 'Forbidden'], Response::HTTP_FORBIDDEN);
        }

        try {
            $posts = $this->wordPressService->getPostsByAuthor($user->getEmail());
            return $this->json($posts);
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/post', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Post(
        path: '/api/blog/post',
        summary: 'Crear una nueva entrada en el blog',
        security: [['Bearer' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'title', type: 'string'),
                    new OA\Property(property: 'content', type: 'string'),
                    new OA\Property(property: 'status', type: 'string', enum: ['publish', 'draft', 'private']),
                    new OA\Property(property: 'image', type: 'string', description: 'Imagen en base64')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Entrada creada'),
            new OA\Response(response: 400, description: 'Datos insuficientes'),
            new OA\Response(response: 403, description: 'Solo profesionales')
        ]
    )]
    public function create(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        if ($user->getTypeAccount() !== 'professional') {
            return $this->json(['error' => 'Forbidden'], Response::HTTP_FORBIDDEN);
        }

        $data = $request->toArray();
        $wpPostData = [
            'title' => $data['title'] ?? null,
            'content' => $data['content'] ?? null,
            'status' => $data['status'] ?? 'publish',
            'author_email' => $user->getEmail(),
            'author_name' => $user->getFullName(),
            'image_base64' => $data['image'] ?? null,
        ];

        if (!$wpPostData['title'] || !$wpPostData['content']) {
            return $this->json(['error' => 'Title and content are required'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $result = $this->wordPressService->createPost($wpPostData);
            return $this->json($result, Response::HTTP_CREATED);
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/post/{id}', name: 'update', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Put(
        path: '/api/blog/post/{id}',
        summary: 'Actualizar una entrada del blog',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'title', type: 'string'),
                    new OA\Property(property: 'content', type: 'string'),
                    new OA\Property(property: 'status', type: 'string', enum: ['publish', 'draft', 'private']),
                    new OA\Property(property: 'image', type: 'string', description: 'Imagen en base64')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Entrada actualizada'),
            new OA\Response(response: 403, description: 'Solo profesionales'),
            new OA\Response(response: 500, description: 'Error al actualizar')
        ]
    )]
    public function update(int $id, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        if ($user->getTypeAccount() !== 'professional') {
            return $this->json(['error' => 'Forbidden'], Response::HTTP_FORBIDDEN);
        }

        $data = $request->toArray();
        $wpPostData = array_filter([
            'title' => $data['title'] ?? null,
            'content' => $data['content'] ?? null,
            'status' => $data['status'] ?? null,
            'image_base64' => $data['image'] ?? null,
        ]);

        try {
            $result = $this->wordPressService->updatePost($id, $wpPostData);
            return $this->json($result);
        } catch (\Throwable $e) {
            $this->logger->error('Error updating blog post', [
                'id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/post/{id}', name: 'delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Delete(
        path: '/api/blog/post/{id}',
        summary: 'Eliminar una entrada del blog',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Entrada eliminada'),
            new OA\Response(response: 403, description: 'Solo profesionales'),
            new OA\Response(response: 500, description: 'Error al eliminar')
        ]
    )]
    public function delete(int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        if ($user->getTypeAccount() !== 'professional') {
            return $this->json(['error' => 'Forbidden'], Response::HTTP_FORBIDDEN);
        }

        try {
            $this->wordPressService->deletePost($id);
            return $this->json(['success' => true]);
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
