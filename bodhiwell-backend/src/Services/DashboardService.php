<?php

namespace App\Services;

use App\Entity\User;
use App\Enum\BookingEnum;
use App\Enum\PaymentStatusEnum;
use Doctrine\ORM\EntityManagerInterface;

class DashboardService
{
    public function __construct(private EntityManagerInterface $em) {}

    public function getKpisForUser(User $user): array
    {
        return [
            'income' => $this->getIncomeKpi($user),
            'appointments' => $this->getAppointmentsKpi($user),
            'occupation' => $this->getOccupationKpi($user),
            'wallet' => $this->getWalletKpi($user),
            'upcomingBookings' => $this->getUpcomingBookings($user),
        ];
    }

    private function getIncomeKpi(User $user): array
    {
        $incomeThisMonth = $this->calculateIncomeForMonth($user);
        $comparison = $this->calculateIncomeComparison($user);

        return [
            'value' => $incomeThisMonth,
            'comparison' => $comparison['es'],
            'comparisonEn' => $comparison['en'],
            'color' => 'green',
            'currency' => 'UYU',
        ];
    }

    private function getAppointmentsKpi(User $user): array
    {
        return [
            'total' => $this->calculateTotalBookings($user),
            'pendingToday' => $this->calculatePendingBookingsToday($user),
            'color' => 'gray',
        ];
    }

    private function getOccupationKpi(User $user): array
    {
        $rate = $this->calculateOccupationRate($user);

        return [
            'rate' => $rate,
            'details' => [
                'occupied' => $rate . '%',
                'free' => (100 - $rate) . '%',
            ],
        ];
    }

    private function getWalletKpi(User $user): array
    {
        return [
            'balance' => $this->calculateWalletBalance($user),
            'currency' => 'UYU',
        ];
    }

    private function calculateIncomeForMonth(User $user): float
    {
        return $this->fetchSum(
            'SELECT SUM(w.amount) FROM wallet_ledgers w
             JOIN professional_wallets pw ON w.wallet_id = pw.id
             WHERE pw.professional_id = :user
             AND w.concept = :concept
             AND DATE_FORMAT(w.created_at, "%Y-%m") = :currentMonth',
            [
                'user' => $user->getId(),
                'concept' => "FUNDS_RELEASE",
                'currentMonth' => (new \DateTime())->format('Y-m'),
            ]
        );
    }

    private function calculateIncomeComparison(User $user): array
    {
        $currentMonthIncome = $this->calculateIncomeForMonth($user);
        $previousMonthIncome = $this->fetchSum(
            'SELECT SUM(w.amount) FROM wallet_ledgers w
             JOIN professional_wallets pw ON w.wallet_id = pw.id
             WHERE pw.professional_id = :user
             AND w.concept = :concept
             AND DATE_FORMAT(w.created_at, "%Y-%m") = :previousMonth',
            [
                'user' => $user->getId(),
                'concept' => "FUNDS_RELEASE",
                'previousMonth' => (new \DateTime('-1 month'))->format('Y-m'),
            ]
        );

        return $this->formatPercentageChange($currentMonthIncome, $previousMonthIncome);
    }

    private function calculateTotalBookings(User $user): int
    {
        return $this->fetchCount(
            'SELECT COUNT(b.id) FROM booking b WHERE b.professional_user_id = :user',
            ['user' => $user->getId()]
        );
    }

    private function calculatePendingBookingsToday(User $user): int
    {
        return $this->fetchCount(
            'SELECT COUNT(b.id) FROM booking b
             WHERE b.professional_user_id = :user
             AND b.status = :status
             AND DATE(b.date_booking_start) = CURRENT_DATE()',
            [
                'user' => $user->getId(),
                'status' => 'pending',
            ]
        );
    }

    private function calculateOccupationRate(User $user): int
    {
        $total = $this->calculateTotalBookings($user);
        $occupied = $this->fetchCount(
            'SELECT COUNT(b.id) FROM booking b
             WHERE b.professional_user_id = :user
             AND b.status = :status',
            [
                'user' => $user->getId(),
                'status' => 'confirmed',
            ]
        );

        return $total > 0 ? (int) (($occupied / $total) * 100) : 0;
    }

    private function calculateWalletBalance(User $user): float
    {
        return $this->fetchSingleValue(
            'SELECT available_balance FROM professional_wallets WHERE professional_id = :user',
            ['user' => $user->getId()]
        );
    }

