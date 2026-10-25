<?php

namespace App\Enum;

enum CertificateStatus: string
{
    case PENDING      = 'pending';
    case UNDER_REVIEW = 'under_review';
    case APPROVED     = 'approved';

    public function label(): string
    {
        return match ($this) {
            self::PENDING      => 'Pendiente',
            self::UNDER_REVIEW => 'En revisión',
            self::APPROVED     => 'Aprobado',
        };
    }

    /** @return string[] */
    public static function values(): array
    {
        return array_map(fn(self $c) => $c->value, self::cases());
    }

    /**
     * Útil si en algún momento quisieras mapear entrada humana a código.
     * (El front ya NO debe enviar status, pero lo dejamos por si se usa en otro punto.)
     */
    public static function tryFromMixed(?string $in): ?self
    {
        if ($in === null) return null;
        $t = trim(mb_strtolower($in));
        return match ($t) {
            'pending', 'pendiente'                              => self::PENDING,
            'under_review', 'en revisión', 'en revision', 'rv' => self::UNDER_REVIEW,
            'approved', 'aprobado', 'aprobada'                 => self::APPROVED,
            default => null,
        };
    }
}
