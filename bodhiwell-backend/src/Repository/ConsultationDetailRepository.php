<?php

namespace App\Repository;

use App\Entity\ConsultationDetail;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ConsultationDetail>
 */
class ConsultationDetailRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ConsultationDetail::class);
    }

    public function save(ConsultationDetail $consultationDetail, bool $flush = true): void
    {
        $entityManager = $this->getEntityManager();
        $entityManager->persist($consultationDetail);

        if ($flush) {
            $entityManager->flush();
        }
    }
}
