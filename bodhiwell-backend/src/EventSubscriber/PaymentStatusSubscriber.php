<?php

namespace App\EventSubscriber;

use App\Entity\Payment;
use App\Entity\User;
use App\Entity\Booking;
use App\Enum\PaymentStatusEnum;
use App\Services\WalletService;
use Doctrine\Common\EventSubscriber;
use Doctrine\ORM\Event\OnFlushEventArgs;
use Doctrine\ORM\Event\PostFlushEventArgs;
use Doctrine\ORM\Events;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

class PaymentStatusSubscriber implements EventSubscriber
{
    /** @var Payment[] */
    private array $toCredit = [];
    /** @var Payment[] */
    private array $toDebit = [];
    /** @var Payment[] */
    private array $toHold = [];

    public function __construct(
        private WalletService $walletService,
        private LoggerInterface $logger,
        private EntityManagerInterface $em
    ) {}

    public function getSubscribedEvents(): array
    {
        return [Events::onFlush, Events::postFlush];
    }

    public function onFlush(OnFlushEventArgs $args): void
    {
        $em  = $args->getObjectManager();
        $uow = $em->getUnitOfWork();

        foreach ($uow->getScheduledEntityInsertions() as $entity) {
            if (!$entity instanceof Payment) {
                continue;
            }
            $status = $this->normalizeStatus($entity->getStatus());
            // Logic disabled for BD-537
            /*
            if ($this->isCreditStatus($status)) {
                $this->toCredit[] = $entity;
            } elseif ($this->isDebitStatus($status)) {
                $this->toDebit[] = $entity;
            } elseif ($this->isHoldStatus($status)) {
                $this->toHold[] = $entity;
            }
            */
        }

        foreach ($uow->getScheduledEntityUpdates() as $entity) {
            if (!$entity instanceof Payment) {
                continue;
            }
            $changes = $uow->getEntityChangeSet($entity);
            if (!isset($changes['status'])) {
                continue;
            }
            [, $new] = $changes['status'];
            [, $new] = $changes['status'];
            $status = $this->normalizeStatus($new);
            /*
            if ($this->isCreditStatus($status)) {
                $this->toCredit[] = $entity;
            } elseif ($this->isDebitStatus($status)) {
                $this->toDebit[] = $entity;
            } elseif ($this->isHoldStatus($status)) {
                $this->toHold[] = $entity;
            }
            */
        }
    }

    public function postFlush(PostFlushEventArgs $args): void
    {
        if ($this->toCredit) {
            $payments = $this->toCredit;
            $this->toCredit = [];
            foreach ($payments as $payment) {
                try {
                    $professional = $this->resolveProfessional($payment);
                    if (!$professional) {
                        $this->logger->warning('No professional user found for payment; skipping credit', [
                            'paymentUid' => method_exists($payment, 'getUid') ? $payment->getUid() : null,
                        ]);
                        continue;
                    }
                    $existingLedger = $this->em->getRepository(\App\Entity\WalletLedger::class)
                        ->findOneBy(['payment' => $payment]);
                    if ($existingLedger === null) {
                        $this->walletService->creditWallet($professional, $payment);
                    } else {
                        $wallet = $existingLedger->getWallet();
                        if ($wallet) {
                            $wallet->setAvailableBalance($wallet->calculateAvailableBalance());
                            $wallet->setFrozenBalance($wallet->calculateFrozenBalance());
                            $wallet->setUpdatedAt(new \DateTimeImmutable());
                            $this->em->persist($wallet);
                            $this->em->flush();
                            $this->logger->info('Rebalanced wallet after capture of held funds', [
                                'paymentUid' => method_exists($payment, 'getUid') ? $payment->getUid() : null,
                                'walletId' => $wallet->getId(),
                            ]);
                        }
                    }
                } catch (\Throwable $e) {
                    $this->logger->error('Failed creating CREDIT ledger after payment status change', [
                        'error' => $e->getMessage(),
                        'paymentUid' => method_exists($payment, 'getUid') ? $payment->getUid() : null,
                    ]);
                }
            }
        }

        if ($this->toDebit) {
            $payments = $this->toDebit;
            $this->toDebit = [];
            foreach ($payments as $payment) {
                try {
                    $professional = $this->resolveProfessional($payment);
                    if (!$professional) {
                        $this->logger->warning('No professional user found for payment; skipping debit', [
                            'paymentUid' => method_exists($payment, 'getUid') ? $payment->getUid() : null,
                        ]);
                        continue;
                    }
                    $amount = (float) ($payment->getAmount() / 100);
                    $this->walletService->debitWallet($professional, $payment, $amount);
                } catch (\Throwable $e) {
                    $this->logger->error('Failed creating DEBIT ledger after payment status change', [
                        'error' => $e->getMessage(),
                        'paymentUid' => method_exists($payment, 'getUid') ? $payment->getUid() : null,
                    ]);
                }
            }
        }

        if ($this->toHold) {
            $payments = $this->toHold;
            $this->toHold = [];
            foreach ($payments as $payment) {
                try {
                    $professional = $this->resolveProfessional($payment);
                    if (!$professional) {
                        $this->logger->warning('No professional user found for payment; skipping hold', [
                            'paymentUid' => method_exists($payment, 'getUid') ? $payment->getUid() : null,
                        ]);
                        continue;
                    }
                    $this->walletService->holdFundsForAuthorization($professional, $payment);
                } catch (\Throwable $e) {
                    $this->logger->error('Failed creating HOLD ledger after payment status change', [
                        'error' => $e->getMessage(),
                        'paymentUid' => method_exists($payment, 'getUid') ? $payment->getUid() : null,
                    ]);
                }
            }
        }
    }

    private function normalizeStatus(mixed $status): ?PaymentStatusEnum
    {
        if ($status instanceof PaymentStatusEnum) {
            return $status;
        }
        if (is_string($status)) {
            return PaymentStatusEnum::tryFrom(strtolower($status))
                ?? PaymentStatusEnum::tryFrom($status);
        }
        return null;
    }

    private function isCreditStatus(?PaymentStatusEnum $status): bool
    {
        return match ($status) {
            PaymentStatusEnum::CAPTURED, PaymentStatusEnum::PARTIALLY_CAPTURED => true,
            default => false,
        };
    }

    private function isDebitStatus(?PaymentStatusEnum $status): bool
    {
        return match ($status) {
            PaymentStatusEnum::REFUNDED, PaymentStatusEnum::PARTIALLY_REFUNDED => true,
            default => false,
        };
    }

    private function isHoldStatus(?PaymentStatusEnum $status): bool
    {
        return $status === PaymentStatusEnum::AUTHORIZED;
    }

    private function resolveProfessional(Payment $payment): ?User
    {
        $bookingRef = method_exists($payment, 'getBooking') ? $payment->getBooking() : null;
        if ($bookingRef instanceof Booking) {
            return method_exists($bookingRef, 'getProfessionalUser') ? $bookingRef->getProfessionalUser() : null;
        }
        if ($bookingRef !== null) {
            $booking = $this->em->getRepository(Booking::class)->find((int) $bookingRef);
            if ($booking instanceof Booking && method_exists($booking, 'getProfessionalUser')) {
                return $booking->getProfessionalUser();
            }
        }
        return null;
    }
}
