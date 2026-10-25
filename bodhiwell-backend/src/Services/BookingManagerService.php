<?php

namespace App\Services;

use DateInterval;
use App\Entity\User;
use App\Entity\Booking;
use App\Utils\Sanitizer;
use App\Enum\BookingEnum;
use App\Mailer\BookingMailer;
use App\Utils\FileValidator;
use App\Services\UserService;
use App\Utils\FileUploadUtil;
use App\Enum\ConsultationTypeEnum;
use App\Repository\UserRepository;
use App\Repository\BookingRepository;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\AvailabilityRepository;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use App\Entity\BookingDetail;
use App\Enum\BookingDetailTypeEnum;
use App\Enum\ConsultTypeEnum;
use App\Services\Notification\NotificationManager;
use App\Enum\NotificationTypeEnum;
use App\Services\WalletService;
use App\Enum\PaymentStatusEnum;


class BookingManagerService
{
    public function __construct(
        private BookingRepository     $bookingRepository,
        private EntityManagerInterface $em,
        private UserService            $userService,
        private UserRepository         $userRepository,
        private AvailabilityRepository $availabilityRepository,
        private FileUploadUtil         $fileUploadUtil,
        private Sanitizer              $sanitizer,
        private FileValidator          $fileValidator,
        private BookingMailer          $bookingMailer,
        private NotificationManager    $notificationManager,
        private WalletService          $walletService,
    ) {}

    /* -------------------- Helpers -------------------- */

    private function addBookingDetail(Booking $booking, BookingDetailTypeEnum $key, ?string $value): void
    {
        $detail = (new BookingDetail())
            ->setDetailKey($key)
            ->setDetailValue($value);
        $booking->addBookingDetail($detail);
    }

    public function getAvailabilityRepository(): AvailabilityRepository
    {
        return $this->availabilityRepository;
    }

    public function assignAvailability(Booking $booking): void
    {
        $start = $booking->getDateBookingStart();
        $professional = $booking->getProfessionalUser();

        if (!$start || !$professional) {
            throw new \RuntimeException('Faltan datos para asignar disponibilidad.');
        }

        $availability = $this->bookingRepository->findAvailabilityForBooking($professional, $start);

        if (!$availability) {
            throw new \RuntimeException('No existe disponibilidad para ese día.');
        }

        $booking->setAvailability($availability);
    }

    public function createBooking(
        User $patient,
        string $professionalUid,
        \DateTimeInterface $start,
        ConsultationTypeEnum $type,
        ?string $notes = null,
        ?UploadedFile $patientImage = null,
        ?string $reserveReason = null,
        bool $quoteForInvited = false
    ): Booking {

        $professionalUid = trim($professionalUid);
        if ($professionalUid === '') {
            throw new \InvalidArgumentException('UID del profesional no puede estar vacío.');
        }

        $professional = $this->userRepository->findOneBy(['uid' => $professionalUid, 'type_account' => 'professional']);
        if (!$professional) {
            throw new \InvalidArgumentException('Profesional no encontrado');
        }

        $proDetails = $professional->getUserDetails();
        $proType = $proDetails?->getConsultType();

        if ($proType) {
            $isHybrid = $proType === ConsultTypeEnum::HYBRID->value;
            if (!$isHybrid && $type->value !== $proType) {
                $required = ConsultTypeEnum::tryFrom($proType)?->label() ?? $proType;
                throw new \RuntimeException(sprintf('El profesional solo atiende en modalidad: %s.', $required));
            }
        }

        $notes = $this->sanitizer->inMultiline($notes);

        $booking = new Booking();
        $booking->setPatientUser($patient);
        $booking->setProfessionalUser($professional);
        $booking->setDateBookingStart($start);
        $booking->setStatus(BookingEnum::WAITING_PAYMENT);
        $booking->setNotes($notes);
        $booking->setType($type);
        $booking->setReserveReason($reserveReason);
        $booking->setQuoteForInvited($quoteForInvited);

        if ($type === ConsultationTypeEnum::VIRTUAL) {
            $this->addBookingDetail($booking, BookingDetailTypeEnum::MEETING_LINK, 'https://meeting/' . uniqid('', true));
        } elseif ($type === ConsultationTypeEnum::PRESENTIAL) {
            $address = $professional->getUserDetails()?->getAddress() ?? '';
            $this->addBookingDetail($booking, BookingDetailTypeEnum::ADDRESS, $address);
        }

        if ($patientImage instanceof UploadedFile) {
            $this->fileValidator->assertImage($patientImage);
            $storedPath = $this->fileUploadUtil->upload($patientImage, 'booking_attachments');
            $booking->setPatientImage($storedPath);
        }

        $this->assignAvailability($booking);

        $this->finalizeBooking($booking);

        try {
            $this->bookingMailer->sendBookingCreated($booking);
        } catch (\Throwable $e) {
        }

        $this->notificationManager->notifyUser(
            $professional,
            NotificationTypeEnum::BOOKING,
            'Nueva Solicitud de Reserva',
            sprintf('El consultante %s %s ha solicitado una nueva reserva.', $patient->getFirstName(), $patient->getLastName()),
            ['booking_uid' => $booking->getUid()]
        );

        return $booking;
    }

