<?php

namespace App\Entity;

use Ramsey\Uuid\Uuid;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use App\Enum\ConsultationDetailTypeEnum;
use App\Repository\ConsultationDetailRepository;

#[ORM\Entity(repositoryClass: ConsultationDetailRepository::class)]
#[ORM\HasLifecycleCallbacks]
class ConsultationDetail
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 36, unique: true)]
    private ?string $uid = null;

    #[ORM\ManyToOne(
        targetEntity: Consultation::class,
        inversedBy: 'consultationDetails'
    )]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Consultation $consultation = null;

    #[ORM\Column(name: 'detail_key', type: 'string', length: 50)]
    private ?string $detailKey = null;

    #[ORM\Column(name: 'detail_value', type: Types::TEXT, nullable: true)]
    private ?string $detailValue = null;

    /* ========= Lifecycle ========= */
    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        if (!$this->uid) {
            $this->uid = Uuid::uuid4()->toString();
        }
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getConsultation(): ?Consultation
    {
        return $this->consultation;
    }

    public function setConsultation(?Consultation $consultation): static
    {
        $this->consultation = $consultation;

        return $this;
    }

    public function getDetailKey(): ?string
    {
        return $this->detailKey;
    }

    public function setDetailKey(string $detailKey): static
    {
        $this->detailKey = $detailKey;

        return $this;
    }

    public function getDetailValue(): ?string
    {
        return $this->detailValue;
    }

    public function setDetailValue(?string $detailValue): static
    {
        $this->detailValue = $detailValue;
        return $this;
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

    public function __toString(): string
    {
        if ($this->detailKey === null) {
            return '';
        }
        $labels = ConsultationDetailTypeEnum::labels();
        return $labels[$this->detailKey] ?? $this->detailKey;
    }
}
