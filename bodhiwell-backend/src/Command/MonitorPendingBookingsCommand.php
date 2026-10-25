<?php

namespace App\Command;

use App\Entity\Booking;
use App\Enum\BookingEnum;
use App\Repository\BookingRepository;
use App\Services\BookingCancellationService;
use App\Services\BookingRecoveryService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:monitor-pending-bookings',
    description: 'Monitors pending bookings to send reminders (15m, 30m) or cancel (45m).',
)]
class MonitorPendingBookingsCommand extends Command
{
    private const CANCELLATION_THRESHOLD_MIN = 45;

    public function __construct(
        private BookingRepository $bookingRepository,
        private \App\Repository\PaymentRepository $paymentRepository,
        private BookingRecoveryService $bookingRecoveryService,
        private \App\Services\BookingManagerService $bookingManagerService,
        private EntityManagerInterface $entityManager
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Monitoring Pending Bookings');

        $qb = $this->bookingRepository->createQueryBuilder('b');
        $qb->where('b.status = :status')
            ->setParameter('status', BookingEnum::WAITING_PAYMENT->value);

        /** @var Booking[] $bookings */
        $bookings = $qb->getQuery()->getResult();
        $io->writeln(sprintf('Found %d pending bookings.', count($bookings)));

        $now = new \DateTimeImmutable();
        $canceledCount = 0;
        $remindedCount = 0;

        foreach ($bookings as $booking) {
            $createdAt = $booking->getCreatedAt();
            $nowTimestamp = $now->getTimestamp();
            $createdAtTimestamp = $createdAt->getTimestamp();
            $minutes = ($nowTimestamp - $createdAtTimestamp) / 60;

            $failedAttempts = $this->paymentRepository->countRejectedByBooking($booking);

            if ($minutes > self::CANCELLATION_THRESHOLD_MIN || $failedAttempts >= 3) {
                $reason = ($failedAttempts >= 3)
                    ? 'MAX_ATTEMPTS: Reserva cancelada por máximos intentos de pago fallidos.'
                    : 'TIMEOUT: Reserva expirada por falta de pago (45 min limit).';

                $io->text(sprintf('Cancelling booking %s. Reason: %s', $booking->getUid(), $reason));

                $this->bookingManagerService->cancelBooking($booking, $reason);
                $canceledCount++;
                continue;
            }

            if ($this->bookingRecoveryService->processBookingReminder($booking)) {
                $remindedCount++;
                $io->text(sprintf('Reminder sent for booking %s', $booking->getUid()));
            }
        }

        $this->entityManager->flush();

        $io->success(sprintf('Processed bookings. Cancelled: %d. Reminded: %d.', $canceledCount, $remindedCount));

        return Command::SUCCESS;
    }
}
