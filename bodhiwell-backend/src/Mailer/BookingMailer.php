<?php

namespace App\Mailer;

use App\Entity\Booking;
use App\Message\SendBookingEmailMessage;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Messenger\Stamp\DelayStamp;

class BookingMailer
{
    public function __construct(
        private MessageBusInterface $bus,
        private int $mailerDelayMs
    ) {}

    public function sendBookingCreated(Booking $booking): void
    {
        $this->dispatchToBoth($booking, 'created');
    }

    public function sendBookingCanceled(Booking $booking): void
    {
        $this->dispatchToBoth($booking, 'canceled');
    }

    public function sendBookingConfirmed(Booking $booking): void
    {
        $this->dispatchToBoth($booking, 'confirmed');
    }

    public function sendBookingReminder(Booking $booking): void
    {
        $this->dispatchToBoth($booking, 'reminder');
    }

    public function sendBookingInitiatedPayment(Booking $booking): void
    {
        $this->dispatchToPatient($booking, 'pending_payment');
    }

    public function sendFriendlyReminder(Booking $booking): void
    {
        $this->dispatchToPatient($booking, 'friendly_reminder');
    }

    public function sendUrgentReminder(Booking $booking): void
    {
        $this->dispatchToPatient($booking, 'urgent_reminder');
    }

    private function dispatchToBoth(Booking $booking, string $emailType): void
    {
        $patient = $booking->getPatientUser();
        $professional = $booking->getProfessionalUser();

        if ($patient && $patient->getEmail()) {
            $this->bus->dispatch(new SendBookingEmailMessage(
                $booking->getId(),
                $patient->getId(),
                $emailType
            ));
        }

        if ($professional && $professional->getEmail()) {
            $stamps = [];
            if ($this->mailerDelayMs > 0) {
                $stamps[] = new DelayStamp($this->mailerDelayMs);
            }

            $this->bus->dispatch(
                new SendBookingEmailMessage(
                    $booking->getId(),
                    $professional->getId(),
                    $emailType
                ),
                $stamps
            );
        }
    }

    private function dispatchToPatient(Booking $booking, string $emailType): void
    {
        $patient = $booking->getPatientUser();
        if ($patient && $patient->getEmail()) {
            $this->bus->dispatch(new SendBookingEmailMessage(
                $booking->getId(),
                $patient->getId(),
                $emailType
            ));
        }
    }
}
