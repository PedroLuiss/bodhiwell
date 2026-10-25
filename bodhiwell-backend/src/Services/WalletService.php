<?php

namespace App\Services;

use App\Entity\User;
use Ramsey\Uuid\Uuid;
use RuntimeException;
use App\Entity\Booking;
use App\Entity\Payment;
use App\Entity\Withdrawal;
use Doctrine\DBAL\LockMode;
use App\Entity\WalletLedger;
use Psr\Log\LoggerInterface;
use App\Entity\SystemSettings;
use App\Enum\PaymentStatusEnum;
use App\Entity\PlatformEarnings;
use App\Enum\TransactionTypeEnum;
use App\Entity\ProfessionalWallet;
use App\Enum\WithdrawalMethodEnum;
use App\Enum\WithdrawalStatusEnum;
use App\Enum\WalletLedgerConceptEnum;
use App\Enum\WalletOperationTypeEnum;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\ProfessionalWalletRepository;

class WalletService
{
    public function __construct(
        private EntityManagerInterface $em,
        private ProfessionalWalletRepository $walletRepo,
        private LoggerInterface $logger
    ) {}

    public function getOrCreateWalletForProfessional(User $professional): ProfessionalWallet
    {
        return $this->walletRepo->getOrCreateByProfessional($professional);
    }

    public function creditWallet(User $professional, Payment $payment): void
    {
        if ($payment->getStatus() !== PaymentStatusEnum::APPROVED) {
            $this->logger->warning('Attempt to credit wallet for non-approved payment', [
                'paymentUid' => $payment->getUid(),
                'status' => $payment->getStatus()?->value,
            ]);
            throw new RuntimeException('Payment is not approved');
        }

        if ($professional->getTypeAccount() !== 'professional') {
            $this->logger->warning('User is not a professional', [
                'userId' => $professional->getId(),
            ]);
            throw new RuntimeException('User is not a professional');
        }

        $existingLedger = $this->em->getRepository(WalletLedger::class)
            ->findOneBy(['payment' => $payment]);

        if ($existingLedger !== null) {
            $this->logger->info('Wallet already credited for payment, skipping', [
                'paymentUid' => $payment->getUid(),
                'ledgerId' => $existingLedger->getId(),
            ]);
            return;
        }

        try {
            $this->em->beginTransaction();

            $wallet = $this->walletRepo->getOrCreateByProfessional($professional);
            if ($wallet->getId()) {
                $this->em->lock($wallet, LockMode::PESSIMISTIC_WRITE);
            }

            $amount = $payment->getAmount() ?? 0.0;
            if ($amount <= 0.0) {
                throw new RuntimeException('Invalid payment amount for credit');
            }

            $ledger = new WalletLedger();
            $ledger->setWallet($wallet);
            $ledger->setPayment($payment);
            $ledger->setAmount($amount);
            $ledger->setOperationType(WalletOperationTypeEnum::CREDIT->value);
            $ledger->setConcept(WalletLedgerConceptEnum::PAYMENT);
            $this->em->persist($ledger);
            $this->em->flush();

            $newAvailable = $wallet->calculateAvailableBalance();
            $newFrozen = $wallet->calculateFrozenBalance();

            $wallet->setAvailableBalance($newAvailable);
            $wallet->setFrozenBalance($newFrozen);
            $wallet->setUpdatedAt(new \DateTimeImmutable());

            $this->em->persist($wallet);

            $this->logger->info('Wallet credited', [
                'professionalId' => $professional->getId(),
                'paymentUid' => $payment->getUid(),
                'amount' => $amount,
                'walletId' => $wallet->getId(),
            ]);

            $this->em->flush();
            $this->em->commit();
        } catch (\Throwable $e) {
            $this->em->rollback();
            $this->logger->error('Failed to credit wallet', [
                'error' => $e->getMessage(),
                'paymentUid' => $payment->getUid(),
                'professionalId' => $professional->getId(),
            ]);
            throw $e;
        }
    }

