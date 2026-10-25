<?php

namespace App\Dto;

class PaymentResponseDTO
{
    public string $paymentUid;
    public ?string $payment_url;

    public function __construct(string $paymentUid, ?string $payment_url)
    {
        $this->paymentUid = $paymentUid;
        $this->payment_url = $payment_url;
    }
}
