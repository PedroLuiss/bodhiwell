<?php

namespace App\Validator;

use Symfony\Component\Validator\Constraint;

#[\Attribute(\Attribute::TARGET_CLASS)]
class NoSelfBooking extends Constraint
{
    public string $message = 'El consultante y el profesional no pueden ser la misma persona.';

    public function getTargets(): string
    {
        return self::CLASS_CONSTRAINT;
    }

    public function validatedBy(): string
    {
        return self::class . 'Validator';
    }
}
