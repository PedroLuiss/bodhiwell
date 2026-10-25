<?php

namespace App\Entity;

use DateTimeInterface;
use Doctrine\ORM\Mapping as ORM;
use App\Repository\StudiesRepository;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: StudiesRepository::class)]
class Studies
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: 'El nombre es obligatorio.')]
    #[Assert\Length(max: 255, maxMessage: 'El nombre no debe exceder los {{ limit }} caracteres.')]
    private ?string $name = null;

    #[ORM\Column(length: 1000)]
    #[Assert\NotBlank(message: 'El instituto es obligatorio.')]
    #[Assert\Length(max: 1000, maxMessage: 'El instituto no debe exceder los {{ limit }} caracteres.')]
    private ?string $institute = null;


    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: 'El tipo de formación es obligatorio.')]
    private ?string $type = null;

    #[ORM\Column(type: 'datetime')]
    #[Assert\LessThanOrEqual(
        propertyPath: 'dateEnd',
        message: 'La fecha de inicio debe ser anterior o igual a la fecha de finalización.'
    )]
    private ?DateTimeInterface $dateStart = null;

    #[ORM\Column(type: 'datetime')]
    #[Assert\GreaterThanOrEqual(
        propertyPath: 'dateStart',
        message: 'La fecha de finalización debe ser posterior o igual a la fecha de inicio.'
    )]
    private ?DateTimeInterface $dateEnd = null;

    #[ORM\Column]
    #[Assert\NotNull(message: 'La fecha de creación es obligatoria.')]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Assert\NotNull(message: 'La fecha de actualización es obligatoria.')]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne(inversedBy: 'studies')]
    #[ORM\JoinColumn(nullable: false)]
    #[Assert\NotNull(message: 'El usuario es obligatorio.')]
    private ?User $user = null;

    #[ORM\Column(length: 255)]
    private ?string $uid = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Url(message: 'La URL proporcionada no es válida.')]
    private ?string $url_certificate = null;

    #[ORM\Column(options: ['default' => false])]
    private bool $is_validated = false;

    #[ORM\ManyToOne(targetEntity: Specialty::class)]
    #[ORM\JoinColumn(name: 'specialty_id', referencedColumnName: 'id', nullable: true)]
    private ?Specialty $specialty = null;

    private ?File $file = null;

    // #[Assert\Callback]
    // public function validateDates(ExecutionContextInterface $context): void
    // {
    //     if ($this->dateStart && $this->dateEnd && $this->dateStart > $this->dateEnd) {
    //         $context->buildViolation('La fecha de inicio debe ser anterior a la fecha de finalización.')
    //             ->atPath('dateStart')
    //             ->addViolation();
    //     }
    // }

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = trim($name);
        return $this;
    }

    public function getInstitute(): ?string
    {
        return $this->institute;
    }

    public function setInstitute(string $institute): static
    {
        $this->institute = trim($institute);
        return $this;
    }


    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = trim($type);
        return $this;
    }

    public function getDateStart(): ?\DateTime
    {
        return $this->dateStart;
    }

    public function setDateStart(\DateTime $dateStart): static
    {
        $this->dateStart = $dateStart;
        return $this;
    }

    public function getDateEnd(): ?\DateTime
    {
        return $this->dateEnd;
    }

    public function setDateEnd(\DateTime $dateEnd): static
    {
        $this->dateEnd = $dateEnd;
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

    public function setUpdatedAt(\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function __toString(): string
    {
        return (string) $this->name;
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

    public function getUrlCertificate(): ?string
    {
        return $this->url_certificate;
    }

    public function setUrlCertificate(?string $url_certificate): static
    {
        $this->url_certificate = $url_certificate;
        return $this;
    }

    public function getFile(): ?File
    {
        if (null === $this->url_certificate) {
            return null;
        }

        $uploadDir = __DIR__ . '/../../public';
        $fullPath = sprintf('%s/%s', rtrim($uploadDir, '/'), ltrim($this->url_certificate, '/'));

        if (!file_exists($fullPath)) {
            return null;
        }

        return new File($fullPath);
    }

    public function getFromFile(): ?File
    {
        return $this->file;
    }

    public function setFile(File | null $file): static
    {
        $this->file = $file;
        return $this;
    }

    public function isValidated(): bool
    {
        return $this->is_validated;
    }

    public function setIsValidated(bool $is_validated): self
    {
        $this->is_validated = $is_validated;
        return $this;
    }

    public function getSpecialty(): ?Specialty
    {
        return $this->specialty;
    }

    public function setSpecialty(?Specialty $specialty): self
    {
        $this->specialty = $specialty;
        return $this;
    }
}
