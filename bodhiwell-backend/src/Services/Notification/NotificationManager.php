<?php

namespace App\Services\Notification;

use App\Entity\Notification;
use App\Entity\User;
use App\Enum\NotificationTypeEnum;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

class NotificationManager
{
    private EntityManagerInterface $entityManager;
    private NotificationSenderInterface $sender;
    private LoggerInterface $logger;

    public function __construct(
        EntityManagerInterface $entityManager,
        NotificationSenderInterface $sender,
        LoggerInterface $logger
    ) {
        $this->entityManager = $entityManager;
        $this->sender = $sender;
        $this->logger = $logger;
    }

    /**
     * Creates a notification record and sends a push notification.
     *
     * @param User $user The recipient user
     * @param NotificationTypeEnum|string $type The type of notification (Enum or string value)
     * @param string $title The title of the notification
     * @param string $body The body of the notification
     * @param array $data Additional data payload
     */
    public function notifyUser(User $user, $type, string $title, string $body, array $data = []): void
    {
        if (is_string($type)) {
            try {
                $type = NotificationTypeEnum::from($type);
            } catch (\ValueError $e) {
                $this->logger->error("Invalid notification type: $type");
                $type = NotificationTypeEnum::SYSTEM;
            }
        }

        $notification = new Notification();
        $notification->setUser($user);
        $notification->setType($type);
        $notification->setTitle($title);
        $notification->setBody($body);
        $notification->setData($data);

        try {
            $this->entityManager->persist($notification);
            $this->entityManager->flush();
        } catch (\Exception $e) {
            $this->logger->error('Failed to persist notification: ' . $e->getMessage());
        }

        try {
            if ($notification->getId()) {
                $data['notification_id'] = $notification->getId();
            }

            $this->sender->send($user, $title, $body, $data);
        } catch (\Exception $e) {
            $this->logger->error('Failed to send push notification via adapter: ' . $e->getMessage());
        }
    }
}
