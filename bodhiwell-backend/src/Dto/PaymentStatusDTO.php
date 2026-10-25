<?php

namespace App\Dto;

class PaymentStatusDTO
{
    public string $paymentUid;
    public string $status;
    public ?string $currency;
    public ?int $amount;

    public ?string $paymentMethod = null;
    public ?string $paymentCode = null;
    public ?string $paymentUrl = null;

    public function __construct(
        string $paymentUid,
        string $status,
        ?string $currency,
        ?int $amount,
        ?string $paymentMethod = null,
        ?string $paymentCode = null,
        ?string $paymentUrl = null
    ) {
        $this->paymentUid = $paymentUid;
        $this->status = $status;
        $this->currency = $currency;
        $this->amount = $amount;
        $this->paymentMethod = $paymentMethod;
        $this->paymentCode = $paymentCode;
        $this->paymentUrl = $paymentUrl;
    }
}
