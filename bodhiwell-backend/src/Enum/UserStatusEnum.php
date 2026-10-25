<?php

namespace App\Enum;

enum UserStatusEnum: string
{
    case ACTIVE = 'active';
    case PENDING_COMPLETION = 'pending_completion';
    case PENDING_APPROVAL = 'pending_approval';
    case REJECTED = 'rejected';

    public static function values(): array
    {
        return array_map(fn(self $c) => $c->value, self::cases());
    }
}
