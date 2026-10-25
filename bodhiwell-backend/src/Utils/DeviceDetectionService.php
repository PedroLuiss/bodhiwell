<?php

namespace App\Utils;

use Symfony\Component\HttpFoundation\RequestStack;

class DeviceDetectionService
{
    private const MOBILE_PAGE_SIZE = 8;
    private const DESKTOP_PAGE_SIZE = 16;

    public function __construct(private RequestStack $requestStack) {}

    public function isMobile(): bool
    {
        $request = $this->requestStack->getCurrentRequest();
        if (!$request) {
            return false;
        }

        $userAgent = strtolower($request->headers->get('User-Agent', ''));

        if ((str_contains($userAgent, 'macintosh') || str_contains($userAgent, 'mac os x')) && !str_contains($userAgent, 'mobile')) {
            return false;
        }

        $mobileAgents = [
            'mobile',
            'android',
            'silk/',
            'kindle',
            'blackberry',
            'opera mini',
            'opera mobi',
            'windows phone',
            'iemobile',
            'iphone',
            'ipod',
        ];

        foreach ($mobileAgents as $device) {
            if (str_contains($userAgent, $device)) {
                return true;
            }
        }

        return false;
    }

    public function getPaginatorPageSize(): int
    {
        return $this->isMobile() ? self::MOBILE_PAGE_SIZE : self::DESKTOP_PAGE_SIZE;
    }
}
