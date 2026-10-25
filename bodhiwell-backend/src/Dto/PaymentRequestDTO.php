<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class PaymentRequestDTO
{
    #[Assert\NotBlank]
    #[Assert\Positive(message: 'Amount must be > 0')]
    public float $amount;

    #[Assert\NotBlank]
    #[Assert\Choice(choices: ['USD', 'EUR', 'VEF', 'UYU'], message: 'Currency {{ value }} not supported')]
    public string $currency;

    #[Assert\Length(max: 50)]
    public ?string $paymentMethod = null;
}
