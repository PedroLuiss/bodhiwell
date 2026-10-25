<?php

namespace App\Validator;

use Symfony\Component\Validator\Constraint;

#[\Attribute(\Attribute::TARGET_CLASS)]
class NoAvailabilityOverlap extends Constraint
{
    public string $message = 'Ya existe una disponibilidad en ese horario para esta fecha.';

    public function getTargets(): string
    {
        return self::CLASS_CONSTRAINT;
    }

    public function validatedBy(): string
    {
        return NoAvailabilityOverlapValidator::class;
    }
}
