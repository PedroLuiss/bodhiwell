<?php

namespace App\Enum;

enum WeekDayEnum:int
{
    case SUNDAY    = 0;
    case MONDAY    = 1;
    case TUESDAY   = 2;
    case WEDNESDAY = 3;
    case THURSDAY  = 4;
    case FRIDAY    = 5;
    case SATURDAY  = 6;

    public static function labels(): array
    {
        return [
            self::SUNDAY->value    => 'Domingo',
            self::MONDAY->value    => 'Lunes',
            self::TUESDAY->value   => 'Martes',
            self::WEDNESDAY->value => 'Miércoles',
            self::THURSDAY->value  => 'Jueves',
            self::FRIDAY->value    => 'Viernes',
            self::SATURDAY->value  => 'Sábado',
        ];
    }

    public function transKey(): string
    {
        return 'weekday.'.$this->name;
    }

    public static function choiceMap(callable $translate = null): array
    {
        $out = [];
        foreach (self::cases() as $case) {
            $label = $translate ? $translate($case) : $case->transKey();
            $out[$label] = $case;
        }
        return $out;
    }
}
