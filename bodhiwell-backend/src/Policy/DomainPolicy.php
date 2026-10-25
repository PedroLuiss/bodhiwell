<?php

namespace App\Policy;

use App\Entity\Booking;
use App\Entity\Payment;
use App\Enum\PaymentStatusEnum;
use InvalidArgumentException;
use RuntimeException;

class DomainPolicy
{
    public function assertBookingEligible(Booking $booking): void
    {
        $status = $booking->getStatus();
        if (in_array($status, ['cancelled', 'completed'], true)) {
            throw new RuntimeException('Booking is not eligible to start a payment');
        }

        $payments = $booking->getPayments();
        foreach ($payments as $p) {
            if ($p->getStatus() === PaymentStatusEnum::CAPTURED) {
                throw new RuntimeException('Booking already has a captured payment');
            }
        }
    }

    public function assertValidAmount(int $amountCents, string $currency): void
    {
        if ($amountCents <= 0) {
            throw new InvalidArgumentException('Amount must be greater than zero');
        }

        $supported = ['USD', 'EUR', 'VEF', 'UYU'];
        if (!in_array($currency, $supported, true)) {
            throw new InvalidArgumentException(sprintf('Currency %s not supported', $currency));
        }

        $maxCents = 10_000_00;
        if ($amountCents > $maxCents) {
            throw new InvalidArgumentException('Amount exceeds maximum allowed');
        }
    }

    public function assertValidTransition(Payment $payment, PaymentStatusEnum $newStatus): void
    {
        $current = $payment->getStatus();
        $target = $newStatus->value;

        $allowed = [
            PaymentStatusEnum::PENDING->value => [
                PaymentStatusEnum::AUTHORIZED->value,
                PaymentStatusEnum::CAPTURED->value,
                PaymentStatusEnum::REJECTED->value,
            ],
            PaymentStatusEnum::AUTHORIZED->value => [
                PaymentStatusEnum::AUTHORIZED->value,
                PaymentStatusEnum::CAPTURED->value,
                PaymentStatusEnum::REJECTED->value,
            ],
            PaymentStatusEnum::CAPTURED->value => [
                PaymentStatusEnum::REFUNDED->value,
            ],
            PaymentStatusEnum::REJECTED->value => [],
            PaymentStatusEnum::REFUNDED->value => [],
        ];

        $currentNormalized = $current ? $current->value : PaymentStatusEnum::PENDING->value;
        $allowedTargets = $allowed[$currentNormalized] ?? [];

        if (!in_array($target, $allowedTargets, true)) {
            throw new RuntimeException(sprintf('Invalid transition from %s to %s', $currentNormalized, $target));
        }
    }
}
