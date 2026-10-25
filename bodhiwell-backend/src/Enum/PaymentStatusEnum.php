<?php

namespace App\Enum;

enum PaymentStatusEnum: string
{
    case INITIATED        = 'INITIATED';
    case PROCESSING       = 'PROCESSING';
    case PENDING_PROVIDER = 'PENDING_PROVIDER';
    case APPROVED         = 'APPROVED';
    case REJECTED         = 'REJECTED';
    case REFUNDED         = 'REFUNDED';
    case AUTHORIZED       = 'AUTHORIZED';
    case PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED';
    case PARTIALLY_CAPTURED = 'PARTIALLY_CAPTURED';
    case CAPTURED         = 'CAPTURED';
    case PENDING          = 'PENDING';

    public static function values(): array
    {
        return array_map(fn(self $c) => $c->value, self::cases());
    }

    public function label(): string
    {
        return match ($this) {
            self::INITIATED        => 'Iniciado',
            self::PROCESSING       => 'Procesando',
            self::PENDING_PROVIDER => 'Pendiente del proveedor',
            self::APPROVED         => 'Aprobado',
            self::REJECTED         => 'Rechazado',
            self::REFUNDED         => 'Reembolsado',
            self::AUTHORIZED       => 'Autorizado',
            self::PARTIALLY_REFUNDED => 'Parcialmente reembolsado',
            self::PARTIALLY_CAPTURED => 'Parcialmente capturado',
            self::CAPTURED         => 'Capturado',
            self::PENDING          => 'Pendiente',
        };
    }
}
