<?php

namespace App\Repository;

use App\Entity\Booking;
use App\Entity\Payment;
use App\Enum\PaymentStatusEnum;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Payment>
 */
class PaymentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Payment::class);
    }

    /**
     * @return Payment[]
     */
    public function findPaymentsByPatient(int $userId, int $limit = 25, int $offset = 0): array
    {
        return $this->findPaymentsByPatientFiltered(
            patientId: $userId,
            limit: $limit,
            offset: $offset,
            startDate: null,
            endDate: null,
            status: null
        );
    }

    /**
     * @return Payment[]
     */
    public function findPaymentsByProfessional(int $userId, int $limit = 25, int $offset = 0): array
    {
        return $this->findPaymentsByProfessionalFiltered(
            professionalId: $userId,
            limit: $limit,
            offset: $offset,
            startDate: null,
            endDate: null,
            status: null
        );
    }

    /**
     * @return Payment[]
     */
    public function findPaymentsByProfessionalFiltered(
        int $professionalId,
        int $limit = 25,
        int $offset = 0,
        ?\DateTimeImmutable $startDate = null,
        ?\DateTimeImmutable $endDate = null,
        null|string|\App\Enum\PaymentStatusEnum $status = null
    ): array {
        $qb = $this->createQueryBuilder('p')
            ->innerJoin('p.booking', 'b')
            ->innerJoin('b.professionalUser', 'u')
            ->andWhere('u.id = :userId')
            ->setParameter('userId', $professionalId)
            ->addSelect('b');

        if ($startDate !== null) {
            $qb->andWhere('p.createdAt >= :startDate')->setParameter('startDate', $startDate);
        }
        if ($endDate !== null) {
            $qb->andWhere('p.createdAt <= :endDate')->setParameter('endDate', $endDate);
        }
        if ($status !== null) {
            $statusParam = \is_string($status)
                ? (\App\Enum\PaymentStatusEnum::tryFrom(strtolower($status)) ?? \App\Enum\PaymentStatusEnum::tryFrom($status) ?? $status)
                : $status;
            $qb->andWhere('p.status = :status')->setParameter('status', $statusParam instanceof \BackedEnum ? $statusParam->value : $statusParam);
        }

        return $qb
            ->orderBy('p.createdAt', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * @return Payment[]
     */
    public function findPaymentsByPatientFiltered(
        int $patientId,
        int $limit = 25,
        int $offset = 0,
        ?\DateTimeImmutable $startDate = null,
        ?\DateTimeImmutable $endDate = null,
        null|string|\App\Enum\PaymentStatusEnum $status = null
    ): array {
        $qb = $this->createQueryBuilder('p')
            ->innerJoin('p.booking', 'b')
            ->innerJoin('b.patientUser', 'u')
            ->andWhere('u.id = :userId')
            ->setParameter('userId', $patientId)
            ->addSelect('b');

        if ($startDate !== null) {
            $qb->andWhere('p.createdAt >= :startDate')->setParameter('startDate', $startDate);
        }
        if ($endDate !== null) {
            $qb->andWhere('p.createdAt <= :endDate')->setParameter('endDate', $endDate);
        }
        if ($status !== null) {
            $statusParam = \is_string($status)
                ? (\App\Enum\PaymentStatusEnum::tryFrom(strtolower($status)) ?? \App\Enum\PaymentStatusEnum::tryFrom($status) ?? $status)
                : $status;
            $qb->andWhere('p.status = :status')->setParameter('status', $statusParam instanceof \BackedEnum ? $statusParam->value : $statusParam);
        }

        return $qb
            ->orderBy('p.createdAt', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
    public function countRejectedByBooking(Booking $booking): int
    {
        return $this->createQueryBuilder('p')
            ->select('count(p.id)')
            ->where('p.booking = :booking')
            ->andWhere('p.status = :status')
            ->setParameter('booking', $booking)
            ->setParameter('status', \App\Enum\PaymentStatusEnum::REJECTED)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
