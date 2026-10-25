<?php

namespace App\Enum;

enum WithdrawalMethodEnum: string
{
    case BANK_TRANSFER = 'bank_transfer';
    case INTERNAL_WALLET = 'internal_wallet';
    case CRYPTO = 'crypto';

    public function label(): string
    {
        return match($this) {
            self::BANK_TRANSFER => 'Transferencia bancaria',
            self::INTERNAL_WALLET => 'Wallet interna',
            self::CRYPTO => 'Cripto',
        };
    }
}
