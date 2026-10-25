<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

final class SearchProfessionalDto
{
    #[Assert\Length(max: 255)]
    private ?string $q = null;

    private ?string $dimension = null;

    /**
     * @var string[]
     */
    private array $specialties = [];

    public function __construct(?string $q = null, ?string $dimension = null, array $specialties = [])
    {
        $this->q = $q;
        $this->dimension = $dimension;
        $this->specialties = array_values(array_filter($specialties, fn($s) => is_string($s) && trim($s) !== ''));
    }

    public function getQ(): ?string
    {
        return $this->q;
    }

    public function getDimension(): ?string
    {
        return $this->dimension;
    }

    /**
     * @return string[]
     */
    public function getSpecialties(): array
    {
        return $this->specialties;
    }
}
