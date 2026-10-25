<?php

namespace App\Controller\Admin;

use App\Repository\BookingRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/admin/ajax/bookings')]
#[IsGranted('ROLE_ADMIN')]
class BookingAjaxController extends AbstractController
{
    public function __construct(private BookingRepository $bookingRepository) {}

    #[Route('/by-patient/{patientId}', name: 'admin_ajax_bookings_by_patient', methods: ['GET'])]
    public function getBookingsByPatient(int $patientId): JsonResponse
    {
        $bookings = $this->bookingRepository->createQueryBuilder('b')
            ->where('b.patientUser = :patientId')
            ->setParameter('patientId', $patientId)
            ->orderBy('b.dateBookingStart', 'DESC')
            ->getQuery()
            ->getResult();

        $data = [];
        foreach ($bookings as $booking) {
            $date = $booking->getDateBookingStart() ? $booking->getDateBookingStart()->format('d/m/Y H:i') : 'Sin fecha';
            $status = $booking->getStatus() ?? 'N/A';

            $data[] = [
                'id' => $booking->getId(),
                'label' => sprintf('%s - %s', $date, $status),
            ];
        }

        return $this->json($data);
    }
}