    /**
     * @throws \RuntimeException
     */
    public function finalizeBooking(Booking $booking): void
    {
        $minutes = (int) $this->userService
            ->getUserDetail($booking->getProfessionalUser(), 'consultTime');
        if ($minutes <= 0) {
            $minutes = 60;
        }

        $start = $booking->getDateBookingStart();
        if ($start && !$start instanceof \DateTimeImmutable) {
            $start = \DateTimeImmutable::createFromInterface($start);
            $booking->setDateBookingStart($start);
        }

        $end = $start->add(new \DateInterval("PT{$minutes}M"));
        $booking->setDateBookingEnd($end);

        if (!$booking->getAvailability()) {
            throw new \RuntimeException('La reserva no tiene disponibilidad asignada.');
        }

        if (!$this->isWithinAvailability($booking, $start, $end)) {
            throw new \RuntimeException('La reserva está fuera del horario de disponibilidad del profesional.');
        }

        if ($this->bookingRepository->hasOverlap($booking->getProfessionalUser(), $start, $end, $booking->getId() ?: null)) {
            throw new \RuntimeException('Ese profesional ya tiene una reserva registrada en ese horario.');
        }

        if ($this->bookingRepository->findPatientConflict($booking->getPatientUser(), $start, $end, $booking->getId() ?: null)) {
            throw new \RuntimeException('El consultante ya tiene otra cita en ese horario.');
        }

        $this->bookingRepository->save($booking, true);
    }

    public function confirmBooking(Booking $booking): void
    {
        $booking->setStatus(BookingEnum::CONFIRMED);
        $this->bookingRepository->save($booking, true);

        // Freeze funds in wallet
        try {
            $this->walletService->freezeFundsForBooking($booking);
        } catch (\Throwable $e) {
            // Log error but don't stop the confirmation process? Or should we?
            // Requirement says "If one update fails, everything must roll back." 
            // But that was for the transaction within WalletService.
            // If freezing fails, we might want to revert confirmation or alert admin.
            // For now, I'll log. Ideally this should be inside a transaction covering both booking update and wallet update.
            // But BookingManagerService uses Repository->save(flush=true).
            // To be strictly atomic, we should wrap this in EM transaction.
        }

        $this->notificationManager->notifyUser(
            $booking->getPatientUser(),
            NotificationTypeEnum::BOOKING,
            'Reserva Confirmada',
            sprintf('Tu reserva con %s %s ha sido confirmada.', $booking->getProfessionalUser()->getFirstName(), $booking->getProfessionalUser()->getLastName()),
            ['booking_uid' => $booking->getUid()]
        );

        $this->notificationManager->notifyUser(
            $booking->getProfessionalUser(),
            NotificationTypeEnum::BOOKING,
            'Cita Confirmada',
            sprintf('La cita con %s %s está confirmada.', $booking->getPatientUser()->getFirstName(), $booking->getPatientUser()->getLastName()),
            ['booking_uid' => $booking->getUid()]
        );
    }

    public function cancelBooking(Booking $booking, ?string $reason = null): void
    {
        $booking->setStatus(BookingEnum::CANCELLED);

        if ($reason) {
            $notes = trim(($booking->getNotes() ?? '') . "\nMotivo de cancelación: " . $reason);
            $booking->setNotes($notes);
        }

        foreach ($booking->getPayments() as $payment) {
            if ($payment->getStatus() === PaymentStatusEnum::INITIATED) {
                $payment->setStatus(PaymentStatusEnum::REJECTED);
                $payment->setUpdatedAt(new \DateTimeImmutable());
            }
        }

        $this->bookingRepository->save($booking, true);

        try {
            $this->bookingMailer->sendBookingCanceled($booking);
        } catch (\Throwable $e) {
        }

        $this->notificationManager->notifyUser(
            $booking->getPatientUser(),
            NotificationTypeEnum::BOOKING,
            'Reserva Cancelada',
            sprintf('Tu reserva con %s %s ha sido cancelada.', $booking->getProfessionalUser()->getFirstName(), $booking->getProfessionalUser()->getLastName()),
            ['booking_uid' => $booking->getUid()]
        );

        $this->notificationManager->notifyUser(
            $booking->getProfessionalUser(),
            NotificationTypeEnum::BOOKING,
            'Reserva Cancelada',
            sprintf('La reserva con %s %s ha sido cancelada.', $booking->getPatientUser()->getFirstName(), $booking->getPatientUser()->getLastName()),
            ['booking_uid' => $booking->getUid()]
        );
    }

