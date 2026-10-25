<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Enum\BookingEnum;
use Psr\Log\LoggerInterface;
use App\Enum\TypeAccountEnum;
use App\Services\AvailabilityService;
use App\Dto\ProfileAvailabilitiesRequest;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use OpenApi\Attributes as OA;

#[Route('/api/profile/my-availabilities')]
#[OA\Tag(name: 'Availabilities')]
final class ProfileAvailabilityApiController extends AbstractController
{
    public function __construct(
        private AvailabilityService $availabilityService,
        private ValidatorInterface $validator,
        private LoggerInterface $logger,
    ) {}

    #[Route('', name: 'api_profile_my_availabilities_get', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Get(
        path: '/api/profile/my-availabilities',
        summary: 'Obtener mis disponibilidades (solo profesionales)',
        security: [['Bearer' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Lista de disponibilidades'),
            new OA\Response(response: 401, description: 'No autorizado'),
            new OA\Response(response: 403, description: 'Solo profesionales')
        ]
    )]
    public function myAvailabilities(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Autenticación requerida.'], Response::HTTP_UNAUTHORIZED);
        }

        if ($user->getTypeAccount() !== TypeAccountEnum::PROFESSIONAL->value) {
            return $this->json(['error' => 'Acceso denegado: solo profesionales'], Response::HTTP_FORBIDDEN);
        }

        $availabilities = $this->availabilityService->getAvailabilitiesForUser($user);

        $response = array_map(function ($availability) {
            $reservations = array_values($availability->getBookings()->filter(
                fn($b) => $b->getStatus() && $b->getStatus()->value !== BookingEnum::CANCELLED->value
            )->toArray());

            return [
                'uid' => $availability->getUid(),
                'day' => $availability->getDayOfWeek()?->value,
                'date' => $availability->getDateAvailability()?->format('Y-m-d'),
                'slots' => $availability->getSlots(),
                'hasReservation' => count($reservations) > 0,
                'reservations' => array_map(function ($booking) {
                    $patient = $booking->getPatientUser();
                    return [
                        'uid' => $booking->getUid(),
                        'patientName' => $patient ? $patient->getFirstName() . ' ' . $patient->getLastName() : null,
                        'patientUid' => $patient ? $patient->getUid() : null,
                        'reservationTime' => [
                            'start' => $booking->getDateBookingStart()->format('H:i'),
                            'end'   => $booking->getDateBookingEnd() ? $booking->getDateBookingEnd()->format('H:i') : null,
                        ],
                        'reason' => $booking->getReserveReason(),
                    ];
                }, $reservations),
            ];
        }, $availabilities);

        return $this->json(['data' => $response], Response::HTTP_OK);
    }

    #[Route('', name: 'api_profile_my_availabilities_post', methods: ['POST', 'PUT'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Post(
        path: '/api/profile/my-availabilities',
        summary: 'Actualizar mis disponibilidades (POST)',
        security: [['Bearer' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(
                        property: 'availabilities',
                        type: 'array',
                        items: new OA\Items(
                            properties: [
                                new OA\Property(property: 'uid', type: 'string', example: 'b47ed7b4-6fa2-4c91-b7f9-a5b1b4c881a2'),
                                new OA\Property(property: 'day', type: 'integer', example: 5),
                                new OA\Property(property: 'date', type: 'string', example: '2025-12-22'),
                                new OA\Property(
                                    property: 'slots',
                                    type: 'array',
                                    items: new OA\Items(
                                        properties: [
                                            new OA\Property(property: 'start', type: 'string', example: '06:00'),
                                            new OA\Property(property: 'end', type: 'string', example: '10:00')
                                        ]
                                    )
                                )
                            ]
                        ),
                        example: [
                            [
                                'uid' => 'b47ed7b4-6fa2-4c91-b7f9-a5b1b4c881a2',
                                'day' => 5,
                                'date' => '2025-12-22',
                                'slots' => [
                                    ['start' => '06:00', 'end' => '10:00'],
                                    ['start' => '14:00', 'end' => '20:00']
                                ]
                            ]
                        ]
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Disponibilidades actualizadas'),
            new OA\Response(response: 400, description: 'Datos inválidos'),
            new OA\Response(response: 401, description: 'No autorizado'),
            new OA\Response(response: 403, description: 'Solo profesionales')
        ]
    )]
    #[OA\Put(
        path: '/api/profile/my-availabilities',
        summary: 'Actualizar mis disponibilidades (PUT)',
        security: [['Bearer' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(
                        property: 'availabilities',
                        type: 'array',
                        items: new OA\Items(
                            properties: [
                                new OA\Property(property: 'uid', type: 'string', example: 'b47ed7b4-6fa2-4c91-b7f9-a5b1b4c881a2'),
                                new OA\Property(property: 'day', type: 'integer', example: 5),
                                new OA\Property(property: 'date', type: 'string', example: '2025-12-22'),
                                new OA\Property(
                                    property: 'slots',
                                    type: 'array',
                                    items: new OA\Items(
                                        properties: [
                                            new OA\Property(property: 'start', type: 'string', example: '06:00'),
                                            new OA\Property(property: 'end', type: 'string', example: '10:00')
                                        ]
                                    )
                                )
                            ]
                        ),
                        example: [
                            [
                                'uid' => 'b47ed7b4-6fa2-4c91-b7f9-a5b1b4c881a2',
                                'day' => 5,
                                'date' => '2025-12-22',
                                'slots' => [
                                    ['start' => '06:00', 'end' => '10:00'],
                                    ['start' => '14:00', 'end' => '20:00']
                                ]
                            ]
                        ]
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Disponibilidades actualizadas'),
            new OA\Response(response: 400, description: 'Datos inválidos'),
            new OA\Response(response: 401, description: 'No autorizado'),
            new OA\Response(response: 403, description: 'Solo profesionales')
        ]
    )]
    public function updateAvailabilities(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Autenticación requerida.'], Response::HTTP_UNAUTHORIZED);
        }
        if ($user->getTypeAccount() !== TypeAccountEnum::PROFESSIONAL->value) {
            return $this->json(['error' => 'Acceso denegado: solo profesionales'], Response::HTTP_FORBIDDEN);
        }

        $payload = json_decode($request->getContent(), true);
        if (!is_array($payload)) {
            return $this->json(['error' => 'JSON inválido.'], Response::HTTP_BAD_REQUEST);
        }

        $dto = new ProfileAvailabilitiesRequest();
        $dto->availabilities = $payload['availabilities'] ?? [];

        $violations = $this->validator->validate($dto);
        if (count($violations) > 0) {
            $errors = [];
            foreach ($violations as $v) {
                $errors[] = [
                    'field' => $v->getPropertyPath(),
                    'message' => $v->getMessage()
                ];
            }
            return $this->json(['errors' => $errors], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $updated = $this->availabilityService->syncAvailabilities($user, $dto->availabilities);

            $data = array_map(function ($a) {
                $reservations = array_values($a->getBookings()->filter(
                    fn($b) => $b->getStatus() && $b->getStatus()->value !== BookingEnum::CANCELLED->value
                )->toArray());

                return [
                    'uid'      => $a->getUid(),
                    'day'      => $a->getDayOfWeek()?->value,
                    'date'     => $a->getDateAvailability()?->format('Y-m-d'),
                    'slots'    => $a->getSlots(),
                    'hasReservation' => count($reservations) > 0,
                    'reservations' => array_map(function ($booking) {
                        $patient = $booking->getPatientUser();
                        return [
                            'uid' => $booking->getUid(),
                            'patientName' => $patient ? $patient->getFirstName() . ' ' . $patient->getLastName() : null,
                            'patientUid' => $patient ? $patient->getUid() : null,
                            'reservationTime' => [
                                'start' => $booking->getDateBookingStart()->format('H:i'),
                                'end'   => $booking->getDateBookingEnd() ? $booking->getDateBookingEnd()->format('H:i') : null,
                            ],
                            'reason' => $booking->getReserveReason(),
                        ];
                    }, $reservations),
                ];
            }, $updated);

            return $this->json(['data' => $data], Response::HTTP_OK);
        } catch (\DomainException $de) {
            return $this->json(['error' => $de->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\InvalidArgumentException $iae) {
            return $this->json(['error' => $iae->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (\Throwable $e) {
            $this->logger->error('Error al actualizar disponibilidades', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            if (($_ENV['APP_ENV'] ?? null) === 'dev') {
                return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            return $this->json(['error' => 'Error interno al actualizar disponibilidades.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
