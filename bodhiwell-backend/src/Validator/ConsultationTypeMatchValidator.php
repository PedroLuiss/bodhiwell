<?php

namespace App\Validator;

use App\Entity\Booking;
use App\Enum\ConsultTypeEnum;
use App\Enum\ConsultationTypeEnum;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;

class ConsultationTypeMatchValidator extends ConstraintValidator
{
    public function validate($value, Constraint $constraint): void
    {
        if (!$constraint instanceof ConsultationTypeMatch) {
            throw new UnexpectedTypeException($constraint, ConsultationTypeMatch::class);
        }

        if (!$value instanceof Booking) {
            return;
        }

        $professional = $value->getProfessionalUser();
        $bookingType = $value->getType();

        if (!$professional || !$bookingType) {
            return;
        }

        $details = $professional->getUserDetails();
        if (!$details) {
            return;
        }

        $proType = $details->getConsultType();

        if (!$proType) {
            return;
        }

        $proType = strtolower(trim($proType));

        if ($proType === ConsultTypeEnum::HYBRID->value) {
            return;
        }

        $isValid = true;
        if ($proType === ConsultTypeEnum::VIRTUAL->value) {
            if ($bookingType !== ConsultationTypeEnum::VIRTUAL) {
                $isValid = false;
            }
        } elseif ($proType === ConsultTypeEnum::PRESENTIAL->value) {
            if ($bookingType !== ConsultationTypeEnum::PRESENTIAL) {
                $isValid = false;
            }
        }

        if (!$isValid) {
            $proTypeLabel = ConsultTypeEnum::tryFrom($proType)?->label() ?? $proType;

            $this->context->buildViolation($constraint->message)
                ->setParameter('{{ professionalType }}', $proTypeLabel)
                ->atPath('type')
                ->addViolation();
        }
    }
}
