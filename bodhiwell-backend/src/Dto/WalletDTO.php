<?php

namespace App\Dto;

use App\Entity\ProfessionalWallet;

class WalletDTO
{
    public string $walletUid;
    public string $availableBalance;
    public string $frozenBalance;
    public string $balanceTotal;
    /** @var array<int, array<string, mixed>> */
    public array $movements = [];

    public function __construct(private ProfessionalWallet $wallet)
    {
        $available = (float) $this->wallet->calculateAvailableBalance();
        $frozen    = (float) $this->wallet->calculateFrozenBalance();

        $this->walletUid        = (string) $this->wallet->getUid();
        $this->availableBalance = number_format($available, 2, '.', '');
        $this->frozenBalance    = number_format($frozen, 2, '.', '');
        $this->balanceTotal     = number_format($available + $frozen, 2, '.', '');

        foreach ($this->wallet->getWalletLedgers() as $ledger) {
            $payment = $ledger->getPayment();
            $booking = $payment?->getBooking();

            $description = $booking?->getNotes()
                ?? $booking?->getReserveReason()
                ?? 'Movimiento asociado al pago ' . ($payment?->getUid() ?? '');

            $this->movements[] = [
                'uid'           => $ledger->getUid(),
                'amount'        => number_format((float) $ledger->getAmount(), 2, '.', ''),
                'operationType' => $ledger->getOperationType(),
                'paymentUid'    => $payment?->getUid(),
                'status'        => $payment?->getStatus()?->value ?? 'unknown',
                'description'   => $description,
                'createdAt'     => $ledger->getCreatedAt()?->format(DATE_ATOM),
            ];
        }
    }
}
