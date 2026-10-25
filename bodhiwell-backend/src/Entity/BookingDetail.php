<?php

namespace App\Entity;

use App\Enum\BookingDetailTypeEnum;
use App\Repository\BookingDetailRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: BookingDetailRepository::class)]
#[ORM\Table(name: 'booking_detail')]
class BookingDetail
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Booking::class, inversedBy: 'bookingDetails')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Booking $booking = null;

    #[ORM\Column(type: 'string', enumType: BookingDetailTypeEnum::class, length: 50)]
    private ?BookingDetailTypeEnum $detailKey = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $detailValue = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getBooking(): ?Booking
    {
        return $this->booking;
    }

    public function setBooking(?Booking $booking): static
    {
        $this->booking = $booking;
        return $this;
    }

    public function getDetailKey(): ?BookingDetailTypeEnum
    {
        return $this->detailKey;
    }

    public function setDetailKey(BookingDetailTypeEnum $detailKey): static
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
}
