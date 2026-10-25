<?php

namespace App\Repository;

use App\Entity\Profession;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Profession>
 */
class ProfessionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Profession::class);
    }

    public function save(Profession $profession, bool $flush = true): void
    {
        $entityManager = $this->getEntityManager();
        $entityManager->persist($profession);

        if ($flush) {
            $entityManager->flush();
        }
    }

}
