<?php

namespace App\Controller;

use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\{JsonResponse, Request, Response};
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Services\FirebaseService;
use App\Services\AuthService;
use App\Utils\UserSerializer;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Mailer\UserMailer;
use OpenApi\Attributes as OA;

#[Route('/api/auth')]
#[OA\Tag(name: 'Auth')]
class ApiAuthController extends AbstractController
{
    private function error(string $message, int $status): JsonResponse
    {
        return new JsonResponse(['code' => $status, 'message' => $message], $status);
    }

    #[Route('/register', methods: ['POST'])]
    #[OA\Post(
        path: '/api/auth/register',
        summary: 'Registrar un nuevo usuario',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'first_name', type: 'string', example: 'pedro2'),
                    new OA\Property(property: 'last_name', type: 'string', example: 'meda2'),
                    new OA\Property(property: 'email', type: 'string', example: 'pedro2@gmail.com'),
                    new OA\Property(property: 'password', type: 'string', example: 'Realmadrid.37'),
                    new OA\Property(property: 'type_account', type: 'string', example: 'professional'),
                    new OA\Property(property: 'newsletter_active', type: 'boolean', example: true)
                ],
                example: [
                    'first_name' => 'Pedro',
                    'last_name' => 'Pérez',
                    'email' => 'pedro@example.com',
                    'password' => 'Password.123',
                    'type_account' => 'professional',
                    'newsletter_active' => true
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Usuario registrado correctamente',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string'),
                        new OA\Property(property: 'token', type: 'string'),
                        new OA\Property(property: 'user', type: 'object')
                    ]
                )
            ),
            new OA\Response(response: 400, description: 'Datos inválidos')
        ]
    )]
    public function register(
        Request $request,
        AuthService $authService,
        JWTTokenManagerInterface $jwtManager,
        UserSerializer $userSerializer
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        try {
            $result = $authService->register($data);
            $user = $result['user'];
            $token = $jwtManager->create($user);

            return new JsonResponse([
                'message' => 'Usuario registrado y autenticado correctamente',
                'token' => $token,
                'user' => $userSerializer::serializeForAuth($user)
            ], Response::HTTP_CREATED);
        } catch (\InvalidArgumentException | \RuntimeException $e) {
            return $this->error($e->getMessage(), Response::HTTP_BAD_REQUEST);
        } catch (\Throwable $e) {
            return $this->error('Error interno del servidor.', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/jwt-login', methods: ['POST'])]
    #[OA\Post(
        path: '/api/auth/jwt-login',
        summary: 'Iniciar sesión con email y contraseña (JWT)',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'email', type: 'string', example: 'user@example.com'),
                    new OA\Property(property: 'password', type: 'string', example: 'password123')
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Autenticación exitosa',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'token', type: 'string'),
                        new OA\Property(property: 'user', type: 'object')
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Credenciales inválidas')
        ]
    )]
    public function jwtLogin(
        Request $request,
        AuthService $authService,
        JWTTokenManagerInterface $jwtManager,
        UserSerializer $userSerializer
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        try {
            $user = $authService->login($data['email'], $data['password']);
            return new JsonResponse([
                'token' => $jwtManager->create($user),
                'user' => $userSerializer->serializeForAuth($user)
            ], Response::HTTP_OK);
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), Response::HTTP_UNAUTHORIZED);
        } catch (\Throwable $e) {
            return $this->error('Error interno del servidor.', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/firebase-login', methods: ['POST'])]
    #[OA\Post(
        path: '/api/auth/firebase-login',
        summary: 'Iniciar sesión con Firebase',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'accessToken', type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ims2ZzViODVhMzMyM1NDN1hNTExNNDAsMzMxMzQyLTM1N2M5ZDEzZDMwZTE4YzQ2a255d3E0b2lhZDI0ZDI5NyI1NnZtZ2EiaDI0dDI5NyInXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.Q3WwXA1DiJKV1qifQ'),
                ],
                example: [
                    'accessToken' => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ims2ZzViODVhMzMyM1NDN1hNTExNNDAsMzMxMzQyLTM1N2M5ZDEzZDMwZTE4YzQ2a255d3E0b2lhZDI0ZDI5NyI1NnZtZ2EiaDI0dDI5NyInXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.Q3WwXA1DiJKV1qifQ'
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Autenticación exitosa',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'code', type: 'integer'),
                        new OA\Property(property: 'message', type: 'string'),
                        new OA\Property(property: 'token', type: 'string'),
                        new OA\Property(property: 'user', type: 'object')
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Token de Firebase inválido')
        ]
    )]
    public function firebaseLogin(
        Request $request,
        AuthService $authService,
        FirebaseService $firebaseService,
        JWTTokenManagerInterface $jwtManager,
        UserSerializer $userSerializer
    ): JsonResponse {
        $data = json_decode($request->getContent(), true) ?? [];

        $idToken = $data['id_token']
            ?? $data['access_token']
            ?? $data['accessToken']
            ?? null;

        if (!$idToken) {
            return $this->error('Falta el id_token en el cuerpo de la petición.', Response::HTTP_BAD_REQUEST);
        }

        if (substr_count($idToken, '.') !== 2) {
            return $this->error('El token enviado no es un ID token válido (formato JWT).', Response::HTTP_BAD_REQUEST);
        }

        try {
            $user = $authService->loginWithFirebase(
                $idToken,
                $firebaseService,
                $this->getParameter('kernel.project_dir'),
                $data['type_account'] ?? null,
                $data['newsletter_active'] ?? false
            );

            return new JsonResponse([
                'code' => Response::HTTP_OK,
                'message' => 'Autenticación exitosa',
                'token' => $jwtManager->create($user),
                'user' => $userSerializer->serializeForAuth($user),
            ], Response::HTTP_OK);
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), Response::HTTP_UNAUTHORIZED);
        } catch (\Throwable $e) {
            return $this->error('Error interno del servidor.', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    #[Route('/forgot-password', methods: ['POST'])]
    #[OA\Post(
        path: '/api/auth/forgot-password',
        summary: 'Solicitar recuperación de contraseña',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'email', type: 'string', example: 'liam@gmail.com')
                ],
                example: ['email' => 'liam@gmail.com']
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Correo de recuperación enviado si el usuario existe')
        ]
    )]
    public function forgotPassword(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        UserMailer $mailer
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;

        if (!$email) {
            return $this->error('El correo electrónico es obligatorio.', Response::HTTP_BAD_REQUEST);
        }

        $user = $userRepository->findOneBy(['email' => $email]);

        if ($user) {
            $token = bin2hex(random_bytes(32));
            $user->setResetPasswordToken($token);
            $user->setResetTokenExpiresAt(new \DateTime('+15 minutes'));

            $entityManager->flush();

            $mailer->sendPasswordReset($user, $token);
        }

        return new JsonResponse(['message' => 'Si el correo existe en nuestro sistema, recibirás un enlace de recuperación.'], Response::HTTP_OK);
    }

    #[Route('/validate-token/{token}', methods: ['GET'])]
    #[OA\Get(
        path: '/api/auth/validate-token/{token}',
        summary: 'Validar token de recuperación de contraseña',
        parameters: [
            new OA\Parameter(name: 'token', in: 'path', required: true, schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Token válido'),
            new OA\Response(response: 404, description: 'Token inválido'),
            new OA\Response(response: 400, description: 'Token expirado')
        ]
    )]
    public function validateToken(
        string $token,
        UserRepository $userRepository
    ): JsonResponse {
        $user = $userRepository->findOneBy(['resetPasswordToken' => $token]);

        if (!$user) {
            return $this->error('Token inválido.', Response::HTTP_NOT_FOUND);
        }

        if ($user->getResetTokenExpiresAt() < new \DateTime()) {
            return $this->error('El token ha expirado.', Response::HTTP_BAD_REQUEST);
        }

        return new JsonResponse(['valid' => true], Response::HTTP_OK);
    }

    #[Route('/reset-password', methods: ['POST'])]
    #[OA\Post(
        path: '/api/auth/reset-password',
        summary: 'Restablecer contraseña con token',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'token', type: 'string', example: 'a18638b8c27663d6419062404041a36c94db403930e1c42a5d9300b99eb7be4b9'),
                    new OA\Property(property: 'newPassword', type: 'string', example: 'Barcelona.37')
                ],
                example: [
                    'token' => 'a18638b8c27663d6419062404041a36c94db403930e1c42a5d9300b99eb7be4b9',
                    'newPassword' => 'Barcelona.37'
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Contraseña restablecida correctamente'),
            new OA\Response(response: 404, description: 'Token inválido'),
            new OA\Response(response: 400, description: 'Token expirado o datos faltantes')
        ]
    )]
    public function resetPassword(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $token = $data['token'] ?? null;
        $newPassword = $data['newPassword'] ?? null;

        if (!$token || !$newPassword) {
            return $this->error('Token y nueva contraseña son obligatorios.', Response::HTTP_BAD_REQUEST);
        }

        $user = $userRepository->findOneBy(['resetPasswordToken' => $token]);

        if (!$user) {
            return $this->error('Token inválido.', Response::HTTP_NOT_FOUND);
        }

        if ($user->getResetTokenExpiresAt() < new \DateTime()) {
            return $this->error('El token ha expirado.', Response::HTTP_BAD_REQUEST);
        }

        $hashedPassword = $passwordHasher->hashPassword($user, $newPassword);
        $user->setPassword($hashedPassword);
        $user->setResetPasswordToken(null);
        $user->setResetTokenExpiresAt(null);

        $entityManager->flush();

        return new JsonResponse(['message' => 'Contraseña restablecida correctamente.'], Response::HTTP_OK);
    }
}
