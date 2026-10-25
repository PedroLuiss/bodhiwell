<?php

namespace App\Validator;

use DateInterval;
use App\Entity\Booking;
use App\Services\UserService;
use App\Repository\BookingRepository;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;

class NoBookingDoubleOverlapValidator extends ConstraintValidator
{
    public function __construct(
        private BookingRepository $bookingRepository,
        private UserService $userService,
    ) {}

    public function validate($value, Constraint $constraint): void
    {
        if (!$constraint instanceof NoBookingDoubleOverlap) {
            throw new UnexpectedTypeException($constraint, NoBookingDoubleOverlap::class);
        }
        if (!$value instanceof Booking) {
            return;
        }

        $pro = $value->getProfessionalUser();
        $pat = $value->getPatientUser();
        $start = $value->getDateBookingStart();

        if (!$pro || !$pat || !$start) {
            return;
        }

        $minutes = (int) $this->userService->getUserDetail($pro, 'consultTime');
        if ($minutes <= 0) {
            $minutes = 60;
        }

        if ($start instanceof \DateTimeImmutable) {
            $start = \DateTime::createFromInterface($start);
        }

        /**
         *  @var \DateTime $start 
         * */
        $end = (clone $start)->add(new DateInterval("PT{$minutes}M"));

        $id = $value->getId();

        $proOverlap = $this->bookingRepository->hasOverlap($pro, $start, $end, $id);
        $patOverlap = $this->bookingRepository->findPatientConflict($pat, $start, $end, $id);

        if ($proOverlap && $patOverlap) {
            $this->context->buildViolation($constraint->messageBoth)
                ->addViolation();
        } elseif ($proOverlap) {
            $this->context->buildViolation($constraint->messagePro)
                ->addViolation();
        } elseif ($patOverlap) {
            $this->context->buildViolation($constraint->messagePat)
                ->addViolation();
        }
    }
}
