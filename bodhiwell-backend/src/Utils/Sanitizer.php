<?php

namespace App\Utils;

/**
 * Stateless sanitizer helpers.
 * Inyéctalo en los servicios (no estático) para facilitar tests/mocks.
 */
final class Sanitizer
{
    public function inText(?string $s): ?string
    {
        if ($s === null) return null;
        $s = preg_replace('/\s+/u', ' ', $s) ?? $s;
        $s = trim($s);
        return $s === '' ? null : $s;
    }

    public function inMultiline(?string $s): ?string
    {
        if ($s === null) return null;
        $s = preg_replace("/[ \t]+\n/", "\n", $s) ?? $s;
        $s = preg_replace("/\n{3,}/", "\n\n", $s) ?? $s;
        $s = trim($s);
        return $s === '' ? null : $s;
    }

    public function outText(?string $s): ?string
    {
        if ($s === null) return null;
        $s = preg_replace('/\s+/u', ' ', $s) ?? $s;
        return trim($s) ?: null;
    }

    public function outMultiline(?string $s): ?string
    {
        if ($s === null) return null;
        $s = preg_replace("/[ \t]+\n/", "\n", $s) ?? $s;
        $s = preg_replace("/\n{3,}/", "\n\n", $s) ?? $s;
        return trim($s) ?: null;
    }

    public function outUrl(?string $u): ?string
    {
        if ($u === null) return null;
        return trim($u) ?: null;
    }

    public function outEmail(?string $e): ?string
    {
        if ($e === null) return null;
        $e = trim($e);
        return $e === '' ? null : $e;
    }

    public function outPhone(?string $p): ?string
    {
        if ($p === null) return null;
        $p = preg_replace('/\s+/', ' ', $p) ?? $p;
        $p = trim($p);
        return $p === '' ? null : $p;
    }

    public function outRich(?string $html): ?string
    {
        if ($html === null) return null;
        $html = trim($html);
        return $html === '' ? null : $html;
    }
}
