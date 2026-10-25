<?php

namespace App\Repository;

use App\Entity\User;
use App\Dto\AvailabilityGroupDto;
use App\Entity\Availability;
use Doctrine\ORM\Query\ResultSetMappingBuilder;
use Doctrine\DBAL\Types\Types;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;

/**
 * @extends ServiceEntityRepository<Availability>
 */
class AvailabilityRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Availability::class);
    }

    public function save(Availability $availability, bool $flush = true): void
    {
        $entityManager = $this->getEntityManager();
        $entityManager->persist($availability);

        if ($flush) {
            $entityManager->flush();
        }
    }

    /* ------------------------------------------------------------------
     *  CONSULTAS PERSONALIZADAS
     * -----------------------------------------------------------------*/

    /**
     *
     * @param User|int $professional  Entidad User o simplemente su id
     * @return Availability[]
     */
    public function findByProfessional(User|int $professional): array
    {
        $proId = $professional instanceof User ? $professional->getId() : $professional;

        return $this->createQueryBuilder('a')
            ->where('a.professionalUser = :pro')
            ->setParameter('pro', $proId)
            ->orderBy('a.dayOfWeek', 'ASC')
            ->addOrderBy('a.dateAvailability', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function existsByProfessionalAndDate(User|int $professional, \DateTimeInterface $date, ?int $excludeId = null): bool
    {
        $proId = $professional instanceof User ? $professional->getId() : $professional;
        $start = (new \DateTimeImmutable($date->format('Y-m-d')))->setTime(0, 0);
        $end   = $start->modify('+1 day');

        $qb = $this->createQueryBuilder('a')
            ->select('COUNT(a.id)')
            ->andWhere('a.professionalUser = :pro')
            ->andWhere('a.dateAvailability >= :start')
            ->andWhere('a.dateAvailability < :end')
            ->setParameter('pro', $proId)
            ->setParameter('start', $start, Types::DATETIME_IMMUTABLE)
            ->setParameter('end', $end, Types::DATETIME_IMMUTABLE);

        if ($excludeId) $qb->andWhere('a.id != :id')->setParameter('id', $excludeId);

        return (int) $qb->getQuery()->getSingleScalarResult() > 0;
    }

    public function hasOverlap(User|int $professional, \DateTimeInterface $date, array $slots, ?int $excludeId = null): bool
    {
        $proId = $professional instanceof User ? $professional->getId() : $professional;
        $start = (new \DateTimeImmutable($date->format('Y-m-d')))->setTime(0, 0);
        $end   = $start->modify('+1 day');

        $qb = $this->createQueryBuilder('a')
            ->andWhere('a.professionalUser = :pro')
            ->andWhere('a.dateAvailability >= :start')
            ->andWhere('a.dateAvailability < :end')
            ->setParameter('pro', $proId)
            ->setParameter('start', $start, Types::DATETIME_IMMUTABLE)
            ->setParameter('end', $end, Types::DATETIME_IMMUTABLE);

        if ($excludeId) {
            $qb->andWhere('a.id != :id')->setParameter('id', $excludeId);
        }

        $availabilities = $qb->getQuery()->getResult();

        $norm = static function (?string $t): ?string {
            if (!$t) return null;
            $t = trim($t);
            if (preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $t)) {
                return substr($t, 0, 5);
            }
            $lower = strtolower($t);
            $lower = str_replace(['p. m.', 'a. m.'], ['pm', 'am'], $lower);
            if (preg_match('/^(\d{1,2}):(\d{2})\s*(am|pm)$/', $lower, $m)) {
                $h = (int)$m[1];
                $mi = $m[2];
                $ap = $m[3];
                if ($ap === 'pm' && $h < 12) $h += 12;
                if ($ap === 'am' && $h === 12) $h = 0;
                return sprintf('%02d:%s', $h, $mi);
            }
            if (preg_match('/^(\d{1,2}):(\d{2})$/', $t, $m)) {
                return sprintf('%02d:%02d', (int)$m[1], (int)$m[2]);
            }
            return null;
        };

        $toMinutes = static function (string $hhmm): int {
            [$h, $m] = array_map('intval', explode(':', $hhmm, 2));
            return $h * 60 + $m;
        };

        foreach ($availabilities as $availability) {
            foreach ((array)$availability->getSlots() as $e) {
                $es = $norm($e['start'] ?? null);
                $ee = $norm($e['end'] ?? null);
                if (!$es || !$ee) continue;

                $esM = $toMinutes($es);
                $eeM = $toMinutes($ee);

                foreach ($slots as $n) {
                    $ns = $norm($n['start'] ?? null);
                    $ne = $norm($n['end'] ?? null);
                    if (!$ns || !$ne) continue;

                    $nsM = $toMinutes($ns);
                    $neM = $toMinutes($ne);

                    if ($nsM < $eeM && $neM > $esM) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * @return \DateTimeImmutable[]
     */
    public function getNextAvailabilityDates(User|int $professional, int $limit = 2): array
    {
        $proId = $professional instanceof User ? $professional->getId() : $professional;
        $now = (new \DateTimeImmutable())->setTime(0, 0);

        $results = $this->createQueryBuilder('a')
            ->select('a.dateAvailability')
            ->andWhere('a.professionalUser = :pro')
            ->andWhere('a.dateAvailability >= :now')
            ->setParameter('pro', $proId)
            ->setParameter('now', $now, Types::DATETIME_IMMUTABLE)
            ->orderBy('a.dateAvailability', 'ASC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();

        return array_column($results, 'dateAvailability');
    }

    public function countFutureAvailabilities(User|int $professional): int
    {
        $proId = $professional instanceof User ? $professional->getId() : $professional;
        $now = (new \DateTimeImmutable())->setTime(0, 0);

        return (int) $this->createQueryBuilder('a')
            ->select('COUNT(a.id)')
            ->andWhere('a.professionalUser = :pro')
            ->andWhere('a.dateAvailability >= :now')
            ->setParameter('pro', $proId)
            ->setParameter('now', $now, Types::DATETIME_IMMUTABLE)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * @return Availability[]
     */
    public function findRecentByProfessional(User|int $professional, int $months = 2): array
    {
        $proId = $professional instanceof User ? $professional->getId() : $professional;
        $from = (new \DateTimeImmutable())->modify("-{$months} months")->setTime(0, 0);

        return $this->createQueryBuilder('a')
            ->andWhere('a.professionalUser = :pro')
            ->andWhere('a.dateAvailability >= :from')
            ->setParameter('pro', $proId)
            ->setParameter('from', $from, Types::DATETIME_IMMUTABLE)
            ->orderBy('a.dateAvailability', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Devuelve todas las disponibilidades de un profesional para una fecha dada (normalizada a medianoche).
     *
     * @return Availability[]
     */
    public function findByProfessionalAndDate(User $pro, \DateTimeInterface $date): array
    {
        if ($date instanceof \DateTimeImmutable) {
            $normalized = $date->setTime(0, 0);
        } elseif ($date instanceof \DateTime) {
            $normalized = \DateTimeImmutable::createFromMutable((clone $date)->setTime(0, 0));
        } else {
            $normalized = new \DateTimeImmutable($date->format('Y-m-d') . ' 00:00:00');
        }

        return $this->createQueryBuilder('a')
            ->andWhere('a.professionalUser = :pro')
            ->andWhere('a.dateAvailability = :date')
            ->setParameter('pro', $pro)
            ->setParameter('date', $normalized, Types::DATETIME_IMMUTABLE)
            ->getQuery()
            ->getResult();
    }

    /**
     * Agrupa disponibilidad por day|week|specialty
     *
     * @param string $groupBy 'day'|'week'|'specialty'
     * @param array $filters
     * @return array<string, \App\Dto\AvailabilityGroupDto[]>
     */
    public function aggregateAvailability(string $groupBy, array $filters = []): array
    {
        $qb = $this->createQueryBuilder('a')
            ->addSelect('p', 'ud', 'prof')
            ->join('a.professionalUser', 'p')
            ->leftJoin('p.userDetails', 'ud')
            ->leftJoin('ud.mainProfession', 'prof')
            ->orderBy('a.dateAvailability', 'ASC');

        if (!empty($filters['professionalId'])) {
            $qb->andWhere('p.id = :pid')->setParameter('pid', $filters['professionalId']);
        }
        if (!empty($filters['start'])) {
            $qb->andWhere('a.dateAvailability >= :start')->setParameter('start', $filters['start']);
        }
        if (!empty($filters['end'])) {
            $qb->andWhere('a.dateAvailability <= :end')->setParameter('end', $filters['end']);
        }

        $availabilities = $qb->getQuery()->getResult();

        $result = [];

        $getProName = function ($pro) {
            if (!$pro) return 'Profesional';
            if (method_exists($pro, 'getFullName')) return trim($pro->getFullName());
            if (method_exists($pro, 'getName')) return trim($pro->getName());
            $first = method_exists($pro, 'getFirstName') ? $pro->getFirstName() : null;
            $last  = method_exists($pro, 'getLastName') ? $pro->getLastName() : null;
            if ($first || $last) return trim(($first ?? '') . ' ' . ($last ?? ''));
            if (method_exists($pro, 'getUsername')) return $pro->getUsername();
            if (method_exists($pro, 'getId')) return 'Profesional #' . $pro->getId();
            return 'Profesional';
        };

        foreach ($availabilities as $a) {
            $pro = method_exists($a, 'getProfessionalUser') ? $a->getProfessionalUser() : null;
            $ud  = null;
            $profEntity = null;
            if ($pro && method_exists($pro, 'getUserDetails')) {
                $ud = $pro->getUserDetails();
                if ($ud && method_exists($ud, 'getMainProfession')) {
                    $profEntity = $ud->getMainProfession();
                }
            }

            $specialtyName = null;
            if ($profEntity) {
                if (method_exists($profEntity, 'getName')) $specialtyName = $profEntity->getName();
                elseif (method_exists($profEntity, 'getTitle')) $specialtyName = $profEntity->getTitle();
            }

            $date = method_exists($a, 'getDateAvailability') ? $a->getDateAvailability() : null;
            $slots = method_exists($a, 'getSlots') ? (array)$a->getSlots() : [];

            $dto = new \App\Dto\AvailabilityGroupDto(
                method_exists($a, 'getId') ? $a->getId() : null,
                $pro && method_exists($pro, 'getId') ? $pro->getId() : null,
                $getProName($pro),
                $specialtyName,
                $date,
                $slots
            );

            $key = 'General';
            if ($groupBy === 'day') {
                if ($date instanceof \DateTimeInterface) $key = $date->format('Y-m-d');
                else $key = (new \DateTime((string)$date))->format('Y-m-d');
            } elseif ($groupBy === 'week') {
                if ($date instanceof \DateTimeInterface) $key = $date->format('o-W');
                else $key = (new \DateTime((string)$date))->format('o-W');
            } elseif ($groupBy === 'specialty') {
                $key = $specialtyName ?? 'Sin Especialidad';
            }

            $result[$key][] = $dto;
        }

        return $result;
    }
}
