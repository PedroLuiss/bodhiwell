<?php

namespace App\Services;

use App\Entity\Availability;
use App\Repository\AvailabilityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AvailabilityService
{
    public function __construct(
        private EntityManagerInterface $em,
        private AvailabilityRepository $availabilityRepository,
        private ValidatorInterface $validator,
        private int $historyMonths
    ) {}

    /**
     * @param \DateTimeInterface $date Fecha de la disponibilidad
     * @param array $slots Array de bloques [['start' => 'HH:MM', 'end' => 'HH:MM'], ...]
     * @throws \DomainException
     */
    private function assertAvailabilityWindow(\DateTimeInterface $date, array $slots): void
    {
        $now = new \DateTimeImmutable();
        $todayStart = $now->setTime(0, 0);

        $dateStart = \DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $date->format('Y-m-d') . ' 00:00:00');
        if ($dateStart < $todayStart) {
            throw new \DomainException('No se pueden modificar disponibilidades anteriores a hoy.');
        }

        if ($date->format('Y-m-d') === $now->format('Y-m-d')) {
            $earliest = null;
            foreach ((array) $slots as $s) {
                $startStr = $s['start'] ?? null;
                if (!$startStr) {
                    continue;
                }
                $slotStart = \DateTimeImmutable::createFromFormat('Y-m-d H:i', $date->format('Y-m-d') . ' ' . $startStr);
                if ($slotStart === false) {
                    continue;
                }
                if ($earliest === null || $slotStart < $earliest) {
                    $earliest = $slotStart;
                }
            }

            if ($earliest instanceof \DateTimeImmutable) {
                $limit = $now->modify('+1 hour');
                if ($earliest <= $limit) {
                    throw new \DomainException('No se pueden modificar disponibilidades de hoy con menos de 1 hora de anticipación.');
                }
            }
        }
    }

    /**
     * @return Availability[]
     */
    public function getAvailabilitiesForUser(UserInterface $user): array
    {
        return $this->availabilityRepository->findByProfessional($user);
    }

    /**
     * Devuelve disponibilidades de los últimos N meses (por defecto 2).
     * 
     * @return Availability[]
     */
    public function getRecentAvailabilitiesForUser(UserInterface $user): array
    {
        return $this->availabilityRepository->findRecentByProfessional($user, $this->historyMonths);
    }

    /**
     * Sincroniza disponibilidades del profesional usando UID (no id).
     *
     * @param UserInterface $user
     * @param array $availabilitiesData
     * @return Availability[]  Lista actualizada
     * @throws \Exception
     */
    public function syncAvailabilities(UserInterface $user, array $availabilitiesData): array
    {

        if (isset($availabilitiesData['availabilities']) && is_array($availabilitiesData['availabilities'])) {
            $availabilitiesData = $availabilitiesData['availabilities'];
        }

        $isAssoc = static function (array $a): bool {
            return $a !== [] && array_keys($a) !== range(0, count($a) - 1);
        };
        if ($availabilitiesData !== [] && is_array($availabilitiesData) && $isAssoc($availabilitiesData)) {
            $availabilitiesData = [$availabilitiesData];
        }

        $this->em->beginTransaction();
        try {
            $existing = $this->availabilityRepository->findByProfessional($user);
            $existingByUid = [];
            foreach ($existing as $e) {
                $existingByUid[$e->getUid()] = $e;
            }

            $processedUids = [];

            foreach ($availabilitiesData as $index => $item) {
                $uid = $item['uid'] ?? null;
                $isDelete = !empty($item['delete']);

                $ident = $this->makeIdent($item, $uid, $index);

                if ($uid !== null && $isDelete) {
                    if (isset($existingByUid[$uid])) {
                        $entityToDelete = $existingByUid[$uid];

                        $this->assertAvailabilityWindow($entityToDelete->getDateAvailability(), (array) $entityToDelete->getSlots());

                        if ($entityToDelete->hasBookings()) {
                            throw new \DomainException('No se puede eliminar una disponibilidad que ya tiene reservas.');
                        }

                        $this->em->remove($entityToDelete);
                        $processedUids[] = $uid;
                        continue;
                    } else {
                        throw new \InvalidArgumentException('No se encontró la disponibilidad a eliminar.');
                    }
                }

                if (empty($item['slots']) || empty($item['date'])) {
                    throw new \InvalidArgumentException("date y slots son requeridos en {$ident}");
                }

                $date  = \DateTime::createFromFormat('Y-m-d', $item['date']);
                $slots = $item['slots'] ?? [];

                if ($date === false) {
                    throw new \InvalidArgumentException("Formato de fecha inválido en {$ident}");
                }
                if (!is_array($slots) || count($slots) > 5) {
                    throw new \DomainException("Máximo 5 bloques de horarios por disponibilidad ({$ident}).");
                }

                $clean = [];
                foreach ($slots as $i => $slot) {
                    $startStr = $slot['start'] ?? '';
                    $endStr   = $slot['end'] ?? '';
                    $start = \DateTime::createFromFormat('H:i', $startStr);
                    $end   = \DateTime::createFromFormat('H:i', $endStr);
                    if ($start === false || $end === false) {
                        throw new \InvalidArgumentException("Formato de hora inválido en {$ident} (bloque " . ($i + 1) . ")");
                    }
                    if ($start >= $end) {
                        throw new \InvalidArgumentException("La hora de inicio debe ser anterior a la de fin en {$ident} (bloque " . ($i + 1) . ")");
                    }
                    $clean[] = ['start' => $start->format('H:i'), 'end' => $end->format('H:i')];
                }

                usort($clean, fn($a, $b) => strcmp($a['start'], $b['start']));
                for ($i = 1; $i < count($clean); $i++) {
                    if ($clean[$i]['start'] < $clean[$i - 1]['end']) {
                        throw new \DomainException("Los bloques no deben solaparse entre sí en {$ident} (bloque " . ($i + 1) . ")");
                    }
                }

                $this->assertAvailabilityWindow($date, $clean);

                $excludeId = null;
                if ($uid !== null) {
                    if (!isset($existingByUid[$uid])) {
                        throw new \InvalidArgumentException("UID de disponibilidad no encontrado en {$ident}");
                    }
                    $excludeId = $existingByUid[$uid]->getId();
                }

                if ($this->availabilityRepository->existsByProfessionalAndDate($user, $date, $excludeId)) {
                    throw new \DomainException(
                        sprintf("Ya existe una disponibilidad para esta fecha (%s).", $date->format('Y-m-d'))
                    );
                }

                if ($this->availabilityRepository->hasOverlap($user, $date, $clean, $excludeId)) {
                    throw new \DomainException("La disponibilidad {$ident} se solapa con otra disponibilidad existente.");
                }

                if ($uid !== null && isset($existingByUid[$uid])) {
                    $entity = $existingByUid[$uid];
                    if ($entity->hasBookings()) {
                        throw new \DomainException('No se puede editar una disponibilidad que ya tiene reservas.');
                    }
                    $this->mapDataToEntity($entity, ['date' => $item['date'], 'slots' => $clean], $user);
                    $this->validateEntity($entity);
                    $this->em->persist($entity);
                    $processedUids[] = $entity->getUid();
                    continue;
                }

                $entity = new Availability();
                $this->mapDataToEntity($entity, ['date' => $item['date'], 'slots' => $clean], $user);
                $this->validateEntity($entity);
                $this->em->persist($entity);
                $processedUids[] = $entity->getUid();
            }

            $this->em->flush();
            $this->em->commit();

            return $this->getAvailabilitiesForUser($user);
        } catch (\Throwable $e) {
            try {
                $this->em->rollback();
            } catch (\Throwable $_) {
            }
            throw $e;
        }
    }

    private function validateEntity(Availability $availability): void
    {
        $errors = $this->validator->validate($availability);
        if (count($errors) > 0) {
            $messages = [];
            foreach ($errors as $error) {
                $messages[] = $error->getMessage();
            }
            throw new \DomainException(implode("\n", $messages));
        }
    }

    private function makeIdent(array $item, ?string $uid, int $index): string
    {
        if (!empty($uid)) {
            return "uid {$uid}";
        }
        $date = $item['date'] ?? 'YYYY-MM-DD';
        $slots = $item['slots'] ?? [];
        $first = $slots[0] ?? ['start' => 'HH:MM', 'end' => 'HH:MM'];
        $start = $first['start'] ?? 'HH:MM';
        $end = $first['end'] ?? 'HH:MM';
        return "fecha {$date} {$start}-{$end} (#{$index})";
    }

    /**
     * Mapea datos al entity Availability conforme a tu entidad.
     *
     * @param Availability $entity
     * @param array $data
     * @param UserInterface $user
     */
    private function mapDataToEntity(Availability $entity, array $data, UserInterface $user): void
    {
        $date = \DateTime::createFromFormat('Y-m-d', $data['date'] ?? '');
        $slots = $data['slots'] ?? [];

        if ($date === false) {
            throw new \InvalidArgumentException('Formato de fecha inválido para date');
        }

        $entity->setDateAvailability($date);
        $entity->setSlots($slots);

        if ($entity->getProfessionalUser() === null) {
            $entity->setProfessionalUser($user);
        }
    }
}
