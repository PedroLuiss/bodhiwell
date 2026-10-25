<?php

namespace App\Message;

class SendMassiveEmailMessage
{
    public function __construct(
        private int $userId,
        private string $title,
        private string $body
    ) {}

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getBody(): string
    {
        return $this->body;
    }
}
