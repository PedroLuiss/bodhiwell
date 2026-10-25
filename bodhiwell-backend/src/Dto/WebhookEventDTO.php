<?php

namespace App\Dto;

class WebhookEventDTO
{
    public string $eventId;
    public string $paymentId;
    public string $status;
    public array $rawPayload;

    public function __construct(string $eventId, string $paymentId, string $status, array $rawPayload)
    {
        $this->eventId = $eventId;
        $this->paymentId = $paymentId;
        $this->status = $status;
        $this->rawPayload = $rawPayload;
    }
}
