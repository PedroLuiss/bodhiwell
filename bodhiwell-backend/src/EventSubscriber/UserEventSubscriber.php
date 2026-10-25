<?php

namespace App\EventSubscriber;

use App\Entity\User;
use App\Services\WalletService;
use Doctrine\Common\EventSubscriber;
use Doctrine\ORM\Event\OnFlushEventArgs;
use Doctrine\ORM\Event\PostFlushEventArgs;
use Doctrine\ORM\Events;
use Psr\Log\LoggerInterface;

class UserEventSubscriber implements EventSubscriber
{
    /** @var User[] */
    private array $usersToCreateWallet = [];

    public function __construct(
        private WalletService $walletService,
        private LoggerInterface $logger
    ) {}

    public function getSubscribedEvents(): array
    {
        return [
            Events::onFlush,
            Events::postFlush,
        ];
    }

    public function onFlush(OnFlushEventArgs $args): void
    {
        $em = $args->getObjectManager();
        $uow = $em->getUnitOfWork();

        foreach ($uow->getScheduledEntityInsertions() as $entity) {
            if (!$entity instanceof User) {
                continue;
            }

            if ($this->isProfessional($entity)) {
                $this->usersToCreateWallet[] = $entity;
            }
        }
    }

    public function postFlush(PostFlushEventArgs $args): void
    {
        if (empty($this->usersToCreateWallet)) {
            return;
        }

        $em = $args->getObjectManager();
        $users = $this->usersToCreateWallet;
        $this->usersToCreateWallet = [];

        foreach ($users as $user) {
            try {
                $this->walletService->getOrCreateWalletForProfessional($user);
                $this->logger->info('Automatically created wallet for new professional user', [
                    'userId' => $user->getId(),
                    'email' => $user->getEmail()
                ]);
            } catch (\Throwable $e) {
                $this->logger->error('Failed to create wallet for new professional user', [
                    'userId' => $user->getId(),
                    'error' => $e->getMessage()
                ]);
            }
        }

        $em->flush();
    }

    private function isProfessional(User $user): bool
    {
        return $user->getTypeAccount() === 'professional' || in_array('ROLE_PROFESSIONAL', $user->getRoles(), true);
    }
}
