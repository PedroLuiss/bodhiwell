<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Enum\BookingEnum;
use App\Services\BookingManagerService;
use App\Repository\BookingRepository;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\{Request, JsonResponse, Response};
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use App\Enum\ConsultationTypeEnum;
use OpenApi\Attributes as OA;

#[Route('/api/bookings')]
#[OA\Tag(name: 'Bookings')]
class BookingApiController extends AbstractController
{
    public function __construct(
        private BookingManagerService $bookingManager,
        private BookingRepository $bookingRepository,
        private UserRepository $userRepository,
    ) {}

    private function error(string $message, int $status): JsonResponse
    {
        return $this->json(['code' => $status, 'message' => $message], $status);
    }

    #[Route('', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Get(
        path: '/api/bookings',
        summary: 'Listar reservas del usuario autenticado',
        security: [['Bearer' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Lista de reservas'),
            new OA\Response(response: 401, description: 'No autorizado')
        ]
    )]
    public function list(): JsonResponse
    {
        /**
         *  @var User $user
         */
        $user = $this->getUser();

        $bookings = $this->bookingRepository->createQueryBuilder('b')
            ->where('b.patientUser = :user OR b.professionalUser = :user')
            ->setParameter('user', $user)
            ->orderBy('b.createdAt', 'DESC')
            ->getQuery()
            ->getResult();

        $serialized = $this->bookingManager->serializeBookings($bookings);
        return $this->json($serialized, Response::HTTP_OK);
    }

    #[Route('', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Post(
        path: '/api/bookings',
        summary: 'Crear una nueva reserva',
        security: [['Bearer' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    properties: [
                        new OA\Property(property: 'professional_user_uid', type: 'string', example: 'e139a23b-8d28-4871-b3c0-613e00e617ec'),
                        new OA\Property(property: 'date_booking_start', type: 'string', format: 'date-time', example: '2025-12-31 11:00'),
                        new OA\Property(property: 'notes', type: 'string', nullable: true, example: 'Primera cita'),
                        new OA\Property(property: 'type', type: 'string', description: 'Tipo de consulta', example: 'presential'),
                        new OA\Property(property: 'reserve_reason', type: 'string', nullable: true, example: 'Chequeo general'),
                        new OA\Property(property: 'quote_for_invited', type: 'boolean', default: false, example: true),
                        new OA\Property(property: 'patient_image', type: 'string', format: 'binary', nullable: true)
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Reserva creada'),
            new OA\Response(response: 400, description: 'Datos inválidos'),
            new OA\Response(response: 409, description: 'Conflicto de disponibilidad')
        ]
    )]
    public function create(Request $request): JsonResponse
    {
        /**
         *  @var User $user
         */
        $user = $this->getUser();

        if (!$user) {
            return $this->error('Debes estar autenticado para crear una reserva.', Response::HTTP_FORBIDDEN);
        }

        $contentType = strtolower($request->headers->get('Content-Type', ''));
        if (!str_contains($contentType, 'multipart/form-data')) {
            return $this->error('Content-Type debe ser multipart/form-data.', Response::HTTP_UNSUPPORTED_MEDIA_TYPE);
        }

        $fields = $request->request->all();
        /** 
         * @var UploadedFile|null $patientImage 
         */
        $patientImage = $request->files->get('patient_image');

        $typeRaw = (string) ($fields['type'] ?? '');
        if ($typeRaw === '') {
            return $this->error('Debe indicar el tipo de reserva.', Response::HTTP_BAD_REQUEST);
        }

        $typeKey = strtolower(trim($typeRaw));
        if (!in_array($typeKey, ConsultationTypeEnum::values(), true)) {
            $valid = implode(', ', ConsultationTypeEnum::values());
            return $this->error('Tipo de reserva no válido. Valores permitidos: ' . $valid, Response::HTTP_BAD_REQUEST);
        }
        $typeEnum = ConsultationTypeEnum::from($typeKey);

        if (!isset($fields['date_booking_start'])) {
            return $this->error('Falta el campo date_booking_start.', Response::HTTP_BAD_REQUEST);
        }

        try {
            $dateStart = new \DateTimeImmutable($fields['date_booking_start']);
        } catch (\Exception) {
            return $this->error('Formato de fecha/hora inválido (date_booking_start).', Response::HTTP_BAD_REQUEST);
        }
        $professionalUid = $fields['professional_user_uid'] ?? null;
        if (!$professionalUid) {
            return $this->error('Falta el campo professional_user_uid.', Response::HTTP_BAD_REQUEST);
        }

        $patient = $user;

        if (method_exists($patient, 'getUid') && $patient->getUid() === $professionalUid) {
            return $this->error('No puedes reservar contigo mismo como profesional.', Response::HTTP_BAD_REQUEST);
        }

        try {
            $booking = $this->bookingManager->createBooking(
                $patient,
                $professionalUid,
                $dateStart,
                $typeEnum,
                $fields['notes'] ?? null,
                $patientImage,
                $fields['reserve_reason'] ?? null,
                array_key_exists('quote_for_invited', $fields)
                    ? filter_var($fields['quote_for_invited'], FILTER_VALIDATE_BOOLEAN)
                    : false
            );

            $serialized = $this->bookingManager->serializeBookings($booking);
            return $this->json($serialized, Response::HTTP_CREATED);
        } catch (\InvalidArgumentException $e) {
            return $this->error($e->getMessage(), Response::HTTP_NOT_FOUND);
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), Response::HTTP_CONFLICT);
        } catch (\Throwable $e) {
            return $this->error('Error interno del servidor.', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{uid}', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Get(
        path: '/api/bookings/{uid}',
        summary: 'Obtener detalle de una reserva',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'uid', in: 'path', required: true, description: 'UID de la reserva', schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Detalle de la reserva'),
            new OA\Response(response: 403, description: 'Prohibido'),
            new OA\Response(response: 404, description: 'Reserva no encontrada')
        ]
    )]
    public function detail(string $uid): JsonResponse
    {
        /** 
         * @var User $user
         */
        $user = $this->getUser();
        $booking = $this->bookingRepository->findOneBy(['uid' => $uid]);

        if (!$booking) {
            return $this->error('Reserva no encontrada.', Response::HTTP_NOT_FOUND);
        }

        $isOwner =
            ($user->getTypeAccount() === 'patient' && $booking->getPatientUser() === $user) ||
            ($user->getTypeAccount() === 'professional' && $booking->getProfessionalUser() === $user);

        if (!$isOwner) {
            return $this->error('No tienes permiso para ver esta reserva.', Response::HTTP_FORBIDDEN);
        }

        $serialized = $this->bookingManager->serializeBookings($booking);
        return $this->json($serialized, Response::HTTP_OK);
    }

    #[Route('/{uid}', methods: ['PATCH'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Patch(
        path: '/api/bookings/{uid}',
        summary: 'Actualizar una reserva',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'uid', in: 'path', required: true, description: 'UID de la reserva', schema: new OA\Schema(type: 'string'))
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'notes', type: 'string', nullable: true),
                    new OA\Property(property: 'reserve_reason', type: 'string', nullable: true),
                    new OA\Property(property: 'quote_for_invited', type: 'boolean'),
                    new OA\Property(property: 'status', type: 'string', description: 'Nuevo estado (solo para profesionales)', enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'])
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Reserva actualizada'),
            new OA\Response(response: 403, description: 'Prohibido')
        ]
    )]
    public function update(string $uid, Request $request): JsonResponse
    {
        /**
         *  @var User $user
         */
        $user = $this->getUser();
        $booking = $this->bookingRepository->findOneBy(['uid' => $uid]);

        if (!$booking) {
            return $this->error('Reserva no encontrada.', Response::HTTP_NOT_FOUND);
        }

        $isPatientOwner = $user->getTypeAccount() === 'patient' && $booking->getPatientUser() === $user;
        $isProfessionalOwner = $user->getTypeAccount() === 'professional' && $booking->getProfessionalUser() === $user;

        if (!$isPatientOwner && !$isProfessionalOwner) {
            return $this->error('No tienes permiso para modificar esta reserva.', Response::HTTP_FORBIDDEN);
        }

        $data = $request->toArray();

        if (array_key_exists('notes', $data)) {
            $booking->setNotes($data['notes'] ?: null);
        }

        if (array_key_exists('reserve_reason', $data)) {
            $reserveReason = $data['reserve_reason'];
            $booking->setReserveReason($reserveReason ?: null);
        }

        if (array_key_exists('quote_for_invited', $data)) {
            $q = $data['quote_for_invited'];
            $booking->setQuoteForInvited(filter_var($q, FILTER_VALIDATE_BOOLEAN));
        }

        if (array_key_exists('status', $data)) {
            if (!$isProfessionalOwner) {
                return $this->error('Solo el profesional puede cambiar el estado.', Response::HTTP_FORBIDDEN);
            }

            try {
                $enumStatus = BookingEnum::from($data['status']);
                $booking->setStatus($enumStatus);
            } catch (\ValueError) {
                return $this->error('Estado no válido.', Response::HTTP_BAD_REQUEST);
            }
        }

        $this->bookingRepository->save($booking, true);

        $serialized = $this->bookingManager->serializeBookings($booking);
        return $this->json($serialized, Response::HTTP_OK);
    }

    #[Route('/{uid}', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Delete(
        path: '/api/bookings/{uid}',
        summary: 'Cancelar una reserva',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'uid', in: 'path', required: true, description: 'UID de la reserva', schema: new OA\Schema(type: 'string'))
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'reason', type: 'string', description: 'Motivo de la cancelación')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Reserva cancelada'),
            new OA\Response(response: 403, description: 'Prohibido'),
            new OA\Response(response: 404, description: 'Reserva no encontrada')
        ]
    )]
    public function cancel(string $uid, Request $request): JsonResponse
    {
        /**
         * @var User $user
         */
        $user = $this->getUser();
        $booking = $this->bookingRepository->findOneBy(['uid' => $uid]);

        if (!$booking) {
            return $this->error('Reserva no encontrada.', Response::HTTP_NOT_FOUND);
        }

        $isOwner =
            ($user->getTypeAccount() === 'patient' && $booking->getPatientUser() === $user) ||
            ($user->getTypeAccount() === 'professional' && $booking->getProfessionalUser() === $user);

        if (!$isOwner) {
            return $this->error('No tienes permiso para cancelar esta reserva.', Response::HTTP_FORBIDDEN);
        }

        $reason = $request->query->get('reason');
        if ($reason === null) {
            $content = $request->getContent();
            $format = $request->getContentTypeFormat();
            if ($format === 'json' && $content !== '') {
                $data = json_decode($content, true);
                if (is_array($data)) {
                    $reason = $data['reason'] ?? null;
                }
            } else {
                $reason = $request->request->get('reason');
            }
        }
        $this->bookingManager->cancelBooking($booking, $reason);

        $serialized = $this->bookingManager->serializeBookings($booking);
        return $this->json($serialized, Response::HTTP_OK);
    }
}
