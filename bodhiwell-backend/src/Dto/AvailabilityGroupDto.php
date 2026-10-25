<?php
namespace App\Dto;

class AvailabilityGroupDto
{
    public function __construct(
        public ?int $availabilityId,
        public ?int $professionalId,
        public string $professionalName,
        public ?string $specialtyName,
        public $dateAvailability,
        public array $slots
    ) {}
}
