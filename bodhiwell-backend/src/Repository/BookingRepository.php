<?php

namespace App\Repository;

use App\Entity\User;
use App\Entity\Booking;
use App\Entity\Availability;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;

use App\Enum\BookingEnum;

/**
 * @extends ServiceEntityRepository<Booking>
 */
class BookingRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Booking::class);
    }

    public function save(Booking $booking, bool $flush = true): void
    {
        $entityManager = $this->getEntityManager();
        $entityManager->persist($booking);

        if ($flush) {
            $entityManager->flush();
        }
    }

    /* -------------------------------------------------
     *  Consultas personalizadas
     * ------------------------------------------------*/

    public function hasOverlap(
        User|int            $professional,
        \DateTimeInterface  $start,
        \DateTimeInterface  $end,
        ?int                $excludeId = null
    ): bool {
        $proId = $professional instanceof User ? $professional->getId() : $professional;

        $qb = $this->createQueryBuilder('b')
            ->andWhere('b.professionalUser = :pro')
            ->andWhere('b.status != :cancelled')
            ->andWhere(':start < b.dateBookingEnd')
            ->andWhere(':end   > b.dateBookingStart')
            ->setParameter('pro',   $proId)
            ->setParameter('cancelled', BookingEnum::CANCELLED)
            ->setParameter('start', $start)
            ->setParameter('end',   $end)
            ->setMaxResults(1);

        if ($excludeId) {
            $qb->andWhere('b.id != :id')
                ->setParameter('id', $excludeId);
        }

        return (bool) $qb->getQuery()->getOneOrNullResult();
    }

    /**
     * @param User|int             
     * @param \DateTimeInterface
     */
    public function findConflictingBooking(User|int $professional, \DateTimeInterface $start): ?Booking
    {
        $proId = $professional instanceof User ? $professional->getId() : $professional;

        return $this->createQueryBuilder('b')
            ->andWhere('b.professionalUser   = :pro')
            ->andWhere('b.dateBookingStart   = :dt')
            ->andWhere('b.status != :cancelled')
            ->setParameter('pro', $proId)
            ->setParameter('dt',  $start)
            ->setParameter('cancelled', BookingEnum::CANCELLED)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findPatientConflict(User|int $patient, \DateTimeInterface $start, \DateTimeInterface $end, ?int $excludeId = null): ?Booking
    {
        $patId = $patient instanceof User ? $patient->getId() : $patient;

        $qb = $this->createQueryBuilder('b')
            ->andWhere('b.patientUser = :pat')
            ->andWhere('b.status != :cancelled')
            ->andWhere(':start < b.dateBookingEnd')
            ->andWhere(':end   > b.dateBookingStart')
            ->setParameter('pat', $patId)
            ->setParameter('cancelled', BookingEnum::CANCELLED)
            ->setParameter('start', $start)
            ->setParameter('end',   $end)
            ->setMaxResults(1);

        if ($excludeId) {
            $qb->andWhere('b.id != :id')
                ->setParameter('id', $excludeId);
        }

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function findAvailabilityForBooking(User $professional, \DateTimeInterface $start): ?Availability
    {
        /**
         *  @var AvailabilityRepository $availabilityRepo
         */
        $availabilityRepo = $this->getEntityManager()->getRepository(Availability::class);
        $availabilities = $availabilityRepo->findByProfessionalAndDate($professional, $start);
        return $availabilities[0] ?? null;
    }

    public function hasReservationWithPatient(User $professional, ?User $patient): bool
    {
        if (!$patient) {
            return false;
        }

        $count = $this->createQueryBuilder('b')
            ->select('COUNT(b.id)')
            ->andWhere('b.professionalUser = :pro')
            ->andWhere('b.patientUser = :pat')
            ->andWhere('b.status != :cancelled')
            ->setParameter('pro', $professional)
            ->setParameter('pat', $patient)
            ->setParameter('cancelled', BookingEnum::CANCELLED)
            ->getQuery()
            ->getSingleScalarResult();

        return (int) $count > 0;
    }
}
