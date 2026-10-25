<?php

namespace App\Enum;

enum WalletStatusEnum: string
{
    case ACTIVE = 'active';
    case BLOCKED = 'blocked';
    case PENDING = 'pending';
}
