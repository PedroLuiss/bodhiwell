<?php

namespace App\Entity;

use App\Repository\PaymentRepository;
use App\Enum\PaymentStatusEnum;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PaymentRepository::class)]
#[ORM\Table(name: "payments")]
#[ORM\UniqueConstraint(name: "uq_payments_plexo_payment_id", columns: ["plexo_payment_id"])]
#[ORM\Index(columns: ["booking_id"], name: "idx_payments_booking_id")]
#[ORM\Index(columns: ["status"], name: "idx_payments_status")]
#[ORM\Index(columns: ["plexo_transaction_id"], name: "idx_payments_plexo_tx_id")]
class Payment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 36, unique: true)]
    private ?string $uid = null;

    #[ORM\ManyToOne(targetEntity: Booking::class, inversedBy: 'payments')]
    #[ORM\JoinColumn(name: 'booking_id', referencedColumnName: 'id', nullable: false, onDelete: 'RESTRICT')]
    private ?Booking $booking = null;

    #[ORM\Column(type: 'float')]
    private ?float $amount = null;

    #[ORM\Column(type: 'string', length: 3)]
    private ?string $currency = null;

    #[ORM\Column(type: 'string', enumType: PaymentStatusEnum::class, length: 32)]
    private ?PaymentStatusEnum $status = PaymentStatusEnum::INITIATED;

    #[ORM\Column(name: 'plexo_payment_id', type: 'string', length: 255, nullable: true)]
    private ?string $plexoPaymentId = null;

    #[ORM\Column(name: 'plexo_transaction_id', type: 'string', length: 255, nullable: true)]
    private ?string $plexoTransactionId = null;

    #[ORM\Column(name: 'payment_method', type: 'string', length: 50, nullable: true)]
    private ?string $paymentMethod = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    /**
     * @var Collection<int, Transaction>
     */
    #[ORM\OneToMany(targetEntity: Transaction::class, mappedBy: 'payment')]
    private Collection $transactions;

    /**
     * @var Collection<int, WalletLedger>
     */
    #[ORM\OneToMany(targetEntity: WalletLedger::class, mappedBy: 'payment')]
    private Collection $walletLedgers;

    public function __construct()
    {
        $this->transactions = new ArrayCollection();
        $this->walletLedgers = new ArrayCollection();
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

    public function getBooking(): ?Booking
    {
        return $this->booking;
    }

    public function setBooking(?Booking $booking): static
    {
        $this->booking = $booking;

        return $this;
    }

    public function getAmount(): ?int
    {
        return $this->amount;
    }

    public function setAmount(int $amount): static
    {
        $this->amount = $amount;

        return $this;
    }

    public function getCurrency(): ?string
    {
        return $this->currency;
    }

    public function setCurrency(string $currency): static
    {
        $this->currency = $currency;

        return $this;
    }

    public function getStatus(): ?PaymentStatusEnum
    {
        return $this->status;
    }

    public function setStatus(PaymentStatusEnum $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getStatusLabel(): ?string
    {
        return $this->status?->value;
    }

    public function getPlexoPaymentId(): ?string
    {
        return $this->plexoPaymentId;
    }

    public function setPlexoPaymentId(?string $plexoPaymentId): static
    {
        $this->plexoPaymentId = $plexoPaymentId;

        return $this;
    }

    public function getPlexoTransactionId(): ?string
    {
        return $this->plexoTransactionId;
    }

    public function setPlexoTransactionId(?string $plexoTransactionId): static
    {
        $this->plexoTransactionId = $plexoTransactionId;

        return $this;
    }

    public function getPaymentMethod(): ?string
    {
        return $this->paymentMethod;
    }

    public function setPaymentMethod(?string $paymentMethod): static
    {
        $this->paymentMethod = $paymentMethod;

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

    public function setUpdatedAt(?\DateTimeInterface $updatedAt): static
    {
        $this->updatedAt = $updatedAt instanceof \DateTimeImmutable || $updatedAt === null
            ? $updatedAt
            : \DateTimeImmutable::createFromInterface($updatedAt);

        return $this;
    }

    /**
     * @return Collection<int, Transaction>
     */
    public function getTransactions(): Collection
    {
        return $this->transactions;
    }

    public function addTransaction(Transaction $transaction): static
    {
        if (!$this->transactions->contains($transaction)) {
            $this->transactions->add($transaction);
            $transaction->setPayment($this);
        }

        return $this;
    }

    public function removeTransaction(Transaction $transaction): static
    {
        if ($this->transactions->removeElement($transaction)) {
            if ($transaction->getPayment() === $this) {
                $transaction->setPayment(null);
            }
        }

        return $this;
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
            $walletLedger->setPayment($this);
        }

        return $this;
    }

    public function removeWalletLedger(WalletLedger $walletLedger): static
    {
        if ($this->walletLedgers->removeElement($walletLedger)) {
            if ($walletLedger->getPayment() === $this) {
                $walletLedger->setPayment(null);
            }
        }

        return $this;
    }

    public function __toString(): string
    {
        return $this->uid ?? (string) $this->id;
    }
}
