<?php

namespace App\Enum;

enum WalletLedgerConceptEnum: string
{
    case PAYMENT = 'PAYMENT';
    case WITHDRAWAL = 'WITHDRAWAL';
    case REFUND = 'REFUND';
    case ADJUSTMENT = 'ADJUSTMENT';
    case INCOME_ON_HOLD = 'INCOME_ON_HOLD';
    case FUNDS_RELEASE = 'FUNDS_RELEASE';
    case WITHDRAWAL_REQUEST = 'WITHDRAWAL_REQUEST';
    case WITHDRAWAL_REJECTED = 'WITHDRAWAL_REJECTED';

    public function label(): string
    {
        return match ($this) {
            self::PAYMENT => 'Pago Recibido',
            self::WITHDRAWAL => 'Retiro',
            self::REFUND => 'Reembolso',
            self::ADJUSTMENT => 'Ajuste',
            self::INCOME_ON_HOLD => 'Ingreso Retenido',
            self::FUNDS_RELEASE => 'Liberación de Fondos',
            self::WITHDRAWAL_REQUEST => 'Solicitud de Retiro',
            self::WITHDRAWAL_REJECTED => 'Retiro Rechazado',
        };
    }
}
