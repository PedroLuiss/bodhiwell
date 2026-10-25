<?php

namespace App\Enum;

enum ConsultationStatusEnum: string
{
    case PENDING   = 'pending';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';
    case EMPTY  = '';

    public static function labels(): array
    {
        return [
            self::PENDING->value   => 'Pending',
            self::COMPLETED->value => 'Completed',
            self::CANCELLED->value => 'Cancelled',
            self::EMPTY->value     => 'No Status',
        ];
    }

    public static function choices(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function values(): array
    {
        return array_map(fn($case) => $case->value, self::cases());
    }
}
