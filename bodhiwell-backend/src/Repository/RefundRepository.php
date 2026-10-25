<?php

namespace App\Repository;

use App\Entity\Refund;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class RefundRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Refund::class);
    }

    public function save(Refund $refund, bool $flush = true): void
    {
        $em = $this->getEntityManager();
        $em->persist($refund);

        if ($flush) {
            $em->flush();
        }
    }

    // Custom query methods for Refund can be added here
}
