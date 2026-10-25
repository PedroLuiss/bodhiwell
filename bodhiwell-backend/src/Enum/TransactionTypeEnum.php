<?php

namespace App\Enum;

enum TransactionTypeEnum: string
{
    case INIT    = 'INIT';
    case AUTH    = 'AUTH';
    case CAPTURE = 'CAPTURE';
    case REJECT  = 'REJECT';
    case REFUND  = 'REFUND';

    public static function values(): array
    {
        return array_map(fn(self $c) => $c->value, self::cases());
    }
}
