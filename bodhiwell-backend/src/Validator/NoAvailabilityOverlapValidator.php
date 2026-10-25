<?php

namespace App\Validator;

use App\Entity\Availability;
use App\Repository\AvailabilityRepository;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;

class NoAvailabilityOverlapValidator extends ConstraintValidator
{
    public function __construct(
        private AvailabilityRepository $availabilityRepository,
        private int $maxDailySlots = 5,
    ) {}

    public function validate($value, Constraint $constraint): void
    {
        if (!$constraint instanceof NoAvailabilityOverlap) {
            throw new UnexpectedTypeException($constraint, NoAvailabilityOverlap::class);
        }
        if (!$value instanceof Availability) {
            return;
        }

        $date  = $value->getDateAvailability();
        $slots = $value->getSlots() ?? [];
        $pro   = $value->getProfessionalUser();

        if (is_array($slots) && count($slots) > $this->maxDailySlots) {
            $this->context->buildViolation(sprintf('Máximo %d bloques de horarios por disponibilidad.', $this->maxDailySlots))
                ->atPath('slots')
                ->addViolation();
            return;
        }

        $clean = [];
        foreach ((array) $slots as $s) {
            $start = $this->norm($s['start'] ?? null);
            $end   = $this->norm($s['end'] ?? null);

            if (!$start || !$end) {
                $this->context->buildViolation('Cada bloque debe tener inicio y fin en formato HH:MM.')
                    ->atPath('slots')
                    ->addViolation();
                return;
            }

            $sMin = $this->toMinutes($start);
            $eMin = $this->toMinutes($end);

            if ($sMin >= $eMin) {
                $this->context->buildViolation('La hora de inicio debe ser anterior a la de fin.')
                    ->atPath('slots')
                    ->addViolation();
                return;
            }

            $clean[] = ['start' => $start, 'end' => $end, '_s' => $sMin, '_e' => $eMin];
        }

        if (!empty($clean)) {
            usort($clean, fn($a, $b) => $a['_s'] <=> $b['_s']);
            for ($i = 1; $i < count($clean); $i++) {
                if ($clean[$i]['_s'] < $clean[$i - 1]['_e']) {
                    $this->context->buildViolation('Los bloques de horas no deben solaparse con las horas de otro bloque existente.')
                        ->atPath('slots')
                        ->addViolation();
                    return;
                }
            }
        }

        if ($pro && $date) {
            $excludeId = $value->getId();

            if ($this->availabilityRepository->existsByProfessionalAndDate($pro, $date, $excludeId)) {
                $this->context->buildViolation('Ya existe una disponibilidad para esta fecha.')
                    ->atPath('dateAvailability')
                    ->addViolation();
                return;
            }

            if (!empty($clean) && $this->availabilityRepository->hasOverlap($pro, $date, $clean, $excludeId)) {
                $this->context->buildViolation('Los bloques se solapan con horarios existentes.')
                    ->atPath('slots')
                    ->addViolation();
                return;
            }
        }
    }

    private function norm(?string $t): ?string
    {
        if (!$t) return null;
        $t = trim($t);

        if (preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $t)) {
            return substr($t, 0, 5);
        }

        $lower = strtolower($t);
        $lower = str_replace(['p. m.', 'a. m.'], ['pm', 'am'], $lower);
        if (preg_match('/^(\d{1,2}):(\d{2})\s*(am|pm)$/', $lower, $m)) {
            $h = (int) $m[1];
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
    }

    private function toMinutes(string $hhmm): int
    {
        [$h, $m] = array_map('intval', explode(':', $hhmm, 2));
        return $h * 60 + $m;
    }
}