    public function debitWallet(User $professional, Payment $payment, float $amount, WalletLedgerConceptEnum $concept = WalletLedgerConceptEnum::ADJUSTMENT): void
    {
        if ($professional->getTypeAccount() !== 'professional') {
            $this->logger->warning('User is not a professional (debit)', [
                'userId' => $professional->getId(),
            ]);
            throw new RuntimeException('User is not a professional');
        }

        if ($amount <= 0) {
            throw new RuntimeException('Invalid debit amount');
        }

        $statusValue = $payment->getStatus()?->value;
        if ($statusValue !== PaymentStatusEnum::REFUNDED->value && $statusValue !== PaymentStatusEnum::PARTIALLY_REFUNDED->value) {
            $this->logger->info('Debit executed on payment not marked refunded (allowed)', [
                'paymentUid' => $payment->getUid(),
                'status' => $statusValue,
            ]);
        }

        try {
            $this->em->beginTransaction();
            $wallet = $this->walletRepo->getOrCreateByProfessional($professional);
            if ($wallet->getId()) {
                $this->em->lock($wallet, LockMode::PESSIMISTIC_WRITE);
            }

            $ledger = new WalletLedger();
            $ledger->setUid(Uuid::uuid4()->toString());
            $ledger->setWallet($wallet);
            $ledger->setPayment($payment);
            $ledger->setAmount($amount);
            $ledger->setOperationType('DEBIT');
            $ledger->setConcept($concept);
            $ledger->setCreatedAt(new \DateTimeImmutable());
            $this->em->persist($ledger);
            $this->em->flush();

            $wallet->setAvailableBalance($wallet->calculateAvailableBalance());
            $wallet->setFrozenBalance($wallet->calculateFrozenBalance());
            $wallet->setUpdatedAt(new \DateTimeImmutable());
            $this->em->persist($wallet);
            $this->em->flush();
            $this->em->commit();

            $this->logger->info('Wallet debited', [
                'professionalId' => $professional->getId(),
                'paymentUid' => $payment->getUid(),
                'amount' => $amount,
                'walletId' => $wallet->getId(),
            ]);
        } catch (\Throwable $e) {
            $this->em->rollback();
            $this->logger->error('Failed to debit wallet', [
                'error' => $e->getMessage(),
                'paymentUid' => $payment->getUid(),
                'professionalId' => $professional->getId(),
            ]);
            throw $e;
        }
    }

