<?php

namespace App\Entity;

use Ramsey\Uuid\Uuid;
use App\Entity\Profession;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\DBAL\Types\Types;
use Symfony\Component\Validator\Constraints as Assert;
use App\Repository\UserRepository;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Security\Core\User\UserInterface;
use App\Enum\UserStatusEnum;
use App\Enum\StudyType;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use App\Enum\MspVerificationStatusEnum;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
#[ORM\HasLifecycleCallbacks]
#[UniqueEntity(fields: ['email'], message: 'Este correo ya está registrado')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: 'string', unique: true)]
    #[Assert\NotBlank(message: 'El UID es obligatorio.')]
    private ?string $uid = null;

    #[ORM\Column(length: 255, unique: true, nullable: false)]
    #[Assert\NotBlank(message: 'El correo electrónico es obligatorio.')]
    #[Assert\Email(message: 'El formato del correo electrónico no es válido.')]
    private ?string $email = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $password = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $fcmToken = null;

    #[Assert\NotBlank(message: 'La contraseña es obligatoria.', groups: ['create'])]
    #[Assert\Length(
        min: 8,
        minMessage: 'La contraseña debe tener al menos {{ limit }} caracteres.',
        groups: ['create']
    )]
    #[Assert\Regex(
        pattern: "/[A-Z]/",
        message: "La contraseña debe contener al menos una letra mayúscula.",
        groups: ['create']
    )]
    #[Assert\Regex(
        pattern: "/[a-z]/",
        message: "La contraseña debe contener al menos una letra minúscula.",
        groups: ['create']
    )]
    #[Assert\Regex(
        pattern: "/\d/",
        message: "La contraseña debe contener al menos un número.",
        groups: ['create']
    )]
    #[Assert\Regex(
        pattern: "/[\W]/",
        message: "La contraseña debe contener al menos un carácter especial.",
        groups: ['create']
    )]
    private ?string $plainPassword = null;

    #[ORM\Column(nullable: true)]
    #[Assert\Type(type: 'array', message: 'El campo roles debe ser un array.')]
    #[Assert\All([
        new Assert\Choice([
            'choices' => ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_OWNER'],
            'message' => 'El rol {{ value }} no es válido.'
        ])
    ])]
    private array $roles = ['ROLE_USER'];

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Length(max: 255, maxMessage: 'El nombre de usuario no puede tener más de {{ limit }} caracteres.')]
    private ?string $username = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Length(max: 255, maxMessage: 'El nombre no puede tener más de {{ limit }} caracteres.')]
    private ?string $first_name = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Length(max: 255, maxMessage: 'El apellido no puede tener más de {{ limit }} caracteres.')]
    private ?string $last_name = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Assert\Length(max: 50, maxMessage: 'El DNI no puede tener más de {{ limit }} caracteres.')]
    private ?string $dni = null;

    #[ORM\Column(length: 30, nullable: true)]
    #[Assert\Length(max: 30, maxMessage: 'El número de teléfono no puede tener más de {{ limit }} caracteres.')]
    private ?string $phone_number = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $newsletterActive = false;

    #[ORM\Column(type: "datetime_immutable", options: ["default" => "CURRENT_TIMESTAMP"], nullable: true)]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: "datetime_immutable", options: ["default" => "CURRENT_TIMESTAMP", "onUpdate" => "CURRENT_TIMESTAMP"], nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(type: "boolean", options: ["default" => true], nullable: true)]
    #[Assert\Type(type: 'bool', message: 'El valor debe ser verdadero o falso.')]
    private ?bool $is_active = true;

    #[ORM\Column(length: 50, nullable: false)]
    #[Assert\Choice(callback: [UserStatusEnum::class, 'values'])]
    private string $status = UserStatusEnum::PENDING_COMPLETION->value;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Length(max: 255, maxMessage: 'El tipo de cuenta no puede tener más de {{ limit }} caracteres.')]
    private ?string $type_account = null;

    #[ORM\Column(type: "text", nullable: true)]
    #[Assert\Type(type: 'string', message: 'El contenido debe ser texto válido.')]
    private ?string $response_firebase = null;

    #[ORM\OneToOne(mappedBy: 'user', cascade: ['persist', 'remove'])]
    private ?UserDetails $userDetails = null;

    #[ORM\OneToOne(mappedBy: 'professional', targetEntity: ProfessionalWallet::class, cascade: ['persist', 'remove'])]
    private ?ProfessionalWallet $professionalWallet = null;

    /**
     * @var Collection<int, Studies>
     */
    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Studies::class, orphanRemoval: true, cascade: ['persist'])]
    #[Assert\Valid]
    private Collection $studies;

    /**
     * @var Collection<int, Profession>
     */
    #[ORM\ManyToMany(targetEntity: Profession::class, mappedBy: 'users', cascade: ['persist'])]
    private Collection $professions;

    #[ORM\Column(type: "string", length: 64, nullable: true)]
    private ?string $verificationToken = null;

    #[ORM\Column(nullable: true)]
    private ?string $resetPasswordToken = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $resetTokenExpiresAt = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $permissions = null;

    /** 
     * @var Collection<int, Booking> 
     * */
    #[ORM\OneToMany(mappedBy: 'professionalUser', targetEntity: Booking::class, orphanRemoval: true, cascade: ['persist', 'remove'])]
    private Collection $professionalBookings;

    /**
     *  @var Collection<int, Booking> 
     * */
    #[ORM\OneToMany(mappedBy: 'patientUser', targetEntity: Booking::class, orphanRemoval: true, cascade: ['persist', 'remove'])]
    private Collection $patientBookings;

    /**
     * @var Collection<int, Availability>
     */

    #[ORM\OneToMany(targetEntity: Availability::class, mappedBy: 'professionalUser', orphanRemoval: true, cascade: ['persist', 'remove'])]
    private Collection $professionalAvailabilities;

    /**
     * @var Collection<int, Withdrawal>
     */
    #[ORM\OneToMany(mappedBy: 'professional', targetEntity: Withdrawal::class)]
    private Collection $withdrawals;

    /**
     * @var Collection<int, Specialty>
     */
    #[ORM\ManyToMany(targetEntity: Specialty::class, inversedBy: 'users')]
    #[ORM\JoinTable(name: 'professional_specialties')]
    private Collection $specialties;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private int $completedConsultations = 0;

    /**
     * @var Collection<int, Refund>
     */
    #[ORM\OneToMany(mappedBy: 'professional', targetEntity: Refund::class)]
    private Collection $professionalRefunds;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $msp_number = null;

    #[ORM\Column(length: 50)]
    #[Assert\Choice(callback: [MspVerificationStatusEnum::class, 'values'])]
    private string $msp_verification_status = MspVerificationStatusEnum::NOT_APPLICABLE->value;

    public function __construct()
    {
        $this->uid = Uuid::uuid4()->toString();
        $this->studies = new ArrayCollection();
        $this->professions = new ArrayCollection();
        $this->professionalBookings = new ArrayCollection();
        $this->patientBookings = new ArrayCollection();
        $this->professionalAvailabilities = new ArrayCollection();
        $this->withdrawals = new ArrayCollection();
        $this->specialties = new ArrayCollection();
        $this->professionalRefunds = new ArrayCollection();
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

    public function setId(int $id): self
    {
        $this->id = $id;
        return $this;
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

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;
        return $this;
    }

    public function getPlainPassword(): ?string
    {
        return $this->plainPassword;
    }

    public function setPlainPassword(?string $plainPassword): self
    {
        $this->plainPassword = $plainPassword;
        return $this;
    }

    public function getRoles(): array
    {
        $roles = $this->roles;
        if (empty($roles)) {
            $roles[] = 'ROLE_USER';
        }
        return array_unique($roles);
    }

    public function setRoles(array $roles): static
    {
        $this->roles = $roles;
        return $this;
    }

    public function getUserIdentifier(): string
    {
        return $this->email;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): static
    {
        $this->username = $username;
        return $this;
    }

    public function getTypeAccount(): ?string
    {
        return $this->type_account;
    }

    public function setTypeAccount(?string $type_account): static
    {
        $this->type_account = $type_account;
        return $this;
    }

    public function getFirstName(): ?string
    {
        return $this->first_name;
    }

    public function setFirstName(string $first_name): static
    {
        $this->first_name = $first_name;
        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->last_name;
    }

    public function setLastName(string $last_name): static
    {
        $this->last_name = $last_name;
        return $this;
    }

    public function getFullName(): string
    {
        return trim(($this->first_name ?? '') . ' ' . ($this->last_name ?? ''));
    }

    public function getDni(): ?string
    {
        return $this->dni;
    }

    public function setDni(?string $dni): self
    {
        $this->dni = $dni;
        return $this;
    }

    public function getPhoneNumber(): ?string
    {
        return $this->phone_number;
    }

    public function setPhoneNumber(?string $phone_number): self
    {
        $this->phone_number = $phone_number;
        return $this;
    }

    public function isActive(): ?bool
    {
        return $this->status === 'active';
    }

    public function setIsActive(bool $is_active): static
    {
        $this->is_active = $is_active;
        $this->status = $is_active ? 'active' : ($this->status === 'active' ? 'inactive' : $this->status);
        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        $this->status = $status;
        $this->is_active = ($status === 'active');
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(?\DateTimeImmutable $createdAt = null): static
    {
        $this->createdAt = $createdAt ?? new \DateTimeImmutable();
        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt = null): static
    {
        $this->updatedAt = $updatedAt ?? new \DateTimeImmutable();
        return $this;
    }

    public function getVerificationToken(): ?string
    {
        return $this->verificationToken;
    }

    public function setVerificationToken(?string $token): self
    {
        $this->verificationToken = $token;
        return $this;
    }

    public function getPermissions(): ?array
    {
        return $this->permissions;
    }

    public function setPermissions(?array $permissions): static
    {
        $this->permissions = $permissions;
        return $this;
    }

    public function getResponseFirebase(): ?string
    {
        return $this->response_firebase;
    }

    public function setResponseFirebase(?string $response_firebase): static
    {
        $this->response_firebase = $response_firebase;
        return $this;
    }

    public function eraseCredentials(): void
    {
        // Método para limpiar credenciales sensibles
    }

    public function getUserDetails(): ?UserDetails
    {
        return $this->userDetails;
    }

    public function setUserDetails(UserDetails $userDetails): static
    {
        if ($userDetails->getUser() !== $this) {
            $userDetails->setUser($this);
        }

        $this->userDetails = $userDetails;

        return $this;
    }

    /**
     * @return Collection<int, Studies>
     */
    public function getStudies(): Collection
    {
        return $this->studies;
    }

    public function addStudy(Studies $study): static
    {
        if (!$this->studies->contains($study)) {
            $this->studies->add($study);
            $study->setUser($this);
        }

        return $this;
    }

    public function removeStudy(Studies $study): static
    {
        if ($this->studies->removeElement($study)) {
            if ($study->getUser() === $this) {
                $study->setUser(null);
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
            $profession->addUser($this);
        }

        return $this;
    }

    public function removeProfession(Profession $profession): static
    {
        if ($this->professions->removeElement($profession)) {
            $profession->removeUser($this);
        }

        return $this;
    }

    public function getResetPasswordToken(): ?string
    {
        return $this->resetPasswordToken;
    }

    public function setResetPasswordToken(?string $token): self
    {
        $this->resetPasswordToken = $token;
        return $this;
    }

    public function getResetTokenExpiresAt(): ?\DateTimeInterface
    {
        return $this->resetTokenExpiresAt;
    }

    public function setResetTokenExpiresAt(?\DateTimeInterface $expiresAt): self
    {
        $this->resetTokenExpiresAt = $expiresAt;
        return $this;
    }

    public function getConsultTime(): ?int
    {
        return $this->getUserDetails()?->getConsultTime();
    }

    public function setConsultTime(?int $minutes): self
    {
        if ($minutes === null) {
            return $this;
        }

        if ($this->getUserDetails() === null) {
            $details = new UserDetails();
            $details->setUser($this);
            $this->setUserDetails($details);
        }

        $this->getUserDetails()->setConsultTime($minutes);
        return $this;
    }

    /**
     * @return Collection<int, Booking>
     */
    public function getProfessionalBookings(): Collection
    {
        return $this->professionalBookings;
    }

    public function addProfessionalBooking(Booking $booking): static
    {
        if (!$this->professionalBookings->contains($booking)) {
            $this->professionalBookings->add($booking);
            $booking->setProfessionalUser($this);
        }

        return $this;
    }

    public function removeProfessionalBooking(Booking $booking): static
    {
        if ($this->professionalBookings->removeElement($booking)) {
            if ($booking->getProfessionalUser() === $this) {
                $booking->setProfessionalUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Booking>
     */
    public function getPatientBookings(): Collection
    {
        return $this->patientBookings;
    }

    public function addPatientBooking(Booking $booking): static
    {
        if (!$this->patientBookings->contains($booking)) {
            $this->patientBookings->add($booking);
            $booking->setPatientUser($this);
        }

        return $this;
    }

    public function removePatientBooking(Booking $booking): static
    {
        if ($this->patientBookings->removeElement($booking)) {
            if ($booking->getPatientUser() === $this) {
                $booking->setPatientUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Availability>
     */
    public function getProfessionalAvailabilities(): Collection
    {
        return $this->professionalAvailabilities;
    }

    public function addProfessionalAvailability(Availability $availability): static
    {
        if (!$this->professionalAvailabilities->contains($availability)) {
            $this->professionalAvailabilities->add($availability);
            $availability->setProfessionalUser($this);
        }
        return $this;
    }

    public function removeProfessionalAvailability(Availability $availability): static
    {
        if ($this->professionalAvailabilities->removeElement($availability)) {
            if ($availability->getProfessionalUser() === $this) {
                $availability->setProfessionalUser(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Withdrawal>
     */
    public function getWithdrawals(): Collection
    {
        return $this->withdrawals;
    }

    public function addWithdrawal(Withdrawal $withdrawal): static
    {
        if (!$this->withdrawals->contains($withdrawal)) {
            $this->withdrawals->add($withdrawal);
            $withdrawal->setProfessional($this);
        }

        return $this;
    }

    public function removeWithdrawal(Withdrawal $withdrawal): static
    {
        if ($this->withdrawals->removeElement($withdrawal)) {
            if ($withdrawal->getProfessional() === $this) {
            }
        }

        return $this;
    }

    public function __toString(): string
    {
        $fullName = trim(($this->first_name ?? '') . ' ' . ($this->last_name ?? ''));

        return $fullName !== ''
            ? $fullName
            : ($this->email ?? (string) $this->id);
    }

    public function getSpecialty(): ?string
    {
        $details = $this->getUserDetails();
        $base = $details?->getBaseProfession();
        if ($base) {
            return $base->getName();
        }
        $profs = $this->getProfessions();
        if ($profs && $profs->count() > 0) {
            return implode(', ', array_map(fn($p) => method_exists($p, 'getName') ? $p->getName() : '', $profs->toArray()));
        }
        return null;
    }

    /**
     * @return Collection<int, Withdrawal>
     */
    public function getPatientsAttended(): int
    {
        return 0;
    }

    public function getCompletedConsultations(): int
    {
        return $this->completedConsultations;
    }

    public function setCompletedConsultations(int $completedConsultations): static
    {
        $this->completedConsultations = $completedConsultations;

        return $this;
    }

    public function getConsultationsCompleted(): int
    {
        return $this->completedConsultations;
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
        }

        return $this;
    }

    public function removeSpecialty(Specialty $specialty): static
    {
        $this->specialties->removeElement($specialty);

        return $this;
    }

    /**
     * @return Collection<int, Refund>
     */
    public function getProfessionalRefunds(): Collection
    {
        return $this->professionalRefunds;
    }

    public function addProfessionalRefund(Refund $refund): static
    {
        if (!$this->professionalRefunds->contains($refund)) {
            $this->professionalRefunds->add($refund);
            $refund->setProfessional($this);
        }

        return $this;
    }

    public function getProfessionalWallet(): ?ProfessionalWallet
    {
        return $this->professionalWallet;
    }

    public function setProfessionalWallet(ProfessionalWallet $professionalWallet): static
    {
        // set the owning side of the relation if necessary
        if ($professionalWallet->getProfessional() !== $this) {
            $professionalWallet->setProfessional($this);
        }

        $this->professionalWallet = $professionalWallet;

        return $this;
    }

    public function removeProfessionalRefund(Refund $refund): static
    {
        if ($this->professionalRefunds->removeElement($refund)) {
            if ($refund->getProfessional() === $this) {
                $refund->setProfessional(null);
            }
        }

        return $this;
    }

    public function getMspNumber(): ?string
    {
        return $this->msp_number;
    }

    public function setMspNumber(?string $msp_number): self
    {
        $this->msp_number = $msp_number;
        return $this;
    }

    public function getMspVerificationStatus(): string
    {
        return $this->msp_verification_status;
    }

    public function setMspVerificationStatus(string $msp_verification_status): self
    {
        $this->msp_verification_status = $msp_verification_status;
        return $this;
    }

    public function getFcmToken(): ?string
    {
        return $this->fcmToken;
    }

    public function setFcmToken(?string $fcmToken): self
    {
        $this->fcmToken = $fcmToken;

        return $this;
    }

    public function isNewsletterActive(): bool
    {
        return $this->newsletterActive;
    }

    public function setNewsletterActive(bool $newsletterActive): self
    {
        $this->newsletterActive = $newsletterActive;

        return $this;
    }

    public function getProfessionsDetail(): string
    {
        $base = $this->getUserDetails()?->getBaseProfession();
        $others = $this->getProfessions()->filter(fn($p) => $base === null || $p->getId() !== $base->getId());
        if ($others->isEmpty()) return 'Ninguna';
        return '<ul>' . implode('', array_map(fn($p) => "<li>" . htmlspecialchars($p->getName()) . "</li>", $others->toArray())) . '</ul>';
    }

    public function getStudiesDetail(): string
    {
        $studies = $this->getStudies();
        if ($studies->isEmpty()) return 'Ninguno';

        $html = '<div class="row" style="margin-left: 0; margin-right: 0;">';
        foreach ($studies as $s) {

            $typeEnum = StudyType::fromMixed((string)$s->getType());
            $typeLabel = $typeEnum ? $typeEnum->label() : ($s->getType() ?? 'N/A');

            $dateStart = $s->getDateStart()?->format('d/m/Y') ?? 'N/A';
            $dateEnd = $s->getDateEnd()?->format('d/m/Y') ?? 'N/A';

            $isValidated = $s->isValidated();
            $validationLabel = $isValidated ? 'SÍ' : 'NO';
            $validationColor = $isValidated ? '#28a745' : '#dc3545';

            $certUrl = $s->getUrlCertificate();
            $certLink = $certUrl ? sprintf('<a href="%s" target="_blank" class="btn btn-xs btn-outline-primary ml-2" style="padding: 2px 5px; font-size: 11px; border: 1px solid #007bff; color: #007bff; text-decoration: none; border-radius: 3px;"><i class="fa fa-external-link"></i> Ver certificado</a>', $certUrl) : '';

            $html .= sprintf(
                '<div class="col-12 mb-3 pb-2 border-bottom">
                    <div class="row">
                        <div class="col-md-3"><strong>Nombre:</strong> %s</div>
                        <div class="col-md-3"><strong>Instituto:</strong> %s</div>
                        <div class="col-md-3"><strong>Tipo:</strong> <span class="badge badge-info" style="background-color: #17a2b8; color: white; padding: 2px 8px; border-radius: 4px;">%s</span></div>
                        <div class="col-md-3"><strong>Validado:</strong> <span class="badge" style="background-color: %s; color: white; padding: 2px 8px; border-radius: 4px;">%s</span></div>
                    </div>
                    <div class="row mt-1">
                        <div class="col-md-3"><strong>Tipo de formación:</strong> %s</div>
                        <div class="col-md-3"><strong>Fecha de inicio:</strong> %s</div>
                        <div class="col-md-3"><strong>Fecha de finalización:</strong> %s</div>
                        <div class="col-md-3"><strong>Certificado:</strong> %s</div>
                    </div>
                </div>',
                htmlspecialchars($s->getName() ?? ''),
                htmlspecialchars($s->getInstitute() ?? ''),
                htmlspecialchars($typeLabel),
                $validationColor,
                $validationLabel,
                htmlspecialchars($typeLabel),
                $dateStart,
                $dateEnd,
                $certLink
            );
        }
        $html .= '</div>';
        return $html;
    }
}
