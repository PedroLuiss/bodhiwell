<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

/**
 * DTO para actualizar disponibilidades de un profesional.
 */
class ProfileAvailabilitiesRequest
{
    /**
     * @Assert\NotNull(message="El campo 'availabilities' es requerido.")
     * @Assert\Type(type="array", message="El campo 'availabilities' debe ser un arreglo.")
     * @Assert\All({
     *   @Assert\Collection(
     *     fields={
     *       "uid" = @Assert\Optional({@Assert\Type("string")}),
     *       "day" = @Assert\NotNull(message="El día es requerido."),
     *       "start" = @Assert\NotBlank(message="La hora de inicio es requerida.") ,
     *       "end" = @Assert\NotBlank(message="La hora de fin es requerida.") ,
     *       "delete" = @Assert\Optional({@Assert\Type(type="bool")})
     *     },
     *     allowMissingFields=false
     *   )
     * })
     */
    public array $availabilities = [];

    /**
     * Validación cross-field: start < end para cada availability.
     *
     * @Assert\Callback
     */
    public function validateAvailabilityTimes(ExecutionContextInterface $context): void
    {
        foreach ($this->availabilities as $i => $a) {
            if (!isset($a['start'], $a['end'])) {
                continue;
            }
            $start = \DateTime::createFromFormat('H:i', $a['start']);
            $end = \DateTime::createFromFormat('H:i', $a['end']);
            if (!$start || !$end) {
                continue;
            }
            if ($start >= $end) {
                $context->buildViolation("La hora de inicio debe ser anterior a la hora de fin en el elemento #$i.")
                    ->atPath("[availabilities][$i][start]")
                    ->addViolation();
            }
        }
    }
}
