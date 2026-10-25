<?php

namespace App\Entity;

use App\Repository\DimensionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\DBAL\Types\Types;
use Symfony\Component\Validator\Constraints as Assert;
use Ramsey\Uuid\Uuid;

#[ORM\Entity(repositoryClass: DimensionRepository::class)]
#[ORM\Table(name: 'dimension')]
#[ORM\HasLifecycleCallbacks]
class Dimension
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255, unique: true)]
    private ?string $uid = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    private ?string $name = null;

    #[ORM\Column(length: 255, unique: true)]
    private ?string $slug = null;

    #[ORM\Column(length: 7, nullable: true)]
    private ?string $colorCode = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $icon = null;

    #[ORM\OneToMany(mappedBy: 'dimension', targetEntity: Specialty::class)]
    private Collection $specialties;

    #[ORM\ManyToMany(targetEntity: Profession::class, mappedBy: 'dimensions')]
    private Collection $professions;

    public function __construct()
    {
        $this->uid = Uuid::uuid4()->toString();
        $this->specialties = new ArrayCollection();
        $this->professions = new ArrayCollection();
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

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): static
    {
        $this->slug = $slug;

        return $this;
    }

    public function getColorCode(): ?string
    {
        return $this->colorCode;
    }

    public function setColorCode(?string $colorCode): static
    {
        $this->colorCode = $colorCode;

        return $this;
    }

    public function getIcon(): ?string
    {
        return $this->icon;
    }

    public function setIcon(?string $icon): static
    {
        $this->icon = $icon;

        return $this;
    }

    /**
     * @return Collection<int, Specialty>
     */
    public function getSpecialties(): Collection
    {
        return $this->specialties;
    }

    public function addSpecialty(Specialty $specialty): static
    {
        if (!$this->specialties->contains($specialty)) {
            $this->specialties->add($specialty);
            $specialty->setDimension($this);
        }

        return $this;
    }

    public function removeSpecialty(Specialty $specialty): static
    {
        if ($this->specialties->removeElement($specialty)) {
            if ($specialty->getDimension() === $this) {
                $specialty->setDimension(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Profession>
     */
    public function getProfessions(): Collection
    {
        return $this->professions;
    }

    public function addProfession(Profession $profession): static
    {
        if (!$this->professions->contains($profession)) {
            $this->professions->add($profession);
            $profession->addDimension($this);
        }

        return $this;
    }

    public function removeProfession(Profession $profession): static
    {
        if ($this->professions->removeElement($profession)) {
            $profession->removeDimension($this);
        }

        return $this;
    }

    public function __toString(): string
    {
        return $this->name ?? '';
    }
}
