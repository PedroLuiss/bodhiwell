<?php

namespace App\Enum;

enum LegalFrameworkEnum: string
{
    case MEDICAL_ACT           = 'MEDICAL_ACT';
    case REGULATED_PROFESSION  = 'REGULATED_PROFESSION';
    case UNREGULATED_PRACTICE  = 'UNREGULATED_PRACTICE';
    case SPECIALTY             = 'SPECIALTY';

    public static function values(): array
    {
        return array_map(fn(self $c) => $c->value, self::cases());
    }

    public function label(): string
    {
        return match ($this) {
            self::MEDICAL_ACT          => 'Acto Médico',
            self::REGULATED_PROFESSION => 'Profesión Regulada',
            self::UNREGULATED_PRACTICE => 'Práctica No Regulada',
            self::SPECIALTY            => 'Especialidad',
        };
    }
}
