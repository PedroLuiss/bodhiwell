<?php

namespace App\Enum;

use Symfony\Contracts\Translation\TranslatorInterface;

enum ConsultationDetailTypeEnum: string
{
    case MEETING_LINK = 'meetingLink';
    case ADDRESS      = 'address';
    case OBSERVATIONS = 'observations';
    case NOTES = 'notes';
    case REASON_CONSULTATION = 'reasonConsultation';

    public static function labels(): array
    {
        return [
            self::MEETING_LINK->value => 'Enlace de reunión',
            self::ADDRESS->value      => 'Dirección',
            self::OBSERVATIONS->value => 'Observaciones',
            self::NOTES->value => 'Notas',
            self::REASON_CONSULTATION->value => 'Motivo de consulta',
        ];
    }

    public static function choices(TranslatorInterface $t): array
    {
        $choices = [];
        foreach (self::cases() as $case) {
            $label = $t->trans("consultation_detail.fields.{$case->value}");
            $choices[$label] = $case->value;
        }
        return $choices;
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
