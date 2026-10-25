<?php

namespace App\Entity;

use App\Enum\ClinicalLevelEnum;
use App\Enum\LegalFrameworkEnum;
use App\Repository\SpecialtyRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Ramsey\Uuid\Uuid;
use App\Entity\Dimension;
use App\Entity\Profession;
use App\Entity\User;
use Doctrine\DBAL\Types\Types;

#[ORM\Entity(repositoryClass: SpecialtyRepository::class)]
#[ORM\Table(name: 'specialty')]
#[ORM\HasLifecycleCallbacks]
class Specialty
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

    #[ORM\ManyToOne(inversedBy: 'specialties')]
    #[ORM\JoinColumn(name: 'dimension_id', referencedColumnName: 'id', nullable: true)]
    private ?Dimension $dimension = null;

    #[ORM\Column(length: 50, nullable: true, enumType: LegalFrameworkEnum::class)]
    private ?LegalFrameworkEnum $legal_framework = null;

    #[ORM\Column(length: 50, nullable: true, enumType: ClinicalLevelEnum::class)]
    private ?ClinicalLevelEnum $clinical_level = null;

    #[ORM\ManyToOne(targetEntity: Profession::class)]
    #[ORM\JoinColumn(name: 'required_base_study_id', referencedColumnName: 'id', nullable: true)]
    private ?Profession $required_base_study = null;

    #[ORM\Column(type: Types::BOOLEAN, options: ['default' => false])]
    private bool $msp_required = false;

    #[ORM\Column(type: Types::BOOLEAN, options: ['default' => true])]
    private bool $is_base_profession = true;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $public_title_male = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $public_title_female = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $public_title_neutral = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\ManyToMany(targetEntity: Profession::class, mappedBy: 'suggestedSpecialties')]
    private Collection $professions;

    #[ORM\ManyToMany(targetEntity: User::class, mappedBy: 'specialties')]
    private Collection $users;

    public function __construct()
    {
        $this->uid = Uuid::uuid4()->toString();
        $this->professions = new ArrayCollection();
        $this->users = new ArrayCollection();
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

    public function getDimension(): ?Dimension
    {
        return $this->dimension;
    }
    public function setDimension(?Dimension $dimension): static
    {
        $this->dimension = $dimension;
        return $this;
    }

    public function getLegalFramework(): ?LegalFrameworkEnum
    {
        return $this->legal_framework;
    }
    public function setLegalFramework(?LegalFrameworkEnum $legal_framework): static
    {
        $this->legal_framework = $legal_framework;
        return $this;
    }

    public function getClinicalLevel(): ?ClinicalLevelEnum
    {
        return $this->clinical_level;
    }
    public function setClinicalLevel(?ClinicalLevelEnum $clinical_level): static
    {
        $this->clinical_level = $clinical_level;
        return $this;
    }

    public function getRequiredBaseStudy(): ?Profession
    {
        return $this->required_base_study;
    }
    public function setRequiredBaseStudy(?Profession $required_base_study): static
    {
        $this->required_base_study = $required_base_study;
        return $this;
    }

    public function isMspRequired(): bool
    {
        return $this->msp_required;
    }
    public function setMspRequired(bool $msp_required): static
    {
        $this->msp_required = $msp_required;
        return $this;
    }

    public function isBaseProfession(): bool
    {
        return $this->is_base_profession;
    }
    public function setIsBaseProfession(bool $is_base_profession): static
    {
        $this->is_base_profession = $is_base_profession;
        return $this;
    }

    public function getPublicTitleMale(): ?string
    {
        return $this->public_title_male;
    }
    public function setPublicTitleMale(?string $val): static
    {
        $this->public_title_male = $val;
        return $this;
    }

    public function getPublicTitleFemale(): ?string
    {
        return $this->public_title_female;
    }
    public function setPublicTitleFemale(?string $val): static
    {
        $this->public_title_female = $val;
        return $this;
    }

    public function getPublicTitleNeutral(): ?string
    {
        return $this->public_title_neutral;
    }
    public function setPublicTitleNeutral(?string $val): static
    {
        $this->public_title_neutral = $val;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }
    public function setDescription(?string $description): static
    {
        $this->description = $description;
        return $this;
    }

    /** @return Collection<int, Profession> */
    public function getProfessions(): Collection
    {
        return $this->professions;
    }

    public function addProfession(Profession $profession): static
    {
        if (!$this->professions->contains($profession)) {
            $this->professions->add($profession);
            $profession->addSuggestedSpecialty($this);
        }
        return $this;
    }

    public function removeProfession(Profession $profession): static
    {
        if ($this->professions->removeElement($profession)) {
            $profession->removeSuggestedSpecialty($this);
        }
        return $this;
    }

    /** @return Collection<int, User> */
    public function getUsers(): Collection
    {
        return $this->users;
    }

    public function addUser(User $user): static
    {
        if (!$this->users->contains($user)) {
            $this->users->add($user);
            $user->addSpecialty($this);
        }
        return $this;
    }

    public function removeUser(User $user): static
    {
        if ($this->users->removeElement($user)) {
            $user->removeSpecialty($this);
        }
        return $this;
    }

    public function __toString(): string
    {
        return $this->name ?? '';
    }
}
