<?php

namespace App\Validator;

use Symfony\Component\Validator\Constraint;

#[\Attribute(\Attribute::TARGET_CLASS)]
class NoBookingDoubleOverlap extends Constraint
{
    public string $messageBoth = 'El profesional y el consultante ya tienen una reserva registrada en ese horario.';
    public string $messagePro  = 'El profesional ya tiene una reserva registrada en ese horario.';
    public string $messagePat  = 'El consultante ya tiene una reserva registrada en ese horario.';

    public function getTargets(): string
    {
        return self::CLASS_CONSTRAINT;
    }

    public function validatedBy(): string
    {
        return self::class . 'Validator';
    }
}
