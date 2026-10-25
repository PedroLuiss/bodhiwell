<?php

namespace App\Services\Notification;

use App\Entity\User;

interface NotificationSenderInterface
{
    /**
     * Send a push notification to the user.
     *
     * @param User $user The recipient user
     * @param string $title The title of the notification
     * @param string $body The body of the notification
     * @param array $data Additional data payload
     */
    public function send(User $user, string $title, string $body, array $data = []): void;
}
