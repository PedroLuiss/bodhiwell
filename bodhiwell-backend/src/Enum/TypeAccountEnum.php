<?php

namespace App\Enum;

enum TypeAccountEnum: string
{
    case PROFESSIONAL = 'professional';
    case PATIENT      = 'patient';

    public function label(): string
    {
        return match ($this) {
            self::PROFESSIONAL => 'Profesional',
            self::PATIENT      => 'Consultante',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function choiceMap(callable $translate = null): array
    {
        $map = [];
        foreach (self::cases() as $case) {
            $label = $translate ? $translate($case) : $case->label();
            $map[$label] = $case->value;
        }
        return $map;
    }
}
