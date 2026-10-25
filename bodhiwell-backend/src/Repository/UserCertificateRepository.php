<?php

namespace App\Repository;

use App\Entity\UserCertificate;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<UserCertificate>
 *
 * @method UserCertificate|null find($id, $lockMode = null, $lockVersion = null)
 * @method UserCertificate|null findOneBy(array $criteria, array $orderBy = null)
 * @method UserCertificate[]    findAll()
 * @method UserCertificate[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserCertificateRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UserCertificate::class);
    }

    public function save(UserCertificate $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(UserCertificate $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}
