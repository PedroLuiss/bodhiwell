<?php

namespace App\EventSubscriber;

use App\Entity\ProfessionalWallet;
use App\Entity\Withdrawal;
use App\Entity\WalletLedger;
use App\Enum\WithdrawalStatusEnum;
use App\Services\WalletService;
use Doctrine\Bundle\DoctrineBundle\EventSubscriber\EventSubscriberInterface;
use Doctrine\ORM\Event\OnFlushEventArgs;
use Doctrine\ORM\Events;

class WithdrawalEventSubscriber implements EventSubscriberInterface
{
    public function __construct(private WalletService $walletService) {}

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
            if ($entity instanceof Withdrawal) {
                if ($entity->getStatus() === WithdrawalStatusEnum::APPROVED) {
                    $ledger = $this->walletService->processWithdrawal($entity, false);
                    if ($ledger) {
                        $uow->computeChangeSet($em->getClassMetadata(WalletLedger::class), $ledger);
                    }
                }
                $this->recalculateWallet($em, $entity);
            }
        }

        foreach ($uow->getScheduledEntityUpdates() as $entity) {
            if ($entity instanceof Withdrawal) {
                $changeSet = $uow->getEntityChangeSet($entity);
                if (isset($changeSet['status']) && $changeSet['status'][1] === WithdrawalStatusEnum::APPROVED) {
                    $ledger = $this->walletService->processWithdrawal($entity, false);
                    if ($ledger) {
                        $uow->computeChangeSet($em->getClassMetadata(WalletLedger::class), $ledger);
                    }
                }
                $this->recalculateWallet($em, $entity);
            }
        }
    }

    private function recalculateWallet($em, Withdrawal $withdrawal): void
    {
        $user = $withdrawal->getProfessional();
        if (!$user) return;

        $wallet = $em->getRepository(ProfessionalWallet::class)->findOneBy(['professional' => $user]);
        if ($wallet) {
            if (!$user->getWithdrawals()->contains($withdrawal)) {
                $user->addWithdrawal($withdrawal);
            }

            $newAvailable = $wallet->calculateAvailableBalance();
            $newFrozen = $wallet->calculateFrozenBalance();

            $wallet->setAvailableBalance($newAvailable);
            $wallet->setFrozenBalance($newFrozen);
            $wallet->setUpdatedAt(new \DateTimeImmutable());

            $em->persist($wallet);
            $classMetadata = $em->getClassMetadata(ProfessionalWallet::class);
            $em->getUnitOfWork()->computeChangeSet($classMetadata, $wallet);
        }
    }
}
