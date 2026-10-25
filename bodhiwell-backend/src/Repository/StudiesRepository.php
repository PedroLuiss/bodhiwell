<?php

namespace App\Repository;

use App\Entity\Studies;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Studies>
 */
class StudiesRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Studies::class);
    }

    public function save(Studies $studies, bool $flush = true): void
    {
        $entityManager = $this->getEntityManager();
        $entityManager->persist($studies);
        if ($flush) {
            $entityManager->flush();
        }
    }
}
