<?php

namespace App\Entity;

use App\Repository\PlatformEarningsRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;

#[ORM\Entity(repositoryClass: PlatformEarningsRepository::class)]
#[ORM\Table(name: 'platform_earnings')]
#[ORM\HasLifecycleCallbacks]
class PlatformEarnings
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 36, unique: true)]
    private ?string $uid = null;

    #[ORM\OneToOne(targetEntity: Booking::class, cascade: ['persist'])]
    #[ORM\JoinColumn(name: 'booking_id', referencedColumnName: 'id', nullable: false, unique: true, onDelete: 'RESTRICT')]
    private ?Booking $booking = null;

    #[ORM\Column(type: Types::FLOAT)]
    private float $amount = 0.0;

    #[ORM\Column(type: Types::DECIMAL, precision: 5, scale: 2)]
    private string $commissionPercentage;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private ?\DateTimeImmutable $createdAt = null;

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

    public function setBooking(Booking $booking): static
    {
        $this->booking = $booking;

        return $this;
    }

    public function getAmount(): float
    {
        return $this->amount;
    }

    public function setAmount(float $amount): static
    {
        $this->amount = $amount;

        return $this;
    }

    public function getCommissionPercentage(): string
    {
        return $this->commissionPercentage;
    }

    public function setCommissionPercentage(string $commissionPercentage): static
    {
        $this->commissionPercentage = $commissionPercentage;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        if ($this->uid === null) {
            $this->uid = Uuid::uuid4()->toString();
        }
        $this->createdAt = new \DateTimeImmutable();
    }
}
