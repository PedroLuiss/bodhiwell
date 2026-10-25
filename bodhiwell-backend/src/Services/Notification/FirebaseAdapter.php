<?php

namespace App\Services\Notification;

use App\Entity\User;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use Psr\Log\LoggerInterface;

class FirebaseAdapter implements NotificationSenderInterface
{
    private $messaging;
    private $logger;

    public function __construct(string $firebaseCredentialsPath, LoggerInterface $logger)
    {
        $this->logger = $logger;

        try {
            $factory = (new Factory)->withServiceAccount($firebaseCredentialsPath);
            $this->messaging = $factory->createMessaging();
        } catch (\Throwable $e) {
            $this->logger->error('Failed to initialize Firebase Factory: ' . $e->getMessage());
            $this->messaging = null;
        }
    }

    public function send(User $user, string $title, string $body, array $data = []): void
    {
        if (!$this->messaging) {
            $this->logger->warning('Firebase messaging is not initialized. Skipping notification.');
            return;
        }

        $token = $user->getFcmToken();

        if (!$token) {
            $this->logger->info(sprintf('User %s (ID: %d) has no FCM token. Skipping push notification.', $user->getEmail(), $user->getId()));
            return;
        }

        try {
            $notification = Notification::create($title, $body);

            $message = CloudMessage::withTarget('token', $token)
                ->withNotification($notification)
                ->withData($data);

            $this->messaging->send($message);

            $this->logger->info(sprintf('Push notification sent to user %s (ID: %d)', $user->getEmail(), $user->getId()));
        } catch (\Throwable $e) {
            $this->logger->error(sprintf('Error sending push notification to user %s (ID: %d): %s', $user->getEmail(), $user->getId(), $e->getMessage()));
        }
    }
}
