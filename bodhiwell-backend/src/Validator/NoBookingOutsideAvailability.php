<?php

namespace App\Validator;

use Symfony\Component\Validator\Constraint;

#[\Attribute(\Attribute::TARGET_CLASS)]
class NoBookingOutsideAvailability extends Constraint
{
    public string $message = 'La reserva está fuera del horario de disponibilidad del profesional.';

    public function getTargets(): string
    {
        return self::CLASS_CONSTRAINT;
    }

    public function validatedBy(): string
    {
        return self::class.'Validator';
    }
}
