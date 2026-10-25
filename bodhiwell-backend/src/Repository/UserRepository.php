<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @extends ServiceEntityRepository<User>
 */

class UserRepository extends ServiceEntityRepository implements UserProviderInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    public function save(User $user, bool $flush = true): void
    {
        $entityManager = $this->getEntityManager();
        $entityManager->persist($user);
        if ($flush) {
            $entityManager->flush();
        }
    }

    public function findProfessionals(): array
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.type_account = :type')
            ->setParameter('type', 'professional')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return User[]
     */
    public function searchProfessionals(\App\Dto\SearchProfessionalDto $criteria): array
    {
        $qb = $this->createQueryBuilder('u')
            ->leftJoin('u.userDetails', 'ud')
            ->leftJoin('ud.mainProfession', 'p')
            ->leftJoin('u.specialties', 's')
            ->leftJoin('p.suggestedSpecialties', 'ps')
            ->leftJoin('p.dimensions', 'pd')
            ->andWhere('u.type_account = :type')
            ->setParameter('type', 'professional')
            ->andWhere('u.status = :status')
            ->setParameter('status', \App\Enum\UserStatusEnum::ACTIVE->value)
            ->groupBy('u.id');

        $qb->select('u');

        if ($criteria->getQ()) {
            $term = '%' . $criteria->getQ() . '%';

            $relevanceScore = '0';
            $relevanceScore .= ' + (CASE WHEN CONCAT(u.first_name, \' \', u.last_name) LIKE :term THEN 50 ELSE 0 END)';
            $relevanceScore .= ' + MAX(CASE WHEN p.name LIKE :term THEN 40 ELSE 0 END)';
            $relevanceScore .= ' + MAX(CASE WHEN s.name LIKE :term THEN 30 ELSE 0 END)';
            $relevanceScore .= ' + MAX(CASE WHEN ps.name LIKE :term THEN 10 ELSE 0 END)';

            $qb->andWhere('(CONCAT(u.first_name, \' \', u.last_name) LIKE :term OR p.name LIKE :term OR s.name LIKE :term OR ps.name LIKE :term)')
                ->addSelect("($relevanceScore) AS HIDDEN relevance_score")
                ->setParameter('term', $term)
                ->orderBy('relevance_score', 'DESC');
        } else {
            $qb->orderBy('u.completedConsultations', 'DESC');
        }

        $qb->addOrderBy('u.completedConsultations', 'DESC');

        if ($criteria->getDimension()) {

            if (!in_array('sd', $qb->getAllAliases())) {
                $qb->leftJoin('s.dimension', 'sd');
            }

            $qb->andWhere('(pd.uid = :dimensionUid OR sd.uid = :dimensionUid)')
                ->setParameter('dimensionUid', $criteria->getDimension());
        }

        if (!empty($criteria->getSpecialties())) {
            $qb->andWhere('s.uid IN (:specialtyUids)')
                ->setParameter('specialtyUids', $criteria->getSpecialties());
        }

        return $qb->getQuery()->getResult();
    }

    public function findProfessionalById(int $id): ?User
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.id = :id')
            ->andWhere('u.type_account = :type')
            ->setParameter('id', $id)
            ->setParameter('type', 'professional')
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function loadUserByIdentifier(string $identifier): User
    {
        $user = $this->createQueryBuilder('u')
            ->where('u.email = :identifier')
            ->setParameter('identifier', $identifier)
            ->getQuery()
            ->getOneOrNullResult();

        if (!$user) {
            throw new \Symfony\Component\Security\Core\Exception\UserNotFoundException(
                sprintf('No user found for identifier "%s"', $identifier)
            );
        }

        return $user;
    }

    public function refreshUser(UserInterface $user): UserInterface
    {
        /**
         * @var User $user
         */
        return $this->find($user->getId());
    }

    public function supportsClass(string $class): bool
    {
        return $class === User::class;
    }
}
