<?php

namespace App\Dto;

use App\Entity\Payment;

class PaymentListDTO
{
    public string $paymentUid;
    public int $amount;
    public string $amountDecimal;
    public string $status;
    public string $createdAt;
    public array $booking;
    public ?string $professionalName;
    public ?string $patientName;

    public function __construct(Payment $payment)
    {
        $this->paymentUid = $payment->getUid();
        $this->amount = $payment->getAmount() ?? 0;
        $this->amountDecimal = number_format(($this->amount) / 100, 2, '.', '');
        $this->status = $payment->getStatusLabel() ?? 'unknown';
        $this->createdAt = $payment->getCreatedAt()?->format(DATE_ATOM) ?? '';
        $booking = $payment->getBooking();
        $this->booking = $booking ? [
            'uid' => $booking->getUid(),
            'dateBookingStart' => $booking->getDateBookingStart()?->format(DATE_ATOM),
            'status' => $booking->getStatus(),
        ] : [];

        $professional = $booking?->getProfessionalUser();
        $this->professionalName = $professional
            ? trim(sprintf('%s %s', $professional->getFirstName() ?? '', $professional->getLastName() ?? '')) ?: null
            : null;

        $patient = $booking?->getPatientUser();
        $this->patientName = $patient
            ? trim(sprintf('%s %s', $patient->getFirstName() ?? '', $patient->getLastName() ?? '')) ?: null
            : null;
    }
}
