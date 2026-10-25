<?php

namespace App\Services;

use App\Entity\Booking;
use App\Entity\Consultation;
use App\Entity\ConsultationDetail;
use App\Enum\BookingEnum;
use App\Enum\ConsultationDetailTypeEnum;
use App\Enum\ConsultationStatusEnum;
use App\Enum\ConsultationTypeEnum;
use App\Repository\BookingRepository;
use Symfony\Component\Security\Core\User\UserInterface;

class ConsultationService
{
    public function __construct(
        private BookingRepository $bookingRepository,
        private WalletService $walletService
    ) {}

    /**
     * @param ConsultationTypeEnum $type
     * @param array<string,string> $details
     *
     * @return string[] 
     */
    public function validate(ConsultationTypeEnum $type, array $details): array
    {
        $detailKeys = array_map('strtolower', array_keys($details));

        $errors = [];

        if (empty($details['reasonConsultation'])) {
            $errors[] = 'El motivo de consulta ("reasonConsultation") es obligatorio.';
        }

        if (empty($details['observations'])) {
            $errors[] = 'El campo "observations" es obligatorio.';
        }

        if (empty($details['notes'])) {
            $errors[] = 'El campo "notes" es obligatorio.';
        }

        return $errors;
    }

    public function createConsultation(
        Booking $booking,
        ConsultationTypeEnum $type,
        array $details,
        ?string $notes = null,
        ?string $reasonConsultation = null
    ): Consultation {
        $consultation = new Consultation();
        $consultation->setBooking($booking);
        $consultation->setType($type);
        $consultation->setNotes($notes ?? '');
        $consultation->setReserveReason($reasonConsultation);
        $consultation->setQuoteForInvited(false);
        $consultation->setConsultationStatus(ConsultationStatusEnum::COMPLETED);

        $booking->setStatus(BookingEnum::COMPLETED);

        // Release funds and apply commission
        try {
            $this->walletService->processBookingCompletion($booking);
        } catch (\Throwable $e) {
            // Log error
        }

        $detailsToAdd = [];
        foreach ($booking->getBookingDetails() as $bookingDetail) {
            $keyEnum = $bookingDetail->getDetailKey();

            $key = $keyEnum instanceof \BackedEnum
                ? strtolower($keyEnum->value)
                : strtolower((string)$keyEnum);

            $value = $bookingDetail->getDetailValue();

            if ($type === ConsultationTypeEnum::VIRTUAL && $key === 'meetinglink') {
                $detailsToAdd['meetingLink'] = $value;
            }

            if ($type === ConsultationTypeEnum::PRESENTIAL && $key === 'address') {
                $detailsToAdd['address'] = $value;
            }
        }

        $detailsToAdd = array_merge($detailsToAdd, $details);

        foreach ($detailsToAdd as $key => $value) {
            $detailType = ConsultationDetailTypeEnum::tryFrom($key);
            $detail = (new ConsultationDetail())
                ->setDetailKey($detailType ? $detailType->value : $key)
                ->setDetailValue($value);
            $consultation->addConsultationDetail($detail);
        }

        return $consultation;
    }

    public function updateConsultation(
        Consultation $consultation,
        ConsultationTypeEnum $type,
        array $details,
        ?string $notes = null,
        ?string $reserveReason = null,
        ?bool $quoteForInvited = null
    ): Consultation {
        $consultation->setType($type);
        $consultation->setNotes($notes ?? '');
        if ($reserveReason !== null) {
            $consultation->setReserveReason($reserveReason ?: null);
        }
        if ($quoteForInvited !== null) {
            $consultation->setQuoteForInvited((bool)$quoteForInvited);
        }

        foreach ($consultation->getConsultationDetails() as $existing) {
            $consultation->removeConsultationDetail($existing);
        }

        foreach ($details as $key => $value) {
            $detailType = ConsultationDetailTypeEnum::tryFrom($key);
            if (!$detailType) {
                continue;
            }

            $detail = (new ConsultationDetail())
                ->setDetailKey($detailType->value)
                ->setDetailValue($value);
            $consultation->addConsultationDetail($detail);
        }

        return $consultation;
    }

    public function serializeConsultation(Consultation $consultation): array
    {
        $booking = $consultation->getBooking();
        $details = [];

        foreach ($consultation->getConsultationDetails() as $detail) {
            $details[strtolower($detail->getDetailKey())] = $detail->getDetailValue();
        }

        $professional = $booking->getProfessionalUser();
        $professionalName = $professional
            ? trim(($professional->getFirstName() ?? '') . ' ' . ($professional->getLastName() ?? ''))
            : null;
        $prefixProfessional = $professional?->getUserDetails()?->getPrefixProfessional();

        $patient = $booking->getPatientUser();
        $consultantName = $patient
            ? trim(($patient->getFirstName() ?? '') . ' ' . ($patient->getLastName() ?? ''))
            : null;

        return [
            'uid'                => $consultation->getUid(),
            'bookingUid'         => $booking->getUid(),
            'date_booking_start' => $booking->getDateBookingStart()?->format('Y/m/d H:i'),
            'reserve_reason'     => $booking->getReserveReason(),
            'observations'       => $details['observations'] ?? null,
            'notes'              => $details['notes'] ?? null,
            'professionalUid'    => $professional?->getUid(),
            'professionalName'   => $professionalName,
            'prefix_professional' => $prefixProfessional,
            'consultantUid'      => $patient?->getUid(),
            'consultantName'     => $consultantName,
        ];
    }

    public function canProfessionalViewConsultation(
        UserInterface $professional,
        Consultation $consultation
    ): bool {
        $booking = $consultation->getBooking();
        $patient = $booking->getPatientUser();

        $count = $this->bookingRepository->createQueryBuilder('b')
            ->select('COUNT(b.id)')
            ->where('b.professionalUser = :pro')
            ->andWhere('b.patientUser = :patient')
            ->setParameter('pro', $professional)
            ->setParameter('patient', $patient)
            ->getQuery()
            ->getSingleScalarResult();

        return (int)$count > 0;
    }
}
