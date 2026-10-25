<?php

namespace App\Entity;

use App\Enum\RefundStatus;
use App\Repository\RefundRepository;
use App\Entity\User;
use App\Entity\Booking;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: RefundRepository::class)]
class Refund
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $uid = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $patient = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'professionalRefunds')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $professional = null;

    #[ORM\ManyToOne(targetEntity: Booking::class, inversedBy: 'refunds')]
    #[ORM\JoinColumn(nullable: true)]
    private ?Booking $booking = null;

    #[ORM\Column(type: Types::FLOAT)]
    private ?float $amount = 0.0;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $reason = null;

    #[ORM\Column(enumType: RefundStatus::class)]
    private ?RefundStatus $status = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $resolvedAt = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $adminNote = null;

    #[ORM\Column(name: 'refund_method', type: 'string', length: 50, nullable: true)]
    private ?string $refundMethod = null;

    public function __construct()
    {
        $this->uid = bin2hex(random_bytes(16));
        $this->createdAt = new \DateTimeImmutable();
        $this->status = RefundStatus::REVIEW;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUid(): ?string
    {
        return $this->uid;
    }

    public function setUid(string $uid): self
    {
        $this->uid = $uid;
        return $this;
    }

    public function getPatient(): ?User
    {
        return $this->patient;
    }

    public function setPatient(?User $patient): self
    {
        $this->patient = $patient;
        return $this;
    }

    public function getProfessional(): ?User
    {
        return $this->professional;
    }

    public function setProfessional(?User $professional): self
    {
        $this->professional = $professional;
        return $this;
    }

    public function getBooking(): ?Booking
    {
        return $this->booking;
    }

    public function setBooking(?Booking $booking): self
    {
        $this->booking = $booking;
        return $this;
    }

    public function getAmount(): ?float
    {
        return $this->amount;
    }

    public function setAmount(float $amount): self
    {
        $this->amount = $amount;
        return $this;
    }

    public function getReason(): ?string
    {
        return $this->reason;
    }

    public function setReason(string $reason): self
    {
        $this->reason = $reason;
        return $this;
    }

    public function getStatus(): ?RefundStatus
    {
        return $this->status;
    }

    public function setStatus(RefundStatus $status): self
    {
        $this->status = $status;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): self
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    public function getResolvedAt(): ?\DateTimeImmutable
    {
        return $this->resolvedAt;
    }

    public function setResolvedAt(?\DateTimeImmutable $resolvedAt): self
    {
        $this->resolvedAt = $resolvedAt;
        return $this;
    }

    public function getAdminNote(): ?string
    {
        return $this->adminNote;
    }

    public function setAdminNote(?string $adminNote): self
    {
        $this->adminNote = $adminNote;
        return $this;
    }

    public function getRefundMethod(): ?string
    {
        return $this->refundMethod;
    }

    public function setRefundMethod(?string $refundMethod): self
    {
        $this->refundMethod = $refundMethod;
        return $this;
    }
}
