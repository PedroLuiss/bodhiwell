<?php

namespace App\Repository;

use App\Entity\Withdrawal;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Withdrawal>
 */
class WithdrawalRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Withdrawal::class);
    }

    public function save(Withdrawal $withdrawal, bool $flush = true): void
    {
        $em = $this->getEntityManager();
        $em->persist($withdrawal);

        if ($flush) {
            $em->flush();
        }
    }

    /**
     * @param string $order ASC|DESC
     * @return Withdrawal[]
     */
    public function findAllOrdered(string $order = 'DESC'): array
    {
        $order = strtoupper($order) === 'ASC' ? 'ASC' : 'DESC';
        return $this->createQueryBuilder('w')
            ->orderBy('w.id', $order)
            ->getQuery()
            ->getResult();
    }
}
