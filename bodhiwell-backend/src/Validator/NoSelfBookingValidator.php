<?php

namespace App\Validator;

use App\Entity\Booking;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;

class NoSelfBookingValidator extends ConstraintValidator
{
    public function validate($value, Constraint $constraint): void
    {
        if (!$constraint instanceof NoSelfBooking) {
            throw new UnexpectedTypeException($constraint, NoSelfBooking::class);
        }

        if (!$value instanceof Booking) {
            return;
        }

        $pro = $value->getProfessionalUser();
        $pat = $value->getPatientUser();
        if ($pro && $pat && $pro === $pat) {
            $this->context->buildViolation($constraint->message)
                ->atPath('professionalUser')
                ->addViolation();
        }
    }
}
