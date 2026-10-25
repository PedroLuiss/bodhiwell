<?php

namespace App\Services;

use App\Entity\Booking;
use App\Enum\NotificationTypeEnum;
use App\Mailer\BookingMailer;
use App\Services\Notification\NotificationManager;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

class BookingRecoveryService
{
    private const REMINDER_1_MIN = 15;
    private const REMINDER_1_MAX = 30;
    private const REMINDER_2_MIN = 30;
    private const REMINDER_2_MAX = 45;

    public function __construct(
        private NotificationManager $notificationManager,
        private BookingMailer $bookingMailer,
        private EntityManagerInterface $entityManager,
        private LoggerInterface $logger
    ) {}

    public function processBookingReminder(Booking $booking): bool
    {
        $createdAt = $booking->getCreatedAt();
        $now = new \DateTimeImmutable();

        $minutes = ($now->getTimestamp() - $createdAt->getTimestamp()) / 60;
        $currentStage = $booking->getNotificationStage();

        // Rule 1: Friendly Reminder (15m - 30m)
        if ($minutes >= self::REMINDER_1_MIN && $minutes < self::REMINDER_1_MAX && $currentStage < 1) {
            $this->sendFriendlyReminder($booking);
            return true;
        }

        // Rule 2: Urgent Reminder (30m - 45m)
        if ($minutes >= self::REMINDER_2_MIN && $minutes < self::REMINDER_2_MAX && $currentStage < 2) {
            $this->sendUrgentReminder($booking);
            return true;
        }

        return false;
    }

    private function sendFriendlyReminder(Booking $booking): void
    {
        $this->logger->info(sprintf('Sending Friendly Reminder (Stage 1) for Booking %s', $booking->getUid()));

        $booking->setNotificationStage(1);
        $this->entityManager->persist($booking);

        $this->notificationManager->notifyUser(
            $booking->getPatientUser(),
            NotificationTypeEnum::REMINDER,
            '¡No pierdas tu horario!',
            'Tu reserva está pendiente de pago. Complétala antes de que expire.',
            ['booking_uid' => $booking->getUid()]
        );

        $this->bookingMailer->sendFriendlyReminder($booking);
    }

    private function sendUrgentReminder(Booking $booking): void
    {
        $this->logger->info(sprintf('Sending Urgent Reminder (Stage 2) for Booking %s', $booking->getUid()));

        $booking->setNotificationStage(2);
        $this->entityManager->persist($booking);

        $this->notificationManager->notifyUser(
            $booking->getPatientUser(),
            NotificationTypeEnum::REMINDER,
            'Último aviso: Tu reserva expirará pronto',
            'Solo tienes unos minutos para confirmar tu pago.',
            ['booking_uid' => $booking->getUid()]
        );

        $this->bookingMailer->sendUrgentReminder($booking);
    }
}
