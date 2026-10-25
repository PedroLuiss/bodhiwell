<?php

namespace App\Enum;

enum ConsultTypeEnum: string
{
    case PRESENTIAL = 'presential';
    case VIRTUAL = 'virtual';
    case HYBRID = 'hybrid';

    public function label(): string
    {
        return match ($this) {
            self::PRESENTIAL => 'Presencial',
            self::VIRTUAL => 'Virtual',
            self::HYBRID => 'Presencial/Virtual',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function choices(): array
    {
        $choices = [];
        foreach (self::cases() as $case) {
            $choices[$case->label()] = $case->value;
        }
        return $choices;
    }
}
