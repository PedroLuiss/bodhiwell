<?php

namespace App\Enum;

enum LatamCountryEnum: string
{
    case AR = 'AR';
    case BO = 'BO';
    case BR = 'BR';
    case CL = 'CL';
    case CO = 'CO';
    case CR = 'CR';
    case CU = 'CU';
    case DO = 'DO';
    case EC = 'EC';
    case SV = 'SV';
    case GT = 'GT';
    case HN = 'HN';
    case HT = 'HT';
    case MX = 'MX';
    case NI = 'NI';
    case PA = 'PA';
    case PY = 'PY';
    case PE = 'PE';
    case PR = 'PR';
    case UY = 'UY';
    case VE = 'VE';
    case BZ = 'BZ';
    case GY = 'GY';
    case SR = 'SR';

    public function label(): string
    {
        return match ($this) {
            self::AR => 'Argentina',
            self::BO => 'Bolivia',
            self::BR => 'Brasil',
            self::CL => 'Chile',
            self::CO => 'Colombia',
            self::CR => 'Costa Rica',
            self::CU => 'Cuba',
            self::DO => 'República Dominicana',
            self::EC => 'Ecuador',
            self::SV => 'El Salvador',
            self::GT => 'Guatemala',
            self::HN => 'Honduras',
            self::HT => 'Haití',
            self::MX => 'México',
            self::NI => 'Nicaragua',
            self::PA => 'Panamá',
            self::PY => 'Paraguay',
            self::PE => 'Perú',
            self::PR => 'Puerto Rico',
            self::UY => 'Uruguay',
            self::VE => 'Venezuela',
            self::BZ => 'Belice',
            self::GY => 'Guyana',
            self::SR => 'Surinam',
        };
    }

    public static function choices(): array
    {
        $out = [];
        foreach (self::cases() as $c) {
            $out[$c->label()] = $c->value;
        }
        return $out;
    }

    public static function codes(): array
    {
        return array_map(fn(self $c) => $c->value, self::cases());
    }
}
