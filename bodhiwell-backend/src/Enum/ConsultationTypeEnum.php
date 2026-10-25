<?php

namespace App\Enum;

enum ConsultationTypeEnum: string
{
    case VIRTUAL     = 'virtual';
    case PRESENTIAL  = 'presential';

    public static function labels(): array
    {
        return [
            self::VIRTUAL->value    => 'Virtual',
            self::PRESENTIAL->value => 'Presencial',
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
