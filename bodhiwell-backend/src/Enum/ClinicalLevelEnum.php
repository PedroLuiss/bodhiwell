<?php

namespace App\Enum;

enum ClinicalLevelEnum: string
{
    case HIGH    = 'HIGH';
    case MEDIUM  = 'MEDIUM';
    case LOW     = 'LOW';
    case SUPPORT = 'SUPPORT';

    public static function values(): array
    {
        return array_map(fn(self $c) => $c->value, self::cases());
    }

    public function label(): string
    {
        return match ($this) {
            self::HIGH    => 'Alto',
            self::MEDIUM  => 'Medio',
            self::LOW     => 'Bajo',
            self::SUPPORT => 'Soporte',
        };
    }
}
