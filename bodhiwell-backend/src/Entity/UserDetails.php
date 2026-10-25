<?php

namespace App\Entity;

use Symfony\Component\String\UnicodeString;
use Symfony\Component\Validator\Constraints as Assert;
use App\Enum\LatamCountryEnum;
use App\Enum\ConsultTypeEnum;
use App\Repository\UserDetailsRepository;
use App\Entity\Profession;
use App\Entity\Dimension;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UserDetailsRepository::class)]
#[ORM\HasLifecycleCallbacks]
class UserDetails
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(inversedBy: 'userDetails', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Length(
        max: 255,
        maxMessage: 'La ruta de la imagen no puede superar los {{ limit }} caracteres.'
    )]
    #[Assert\Regex(
        pattern: '/\.(jpe?g|png|webp)$/i',
        message: 'Solo se permiten imágenes con extensiones .jpg, .jpeg, .png o .webp'
    )]
    private ?string $image = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    #[Assert\Date(message: 'La fecha de nacimiento no es válida.')]
    private ?\DateTimeInterface $dateBirth = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Length(max: 255, maxMessage: 'El campo género no puede tener más de {{ limit }} caracteres.')]
    private ?string $gender = null;

    #[ORM\Column(length: 2, nullable: true)]
    #[Assert\Choice(
        callback: [LatamCountryEnum::class, 'codes'],
        message: 'País no válido.'
    )]
    private ?string $country = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Length(max: 255, maxMessage: 'El campo ciudad no puede tener más de {{ limit }} caracteres.')]
    private ?string $city = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Length(max: 255, maxMessage: 'El código postal no puede tener más de {{ limit }} caracteres.')]
    private ?string $zipcode = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Length(max: 255, maxMessage: 'La dirección no puede tener más de {{ limit }} caracteres.')]
    private ?string $address = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Length(max: 255, maxMessage: 'El campo idioma no puede tener más de {{ limit }} caracteres.')]
    private ?string $language = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Assert\Length(max: 65535, maxMessage: 'El campo "sobre mí" no puede tener más de {{ limit }} caracteres.')]
    private ?string $about = null;

    #[ORM\Column(length: 20, nullable: true)]
    #[Assert\Length(
        max: 20,
        maxMessage: 'El número de teléfono no puede tener más de {{ limit }} caracteres.'
    )]
    #[Assert\Regex(
        pattern: "/^\+?[0-9\s\-]{7,20}$/",
        message: "Número de teléfono no válido."
    )]
    private ?string $phone = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Assert\Type('array', message: 'La disponibilidad de tiempo debe ser un arreglo.')]
    private array $TimeAvailability = [];

    #[ORM\Column(type: Types::BOOLEAN, options: ['default' => true])]
    #[Assert\NotNull(message: 'Debe aceptar las políticas.')]
    private bool $policies = true;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Assert\Length(max: 65535, maxMessage: 'La condición médica no puede superar los {{ limit }} caracteres.')]
    private ?string $medicalCondition = null;

    #[ORM\Column(nullable: true)]
    private ?int $consultTime = 60;

    #[ORM\ManyToOne(targetEntity: Profession::class, inversedBy: 'userDetails')]
    #[ORM\JoinColumn(name: 'base_profession_id', referencedColumnName: 'id', nullable: true, onDelete: 'SET NULL')]
    private ?Profession $baseProfession = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $shortDescription = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Length(max: 255, maxMessage: 'La ruta de la imagen (banner) no puede superar los {{ limit }} caracteres.')]
    #[Assert\Regex(pattern: '/\.(jpe?g|png|webp)$/i', message: 'Solo se permiten imágenes .jpg, .jpeg, .png o .webp')]
    private ?string $bannerImage = null;

    #[ORM\Column(length: 20, nullable: true)]
    #[Assert\Length(max: 20, maxMessage: 'El prefijo no puede tener más de {{ limit }} caracteres.')]
    private ?string $prefixProfessional = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Assert\Length(max: 65535, maxMessage: 'La información profesional no puede tener más de {{ limit }} caracteres.')]
    private ?string $professionalInfo = null;

    #[ORM\Column(length: 20, nullable: true)]
    #[Assert\Choice(callback: [ConsultTypeEnum::class, 'values'], message: 'Tipo de consulta no válido.')]
    private ?string $consultType = null;

    #[ORM\Column(nullable: true)]
    private ?float $consultPrice = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Length(max: 255, maxMessage: 'El número de cuenta no puede tener más de {{ limit }} caracteres.')]
    private ?string $accountNumber = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Length(max: 255, maxMessage: 'El nombre del titular no puede tener más de {{ limit }} caracteres.')]
    private ?string $holderName = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Length(max: 255, maxMessage: 'El nombre del banco no puede tener más de {{ limit }} caracteres.')]
    private ?string $bankName = null;

    #[ORM\Column(length: 20, nullable: true, options: ['default' => 'image'])]
    #[Assert\Choice(choices: ['image', 'video'], message: 'Tipo de medio no válido.')]
    private ?string $profileMediaType = 'image';

    #[ORM\Column(length: 500, nullable: true)]
    #[Assert\Length(max: 500, maxMessage: 'La URL del video no puede superar los {{ limit }} caracteres.')]
    #[Assert\Url(message: 'La URL del video no es válida.')]
    private ?string $profileVideoUrl = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $rejectionReason = null;

    #[ORM\ManyToOne(targetEntity: Dimension::class)]
    #[ORM\JoinColumn(name: 'dimension_id', referencedColumnName: 'id', nullable: true)]
    private ?Dimension $dimension = null;

    #[ORM\ManyToOne(targetEntity: Specialty::class)]
    #[ORM\JoinColumn(name: 'main_specialty_id', referencedColumnName: 'id', nullable: true, onDelete: 'SET NULL')]
    private ?Specialty $mainSpecialty = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(User $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getImage(): ?string
    {
        return $this->image;
    }

    public function setImage(?string $image): static
    {
        $this->image = $image ? (new UnicodeString(strip_tags($image)))->trim()->toString() : null;
        return $this;
    }

    public function getDateBirth(): ?\DateTimeInterface
    {
        return $this->dateBirth;
    }

    public function setDateBirth(?\DateTimeInterface $dateBirth): static
    {
        $this->dateBirth = $dateBirth;
        return $this;
    }

    public function getGender(): ?string
    {
        return $this->gender;
    }

    public function setGender(?string $gender): static
    {
        $this->gender = $gender ? strip_tags($gender) : null;
        return $this;
    }

    public function getCountry(): ?string
    {
        return $this->country;
    }

    public function setCountry(?string $country): self
    {
        $this->country = $country;
        return $this;
    }

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function setCity(?string $city): static
    {
        $this->city = $city ? strip_tags($city) : null;
        return $this;
    }

    public function getZipcode(): ?string
    {
        return $this->zipcode;
    }

    public function setZipcode(?string $zipcode): static
    {
        $this->zipcode = $zipcode ? strip_tags($zipcode) : null;
        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(?string $address): static
    {
        $this->address = $address ? strip_tags($address) : null;
        return $this;
    }

    public function getLanguage(): ?string
    {
        return $this->language;
    }

    public function setLanguage(?string $language): static
    {
        $this->language = $language ? strip_tags($language) : null;
        return $this;
    }

    public function getAbout(): ?string
    {
        return $this->about;
    }

    public function setAbout(?string $about): static
    {
        $this->about = $about ? $about : null;
        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(?string $phone): static
    {
        $this->phone = $phone ? (new UnicodeString(strip_tags($phone)))->trim()->toString() : null;
        return $this;
    }

    public function getTimeAvailability(): array
    {
        return $this->TimeAvailability;
    }

    public function setTimeAvailability(array $TimeAvailability): static
    {
        $this->TimeAvailability = $TimeAvailability;
        return $this;
    }

    public function isPolicies(): ?bool
    {
        return $this->policies;
    }

    public function setPolicies(bool $policies): static
    {
        $this->policies = $policies;
        return $this;
    }

    public function getMedicalCondition(): ?string
    {
        return $this->medicalCondition;
    }

    public function setMedicalCondition(?string $medicalCondition): static
    {
        $this->medicalCondition = $medicalCondition ?: null;
        return $this;
    }

    public function getProfileImageUrl(): ?string
    {
        if (!$this->image) {
            return null;
        }
        $path = (string) $this->image;
        return str_starts_with($path, '/') ? $path : '/' . $path;
    }

    public function getConsultTime(): ?int
    {
        return $this->consultTime;
    }

    public function setConsultTime(?int $consultTime): static
    {
        $this->consultTime = $consultTime;

        return $this;
    }

    public function getRejectionReason(): ?string
    {
        return $this->rejectionReason;
    }

    public function setRejectionReason(?string $rejectionReason): static
    {
        $this->rejectionReason = $rejectionReason;
        return $this;
    }

    /* ---------- Lifecycle ---------- */
    #[ORM\PrePersist]
    public function initDefaults(): void
    {
        if ($this->policies === null) {
            $this->policies = true;
        }
    }

    public function getBaseProfession(): ?Profession
    {
        return $this->baseProfession;
    }

    public function setBaseProfession(?Profession $baseProfession): static
    {
        $this->baseProfession = $baseProfession;

        return $this;
    }

    public function getShortDescription(): ?string
    {
        return $this->shortDescription;
    }

    public function setShortDescription(?string $shortDescription): static
    {
        $this->shortDescription = $shortDescription;

        return $this;
    }

    public function getBannerImage(): ?string
    {
        return $this->bannerImage;
    }

    public function setBannerImage(?string $bannerImage): static
    {
        $this->bannerImage = $bannerImage ? (new UnicodeString(strip_tags($bannerImage)))->trim()->toString() : null;
        return $this;
    }


    public function getPrefixProfessional(): ?string
    {
        return $this->prefixProfessional;
    }

    public function setPrefixProfessional(?string $prefixProfessional): static
    {
        $this->prefixProfessional = $prefixProfessional ? (new UnicodeString(strip_tags($prefixProfessional)))->trim()->toString() : null;
        return $this;
    }

    public function getProfessionalInfo(): ?string
    {
        return $this->professionalInfo;
    }

    public function setProfessionalInfo(?string $professionalInfo): static
    {
        $this->professionalInfo = $professionalInfo ?: null;
        return $this;
    }

    public function getConsultType(): ?string
    {
        return $this->consultType;
    }

    public function setConsultType(?string $consultType): static
    {
        $this->consultType = $consultType;

        return $this;
    }

    public function getConsultPrice(): ?float
    {
        return $this->consultPrice;
    }

    public function setConsultPrice(?float $consultPrice): static
    {
        $this->consultPrice = $consultPrice;
        return $this;
    }

    public function getAccountNumber(): ?string
    {
        return $this->accountNumber;
    }

    public function setAccountNumber(?string $accountNumber): static
    {
        $this->accountNumber = $accountNumber ? strip_tags($accountNumber) : null;

        return $this;
    }

    public function getHolderName(): ?string
    {
        return $this->holderName;
    }

    public function setHolderName(?string $holderName): static
    {
        $this->holderName = $holderName ? strip_tags($holderName) : null;

        return $this;
    }

    public function getBankName(): ?string
    {
        return $this->bankName;
    }

    public function setBankName(?string $bankName): static
    {
        $this->bankName = $bankName ? strip_tags($bankName) : null;

        return $this;
    }

    public function getProfileMediaType(): ?string
    {
        return $this->profileMediaType;
    }

    public function setProfileMediaType(?string $profileMediaType): static
    {
        // Default to 'image' if null or empty
        $this->profileMediaType = $profileMediaType ?: 'image';
        return $this;
    }

    public function getProfileVideoUrl(): ?string
    {
        return $this->profileVideoUrl;
    }

    public function setProfileVideoUrl(?string $profileVideoUrl): static
    {
        $this->profileVideoUrl = $profileVideoUrl ? trim($profileVideoUrl) : null;
        return $this;
    }

    public function getDimension(): ?Dimension
    {
        return $this->dimension;
    }

    public function setDimension(?Dimension $dimension): self
    {
        $this->dimension = $dimension;
        return $this;
    }

    public function getMainSpecialty(): ?Specialty
    {
        return $this->mainSpecialty;
    }

    public function setMainSpecialty(?Specialty $mainSpecialty): static
    {
        $this->mainSpecialty = $mainSpecialty;
        return $this;
    }
}
