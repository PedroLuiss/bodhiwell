<?php

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class ApiPermissionMiddlewareSubscriber implements EventSubscriberInterface
{
    public function onApiPermissionMiddleware($event): void
    {
        // ...
    }

    public static function getSubscribedEvents(): array
    {
        return [
            'ApiPermissionMiddleware' => 'onApiPermissionMiddleware',
        ];
    }
}