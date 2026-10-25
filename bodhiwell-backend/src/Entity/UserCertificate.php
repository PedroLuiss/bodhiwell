<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use App\Repository\UserCertificateRepository;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\Validator\Constraints as Assert;
use DateTimeImmutable;

#[ORM\Entity(repositoryClass: UserCertificateRepository::class)]
class UserCertificate
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
    #[Assert\NotBlank(message: 'El estado es obligatorio.')]
    private ?string $status = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Url(message: 'La URL proporcionada no es válida.')]
    private ?string $urlFile = null;

    #[ORM\Column]
    #[Assert\NotNull(message: 'La fecha de creación es obligatoria.')]
    private ?DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Assert\NotNull(message: 'La fecha de actualización es obligatoria.')]
    private ?DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Assert\NotNull(message: 'El usuario es obligatorio.')]
    private ?User $user = null;

    #[ORM\Column(length: 255)]
    private ?string $uid = null;

    private ?File $file = null;

    public function __construct()
    {
        $this->createdAt = new DateTimeImmutable();
        $this->updatedAt = new DateTimeImmutable();
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
        $this->name = $name;

        return $this;
    }

    public function getInstitute(): ?string
    {
        return $this->institute;
    }

    public function setInstitute(string $institute): static
    {
        $this->institute = $institute;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getUrlFile(): ?string
    {
        return $this->urlFile;
    }

    public function setUrlFile(?string $urlFile): static
    {
        $this->urlFile = $urlFile;

        return $this;
    }

    public function getCreatedAt(): ?DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getUpdatedAt(): ?DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(DateTimeImmutable $updatedAt): static
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

    public function getUid(): ?string
    {
        return $this->uid;
    }

    public function setUid(string $uid): static
    {
        $this->uid = $uid;

        return $this;
    }

    public function getFromFile(): ?File
    {
        return $this->file;
    }

    public function setFile(?File $file): static
    {
        $this->file = $file;

        return $this;
    }

    public function getFile(): ?File
    {
        if (null === $this->urlFile) {
            return null;
        }

        $uploadDir = __DIR__ . '/../../public';
        $fullPath = sprintf('%s/%s', rtrim($uploadDir, '/'), ltrim($this->urlFile, '/'));

        if (!file_exists($fullPath)) {
            return null;
        }

        return new File($fullPath);
    }
}
