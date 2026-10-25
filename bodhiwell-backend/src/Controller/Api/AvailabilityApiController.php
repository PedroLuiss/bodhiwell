<?php

namespace App\Controller\Api;

use App\Enum\BookingEnum;
use App\Enum\WeekDayEnum;
use App\Repository\UserRepository;
use App\Repository\AvailabilityRepository;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use OpenApi\Attributes as OA;

#[Route('/api')]
#[OA\Tag(name: 'Availabilities')]
class AvailabilityApiController extends AbstractController
{
    #[Route('/professionals/{uid}/availabilities', name: 'api_professional_availabilities', methods: ['GET'])]
    #[OA\Get(
        path: '/api/professionals/{uid}/availabilities',
        summary: 'Listar disponibilidades de un profesional',
        parameters: [
            new OA\Parameter(name: 'uid', in: 'path', required: true, description: 'UID del profesional', schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Lista de disponibilidades'),
            new OA\Response(response: 404, description: 'Profesional no encontrado')
        ]
    )]
    public function listForProfessional(
        string $uid,
        AvailabilityRepository $availabilityRepository,
        UserRepository $users
    ): JsonResponse {
        $pro = $users->findOneBy(['uid' => $uid]);
        if (!$pro) {
            return $this->json(['error' => 'Profesional no encontrado'], 404);
        }

        $dias = WeekDayEnum::labels();

        $data = array_map(
            function ($a) use ($dias) {
                $reservations = array_values($a->getBookings()->filter(
                    fn($b) => $b->getStatus() && $b->getStatus()->value !== BookingEnum::CANCELLED->value
                )->toArray());

                return [
                    'dayInt' => $a->getDayOfWeek()->value,
                    'day'    => $dias[$a->getDayOfWeek()->value] ?? '',
                    'date'    => $a->getDateAvailability()->format('Y-m-d'),
                    'slots'   => array_map(
                        fn($slot) => [
                            'start' => $slot['start'] ?? null,
                            'end'   => $slot['end'] ?? null,
                        ],
                        $a->getSlots()
                    ),
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
            },
            $availabilityRepository->findByProfessional($pro)
        );

        return $this->json($data);
    }
}
