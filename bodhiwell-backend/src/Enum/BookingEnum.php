<?php

namespace App\Enum;

enum BookingEnum: string
{
    case WAITING_PAYMENT  = 'WAITING_PAYMENT';
    case PROCESSING       = 'PROCESSING';
    case PENDING_PROVIDER = 'PENDING_PROVIDER';
    case CONFIRMED        = 'CONFIRMED';
    case CANCELLED        = 'CANCELLED';
    case COMPLETED        = 'COMPLETED';
    case PENDING          = 'PENDING';

    public static function values(): array
    {
        return array_map(fn(self $e) => $e->value, self::cases());
    }

    public function label(): string
    {
        return match ($this) {
            self::WAITING_PAYMENT  => 'Esperando pago',
            self::PROCESSING       => 'Procesando',
            self::PENDING_PROVIDER => 'Pendiente del proveedor',
            self::CONFIRMED        => 'Confirmada',
            self::CANCELLED        => 'Cancelada',
            self::COMPLETED        => 'Completada',
            self::PENDING          => 'Pendiente',
        };
    }
}