    private function getUpcomingBookings(User $user): array
    {
        $query = $this->em->createQuery(
            'SELECT b FROM App\Entity\Booking b
             WHERE b.professionalUser = :user
             AND b.status = :status
             AND b.dateBookingStart > CURRENT_TIMESTAMP()
             ORDER BY b.dateBookingStart ASC'
        );
        $query->setParameter('user', $user);
        $query->setParameter('status', BookingEnum::CONFIRMED->value);

        $bookings = $query->getResult();

        return array_map(function ($booking) {
            $patient = $booking->getPatientUser();
            return [
                'uid' => $booking->getUid(),
                'patientName' => $patient ? $patient->getFirstName() . ' ' . $patient->getLastName() : null,
                'patientUid' => $patient ? $patient->getUid() : null,
                'reservationTime' => $booking->getDateBookingStart()->format('Y-m-d H:i'),
                'reason' => $booking->getReserveReason(),
            ];
        }, $bookings);
    }

    public function getPatientKpis(User $user): array
    {
        return [
            'appointments' => $this->getPatientAppointmentsKpi($user),
            'upcomingBookings' => $this->getUpcomingBookingsForPatient($user),
        ];
    }

    private function getPatientAppointmentsKpi(User $user): array
    {
        return [
            'total' => $this->calculateTotalConsultationForPatient($user),
            'pendingToday' => $this->calculatePendingBookingsTodayForPatient($user),
            'color' => 'blue',
        ];
    }

    private function calculateTotalConsultationForPatient(User $user): int
    {
        return $this->fetchCount(
            'SELECT COUNT(b.id) FROM consultation c INNER JOIN booking b ON c.booking_id = b.id WHERE b.patient_user_id = :user',
            ['user' => $user->getId()]
        );
    }

    private function calculatePendingBookingsTodayForPatient(User $user): int
    {
        return $this->fetchCount(
            'SELECT COUNT(b.id) FROM booking b
             WHERE b.patient_user_id = :user
             AND b.status = :status
             AND DATE(b.date_booking_start) = CURRENT_DATE()',
            [
                'user' => $user->getId(),
                'status' => BookingEnum::CONFIRMED->value,
            ]
        );
    }

    private function getUpcomingBookingsForPatient(User $user): array
    {
        $query = $this->em->createQuery(
            'SELECT b FROM App\Entity\Booking b
             WHERE b.patientUser = :user
             AND b.status = :status
             AND b.dateBookingStart > CURRENT_TIMESTAMP()
             ORDER BY b.dateBookingStart ASC'
        );
        $query->setParameter('user', $user);
        $query->setParameter('status', BookingEnum::CONFIRMED->value);

        $bookings = $query->getResult();

        return array_map(function ($booking) {
            $professional = $booking->getProfessionalUser();
            return [
                'uid' => $booking->getUid(),
                'professionalName' => $professional ? $professional->getFirstName() . ' ' . $professional->getLastName() : null,
                'professionalUid' => $professional ? $professional->getUid() : null,
                'reservationTime' => $booking->getDateBookingStart()->format('Y-m-d H:i'),
                'reason' => $booking->getReserveReason(),
            ];
        }, $bookings);
    }

    private function fetchSum(string $query, array $params): float
    {
        return (float) ($this->em->getConnection()->fetchOne($query, $params) ?? 0);
    }

    private function fetchCount(string $query, array $params): int
    {
        return (int) ($this->em->getConnection()->fetchOne($query, $params) ?? 0);
    }

    private function fetchSingleValue(string $query, array $params): float
    {
        return (float) ($this->em->getConnection()->fetchOne($query, $params) ?? 0);
    }

    private function formatPercentageChange(float $current, float $previous): array
    {
        if ($current === 0.0 || $previous === 0.0) {
            return [
                'es' => 'Sin datos suficientes para comparación',
                'en' => 'No enough data for comparison',
            ];
        }

        if ($previous === 0.0) {
            return [
                'es' => '↑ ' . round($current * 100, 2) . '% (nuevo ingreso)',
                'en' => '↑ ' . round($current * 100, 2) . '% (new income)',
            ];
        }

        $percentageChange = (($current - $previous) / $previous) * 100;

        return $percentageChange >= 0
            ? [
                'es' => '↑ ' . round($percentageChange, 2) . '% vs mes anterior',
                'en' => '↑ ' . round($percentageChange, 2) . '% vs previous month',
            ]
            : [
                'es' => '↓ ' . abs(round($percentageChange, 2)) . '% vs mes anterior',
                'en' => '↓ ' . abs(round($percentageChange, 2)) . '% vs previous month',
            ];
    }
}
