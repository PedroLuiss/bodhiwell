<?php

namespace App\Entity;

use App\Entity\Booking;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use App\Enum\ConsultationDetailTypeEnum;
use Ramsey\Uuid\Uuid;
use Doctrine\ORM\Mapping\HasLifecycleCallbacks;
use App\Repository\ConsultationRepository;
use App\Enum\ConsultationTypeEnum;
use App\Enum\ConsultationStatusEnum;
use App\Entity\ConsultationDetail;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ConsultationRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Consultation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 36, unique: true)]
    private ?string $uid = null;

    #[ORM\OneToOne(inversedBy: 'consultation', cascade: ['persist'])]
    #[ORM\JoinColumn(nullable: false)]
    private ?Booking $booking = null;

    #[ORM\Column(type: 'string', enumType: ConsultationTypeEnum::class, length: 20)]
    private ?ConsultationTypeEnum $type = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $notes = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: 'string', enumType: ConsultationStatusEnum::class, length: 20)]
    private ?ConsultationStatusEnum $consultationStatus = ConsultationStatusEnum::PENDING;

    /**
     * @var Collection<int, ConsultationDetail>
     */
    #[ORM\OneToMany(targetEntity: ConsultationDetail::class, mappedBy: 'consultation', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $consultationDetails;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Assert\Length(max: 5000)]
    private ?string $reserveReason = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $quoteForInvited = false;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->consultationDetails = new ArrayCollection();
    }

    /* ========= Lifecycle ========= */
    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $now = new \DateTimeImmutable();
        $this->createdAt = $now;
        $this->updatedAt = $now;

        if (!$this->uid) {
            $this->uid = Uuid::uuid4()->toString();
        }
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
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

    public function getBooking(): ?Booking
    {
        return $this->booking;
    }

    public function setBooking(Booking $booking): static
    {
        $this->booking = $booking;

        return $this;
    }

    public function getType(): ?ConsultationTypeEnum
    {
        return $this->type;
    }

    public function setType(ConsultationTypeEnum $type): static
    {
        $this->type = $type;
        return $this;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): static
    {
        $this->notes = $notes;

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

    public function getConsultationStatus(): ?ConsultationStatusEnum
    {
        return $this->consultationStatus;
    }

    public function setConsultationStatus(ConsultationStatusEnum $status): static
    {
        $this->consultationStatus = $status;
        return $this;
    }

    public function getConsultationStatusLabel(): string
    {
        return ConsultationStatusEnum::labels()[$this->consultationStatus->value] ?? ucfirst($this->consultationStatus->value);
    }

    public function getFirstDetailLabel(): ?string
    {
        $first = $this->getConsultationDetails()->first();
        if (!$first) {
            return null;
        }

        $key = $first->getDetailKey();
        $translatedKey = ConsultationDetailTypeEnum::labels()[$key] ?? ucfirst($key);

        return sprintf('%s: %s', $translatedKey, $first->getDetailValue());
    }

    /**
     * @return Collection<int, ConsultationDetail>
     */
    public function getConsultationDetails(): Collection
    {
        return $this->consultationDetails;
    }

    public function addConsultationDetail(ConsultationDetail $consultationDetail): static
    {
        if (!$this->consultationDetails->contains($consultationDetail)) {
            $this->consultationDetails->add($consultationDetail);
            $consultationDetail->setConsultation($this);
        }

        return $this;
    }

    public function removeConsultationDetail(ConsultationDetail $consultationDetail): static
    {
        if ($this->consultationDetails->removeElement($consultationDetail)) {
            if ($consultationDetail->getConsultation() === $this) {
                $consultationDetail->setConsultation(null);
            }
        }

        return $this;
    }

    public function getReserveReason(): ?string
    {
        return $this->reserveReason;
    }

    public function setReserveReason(?string $reserveReason): static
    {
        $this->reserveReason = $reserveReason;

        return $this;
    }

    public function isQuoteForInvited(): bool
    {
        return $this->quoteForInvited;
    }

    public function setQuoteForInvited(bool $quoteForInvited): self
    {
        $this->quoteForInvited = $quoteForInvited;

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
}
