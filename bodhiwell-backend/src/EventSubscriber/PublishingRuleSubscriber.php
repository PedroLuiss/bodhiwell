<?php

namespace App\EventSubscriber;

use App\Entity\User;
use App\Entity\Studies;
use App\Entity\Profession;
use App\Enum\UserStatusEnum;
use App\Services\PublishingRuleService;
use Doctrine\Common\EventSubscriber;
use Doctrine\ORM\Event\OnFlushEventArgs;
use Doctrine\ORM\Events;
use Doctrine\ORM\UnitOfWork;

class PublishingRuleSubscriber implements EventSubscriber
{
    public function __construct(
        private PublishingRuleService $publishingRuleService
    ) {}

    public function getSubscribedEvents(): array
    {
        return [
            Events::onFlush,
        ];
    }

    public function onFlush(OnFlushEventArgs $args): void
    {
        $em = $args->getObjectManager();
        $uow = $em->getUnitOfWork();

        foreach ($uow->getScheduledEntityInsertions() as $entity) {
            if ($entity instanceof User) {
                $this->checkUser($entity, $uow, $em);
            }
        }

        foreach ($uow->getScheduledEntityUpdates() as $entity) {
            if ($entity instanceof User) {
                $this->checkUser($entity, $uow, $em);
            }
        }

        foreach ($uow->getScheduledEntityInsertions() as $entity) {
            if ($entity instanceof Studies) {
                $this->checkUser($entity->getUser(), $uow, $em);
            }
        }

        foreach ($uow->getScheduledEntityUpdates() as $entity) {
            if ($entity instanceof Studies) {
                $changeset = $uow->getEntityChangeSet($entity);
                if (isset($changeset['is_validated'])) {
                    $this->checkUser($entity->getUser(), $uow, $em);
                }
            }
        }

        foreach ($uow->getScheduledEntityDeletions() as $entity) {
            if ($entity instanceof Studies) {
                $this->checkUser($entity->getUser(), $uow, $em);
            }
        }

        foreach ($uow->getScheduledEntityUpdates() as $entity) {
            if ($entity instanceof Profession) {
                $changeset = $uow->getEntityChangeSet($entity);
                if (isset($changeset['requires_msp'])) {
                    foreach ($entity->getUsers() as $user) {
                        $this->checkUser($user, $uow, $em);
                    }
                }
            }
        }
    }

    private function checkUser(?User $user, UnitOfWork $uow, \Doctrine\ORM\EntityManagerInterface $em): void
    {
        if (!$user) {
            return;
        }

        if ($user->getTypeAccount() !== 'professional') {
            return;
        }

        if ($user->getStatus() === UserStatusEnum::ACTIVE->value) {
            if (!$this->publishingRuleService->isPublishable($user)) {
                $user->setStatus(UserStatusEnum::PENDING_APPROVAL->value);

                $uow->recomputeSingleEntityChangeSet(
                    $em->getClassMetadata(get_class($user)),
                    $user
                );
            }
        }
    }
}
