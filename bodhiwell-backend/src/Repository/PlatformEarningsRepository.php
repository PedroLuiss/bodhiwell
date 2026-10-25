<?php

namespace App\Repository;

use App\Entity\PlatformEarnings;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<PlatformEarnings>
 */
class PlatformEarningsRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PlatformEarnings::class);
    }

    public function calculateTotalEarnings(): float
    {
        return (float) $this->createQueryBuilder('p')
            ->select('SUM(p.amount)')
            ->getQuery()
            ->getSingleScalarResult();
    }
}
