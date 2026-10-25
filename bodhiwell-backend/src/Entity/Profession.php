<?php

namespace App\Entity;

use App\Entity\Dimension;
use App\Repository\ProfessionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use App\Enum\LegalFrameworkEnum;

#[ORM\Entity(repositoryClass: ProfessionRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ORM\Table(
    name: 'profession',
    indexes: [
        new ORM\Index(name: 'profession_status_idx', columns: ['status']),
    ]
)]
class Profession
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: 'El nombre es obligatorio.')]
    #[Assert\Length(max: 255)]
    private ?string $name = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: 'El estado es obligatorio.')]
    #[Assert\Length(max: 255)]
    private ?string $status = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Assert\NotNull]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Assert\NotNull]
    private ?\DateTimeImmutable $updatedAt = null;

    /**
     * @var Collection<int, User>
     */
    #[ORM\ManyToMany(targetEntity: User::class, inversedBy: 'professions')]
    private Collection $users;

    #[ORM\Column(length: 255)]
    private ?string $uid = null;

    /**
     * @var Collection<int, UserDetails>
     */
    #[ORM\OneToMany(targetEntity: UserDetails::class, mappedBy: 'baseProfession')]
    private Collection $userDetails;

    /**
     * @var Collection<int, Dimension>
     */
    #[ORM\ManyToMany(targetEntity: Dimension::class, inversedBy: 'professions')]
    #[ORM\JoinTable(name: 'profession_dimension')]
    private Collection $dimensions;

    /**
     * @var Collection<int, Specialty>
     */
    #[ORM\ManyToMany(targetEntity: Specialty::class, inversedBy: 'professions')]
    #[ORM\JoinTable(name: 'profession_suggested_specialties')]
    private Collection $suggestedSpecialties;

    #[ORM\Column(length: 50, nullable: true)]
    #[Assert\Choice(callback: [LegalFrameworkEnum::class, 'values'])]
    private ?string $legal_framework = null;

    #[ORM\Column(options: ['default' => false])]
    private bool $requires_msp = false;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
        $this->users = new ArrayCollection();
        $this->userDetails = new ArrayCollection();
        $this->dimensions = new ArrayCollection();
        $this->suggestedSpecialties = new ArrayCollection();
    }

    #[ORM\PreUpdate]
    public function updatedTimestamps(): void
    {
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
        $this->name = trim(strip_tags($name));
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = trim(strip_tags($status));
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

    public function __toString(): string
    {
        return $this->name ?? '';
    }

    /**
     * @return Collection<int, User>
     */
    public function getUsers(): Collection
    {
        return $this->users;
    }

    public function addUser(User $user): static
    {
        if (!$this->users->contains($user)) {
            $this->users->add($user);
        }

        return $this;
    }

    public function removeUser(User $user): static
    {
        $this->users->removeElement($user);

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

    /**
     * @return Collection<int, UserDetails>
     */
    public function getUserDetails(): Collection
    {
        return $this->userDetails;
    }

    public function addUserDetail(UserDetails $userDetail): static
    {
        if (!$this->userDetails->contains($userDetail)) {
            $this->userDetails->add($userDetail);
            $userDetail->setBaseProfession($this);
        }

        return $this;
    }

    public function removeUserDetail(UserDetails $userDetail): static
    {
        if ($this->userDetails->removeElement($userDetail)) {
            // set the owning side to null (unless already changed)
            if ($userDetail->getBaseProfession() === $this) {
                $userDetail->setBaseProfession(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Dimension>
     */
    public function getDimensions(): Collection
    {
        return $this->dimensions;
    }

    public function addDimension(Dimension $dimension): static
    {
        if (!$this->dimensions->contains($dimension)) {
            $this->dimensions->add($dimension);
        }

        return $this;
    }

    public function removeDimension(Dimension $dimension): static
    {
        $this->dimensions->removeElement($dimension);

        return $this;
    }

    /**
     * @return Collection<int, Specialty>
     */
    public function getSuggestedSpecialties(): Collection
    {
        return $this->suggestedSpecialties;
    }

    public function addSuggestedSpecialty(Specialty $suggestedSpecialty): static
    {
        if (!$this->suggestedSpecialties->contains($suggestedSpecialty)) {
            $this->suggestedSpecialties->add($suggestedSpecialty);
        }

        return $this;
    }

    public function removeSuggestedSpecialty(Specialty $suggestedSpecialty): static
    {
        $this->suggestedSpecialties->removeElement($suggestedSpecialty);

        return $this;
    }

    public function getLegalFramework(): ?string
    {
        return $this->legal_framework;
    }

    public function setLegalFramework(?string $legal_framework): self
    {
        $this->legal_framework = $legal_framework;
        return $this;
    }

    public function isRequiresMsp(): bool
    {
        return $this->requires_msp;
    }

    public function setRequiresMsp(bool $requires_msp): self
    {
        $this->requires_msp = $requires_msp;
        return $this;
    }
}
