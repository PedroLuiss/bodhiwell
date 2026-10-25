<?php

namespace App\Repository;

use App\Entity\Consultation;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Consultation>
 */
class ConsultationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Consultation::class);
    }

    public function save(Consultation $consultation, bool $flush = true): void
    {
        $entityManager = $this->getEntityManager();
        $entityManager->persist($consultation);

        if ($flush) {
            $entityManager->flush();
        }
    }

    /**
     * @return Consultation[]
     */
    public function findByProfessional(User $professional): array
    {
        return $this->createQueryBuilder('c')
            ->join('c.booking', 'b')
            ->addSelect('b')
            ->where('b.professionalUser = :pro')
            ->setParameter('pro', $professional)
            ->orderBy('b.dateBookingStart', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return Consultation[]
     */
    public function findByPatient(User $patient): array
    {
        return $this->createQueryBuilder('c')
            ->join('c.booking', 'b')
            ->addSelect('b')
            ->where('b.patientUser = :patient')
            ->setParameter('patient', $patient)
            ->orderBy('b.dateBookingStart', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findOneByUid(string $uid): ?Consultation
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.uid = :uid')
            ->setParameter('uid', $uid)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
