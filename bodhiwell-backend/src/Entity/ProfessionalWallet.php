<?php

namespace App\Entity;

use App\Repository\ProfessionalWalletRepository;
use App\Entity\User;
use App\Entity\WalletLedger;
use App\Enum\PaymentStatusEnum;
use App\Enum\WithdrawalStatusEnum;
use App\Enum\RefundStatus;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;

#[ORM\Entity(repositoryClass: ProfessionalWalletRepository::class)]
#[ORM\Table(name: 'professional_wallets')]
#[ORM\UniqueConstraint(name: 'uq_professional_wallets_professional_id', columns: ['professional_id'])]
#[ORM\HasLifecycleCallbacks]
class ProfessionalWallet
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $uid = null;

    #[ORM\Column(length: 50, options: ['default' => 'active'])]
    private string $status = 'active';

    #[ORM\OneToOne(targetEntity: User::class, inversedBy: 'professionalWallet', cascade: ['persist'])]
    #[ORM\JoinColumn(name: 'professional_id', referencedColumnName: 'id', nullable: false, unique: true, onDelete: 'RESTRICT')]
    private ?User $professional = null;


    #[ORM\Column(type: Types::FLOAT, options: ['default' => 0])]
    private float $availableBalance = 0.0;

    #[ORM\Column(type: Types::FLOAT, options: ['default' => 0])]
    private float $frozenBalance = 0.0;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private ?\DateTimeImmutable $updatedAt = null;

    /**
     * @var Collection<int, WalletLedger>
     */
    #[ORM\OneToMany(targetEntity: WalletLedger::class, mappedBy: 'wallet')]
    private Collection $walletLedgers;

    public function __construct()
    {
        $this->walletLedgers = new ArrayCollection();
        $now = new \DateTimeImmutable();
        $this->createdAt = $now;
        $this->updatedAt = $now;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUid(): ?string
    {
        return $this->uid;
    }

    public function setUid(string $uid): static
    {
        $this->uid = $uid;
        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function getProfessional(): ?User
    {
        return $this->professional;
    }

    public function setProfessional(User $professional): static
    {
        $this->professional = $professional;

        return $this;
    }

    public function getAvailableBalance(): float
    {
        return $this->availableBalance;
    }

    public function setAvailableBalance(float $availableBalance): static
    {
        $this->availableBalance = $availableBalance;

        return $this;
    }

    public function getFrozenBalance(): float
    {
        return $this->frozenBalance;
    }

    public function setFrozenBalance(float $frozenBalance): static
    {
        $this->frozenBalance = $frozenBalance;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): static
    {
        $this->createdAt = $createdAt instanceof \DateTimeImmutable
            ? $createdAt
            : \DateTimeImmutable::createFromInterface($createdAt);
        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeInterface $updatedAt): static
    {
        $this->updatedAt = $updatedAt instanceof \DateTimeImmutable
            ? $updatedAt
            : \DateTimeImmutable::createFromInterface($updatedAt);

        return $this;
    }

    #[ORM\PrePersist]
    public function initOnCreate(): void
    {
        if (method_exists($this, 'getUid') && $this->getUid() === null) {
            $this->setUid(Uuid::uuid4()->toString());
        }
        $now = new \DateTimeImmutable();
        if ($this->getCreatedAt() === null) {
            $this->setCreatedAt($now);
        }
        if ($this->getUpdatedAt() === null) {
            $this->setUpdatedAt($now);
        }
    }

    #[ORM\PreUpdate]
    public function touchUpdatedAt(): void
    {
        $this->setUpdatedAt(new \DateTimeImmutable());
    }

    /**
     * @return Collection<int, WalletLedger>
     */
    public function getWalletLedgers(): Collection
    {
        return $this->walletLedgers;
    }

    public function addWalletLedger(WalletLedger $walletLedger): static
    {
        if (!$this->walletLedgers->contains($walletLedger)) {
            $this->walletLedgers->add($walletLedger);
            $walletLedger->setWallet($this);
        }

        return $this;
    }

    public function removeWalletLedger(WalletLedger $walletLedger): static
    {
        if ($this->walletLedgers->removeElement($walletLedger)) {
            if ($walletLedger->getWallet() === $this) {
                $walletLedger->setWallet(null);
            }
        }

        return $this;
    }

    public function calculateAvailableBalance(): float
    {
        $balance = 0.0;
        foreach ($this->walletLedgers as $ledger) {
            $payment = $ledger->getPayment();
            $paymentStatus = $payment?->getStatus()?->value;

            if ($payment) {
                // Legacy logic for CAPTURED/PARTIALLY_CAPTURED removed as per user request (BD-537)
                // We now rely on explicit ledger concepts like FUNDS_RELEASE or operation type for manual adjustments.
                // If specific support for legacy payments is needed, it should be re-evaluated.
            } else {
                $amount = $ledger->getAmount();
                if ($ledger->getConcept() === \App\Enum\WalletLedgerConceptEnum::FUNDS_RELEASE) {
                    $balance += $amount;
                } elseif ($ledger->getConcept() === \App\Enum\WalletLedgerConceptEnum::ADJUSTMENT) {
                    if ($ledger->getOperationType() === 'CREDIT') {
                        $balance += $amount;
                    } elseif ($ledger->getOperationType() === 'DEBIT') {
                        $balance -= $amount;
                    }
                } elseif ($ledger->getOperationType() === 'CREDIT') {
                    // Check if it's a manual credit not covered above?
                    // Existing logic was: if (CREDIT) +=; else if (DEBIT) -=;
                    // But we want to be specific about concepts if possible, or usually just trust operation type?
                    // If I trust operation type, FUNDS_RELEASE is CREDIT, so it would be added.
                    // INCOME_ON_HOLD is CREDIT, but it should be FROZEN, not available.

                    // So I must exclude INCOME_ON_HOLD from here if I rely on generic CREDIT.
                    if ($ledger->getConcept() !== \App\Enum\WalletLedgerConceptEnum::INCOME_ON_HOLD) {
                        $balance += $amount;
                    }
                } elseif ($ledger->getOperationType() === 'DEBIT') {
                    $balance -= $amount;
                }
            }
        }

        if ($this->getProfessional()) {
            foreach ($this->getProfessional()->getWithdrawals() as $withdrawal) {
                if (in_array($withdrawal->getStatus(), [
                    WithdrawalStatusEnum::PENDING,
                    WithdrawalStatusEnum::IN_PROCESS
                ], true)) {
                    $balance -= $withdrawal->getAmount();
                }
            }

            foreach ($this->getProfessional()->getProfessionalRefunds() as $refund) {
                if ($refund->getStatus() === RefundStatus::REVIEW) {
                    $balance -= $refund->getAmount();
                }
            }
        }

        return $balance;
    }

    public function calculateFrozenBalance(): float
    {
        $balance = 0.0;
        foreach ($this->walletLedgers as $ledger) {
            $paymentStatus = $ledger->getPayment()?->getStatus()?->value;

            // Legacy logic for PENDING/AUTHORIZED removed.
            // Frozen balance is now determined by INCOME_ON_HOLD concept.

            /*
            if (in_array($paymentStatus, [
                PaymentStatusEnum::PENDING->value,
                PaymentStatusEnum::AUTHORIZED->value,
            ], true)) {
                $balance += $ledger->getAmount();
            }
            */

            if ($ledger->getConcept() === \App\Enum\WalletLedgerConceptEnum::INCOME_ON_HOLD) {
                $balance += $ledger->getAmount();
            }
        }

        if ($this->getProfessional()) {
            foreach ($this->getProfessional()->getWithdrawals() as $withdrawal) {
                if (in_array($withdrawal->getStatus(), [WithdrawalStatusEnum::PENDING, WithdrawalStatusEnum::IN_PROCESS], true)) {
                    $balance += $withdrawal->getAmount();
                }
            }

            foreach ($this->getProfessional()->getProfessionalRefunds() as $refund) {
                if ($refund->getStatus() === RefundStatus::REVIEW) {
                    $balance += $refund->getAmount();
                }
            }
        }

        return $balance;
    }

    public function calculateTotalBalance(): float
    {
        $available = $this->calculateAvailableBalance();
        $frozen    = $this->calculateFrozenBalance();

        return $available + $frozen;
    }

    public function getBalanceTotal(): float
    {
        return $this->availableBalance + $this->frozenBalance;
    }

    public function getBalanceTotalFloat(): float
    {
        return $this->getBalanceTotal();
    }
}