    public function holdFundsForAuthorization(User $professional, Payment $payment): void
    {
        if ($payment->getStatus() !== PaymentStatusEnum::AUTHORIZED) {
            throw new RuntimeException('Payment is not authorized');
        }

        if ($professional->getTypeAccount() !== 'professional') {
            throw new RuntimeException('User is not a professional');
        }

        $ledgerRepo = $this->em->getRepository(WalletLedger::class);
        $existing = $ledgerRepo->findOneBy(['payment' => $payment, 'operationType' => WalletOperationTypeEnum::CREDIT->value]);
        if ($existing) {
            $this->logger->info('Hold already exists for payment', ['paymentUid' => $payment->getUid()]);
            return;
        }

        $conn = $this->em->getConnection();
        $conn->beginTransaction();
        try {
            $wallet = $this->walletRepo->getOrCreateByProfessional($professional);
            if ($wallet->getId()) {
                $this->em->lock($wallet, LockMode::PESSIMISTIC_WRITE);
            }

            $amount = $payment->getAmount() ?? 0.0;
            if ($amount <= 0.0) {
                throw new RuntimeException('Invalid payment amount for hold');
            }

            $ledger = new WalletLedger();
            $ledger->setWallet($wallet);
            $ledger->setPayment($payment);
            $ledger->setAmount($amount);
            $ledger->setOperationType(WalletOperationTypeEnum::CREDIT->value);
            $ledger->setConcept(WalletLedgerConceptEnum::PAYMENT);
            $ledger->setCreatedAt(new \DateTimeImmutable());
            $this->em->persist($ledger);

            $newAvailable = $wallet->calculateAvailableBalance();
            $newFrozen = $wallet->calculateFrozenBalance();
            $wallet->setAvailableBalance($newAvailable);
            $wallet->setFrozenBalance($newFrozen);
            $wallet->setUpdatedAt(new \DateTimeImmutable());
            $this->em->persist($wallet);

            $this->em->flush();
            $conn->commit();

            $this->logger->info('Funds held (AUTHORIZED)', [
                'professionalId' => $professional->getId(),
                'paymentUid' => $payment->getUid(),
                'amount' => $amount,
                'walletId' => $wallet->getId(),
            ]);
        } catch (\Throwable $e) {
            $conn->rollBack();
            $this->logger->error('Failed to hold funds', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    public function processWithdrawal(Withdrawal $withdrawal, bool $flush = true): ?WalletLedger
    {
        if ($withdrawal->getStatus() !== WithdrawalStatusEnum::APPROVED) {
            return null;
        }

        $existingLedger = $this->em->getRepository(WalletLedger::class)->findOneBy(['withdrawal' => $withdrawal]);
        if ($existingLedger) {
            return null;
        }

        $wallet = $this->walletRepo->findOneBy(['professional' => $withdrawal->getProfessional()]);
        if (!$wallet) {
            throw new RuntimeException('Wallet not found for professional');
        }

        $ledger = new WalletLedger();
        $wallet->addWalletLedger($ledger);
        $ledger->setWithdrawal($withdrawal);
        $ledger->setAmount($withdrawal->getAmount());
        $ledger->setOperationType(WalletOperationTypeEnum::DEBIT->value);
        $ledger->setConcept(WalletLedgerConceptEnum::WITHDRAWAL);

        $this->em->persist($ledger);

        $wallet->setAvailableBalance($wallet->calculateAvailableBalance());
        $wallet->setFrozenBalance($wallet->calculateFrozenBalance());
        $this->em->persist($wallet);

        if ($flush) {
            $this->em->flush();
        }

        return $ledger;
    }

    public function rejectWithdrawal(Withdrawal $withdrawal, bool $flush = true): void
    {
        $this->em->beginTransaction();
        try {
            $walletEntity = $this->walletRepo->findOneBy(['professional' => $withdrawal->getProfessional()]);

            if (!$walletEntity) {
                throw new RuntimeException('Wallet not found for professional');
            }

            $wallet = $this->timeSensitiveFindOne($walletEntity->getId());
            if (!$wallet) {
                throw new RuntimeException('Wallet not found for professional');
            }
            $this->em->lock($wallet, LockMode::PESSIMISTIC_WRITE);

            $amount = $withdrawal->getAmount();

            $ledger = new WalletLedger();
            $ledger->setWallet($wallet);
            $ledger->setWithdrawal($withdrawal);
            $ledger->setAmount($amount);
            $ledger->setOperationType(WalletOperationTypeEnum::CREDIT->value);
            $ledger->setConcept(WalletLedgerConceptEnum::WITHDRAWAL_REJECTED);
            $this->em->persist($ledger);

            $wallet->setAvailableBalance($wallet->getAvailableBalance() + $amount);
            $wallet->setUpdatedAt(new \DateTimeImmutable());
            $this->em->persist($wallet);

            $this->em->flush();
            $this->em->commit();

            $this->logger->info('Withdrawal rejected and refunded', [
                'withdrawalId' => $withdrawal->getId(),
                'walletId' => $wallet->getId(),
                'amount' => $amount
            ]);
        } catch (\Throwable $e) {
            $this->em->rollback();
            $this->logger->error('Failed to reject withdrawal', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    public function freezeFundsForBooking(Booking $booking): void
    {
        $professional = $booking->getProfessionalUser();
        $payments = $booking->getPayments();
        $updatesMade = false;

        $this->em->beginTransaction();
        try {
            $wallet = $this->getOrCreateWalletForProfessional($professional);
            if ($wallet->getId()) {
                $this->em->lock($wallet, LockMode::PESSIMISTIC_WRITE);
            }

            foreach ($payments as $payment) {
                if ($payment->getStatus() === PaymentStatusEnum::APPROVED) {
                    $existingLedger = $this->em->getRepository(WalletLedger::class)->findOneBy([
                        'payment' => $payment,
                        'concept' => WalletLedgerConceptEnum::INCOME_ON_HOLD
                    ]);

                    if (!$existingLedger) {
                        $amount = $payment->getAmount() ?? 0.0;
                        if ($amount > 0) {
                            $wallet->setFrozenBalance($wallet->getFrozenBalance() + $amount);

                            $ledger = new WalletLedger();
                            $ledger->setWallet($wallet);
                            $ledger->setAmount($amount);
                            $ledger->setOperationType(WalletOperationTypeEnum::CREDIT->value);
                            $ledger->setConcept(WalletLedgerConceptEnum::INCOME_ON_HOLD);
                            $ledger->setPayment($payment);

                            $this->em->persist($ledger);
                            $updatesMade = true;
                        }
                    }
                }
            }

            if ($updatesMade) {
                $this->em->persist($wallet);
                $this->em->flush();
                $this->logger->info('Funds frozen for booking (incremental)', [
                    'bookingUid' => $booking->getUid(),
                    'walletId' => $wallet->getId()
                ]);
            }

            $this->em->commit();
        } catch (\Throwable $e) {
            $this->em->rollback();
            $this->logger->error('Failed to freeze funds for booking', [
                'error' => $e->getMessage(),
                'bookingUid' => $booking->getUid()
            ]);
            throw $e;
        }
    }

    public function processBookingCompletion(Booking $booking): void
    {
        $professional = $booking->getProfessionalUser();
        $payments = $booking->getPayments();
        $totalAmount = 0;
        foreach ($payments as $payment) {
            if ($payment->getStatus() === PaymentStatusEnum::APPROVED) {
                $totalAmount += ($payment->getAmount() ?? 0.0);
            }
        }

        if ($totalAmount <= 0) {
            $this->logger->warning('No approved payments found for booking completion', ['bookingUid' => $booking->getUid()]);
            return;
        }

        $this->em->beginTransaction();
        try {
            $wallet = $this->getOrCreateWalletForProfessional($professional);
            if ($wallet->getId()) {
                $this->em->lock($wallet, LockMode::PESSIMISTIC_WRITE);
            }

            $systemSettingsRepo = $this->em->getRepository(SystemSettings::class);
            $commissionSetting = $systemSettingsRepo->findOneBy(['settingKey' => 'booking_commission_percentage']);
            $commissionPercentage = $commissionSetting ? (float)$commissionSetting->getSettingValue() : 15.0;

            $commissionAmount = round($totalAmount * ($commissionPercentage / 100), 2);
            $netProfessional = $totalAmount - $commissionAmount;

            $newFrozen = $wallet->getFrozenBalance() - $totalAmount;
            if ($newFrozen < 0) $newFrozen = 0;
            $wallet->setFrozenBalance($newFrozen);

            $wallet->setAvailableBalance($wallet->getAvailableBalance() + $netProfessional);

            $this->em->persist($wallet);

            $ledger = new WalletLedger();
            $ledger->setWallet($wallet);
            $ledger->setAmount($netProfessional);
            $lastApprovedPayment = $payments->filter(fn($p) => $p->getStatus() === PaymentStatusEnum::APPROVED)->last();
            $ledger->setPayment($lastApprovedPayment ?: null);
            $ledger->setOperationType(WalletOperationTypeEnum::CREDIT->value);
            $ledger->setConcept(WalletLedgerConceptEnum::FUNDS_RELEASE);
            $this->em->persist($ledger);

            $earnings = new PlatformEarnings();
            $earnings->setBooking($booking);
            $earnings->setAmount($commissionAmount);
            $earnings->setCommissionPercentage((string)$commissionPercentage);
            $this->em->persist($earnings);

            $this->em->flush();
            $this->em->commit();

            $this->logger->info('Booking completion processed: Funds released and commission applied', [
                'bookingUid' => $booking->getUid(),
                'total' => $totalAmount,
                'commission' => $commissionAmount,
                'net' => $netProfessional
            ]);
        } catch (\Throwable $e) {
            $this->em->rollback();
            $this->logger->error('Failed to process booking completion', [
                'error' => $e->getMessage(),
                'bookingUid' => $booking->getUid()
            ]);
            throw $e;
        }
    }

    public function createAutomaticWithdrawal(ProfessionalWallet $wallet, string $reason = 'Corte quincenal automático', ?WithdrawalMethodEnum $method = null)
    {
        $this->em->beginTransaction();
        try {
            $wallet = $this->timeSensitiveFindOne($wallet->getId());
            $this->em->lock($wallet, LockMode::PESSIMISTIC_WRITE);

            $balance = $wallet->getAvailableBalance();

            if ($balance <= 0) {
                $this->em->rollback();
                throw new \RuntimeException('Wallet has no available balance.');
            }

            $withdrawal = new Withdrawal();
            $withdrawal->setProfessional($wallet->getProfessional());
            $withdrawal->setStatus(WithdrawalStatusEnum::PENDING);
            $withdrawal->setAmount((string) $balance);
            $withdrawal->setReason($reason);
            if ($method) {
                $withdrawal->setWithdrawalMethod($method);
            }
            $this->em->persist($withdrawal);

            $ledger = new WalletLedger();
            $ledger->setWallet($wallet);
            $ledger->setWithdrawal($withdrawal);
            $ledger->setAmount($balance);
            $ledger->setOperationType(WalletOperationTypeEnum::DEBIT->value);
            $ledger->setConcept(WalletLedgerConceptEnum::WITHDRAWAL_REQUEST);
            $this->em->persist($ledger);

            $wallet->setAvailableBalance(0);
            $wallet->setUpdatedAt(new \DateTimeImmutable());
            $this->em->persist($wallet);

            $this->em->flush();
            $this->em->commit();

            $this->logger->info('Automatic withdrawal generated', [
                'walletId' => $wallet->getId(),
                'professionalId' => $wallet->getProfessional()->getId(),
                'amount' => $balance
            ]);
        } catch (\Throwable $e) {
            $this->em->rollback();
            $this->logger->error('Failed to generate automatic withdrawal', [
                'walletId' => $wallet->getId(),
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    private function timeSensitiveFindOne(int $id): ?ProfessionalWallet
    {
        return $this->em->find(ProfessionalWallet::class, $id);
    }
}
