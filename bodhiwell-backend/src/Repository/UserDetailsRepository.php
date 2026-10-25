<?php

namespace App\Repository;

use App\Entity\UserDetails;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<UserDetails>
 */
class UserDetailsRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UserDetails::class);
    }

    public function save(UserDetails $userDetails, bool $flush = true): void
    {
        $entityManager = $this->getEntityManager();
        $entityManager->persist($userDetails);
        if ($flush) {
            $entityManager->flush();
        }
    }
}
