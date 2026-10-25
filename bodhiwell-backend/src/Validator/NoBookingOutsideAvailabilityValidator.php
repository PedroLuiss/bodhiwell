<?php

namespace App\Validator;

use App\Entity\Booking;
use App\Repository\AvailabilityRepository;
use App\Services\UserService;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;

class NoBookingOutsideAvailabilityValidator extends ConstraintValidator
{
    public function __construct(
        private AvailabilityRepository $availabilityRepository,
        private UserService $userService,
    ) {}

    public function validate($value, Constraint $constraint): void
    {
        if (!$constraint instanceof NoBookingOutsideAvailability) {
            throw new UnexpectedTypeException($constraint, NoBookingOutsideAvailability::class);
        }

        if (!$value instanceof Booking) {
            return;
        }

        $pro   = $value->getProfessionalUser();
        $start = $value->getDateBookingStart();

        if (!$pro || !$start) {
            return;
        }

        $minutes = (int) $this->userService->getUserDetail($pro, 'consultTime');
        if ($minutes <= 0) {
            $minutes = 60;
        }

        if ($start instanceof \DateTimeImmutable) {
            $end = $start->add(new \DateInterval("PT{$minutes}M"));
        } elseif ($start instanceof \DateTime) {
            $end = (clone $start)->add(new \DateInterval("PT{$minutes}M"));
        } else {
            /** @var \DateTimeInterface $start */
            $tmp = \DateTime::createFromInterface($start);
            $end = (clone $tmp)->add(new \DateInterval("PT{$minutes}M"));
        }

        $date = $start->format('Y-m-d');

        $availabilityFromBooking = $value->getAvailability();
        if ($availabilityFromBooking) {
            $availabilities = [$availabilityFromBooking];
        } else {
            $availabilities = $this->availabilityRepository
                ->findByProfessionalAndDate($pro, $start);
        }

        $toMinutes = static fn(\DateTimeInterface $dt): int => ((int) $dt->format('H')) * 60 + (int) $dt->format('i');

        $startMin = $toMinutes($start);
        $endMin   = $toMinutes($end);

        $insideSomeAvailability = false;

        foreach ($availabilities as $a) {
            foreach ($a->getSlots() as $slot) {
                $slotStartStr = $slot['start'] ?? null;
                $slotEndStr   = $slot['end'] ?? null;

                if (!$slotStartStr || !$slotEndStr) {
                    continue;
                }

                $slotStart = \DateTimeImmutable::createFromFormat('Y-m-d H:i', $date . ' ' . $slotStartStr);
                $slotEnd   = \DateTimeImmutable::createFromFormat('Y-m-d H:i', $date . ' ' . $slotEndStr);

                if (!$slotStart || !$slotEnd) {
                    continue;
                }

                $slotStartMin = $toMinutes($slotStart);
                $slotEndMin   = $toMinutes($slotEnd);

                if ($startMin >= $slotStartMin && $endMin <= $slotEndMin) {
                    $insideSomeAvailability = true;
                    break 2;
                }
            }
        }

        if (!$insideSomeAvailability) {
            $this->context->buildViolation($constraint->message)
                ->atPath('dateBookingStart')
                ->addViolation();
        }
    }
}
