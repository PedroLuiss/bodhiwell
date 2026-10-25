<?php

namespace App\Entity;

use App\Repository\WalletLedgerRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Ramsey\Uuid\Uuid;
use App\Enum\WalletLedgerConceptEnum;

#[ORM\Entity(repositoryClass: WalletLedgerRepository::class)]
#[ORM\Table(name: 'wallet_ledgers')]
#[ORM\Index(columns: ['wallet_id'], name: 'idx_wallet_ledgers_wallet_id')]
#[ORM\Index(columns: ['payment_id'], name: 'idx_wallet_ledgers_payment_id')]
#[ORM\Index(columns: ['withdrawal_id'], name: 'idx_wallet_ledgers_withdrawal_id')]
#[ORM\HasLifecycleCallbacks]
class WalletLedger
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 36, unique: true)]
    private ?string $uid = null;

    #[ORM\ManyToOne(inversedBy: 'walletLedgers')]
    #[ORM\JoinColumn(name: 'wallet_id', referencedColumnName: 'id', nullable: false, onDelete: 'RESTRICT')]
    private ?ProfessionalWallet $wallet = null;

    #[ORM\ManyToOne(inversedBy: 'walletLedgers')]
    #[ORM\JoinColumn(name: 'payment_id', referencedColumnName: 'id', nullable: true, onDelete: 'RESTRICT')]
    private ?Payment $payment = null;

    #[ORM\ManyToOne(targetEntity: Withdrawal::class)]
    #[ORM\JoinColumn(name: 'withdrawal_id', referencedColumnName: 'id', nullable: true, onDelete: 'RESTRICT')]
    private ?Withdrawal $withdrawal = null;

    #[ORM\ManyToOne(targetEntity: Refund::class)]
    #[ORM\JoinColumn(name: 'refund_id', referencedColumnName: 'id', nullable: true, onDelete: 'RESTRICT')]
    private ?Refund $refund = null;

    #[ORM\Column(type: Types::FLOAT)]
    private ?float $amount = null;

    #[ORM\Column(name: 'operation_type', length: 50)]
    #[Assert\Choice(['CREDIT', 'DEBIT'], message: 'Tipo de operación inválido.')]
    private ?string $operationType = null;

    #[ORM\Column(name: 'concept', type: 'string', enumType: WalletLedgerConceptEnum::class, nullable: true)]
    private ?WalletLedgerConceptEnum $concept = null;

    #[ORM\Column(name: 'created_at', type: Types::DATETIME_IMMUTABLE)]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\PrePersist]
    public function initUidAndCreatedAt(): void
    {
        if ($this->uid === null) {
            $this->uid = Uuid::uuid4()->toString();
        }
        if ($this->createdAt === null) {
            $this->createdAt = new \DateTimeImmutable();
        }
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getWallet(): ?ProfessionalWallet
    {
        return $this->wallet;
    }

    public function setWallet(?ProfessionalWallet $wallet): static
    {
        $this->wallet = $wallet;

        return $this;
    }

    public function getPayment(): ?Payment
    {
        return $this->payment;
    }

    public function setPayment(?Payment $payment): static
    {
        $this->payment = $payment;

        return $this;
    }

    public function getWithdrawal(): ?Withdrawal
    {
        return $this->withdrawal;
    }

    public function setWithdrawal(?Withdrawal $withdrawal): static
    {
        $this->withdrawal = $withdrawal;

        return $this;
    }

    public function getRefund(): ?Refund
    {
        return $this->refund;
    }

    public function setRefund(?Refund $refund): static
    {
        $this->refund = $refund;

        return $this;
    }

    public function getAmount(): ?float
    {
        return $this->amount;
    }

    public function setAmount(float $amount): static
    {
        $this->amount = $amount;

        return $this;
    }

    public function getOperationType(): ?string
    {
        return $this->operationType;
    }

    public function setOperationType(string $operationType): static
    {
        $this->operationType = $operationType;

        return $this;
    }

    public function getConcept(): ?WalletLedgerConceptEnum
    {
        return $this->concept;
    }

    public function setConcept(?WalletLedgerConceptEnum $concept): static
    {
        $this->concept = $concept;

        return $this;
    }

    public function getMethodLabel(): string
    {
        if ($this->payment) {
            $method = $this->payment->getPaymentMethod();
            return $method ? strtoupper(str_replace('_', ' ', $method)) : 'N/A';
        }
        if ($this->withdrawal) {
            $method = $this->withdrawal->getWithdrawalMethod()?->value;
            return $method ? strtoupper(str_replace('_', ' ', $method)) : 'N/A';
        }
        if ($this->refund) {
            $method = $this->refund->getRefundMethod();
            return $method ? strtoupper(str_replace('_', ' ', $method)) : 'N/A';
        }
        return '—';
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
}
