<?php

namespace App\Services;

use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Uid\Uuid;

class CorrelationIdProvider
{
    public function __construct(private RequestStack $requestStack) {}

    public function getOrCreate(): string
    {
        $req = $this->requestStack->getCurrentRequest();
        if ($req) {
            $cid = $req->headers->get('X-Correlation-Id') ?: $req->attributes->get('correlation_id');
            if ($cid) {
                return (string)$cid;
            }
            $cid = Uuid::v4()->toRfc4122();
            $req->attributes->set('correlation_id', $cid);
            return $cid;
        }
        return Uuid::v4()->toRfc4122();
    }
}
