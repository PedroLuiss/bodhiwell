<?php

namespace App\Entity;

use App\Entity\User;
use App\Entity\Availability;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Ramsey\Uuid\Uuid;
use Doctrine\ORM\Mapping as ORM;
use App\Enum\ConsultationTypeEnum;
use App\Enum\BookingEnum;
use App\Repository\BookingRepository;
use App\Validator\NoBookingOutsideAvailability;
use App\Validator\NoSelfBooking;
use App\Validator\ConsultationTypeMatch;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: BookingRepository::class)]
#[ORM\Table(
    name: 'booking',
    indexes: [
        new ORM\Index(columns: ['professional_user_id']),
        new ORM\Index(columns: ['patient_user_id']),
        new ORM\Index(columns: ['date_booking_start']),
        new ORM\Index(columns: ['date_booking_end']),
    ],
    uniqueConstraints: [
        new ORM\UniqueConstraint(
            name: 'uq_professional_start',
            columns: ['professional_user_id', 'date_booking_start']
        ),
    ]
)]
#[ORM\HasLifecycleCallbacks]
#[\App\Validator\NoBookingDoubleOverlap]
#[NoBookingOutsideAvailability]
#[NoSelfBooking]
#[ConsultationTypeMatch]
class Booking
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 36, unique: true)]
    private ?string $uid = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'professionalBookings')]
    #[ORM\JoinColumn(name: 'professional_user_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    #[Assert\NotNull(message: 'Debe indicar el profesional.')]
    private ?User $professionalUser = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'patientBookings')]
    #[ORM\JoinColumn(name: 'patient_user_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    #[Assert\NotNull(message: 'Debe indicar el consultante.')]
    private ?User $patientUser = null;

    #[ORM\Column(name: 'date_booking_start', type: Types::DATETIME_IMMUTABLE)]
    #[Assert\NotNull]
    #[Assert\GreaterThan('now', message: 'La fecha/hora debe ser futura.')]
    private ?\DateTimeImmutable $dateBookingStart = null;

    #[ORM\Column(name: 'date_booking_end', type: Types::DATETIME_IMMUTABLE)]
    private ?\DateTimeImmutable $dateBookingEnd = null;

    #[ORM\Column(type: 'string', length: 30, enumType: BookingEnum::class)]
    #[Assert\NotNull]
    private ?BookingEnum $status = BookingEnum::WAITING_PAYMENT;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Assert\Length(max: 255)]
    private ?string $notes = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\OneToOne(mappedBy: 'booking', cascade: ['persist', 'remove'])]
    private ?Consultation $consultation = null;

    #[ORM\Column(type: 'string', enumType: ConsultationTypeEnum::class, length: 20)]
    private ?ConsultationTypeEnum $type = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Assert\Length(max: 5000)]
    private ?string $reserveReason = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $quoteForInvited = false;

    #[ORM\Column(name: 'patient_image', length: 255, nullable: true)]
    #[Assert\Length(max: 255, maxMessage: 'La ruta de la imagen no puede superar los {{ limit }} caracteres.')]
    #[Assert\Regex(pattern: '/\.(jpe?g|png|webp)$/i', message: 'Solo se permiten imágenes con extensiones .jpg, .jpeg, .png o .webp')]
    private ?string $patientImage = null;

    #[ORM\ManyToOne(targetEntity: Availability::class, inversedBy: 'bookings')]
    #[ORM\JoinColumn(name: 'availability_id', referencedColumnName: 'id', nullable: true, onDelete: 'SET NULL')]
    private ?Availability $availability = null;

    /**
     * @var Collection<int, Payment>
     */
    #[ORM\OneToMany(targetEntity: Payment::class, mappedBy: 'booking')]
    private Collection $payments;

    /**
     * @var Collection<int, BookingDetail>
     */
    #[ORM\OneToMany(targetEntity: BookingDetail::class, mappedBy: 'booking', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $bookingDetails;

    #[ORM\OneToMany(mappedBy: 'booking', targetEntity: Refund::class)]
    private Collection $refunds;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $reminderSentAt = null;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private int $notificationStage = 0;

    public function __construct()
    {
        $this->bookingDetails = new ArrayCollection();
        $this->payments = new ArrayCollection();
        $this->refunds = new ArrayCollection();
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

    public function getProfessionalUser(): ?User
    {
        return $this->professionalUser;
    }

    public function setProfessionalUser(?User $professionalUser): static
    {
        $this->professionalUser = $professionalUser;

        return $this;
    }

    public function getPatientUser(): ?User
    {
        return $this->patientUser;
    }

    public function setPatientUser(?User $patientUser): static
    {
        $this->patientUser = $patientUser;

        return $this;
    }

    public function getDateBookingStart(): ?\DateTimeImmutable
    {
        return $this->dateBookingStart;
    }

    public function setDateBookingStart(\DateTimeInterface $dt): self
    {
        $this->dateBookingStart = $dt instanceof \DateTimeImmutable ? $dt : \DateTimeImmutable::createFromInterface($dt);
        return $this;
    }

    public function getDateBookingEnd(): ?\DateTimeImmutable
    {
        return $this->dateBookingEnd;
    }

    public function setDateBookingEnd(\DateTimeInterface $dt): self
    {
        $this->dateBookingEnd = $dt instanceof \DateTimeImmutable ? $dt : \DateTimeImmutable::createFromInterface($dt);
        return $this;
    }

    public function getStatus(): ?BookingEnum
    {
        return $this->status;
    }

    public function setStatus(BookingEnum $status): static
    {
        $this->status = $status;

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

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getConsultation(): ?Consultation
    {
        return $this->consultation;
    }

    public function setConsultation(Consultation $consultation): static
    {
        if ($consultation->getBooking() !== $this) {
            $consultation->setBooking($this);
        }

        $this->consultation = $consultation;

        return $this;
    }

    public function isConsulted(): bool
    {
        return null !== $this->consultation;
    }

    public function __toString(): string
    {
        return sprintf(
            '#%d – %s',
            $this->getId(),
            $this->getDateBookingStart()?->format('Y-m-d H:i') ?? '–'
        );
    }

    public function getAvailability(): ?Availability
    {
        return $this->availability;
    }

    public function setAvailability(?Availability $availability): static
    {
        $this->availability = $availability;
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

    public function getPatientImage(): ?string
    {
        return $this->patientImage;
    }

    public function setPatientImage(?string $patientImage): self
    {
        $this->patientImage = $patientImage;

        return $this;
    }

    /**
     * @return Collection<int, Payment>
     */
    public function getPayments(): Collection
    {
        return $this->payments;
    }

    public function addPayment(Payment $payment): static
    {
        if (!$this->payments->contains($payment)) {
            $this->payments->add($payment);
            $payment->setBooking($this);
        }
        return $this;
    }

    /**
     * @return Collection<int, BookingDetail>
     */
    public function getBookingDetails(): Collection
    {
        return $this->bookingDetails;
    }

    public function addBookingDetail(BookingDetail $bookingDetail): static
    {
        if (!$this->bookingDetails->contains($bookingDetail)) {
            $this->bookingDetails->add($bookingDetail);
            $bookingDetail->setBooking($this);
        }

        return $this;
    }

    /**
     * @return Collection<int, Refund>
     */
    public function getRefunds(): Collection
    {
        return $this->refunds;
    }

    public function addRefund(Refund $refund): static
    {
        if (!$this->refunds->contains($refund)) {
            $this->refunds->add($refund);
            $refund->setBooking($this);
        }

        return $this;
    }

    public function removePayment(Payment $payment): static
    {
        if ($this->payments->removeElement($payment)) {
            if ($payment->getBooking() === $this) {
                $payment->setBooking(null);
            }
        }
        return $this;
    }

    public function removeBookingDetail(BookingDetail $bookingDetail): static
    {
        if ($this->bookingDetails->removeElement($bookingDetail)) {
            if ($bookingDetail->getBooking() === $this) {
                $bookingDetail->setBooking(null);
            }
        }

        return $this;
    }

    public function removeRefund(Refund $refund): static
    {
        if ($this->refunds->removeElement($refund)) {
            if ($refund->getBooking() === $this) {
                $refund->setBooking(null);
            }
        }

        return $this;
    }

    public function getReminderSentAt(): ?\DateTimeImmutable
    {
        return $this->reminderSentAt;
    }

    public function setReminderSentAt(?\DateTimeImmutable $reminderSentAt): self
    {
        $this->reminderSentAt = $reminderSentAt;

        return $this;
    }

    public function getNotificationStage(): int
    {
        return $this->notificationStage;
    }

    public function setNotificationStage(int $notificationStage): self
    {
        $this->notificationStage = $notificationStage;

        return $this;
    }
}
