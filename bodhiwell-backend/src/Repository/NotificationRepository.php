<?php

namespace App\Repository;

use App\Entity\Notification;
use App\Entity\User;
use App\Enum\NotificationTypeEnum;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Notification>
 *
 * @method Notification|null find($id, $lockMode = null, $lockVersion = null)
 * @method Notification|null findOneBy(array $criteria, array $orderBy = null)
 * @method Notification[]    findAll()
 * @method Notification[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class NotificationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Notification::class);
    }

    public function save(Notification $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Notification $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function findByFilters(User $user, ?string $search, ?NotificationTypeEnum $type, int $page = 1, int $limit = 20, bool $prioritizeUnread = false): Paginator
    {
        $qb = $this->createQueryBuilder('n')
            ->andWhere('n.user = :user')
            ->setParameter('user', $user);

        if ($search) {
            $qb->andWhere('n.title LIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }

        if ($type) {
            $qb->andWhere('n.type = :type')
                ->setParameter('type', $type);
        }

        if ($prioritizeUnread) {
            $qb->addSelect('CASE WHEN n.readAt IS NULL THEN 0 ELSE 1 END AS HIDDEN readStatus');
            $qb->orderBy('readStatus', 'ASC');
            $qb->addOrderBy('n.createdAt', 'DESC');
        } else {
            $qb->orderBy('n.createdAt', 'DESC');
        }

        $query = $qb->getQuery();
        $query->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        return new \Doctrine\ORM\Tools\Pagination\Paginator($query);
    }
    public function markAllAsRead(User $user): int
    {
        $qb = $this->createQueryBuilder('n');

        return $qb->update()
            ->set('n.readAt', ':now')
            ->where('n.user = :user')
            ->andWhere('n.readAt IS NULL')
            ->setParameter('now', new \DateTimeImmutable())
            ->setParameter('user', $user)
            ->getQuery()
            ->execute();
    }
}
