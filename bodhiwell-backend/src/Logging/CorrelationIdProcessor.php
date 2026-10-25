<?php

namespace App\Logging;

use App\Services\CorrelationIdProvider;
use Monolog\LogRecord;

class CorrelationIdProcessor
{
    public function __construct(private CorrelationIdProvider $provider) {}

    public function __invoke(LogRecord $record): LogRecord
    {
        try {
            $record->extra['correlation_id'] = $this->provider->getOrCreate();
        } catch (\Throwable) {
        }
        return $record;
    }
}
