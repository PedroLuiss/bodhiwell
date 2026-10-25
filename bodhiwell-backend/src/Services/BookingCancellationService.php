<?php

namespace App\Services;

use App\Entity\Booking;
use App\Enum\BookingEnum;
use App\Repository\BookingRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

class BookingCancellationService
{
    private const EXPIRATION_MINUTES = 45;

    public function __construct(
        private BookingRepository $bookingRepository,
        private BookingManagerService $bookingManagerService,
        private LoggerInterface $logger
    ) {}

    public function checkAndCancelExpiredBookings(): int
    {
        $expirationDate = new \DateTimeImmutable(sprintf('-%d minutes', self::EXPIRATION_MINUTES));

        $qb = $this->bookingRepository->createQueryBuilder('b');
        $qb->where('b.status = :status')
            ->andWhere('b.createdAt <= :expirationDate')
            ->setParameter('status', BookingEnum::WAITING_PAYMENT)
            ->setParameter('expirationDate', $expirationDate);

        /** @var Booking[] $expiredBookings */
        $expiredBookings = $qb->getQuery()->getResult();

        $count = 0;
        foreach ($expiredBookings as $booking) {
            try {
                $this->logger->info(sprintf('Cancelling expired booking %s created at %s', $booking->getUid(), $booking->getCreatedAt()->format('Y-m-d H:i:s')));

                $this->bookingManagerService->cancelBooking($booking, 'TIMEOUT: Reserva expirada por falta de pago (45 min limit).');
                $count++;
            } catch (\Throwable $e) {
                $this->logger->error(sprintf('Error cancelling booking %s: %s', $booking->getUid(), $e->getMessage()));
            }
        }

        return $count;
    }
}
