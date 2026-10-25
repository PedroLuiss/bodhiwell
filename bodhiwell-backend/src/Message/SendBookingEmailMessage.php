<?php

namespace App\Message;

class SendBookingEmailMessage
{
    public function __construct(
        private int $bookingId,
        private int $userId,
        private string $emailType
    ) {}

    public function getBookingId(): int
    {
        return $this->bookingId;
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function getEmailType(): string
    {
        return $this->emailType;
    }
}
