<?php

namespace App\Repository;

use App\Entity\Booking;
use App\Entity\ProfessionalWallet;
use App\Entity\WalletLedger;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<WalletLedger>
 */
class WalletLedgerRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, WalletLedger::class);
    }

    /**
     * @return WalletLedger[]
     */
    public function findForRefund(ProfessionalWallet $wallet, Booking $booking, string $refundAmount): array
    {
        $qb = $this->createQueryBuilder('l');

        $qb->leftJoin('l.payment', 'payment')
            ->leftJoin('payment.booking', 'bookingAlias')
            ->andWhere('l.wallet = :wallet')
            ->andWhere($qb->expr()->orX(
                'bookingAlias = :booking',
                $qb->expr()->andX(
                    'l.payment IS NULL',
                    'l.operationType = :refundOperation',
                    'l.amount = :refundAmount'
                )
            ))
            ->setParameter('wallet', $wallet)
            ->setParameter('booking', $booking)
            ->setParameter('refundOperation', 'DEBIT')
            ->setParameter('refundAmount', $refundAmount)
            ->orderBy('l.createdAt', 'DESC');

        return $qb->getQuery()->getResult();
    }

    /**
     * @param ProfessionalWallet $wallet
     * @param array $filters
     * @param int $page
     * @param int $limit
     * @return array{data: WalletLedger[], total: int}
     */
    public function findLedgersForWallet(ProfessionalWallet $wallet, array $filters, int $page = 1, int $limit = 10): array
    {
        $qb = $this->createQueryBuilder('l');
        $qb->leftJoin('l.payment', 'p')
            ->leftJoin('p.booking', 'b')
            ->where('l.wallet = :wallet')
            ->setParameter('wallet', $wallet);

        if (!empty($filters['startDate'])) {
            $qb->andWhere('l.createdAt >= :startDate')
                ->setParameter('startDate', new \DateTime($filters['startDate']));
        }

        if (!empty($filters['endDate'])) {
            $endDate = new \DateTime($filters['endDate']);
            $endDate->setTime(23, 59, 59);
            $qb->andWhere('l.createdAt <= :endDate')
                ->setParameter('endDate', $endDate);
        }

        if (!empty($filters['search'])) {
            $term = '%' . $filters['search'] . '%';
            $qb->andWhere($qb->expr()->orX(
                'l.uid LIKE :term',
                'l.concept LIKE :term',
                'p.uid LIKE :term',
                'b.uid LIKE :term',
                'b.notes LIKE :term'
            ))->setParameter('term', $term);
        }

        // Clone for count
        $countQb = clone $qb;
        $total = $countQb->select('count(l.id)')->getQuery()->getSingleScalarResult();

        // Pagination
        $qb->orderBy('l.createdAt', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        return [
            'data' => $qb->getQuery()->getResult(),
            'total' => (int) $total
        ];
    }

    //    /**
    //     * @return WalletLedger[] Returns an array of WalletLedger objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('w')
    //            ->andWhere('w.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('w.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?WalletLedger
    //    {
    //        return $this->createQueryBuilder('w')
    //            ->andWhere('w.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
