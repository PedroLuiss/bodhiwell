<?php

namespace App\Dto;

use App\Enum\ConsultationDetailTypeEnum;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

class ConsultationInput
{
    /**
     * @Assert\NotBlank
     * @Assert\Uuid
     */
    public string $bookingUid;

    /**
     * @Assert\NotBlank
     * @Assert\Choice(callback: [\App\Enum\ConsultationTypeEnum::class, 'choices'])
     */
    public string $type;

    public ?string $notes = null;

    /**
     * @var array<string,string>
     * @Assert\Type("array")
     * @Assert\Callback                          
     */
    public array $details = [];
    
    public ?string $reserveReason = null;

    public ?bool $quoteForInvited = null;

    /**
     * Callback de validación para asegurar que las claves de `details`
     * sólo estén en el enum ConsultationDetailTypeEnum.
     *
     * @param ExecutionContextInterface $context
     */
    public function validateDetailsKeys(ExecutionContextInterface $context): void
    {
        $validKeys = ConsultationDetailTypeEnum::values();

        foreach ($this->details as $key => $value) {
            if (!\in_array($key, $validKeys, true)) {
                $context
                    ->buildViolation(
                        sprintf(
                            'La clave "%s" no es válida. Valores permitidos: %s',
                            $key,
                            implode(', ', $validKeys)
                        )
                    )
                    ->atPath("details[$key]")       
                    ->addViolation();
            }
        }
    }
}

