<?php

namespace App\Entity;

use App\Repository\WithdrawalRepository;
use App\Enum\WithdrawalStatusEnum;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use DateTimeImmutable;
use App\Entity\User;
use App\Enum\WithdrawalMethodEnum;
use Ramsey\Uuid\Uuid;


#[ORM\Entity(repositoryClass: WithdrawalRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Withdrawal
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $uid = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private ?DateTimeImmutable $date = null;

    #[ORM\Column(type: Types::FLOAT)]
    private ?float $amount = null;

    #[ORM\Column(type: 'string', enumType: WithdrawalStatusEnum::class, length: 20)]
    private ?WithdrawalStatusEnum $status = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'withdrawals')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $professional = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    private ?User $processedBy = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $processedAt = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(type: Types::STRING, length: 20, nullable: true)]
    private ?string $dni = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $reason = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $adminNote = null;

    #[ORM\Column(type: 'string', enumType: WithdrawalMethodEnum::class, length: 50, nullable: true)]
    private ?WithdrawalMethodEnum $withdrawalMethod = null;


    public function __construct()
    {
        $this->uid = Uuid::uuid4()->toString();
        $this->createdAt = new \DateTimeImmutable();
        $this->date = new \DateTimeImmutable();
    }

    #[ORM\PrePersist]
    public function setTimestamps(): void
    {
        if ($this->createdAt === null) {
            $this->createdAt = new \DateTimeImmutable();
        }

        if ($this->updatedAt === null) {
            $this->updatedAt = new \DateTimeImmutable();
        }

        if ($this->date === null) {
            $this->date = new \DateTimeImmutable();
        }

        if (!$this->uid) {
            $this->uid = Uuid::uuid4()->toString();
        }
    }

    #[ORM\PreUpdate]
    public function updateTimestamps(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
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

    public function getDate(): ?DateTimeImmutable
    {
        return $this->date;
    }

    public function setDate(DateTimeImmutable $date): static
    {
        $this->date = $date;

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

    public function getStatus(): ?WithdrawalStatusEnum
    {
        return $this->status;
    }

    public function setStatus(WithdrawalStatusEnum $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getProfessional(): ?User
    {
        return $this->professional;
    }

    public function setProfessional(?User $professional): static
    {
        $this->professional = $professional;

        return $this;
    }

    public function getProcessedBy(): ?User
    {
        return $this->processedBy;
    }

    public function setProcessedBy(?User $processedBy): static
    {
        $this->processedBy = $processedBy;

        return $this;
    }

    public function getProcessedAt(): ?\DateTimeImmutable
    {
        return $this->processedAt;
    }

    public function setProcessedAt(?\DateTimeImmutable $processedAt): static
    {
        $this->processedAt = $processedAt;
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

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getDni(): ?string
    {
        return $this->dni;
    }

    public function setDni(?string $dni): static
    {
        $this->dni = $dni;
        return $this;
    }

    public function getReason(): ?string
    {
        return $this->reason;
    }

    public function setReason(?string $reason): static
    {
        $this->reason = $reason;
        return $this;
    }

    public function getWithdrawalMethod(): ?WithdrawalMethodEnum
    {
        return $this->withdrawalMethod;
    }

    public function setWithdrawalMethod(?WithdrawalMethodEnum $withdrawalMethod): static
    {
        $this->withdrawalMethod = $withdrawalMethod;
        return $this;
    }

    public function getAdminNote(): ?string
    {
        return $this->adminNote;
    }

    public function setAdminNote(?string $adminNote): static
    {
        $this->adminNote = $adminNote;
        return $this;
    }
}