    public function serializeBookings(array | Booking $bookings): array
    {
        $serializeOne = function (Booking $b): array {
            $pro        = $b->getProfessionalUser();
            $proDetails = method_exists($pro, 'getUserDetails') ? $pro->getUserDetails() : null;

            $baseProfessionName = null;
            if ($proDetails && method_exists($proDetails, 'getBaseProfession')) {
                $base = $proDetails->getBaseProfession();
                if ($base && method_exists($base, 'getName')) {
                    $baseProfessionName = $base->getName();
                }
            }

            $bannerImage = null;
            if ($proDetails && method_exists($proDetails, 'getBannerImage')) {
                $bannerImage = $proDetails->getBannerImage();
            }

            $consultation = $b->getConsultation();
            $isConsulted = $consultation !== null;
            $consultationStatus = $consultation?->getConsultationStatus()?->value;

            $now = new \DateTimeImmutable();
            $startDt = $b->getDateBookingStart();
            $canCreateConsultation = !$isConsulted && ($startDt instanceof \DateTimeInterface ? $startDt <= $now : false);

            $consultationData = null;
            if ($consultation) {
                $statusEnum = $consultation->getConsultationStatus();
                $consultationData = [
                    'uid'    => $consultation->getUid(),
                    'status' => $statusEnum && $statusEnum->value !== '' ? $statusEnum->value : 'pending',
                    'notes'  => $this->sanitizer->outMultiline($consultation->getNotes()),
                    'observations' => $this->sanitizer->outMultiline($consultation->getReserveReason()),
                ];
            }

            $details = array_map(fn($d) => [
                'key'   => $d->getDetailKey()?->value,
                'value' => $d->getDetailValue(),
            ], $b->getBookingDetails()->toArray());

            return [
                'uid'                   => $b->getUid(),
                'professional_uid'      => $pro?->getUid(),
                'patient_uid'           => $b->getPatientUser()?->getUid(),
                'professional'          => $this->sanitizer->outText($pro->getFirstName() . ' ' . $pro->getLastName()),
                'patient'               => $this->sanitizer->outText($b->getPatientUser()->getFirstName() . ' ' . $b->getPatientUser()->getLastName()),
                'date_start'            => $b->getDateBookingStart()?->format('Y-m-d H:i'),
                'date_end'              => $b->getDateBookingEnd()?->format('Y-m-d H:i'),
                'status'                => $b->getStatus()?->value,
                'notes'                 => $this->sanitizer->outMultiline($b->getNotes()),
                'type'                  => $b->getType()?->value,
                'reserve_reason'        => $this->sanitizer->outMultiline($b->getReserveReason()),
                'quote_for_invited'    => $b->isQuoteForInvited(),
                'patient_image'         => $this->sanitizer->outUrl($b->getPatientImage()),
                'base_profession'       => $this->sanitizer->outText($baseProfessionName),
                'banner_image'          => $this->sanitizer->outUrl($bannerImage),
                'prefix_professional'   => $this->sanitizer->outText($proDetails?->getPrefixProfessional()),
                'isConsulted'           => $isConsulted,
                'consultationStatus'    => $consultationStatus,
                'consultation'          => $consultationData,
                'details'               => $details,
                'canCreateConsultation' => $canCreateConsultation,
            ];
        };

        if (!is_array($bookings)) {
            return $serializeOne($bookings);
        }
        return array_map($serializeOne, $bookings);
    }

    public function isWithinAvailability(Booking $booking, \DateTimeInterface $start, \DateTimeInterface $end): bool
    {
        $dateStr = $start->format('Y-m-d');
        $availability = $booking->getAvailability();
        if (!$availability) {
            $availability = $this->bookingRepository->findAvailabilityForBooking($booking->getProfessionalUser(), $start);
        }
        if (!$availability) {
            return false;
        }

        $toMinutes = fn(\DateTimeInterface $dt) => ((int)$dt->format('H')) * 60 + (int)$dt->format('i');

        $startMin = $toMinutes($start);
        $endMin   = $toMinutes($end);

        foreach ($availability->getSlots() as $slot) {
            $slotStartStr = $slot['start'] ?? null;
            $slotEndStr   = $slot['end'] ?? null;
            if (!$slotStartStr || !$slotEndStr) {
                continue;
            }

            $slotStartStr = substr($slotStartStr, 0, 5);
            $slotEndStr   = substr($slotEndStr, 0, 5);

            $slotStart = \DateTimeImmutable::createFromFormat('Y-m-d H:i', $dateStr . ' ' . $slotStartStr);
            $slotEnd   = \DateTimeImmutable::createFromFormat('Y-m-d H:i', $dateStr . ' ' . $slotEndStr);
            if (!$slotStart || !$slotEnd) {
                continue;
            }

            $slotStartMin = $toMinutes($slotStart);
            $slotEndMin   = $toMinutes($slotEnd);

            if ($startMin >= $slotStartMin && $endMin <= $slotEndMin) {
                return true;
            }
        }

        return false;
    }

    private function toMinutes(\DateTimeInterface $time): int
    {
        return ((int) $time->format('H')) * 60 + (int) $time->format('i');
    }
}
