<?php

namespace App\Command;

use App\Entity\Booking;
use App\Enum\BookingEnum;
use App\Enum\NotificationTypeEnum;
use App\Repository\BookingRepository;
use App\Services\Notification\NotificationManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use App\Mailer\BookingMailer;

#[AsCommand(
    name: 'app:send-booking-reminders',
    description: 'Sends push notifications for bookings starting in the next 24 hours.',
)]

class SendBookingRemindersCommand extends Command
{
    private int $reminderTimeMinutes;

    public function __construct(
        private BookingRepository $bookingRepository,
        private NotificationManager $notificationManager,
        private EntityManagerInterface $entityManager,
        int $reminderTimeMinutes,
        private BookingMailer $bookingMailer
    ) {
        parent::__construct();
        $this->reminderTimeMinutes = $reminderTimeMinutes;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Sending Booking Reminders');

        $now = new \DateTimeImmutable('now', new \DateTimeZone('America/Montevideo'));
        $reminderInterval = sprintf('+%d minutes', $this->reminderTimeMinutes);
        $reminderLimit = $now->modify($reminderInterval);

        $qb = $this->bookingRepository->createQueryBuilder('b');
        $bookings = $qb
            ->where('b.status = :status')
            ->andWhere('b.dateBookingStart BETWEEN :now AND :reminderLimit')
            ->andWhere('b.reminderSentAt IS NULL')
            ->setParameter('status', BookingEnum::CONFIRMED->value)
            ->setParameter('now', $now)
            ->setParameter('reminderLimit', $reminderLimit)
            ->getQuery()
            ->getResult();

        $count = 0;

        /** @var Booking $booking */
        foreach ($bookings as $booking) {

            $notificationDateText = $booking->getDateBookingStart()->format('Y-m-d') === $now->format('Y-m-d') ? 'hoy' : 'mañana';

            $this->notificationManager->notifyUser(
                $booking->getPatientUser(),
                NotificationTypeEnum::REMINDER,
                'Recordatorio de Cita',
                sprintf('Tienes una cita %s a las %s con %s %s.', $notificationDateText, $booking->getDateBookingStart()->format('H:i'), $booking->getProfessionalUser()->getFirstName(), $booking->getProfessionalUser()->getLastName()),
                ['booking_uid' => $booking->getUid()]
            );

            $this->notificationManager->notifyUser(
                $booking->getProfessionalUser(),
                NotificationTypeEnum::REMINDER,
                'Recordatorio de Cita',
                sprintf('Tienes una cita %s a las %s con %s %s.', $notificationDateText, $booking->getDateBookingStart()->format('H:i'), $booking->getPatientUser()->getFirstName(), $booking->getPatientUser()->getLastName()),
                ['booking_uid' => $booking->getUid()]
            );

            $this->bookingMailer->sendBookingReminder($booking);

            $booking->setReminderSentAt($now);
            $this->entityManager->persist($booking);

            $count++;
        }

        $this->entityManager->flush();
        $io->success(sprintf('Sent %d reminders.', $count));

        return Command::SUCCESS;
    }
}
