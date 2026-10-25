<?php

namespace App\Enum;

enum StudyType: string
{
    case HIGHER_EDUCATION            = 'higher_education';
    case TECHNICAL_VOCATIONAL        = 'technical_vocational';
    case SECONDARY_EDUCATION         = 'secondary_education';
    case PRIMARY_EDUCATION           = 'primary_education';
    case COURSE_WORKSHOP             = 'course_workshop';
    case PROFESSIONAL_CERTIFICATION  = 'professional_certification';
    case OTHER                       = 'other';

    public function label(): string
    {
        return match ($this) {
            self::HIGHER_EDUCATION           => 'Educación superior',
            self::TECHNICAL_VOCATIONAL       => 'Educación técnica o vocacional',
            self::SECONDARY_EDUCATION        => 'Educación secundaria',
            self::PRIMARY_EDUCATION          => 'Educación primaria',
            self::COURSE_WORKSHOP            => 'Curso/Taller',
            self::PROFESSIONAL_CERTIFICATION => 'Certificación profesional',
            self::OTHER                      => 'Otros',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function fromMixed(null|string $value): ?self
    {
        if ($value === null || $value === '') return null;

        $v = trim($value);

        $vn = mb_strtolower($v);
        $vn = preg_replace('/\s+/', ' ', $vn);

        return match (true) {
            $v === self::HIGHER_EDUCATION->value           => self::HIGHER_EDUCATION,
            $v === self::TECHNICAL_VOCATIONAL->value       => self::TECHNICAL_VOCATIONAL,
            $v === self::SECONDARY_EDUCATION->value        => self::SECONDARY_EDUCATION,
            $v === self::PRIMARY_EDUCATION->value          => self::PRIMARY_EDUCATION,
            $v === self::COURSE_WORKSHOP->value            => self::COURSE_WORKSHOP,
            $v === self::PROFESSIONAL_CERTIFICATION->value => self::PROFESSIONAL_CERTIFICATION,
            $v === self::OTHER->value                      => self::OTHER,

            $vn === 'educación superior'                   => self::HIGHER_EDUCATION,
            $vn === 'educación técnica o vocacional'       => self::TECHNICAL_VOCATIONAL,
            $vn === 'educación secundaria'                 => self::SECONDARY_EDUCATION,
            $vn === 'educación primaria'                   => self::PRIMARY_EDUCATION,
            $vn === 'curso/taller'                         => self::COURSE_WORKSHOP,
            $vn === 'certificación profesional'            => self::PROFESSIONAL_CERTIFICATION,
            $vn === 'otros'                                => self::OTHER,
            default => null,
        };
    }

    public static function map(): array
    {
        $out = [];
        foreach (self::cases() as $c) $out[$c->value] = $c->label();
        return $out;
    }

    public static function choices(): array
    {
        $out = [];
        foreach (self::cases() as $c) $out[$c->label()] = $c->value;
        return $out;
    }
}
