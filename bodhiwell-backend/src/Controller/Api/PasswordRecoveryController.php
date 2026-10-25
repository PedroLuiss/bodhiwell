<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use App\Services\PasswordRecoveryService;
use OpenApi\Attributes as OA;

#[Route('/api/password')]
#[OA\Tag(name: 'Auth')]
class PasswordRecoveryController extends AbstractController
{
    #[Route('/recover', name: 'password_recover', methods: ['POST'])]
    #[OA\Post(
        path: '/api/password/recover',
        summary: 'Solicitar recuperación de contraseña (vía PasswordRecoveryController)',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'email', type: 'string', example: 'usernews124siiga111@example.com')
                ],
                example: ['email' => 'usernews124siiga111@example.com']
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Correo enviado si el usuario existe'),
            new OA\Response(response: 400, description: 'Email obligatorio')
        ]
    )]
    public function recover(Request $request, PasswordRecoveryService $recoveryService): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;

        if (!$email) {
            return new JsonResponse(['error' => 'El email es obligatorio'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $recoveryService->requestRecovery($email);

        return new JsonResponse(['message' => 'Si el email existe, se ha enviado un enlace de recuperación.'], JsonResponse::HTTP_OK);
    }

    #[Route('/reset', name: 'password_reset', methods: ['POST'])]
    #[OA\Post(
        path: '/api/password/reset',
        summary: 'Restablecer contraseña con token (vía PasswordRecoveryController)',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'token', type: 'string'),
                    new OA\Property(property: 'password', type: 'string')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Contraseña actualizada'),
            new OA\Response(response: 400, description: 'Faltan campos o token inválido')
        ]
    )]
    public function reset(Request $request, PasswordRecoveryService $recoveryService): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $token = $data['token'] ?? null;
        $newPassword = $data['password'] ?? null;

        if (!$token || !$newPassword) {
            return new JsonResponse(['error' => 'Faltan campos requeridos'], JsonResponse::HTTP_BAD_REQUEST);
        }

        try {
            $recoveryService->resetPassword($token, $newPassword);
            return new JsonResponse(['message' => 'Contraseña actualizada correctamente'], JsonResponse::HTTP_OK);
        } catch (\RuntimeException $e) {
            return new JsonResponse(['error' => $e->getMessage()], JsonResponse::HTTP_BAD_REQUEST);
        }
    }
}
