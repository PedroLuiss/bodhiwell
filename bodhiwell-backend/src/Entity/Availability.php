<?php

namespace App\Entity;

use App\Entity\User;
use App\Entity\Booking;
use Ramsey\Uuid\Uuid;
use App\Enum\WeekDayEnum;
use App\Repository\AvailabilityRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use App\Validator\NoAvailabilityOverlap;
use Symfony\Component\Validator\Constraints as Assert;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[NoAvailabilityOverlap]
#[ORM\Entity(repositoryClass: AvailabilityRepository::class)]
#[ORM\Table(
    name: 'availability',
    indexes: [
        new ORM\Index(columns: ['professional_user_id']),
        new ORM\Index(columns: ['day_of_week']),
        new ORM\Index(columns: ['date_availability']),
    ],
    uniqueConstraints: [
        new ORM\UniqueConstraint(name: 'uniq_pro_date', columns: ['professional_user_id', 'date_availability'])
    ]
)]
#[ORM\HasLifecycleCallbacks]
class Availability
{
    /** 
     * @deprecated  
     * Se mantiene si tienes datos legacy
     */
    public static array $DAYS = [];

    public static function initDays(): void
    {
        self::$DAYS = WeekDayEnum::choiceMap();
    }

    /* ========= PK ========= */
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 36, unique: true)]
    private ?string $uid = null;

    /* ========= Relaciones ========= */
    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'professionalAvailabilities')]
    #[ORM\JoinColumn(name: 'professional_user_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    #[Assert\NotNull(message: 'Debe asociar un profesional.')]
    private ?User $professionalUser = null;

    /* === Datos de disponibilidad === */
    #[ORM\Column(name: 'day_of_week', type: Types::SMALLINT)]
    #[Assert\NotNull]
    #[Assert\Range(min: 0, max: 6, notInRangeMessage: 'El día debe estar entre 0 (domingo) y 6 (sábado).')]
    private ?int $dayOfWeek = null;

    #[ORM\Column(name: 'date_availability', type: Types::DATETIME_IMMUTABLE, nullable: false)]
    #[Assert\NotNull]
    private ?\DateTimeImmutable $dateAvailability = null;

    #[ORM\Column(type: Types::JSON, nullable: false)]
    private array $slots = [];

    #[ORM\OneToMany(mappedBy: 'availability', targetEntity: Booking::class)]
    private Collection $bookings;

    public function __construct()
    {
        $this->bookings = new ArrayCollection();
    }

    /**
     * @return Collection<int, Booking>
     */
    public function getBookings(): Collection
    {
        return $this->bookings;
    }

    public function addBooking(Booking $booking): static
    {
        if (!$this->bookings->contains($booking)) {
            $this->bookings->add($booking);
            $booking->setAvailability($this);
        }

        return $this;
    }

    public function removeBooking(Booking $booking): static
    {
        if ($this->bookings->removeElement($booking)) {
            if ($booking->getAvailability() === $this) {
                $booking->setAvailability(null);
            }
        }

        return $this;
    }

    public function hasBookings(): bool
    {
        if ($this->bookings->isEmpty()) {
            return false;
        }

        foreach ($this->bookings as $booking) {
            $status = $booking->getStatus();
            if ($status && $status->value !== \App\Enum\BookingEnum::CANCELLED->value) {
                return true;
            }
        }

        return false;
    }

    /* === Timestamps === */
    #[ORM\Column(type: 'datetime_immutable')]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?\DateTimeImmutable $updatedAt = null;

    /* === Lifecycle === */
    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $now = new \DateTimeImmutable();
        $this->createdAt = $now;
        $this->updatedAt = $now;
        if (!$this->uid) {
            $this->uid = Uuid::uuid4()->toString();
        }
        if ($this->dateAvailability) {
            $this->setDateAvailability(clone $this->dateAvailability);
        }
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
        if ($this->dateAvailability) {
            $this->setDateAvailability(clone $this->dateAvailability);
        }
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

    public function getDayOfWeek(): ?WeekDayEnum
    {
        return $this->dayOfWeek !== null ? WeekDayEnum::from($this->dayOfWeek) : null;
    }

    public function setDayOfWeek(int|WeekDayEnum $day): static
    {
        $this->dayOfWeek = $day instanceof WeekDayEnum ? $day->value : $day;

        return $this;
    }

    public function getDateAvailability(): ?\DateTimeImmutable
    {
        return $this->dateAvailability;
    }

    public function setDateAvailability(?\DateTimeInterface $dateAvailability): static
    {
        if ($dateAvailability !== null) {
            $normalized = $dateAvailability instanceof \DateTimeImmutable
                ? $dateAvailability
                : \DateTimeImmutable::createFromInterface($dateAvailability);
            $normalized = $normalized->setTime(0, 0, 0);
            $this->dateAvailability = $normalized;

            $weekday0 = (int) $normalized->format('w');
            $this->setDayOfWeek($weekday0);
        }
        return $this;
    }

    public function getSlots(): array
    {
        return $this->slots;
    }

    public function setSlots(array $slots): static
    {
        $this->slots = $slots;
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

    /* === Campos Virtuales para EasyAdmin === */
    public function getNextDates(): ?string
    {
        return null;
    }
    public function getDaysSummary(): ?string
    {
        return null;
    }
}
