<?php

namespace App\Enum;

enum MspVerificationStatusEnum: string
{
    case PENDING = 'PENDING';
    case VERIFIED = 'VERIFIED';
    case REJECTED = 'REJECTED';
    case NOT_APPLICABLE = 'NOT_APPLICABLE';

    public static function values(): array
    {
        return array_map(fn(self $c) => $c->value, self::cases());
    }

    public function label(): string
    {
        return match ($this) {
            self::PENDING        => 'Pendiente',
            self::VERIFIED       => 'Verificado',
            self::REJECTED       => 'Rechazado',
            self::NOT_APPLICABLE => 'No aplica',
        };
    }
}
