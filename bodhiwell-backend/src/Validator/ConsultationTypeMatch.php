<?php

namespace App\Validator;

use Symfony\Component\Validator\Constraint;

#[\Attribute(\Attribute::TARGET_CLASS)]
class ConsultationTypeMatch extends Constraint
{
    public string $message = 'El profesional solo atiende en modalidad: {{ professionalType }}.';

    public function getTargets(): string
    {
        return self::CLASS_CONSTRAINT;
    }

    public function validatedBy(): string
    {
        return self::class . 'Validator';
    }
}
