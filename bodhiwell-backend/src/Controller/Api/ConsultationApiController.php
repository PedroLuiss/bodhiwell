<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Dto\ConsultationInput;
use App\Enum\ConsultationTypeEnum;
use App\Repository\BookingRepository;
use App\Repository\ConsultationRepository;
use Doctrine\ORM\EntityManagerInterface;
use App\Services\ConsultationService;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\{JsonResponse, Request, Response};
use OpenApi\Attributes as OA;

#[Route('/api')]
#[OA\Tag(name: 'Consultations')]
class ConsultationApiController extends AbstractController
{
    public function __construct(
        private BookingRepository $bookingRepository,
        private ConsultationRepository $consultationRepository,
        private EntityManagerInterface $em,
        private ValidatorInterface $validator,
        private SerializerInterface $serializer,
        private ConsultationService $consultationService,
    ) {}

    private function error(string $message, int $status): JsonResponse
    {
        return $this->json(['code' => $status, 'message' => $message], $status);
    }

    #[Route('/consultations', name: 'api_consultations_create', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Post(
        path: '/api/consultations',
        summary: 'Crear una nueva consulta/informe para una reserva',
        security: [['Bearer' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'bookingUid', type: 'string', description: 'UID de la reserva', example: 'dd586829-26e7-449a-934d-4714fa1c41e0'),
                    new OA\Property(property: 'details', type: 'object', description: 'Detalles del informe/consulta', example: [
                        'reasonConsultation' => 'Dolor lumbar crónico',
                        'observations' => 'El paciente muestra ligera mejoría respecto a la cita anterior.',
                        'notes' => 'Revisar nuevamente en una semana y evaluar ejercicios de estiramiento.'
                    ])
                ],
                example: [
                    'bookingUid' => 'dd586829-26e7-449a-934d-4714fa1c41e0',
                    'details' => [
                        'reasonConsultation' => 'Dolor lumbar crónico',
                        'observations' => 'El paciente muestra ligera mejoría respecto a la cita anterior.',
                        'notes' => 'Revisar nuevamente en una semana y evaluar ejercicios de estiramiento.'
                    ]
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Consulta creada'),
            new OA\Response(response: 400, description: 'Datos inválidos'),
            new OA\Response(response: 403, description: 'Prohibido'),
            new OA\Response(response: 404, description: 'Reserva no encontrada'),
            new OA\Response(response: 409, description: 'Conflicto (ya existe consulta)')
        ]
    )]
    public function create(Request $request): JsonResponse
    {
        $data = $request->toArray();
        $bookingUid = $data['bookingUid'] ?? $data['booking_uid'] ?? null;
        $details = $data['details'] ?? [];

        if (!$bookingUid || !is_string($bookingUid) || !is_array($details)) {
            return $this->error('El cuerpo de la solicitud es inválido.', Response::HTTP_BAD_REQUEST);
        }

        $booking = $this->bookingRepository->findOneBy(['uid' => $bookingUid]);
        if (!$booking) {
            return $this->error('Reserva no encontrada.', Response::HTTP_NOT_FOUND);
        }

        if ($booking->getStatus() === 'cancelled') {
            return $this->error('La reserva no está activa.', Response::HTTP_BAD_REQUEST);
        }

        if ($booking->getConsultation()) {
            return $this->error('Ya existe una consulta para esta reserva.', Response::HTTP_CONFLICT);
        }

        $now = new \DateTimeImmutable('now');
        $start = $booking->getDateBookingStart();
        if ($start instanceof \DateTimeInterface && $now < $start) {
            return $this->error(
                'Aún no puedes generar el informe: la reserva inicia el ' . $start->format('Y-m-d H:i') . '.',
                Response::HTTP_BAD_REQUEST
            );
        }

        $currentUser = $this->getUser();
        if (!$currentUser || !$currentUser instanceof User) {
            return $this->error('No autenticado', Response::HTTP_UNAUTHORIZED);
        }
        if ($booking->getProfessionalUser() !== $currentUser && $booking->getPatientUser() !== $currentUser) {
            return $this->error('No puedes usar esta reserva.', Response::HTTP_FORBIDDEN);
        }

        $type = $booking->getType();
        if (!$type) {
            return $this->error('El tipo de la reserva no es válido.', Response::HTTP_BAD_REQUEST);
        }

        if ($type === ConsultationTypeEnum::VIRTUAL && !isset($details['meetingLink'])) {
            $details['meetingLink'] = 'https://video.bodhiwell.com/session/' . uniqid('', true);
        }

        if ($type === ConsultationTypeEnum::PRESENTIAL) {
            $professional = $booking->getProfessionalUser();
            $address = $professional?->getUserDetails()?->getAddress();

            if ($address) {
                $details['address'] = $address;
            } else {
                return $this->error('El profesional no tiene una dirección configurada en su perfil.', Response::HTTP_BAD_REQUEST);
            }
        }

        $bizErrors = $this->consultationService->validate($type, $details);
        if ($bizErrors) {
            return $this->error(implode(' | ', $bizErrors), Response::HTTP_BAD_REQUEST);
        }

        $notes = isset($details['notes']) && is_string($details['notes']) ? $details['notes'] : null;
        $reasonConsultation = isset($details['reasonConsultation']) && is_string($details['reasonConsultation'])
            ? $details['reasonConsultation']
            : null;

        $detailPayload = [];
        foreach (['meetingLink', 'address', 'observations', 'notes', 'reasonConsultation'] as $k) {
            if (array_key_exists($k, $details) && is_string($details[$k])) {
                $detailPayload[$k] = $details[$k];
            }
        }

        $consultation = $this->consultationService->createConsultation(
            booking: $booking,
            type: $type,
            details: $detailPayload,
            notes: $notes,
            reasonConsultation: $reasonConsultation
        );

        $booking->setConsultation($consultation);

        $this->consultationRepository->save($consultation);

        return $this->json([
            'uid'               => $consultation->getUid(),
            'bookingUid'        => $booking->getUid(),
            'type'              => $type->value,
            'date_booking_start' => $booking->getDateBookingStart()?->format('Y/m/d H:i'),
            'details'           => $detailPayload,
            'createdAt'         => $consultation->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ], Response::HTTP_CREATED);
    }

    #[Route('/consultations', name: 'api_consultations_update', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Put(
        path: '/api/consultations',
        summary: 'Actualizar una consulta/informe existente',
        security: [['Bearer' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'bookingUid', type: 'string', example: '6668782b-d122-4a94-9b83-b3618df6bb39'),
                    new OA\Property(property: 'type', type: 'string', example: 'virtual'),
                    new OA\Property(property: 'notes', type: 'string', example: 'Salon 33 piso 2'),
                    new OA\Property(property: 'details', type: 'object', example: ['meetingLink' => 'https://video.example.com/bar']),
                    new OA\Property(property: 'reserve_reason', type: 'string', example: 'Molestia lumbar y mareos'),
                    new OA\Property(property: 'quote_for_invited', type: 'boolean', example: false)
                ],
                example: [
                    'bookingUid' => '6668782b-d122-4a94-9b83-b3618df6bb39',
                    'type' => 'virtual',
                    'notes' => 'Salon 33 piso 2',
                    'reserve_reason' => 'Molestia lumbar y mareos',
                    'quote_for_invited' => false,
                    'details' => [
                        'meetingLink' => 'https://video.example.com/bar'
                    ]
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Consulta actualizada'),
            new OA\Response(response: 400, description: 'Datos inválidos'),
            new OA\Response(response: 403, description: 'Prohibido'),
            new OA\Response(response: 404, description: 'No encontrado')
        ]
    )]
    public function update(Request $request): JsonResponse
    {
        /** 
         * @var ConsultationInput $input 
         */
        $input = $this->serializer->deserialize(
            $request->getContent(),
            ConsultationInput::class,
            'json'
        );

        $raw = $request->toArray();
        if ($input->reserveReason === null && array_key_exists('reserve_reason', $raw)) {
            $input->reserveReason = $raw['reserve_reason'];
        }
        if ($input->quoteForInvited === null && array_key_exists('quote_for_invited', $raw)) {
            $input->quoteForInvited = filter_var($raw['quote_for_invited'], FILTER_VALIDATE_BOOLEAN);
        }

        $errors = $this->validator->validate($input);
        if (count($errors) > 0) {
            return $this->error((string) $errors, Response::HTTP_BAD_REQUEST);
        }

        $booking = $this->bookingRepository->findOneBy(['uid' => $input->bookingUid]);
        if (!$booking) {
            return $this->error('Reserva no encontrada.', Response::HTTP_NOT_FOUND);
        }

        $consultation = $booking->getConsultation();
        if (!$consultation) {
            return $this->error('No existe consulta para esta reserva.', Response::HTTP_NOT_FOUND);
        }

        $user = $this->getUser();
        if ($booking->getProfessionalUser() !== $user && $booking->getPatientUser() !== $user) {
            return $this->error('No puedes modificar esta consulta.', Response::HTTP_FORBIDDEN);
        }

        $type = ConsultationTypeEnum::tryFrom($input->type);
        if (!$type) {
            return $this->error('Tipo de consulta inválido.', Response::HTTP_BAD_REQUEST);
        }

        if ($booking->getType()?->value !== $type->value) {
            return $this->error('El tipo de consulta no coincide con el tipo de la reserva.', Response::HTTP_BAD_REQUEST);
        }

        $bizErrors = $this->consultationService->validate($type, $input->details);
        if ($bizErrors) {
            return $this->error(implode(' | ', $bizErrors), Response::HTTP_BAD_REQUEST);
        }

        $consultation = $this->consultationService->updateConsultation(
            consultation: $consultation,
            type: $type,
            details: $input->details,
            notes: $input->notes ?? null,
            reserveReason: array_key_exists('reserve_reason', $raw)
                ? ($input->reserveReason ?? $raw['reserve_reason'])
                : null,
            quoteForInvited: array_key_exists('quote_for_invited', $raw)
                ? ($input->quoteForInvited ?? filter_var($raw['quote_for_invited'], FILTER_VALIDATE_BOOLEAN))
                : null
        );

        $this->consultationRepository->save($consultation);

        return $this->json([
            'bookingUid'        => $booking->getUid(),
            'type'              => $consultation->getType()->value,
            'notes'             => $consultation->getNotes(),
            'details'           => $input->details,
            'createdAt'         => $consultation->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'reserve_reason'    => $consultation->getReserveReason(),
            'quote_for_invited' => $consultation->isQuoteForInvited(),
        ], Response::HTTP_OK);
    }

    #[Route('/consultations/{uid}', name: 'api_consultations_get', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Get(
        path: '/api/consultations/{uid}',
        summary: 'Obtener detalle de una consulta por UID',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'uid', in: 'path', required: true, schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Detalle de la consulta'),
            new OA\Response(response: 403, description: 'No autorizado'),
            new OA\Response(response: 404, description: 'Consulta no encontrada')
        ]
    )]
    public function getByUid(string $uid): JsonResponse
    {
        $currentUser = $this->getUser();
        if (!$currentUser || !$currentUser instanceof User) {
            return $this->error('No autenticado', Response::HTTP_UNAUTHORIZED);
        }

        $consultation = $this->consultationRepository->findOneByUid($uid);
        if (!$consultation) {
            return $this->error('Consulta no encontrada.', Response::HTTP_NOT_FOUND);
        }

        $booking = $consultation->getBooking();
        $patient = $booking->getPatientUser();

        $type = $currentUser->getTypeAccount();
        if ($type === 'patient') {
            if ($patient?->getId() !== $currentUser->getId()) {
                return $this->error('No autorizado', Response::HTTP_FORBIDDEN);
            }
        } elseif ($type === 'professional') {
            $hasReservation = $this->bookingRepository->hasReservationWithPatient($currentUser, $patient);
            if (!$hasReservation) {
                return $this->error('No autorizado', Response::HTTP_FORBIDDEN);
            }
        } else {
            return $this->error('Tipo de cuenta no permitido', Response::HTTP_FORBIDDEN);
        }

        $response = $this->consultationService->serializeConsultation($consultation);

        return $this->json($response, Response::HTTP_OK);
    }

    #[Route('/my-consultations', name: 'api_my_consultations', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Get(
        path: '/api/my-consultations',
        summary: 'Listar mis consultas (como paciente o profesional)',
        security: [['Bearer' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Lista de consultas'),
            new OA\Response(response: 401, description: 'No autorizado'),
            new OA\Response(response: 403, description: 'Tipo de cuenta no válido')
        ]
    )]
    public function listMyConsultations(): JsonResponse
    {
        /**
         * @var mixed $currentUser
         */
        $currentUser = $this->getUser();
        if (!$currentUser) {
            return $this->json([
                'code' => Response::HTTP_UNAUTHORIZED,
                'message' => 'No autenticado'
            ], Response::HTTP_UNAUTHORIZED);
        }

        $type = method_exists($currentUser, 'getTypeAccount') ? $currentUser->getTypeAccount() : null;
        if (!in_array($type, ['professional', 'patient'], true)) {
            return $this->json([
                'code' => Response::HTTP_FORBIDDEN,
                'message' => 'Tipo de cuenta no válido. Solo las cuentas "professional" o "patient" pueden acceder a este recurso.'
            ], Response::HTTP_FORBIDDEN);
        }

        $consultations = match ($type) {
            'professional' => $this->consultationRepository->findByProfessional($currentUser),
            'patient'      => $this->consultationRepository->findByPatient($currentUser),
        };

        $data = [];
        foreach ($consultations as $consultation) {
            $booking = $consultation->getBooking();
            $professional = $booking->getProfessionalUser();
            $patient = $booking->getPatientUser();

            $reason = $consultation->getReserveReason();
            if (!$reason) {
                foreach ($consultation->getConsultationDetails() as $detail) {
                    if (strtolower((string) $detail->getDetailKey()) === 'reasonconsultation') {
                        $reason = $detail->getDetailValue();
                        break;
                    }
                }
            }

            $professionalName = $professional
                ? trim(($professional->getFirstName() ?? '') . ' ' . ($professional->getLastName() ?? ''))
                : null;
            $patientName = $patient
                ? trim(($patient->getFirstName() ?? '') . ' ' . ($patient->getLastName() ?? ''))
                : null;

            $item = [
                'uid' => $consultation->getUid(),
                'date_booking_start' => $booking->getDateBookingStart()?->format('Y-m-d H:i'),
                'reason' => $reason,
                'professionalUid' => $professional?->getUid(),
                'professionalName' => $professionalName,
                'patientUid' => $patient?->getUid(),
                'patientName' => $patientName,
            ];

            $data[] = $item;
        }

        return $this->json($data, Response::HTTP_OK);
    }

    #[Route('/{uid_patient}/consultations', name: 'api_patient_consultations', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Get(
        path: '/api/{uid_patient}/consultations',
        summary: 'Listar historial de consultas de un paciente (para profesional)',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'uid_patient', in: 'path', required: true, schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Historial de consultas'),
            new OA\Response(response: 403, description: 'Prohibido (solo profesionales)'),
            new OA\Response(response: 404, description: 'Paciente no encontrado')
        ]
    )]
    public function listConsultationsByPatient(string $uid_patient): JsonResponse
    {
        /**
         *  @var User|null $currentUser
         */
        $currentUser = $this->getUser();
        if (!$currentUser) {
            return $this->json([
                'code' => Response::HTTP_UNAUTHORIZED,
                'message' => 'No autenticado'
            ], Response::HTTP_UNAUTHORIZED);
        }

        if ($currentUser->getTypeAccount() !== 'professional') {
            return $this->json([
                'code' => Response::HTTP_FORBIDDEN,
                'message' => 'Solo los profesionales pueden consultar el historial de un consultante.'
            ], Response::HTTP_FORBIDDEN);
        }

        $patient = $this->em->getRepository(User::class)->findOneBy(['uid' => $uid_patient]);
        if (!$patient) {
            return $this->json([
                'code' => Response::HTTP_NOT_FOUND,
                'message' => 'Consultante no encontrado.'
            ], Response::HTTP_NOT_FOUND);
        }

        if (!$this->bookingRepository->hasReservationWithPatient($currentUser, $patient)) {
            return $this->json([
                'code' => Response::HTTP_FORBIDDEN,
                'message' => 'No tienes reservas con este consultante.'
            ], Response::HTTP_FORBIDDEN);
        }

        $consultations = $this->consultationRepository->createQueryBuilder('c')
            ->join('c.booking', 'b')
            ->addSelect('b')
            ->where('b.patientUser = :patient')
            ->setParameter('patient', $patient)
            ->orderBy('b.dateBookingStart', 'DESC')
            ->getQuery()
            ->getResult();

        $data = [];
        foreach ($consultations as $consultation) {
            $booking = $consultation->getBooking();
            $professional = $booking->getProfessionalUser();

            $reason = $consultation->getReserveReason();
            if (!$reason) {
                foreach ($consultation->getConsultationDetails() as $detail) {
                    if (strtolower((string)$detail->getDetailKey()) === 'reasonconsultation') {
                        $reason = $detail->getDetailValue();
                        break;
                    }
                }
            }

            $data[] = [
                'uid' => $consultation->getUid(),
                'professionalName' => $professional ? trim(($professional->getFirstName() ?? '') . ' ' . ($professional->getLastName() ?? '')) : null,
                'date_booking_start' => $booking->getDateBookingStart()?->format('Y-m-d H:i'),
                'reason' => $reason,
            ];
        }

        return $this->json($data, Response::HTTP_OK);
    }
}
