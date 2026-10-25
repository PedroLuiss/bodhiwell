<?php

namespace App\MessageHandler;

use App\Message\SendMassiveEmailMessage;
use App\Mailer\UserMailer;
use App\Repository\UserRepository;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Psr\Log\LoggerInterface;

#[AsMessageHandler]
class SendMassiveEmailHandler
{
    public function __construct(
        private UserRepository $userRepository,
        private UserMailer $userMailer,
        private LoggerInterface $logger
    ) {}

    public function __invoke(SendMassiveEmailMessage $message): void
    {
        $user = $this->userRepository->find($message->getUserId());

        if (!$user) {
            $this->logger->warning('User not found for async email', [
                'userId' => $message->getUserId()
            ]);
            return;
        }

        try {
            $this->userMailer->sendNewsletter(
                $user,
                $message->getTitle(),
                $message->getBody()
            );
        } catch (\Throwable $e) {
            $this->logger->error('Failed to send async email', [
                'userId' => $user->getId(),
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
}
