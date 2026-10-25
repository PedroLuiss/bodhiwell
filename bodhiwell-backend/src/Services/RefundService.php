<?php

namespace App\Services;

use App\Entity\Refund;
use App\Enum\RefundStatus;
use App\Entity\ProfessionalWallet;
use App\Entity\WalletLedger;
use App\Entity\Booking;
use App\Entity\User;
use App\Repository\RefundRepository;
use App\Repository\ProfessionalWalletRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use App\Services\PlexoClient;
use App\Services\PaymentService;
use App\Enum\PaymentStatusEnum;
use App\Enum\WalletLedgerConceptEnum;

class RefundService
{
    public function __construct(
        private RefundRepository $refundRepository,
        private ProfessionalWalletRepository $walletRepository,
        private EntityManagerInterface $em,
        private ValidatorInterface $validator,
        private PlexoClient $plexoClient,
        private PaymentService $paymentService,
    ) {}

    public function createRefund(User $patient, User $professional, Booking $booking, int $amount, string $reason, ?Refund $existingRefund = null, ?string $refundMethod = null): Refund
    {
        if (empty($reason) || !$booking) {
            throw new \InvalidArgumentException('Motivo y reserva son obligatorios');
        }

        $now = new \DateTimeImmutable();
        $maxDays = 100;
        if ($booking->getDateBookingEnd() < $now->modify('-' . $maxDays . ' days')) {
            throw new \DomainException('El plazo para solicitar reembolso ha expirado');
        }

        $refund = $existingRefund ?? new Refund();
        $refund->setPatient($patient);
        $professional->addProfessionalRefund($refund);
        $refund->setBooking($booking);
        $refund->setAmount($amount);
        $refund->setReason($reason);
        $refund->setRefundMethod($refundMethod);
        if (!$refund->getStatus()) {
            $refund->setStatus(RefundStatus::REVIEW);
        }

        $this->refundRepository->save($refund);

        $wallet = $this->walletRepository->findOneBy(['professional' => $professional]);
        if (!$wallet) {
            throw new \DomainException('No se encontró la billetera del profesional');
        }

        $wallet->setAvailableBalance($wallet->calculateAvailableBalance());
        $wallet->setFrozenBalance($wallet->calculateFrozenBalance());
        $this->em->persist($wallet);
        $this->em->flush();

        return $refund;
    }

    public function approveRefund(Refund $refund, User $admin, ?string $adminNote = null): void
    {
        if ($refund->getStatus() !== RefundStatus::REVIEW) {
            throw new \DomainException('Solo se pueden aprobar reembolsos en revisión');
        }

        $paymentToRefund = null;
        foreach ($refund->getBooking()->getPayments() as $payment) {
            if (in_array($payment->getStatus(), [PaymentStatusEnum::CAPTURED->value, PaymentStatusEnum::AUTHORIZED->value])) {
                $paymentToRefund = $payment;
                break;
            }
        }

        if ($paymentToRefund && $paymentToRefund->getPlexoPaymentId()) {
            try {
                $this->plexoClient->refundPayment($paymentToRefund->getPlexoPaymentId(), (float)($refund->getAmount() / 100));
                $this->paymentService->updatePaymentStatus($paymentToRefund, PaymentStatusEnum::REFUNDED);
            } catch (\Throwable $e) {
                throw new \RuntimeException('Error al procesar el reembolso en la pasarela: ' . $e->getMessage(), 0, $e);
            }
        }

        $refund->setStatus(RefundStatus::APPROVED);
        $refund->setResolvedAt(new \DateTimeImmutable());
        $refund->setUpdatedAt(new \DateTimeImmutable());
        if ($adminNote) {
            $refund->setAdminNote($adminNote);
        }
        $this->refundRepository->save($refund);

        $wallet = $this->walletRepository->findOneBy(['professional' => $refund->getProfessional()]);
        $wallet->setFrozenBalance($wallet->getFrozenBalance() - $refund->getAmount());
        $this->em->persist($wallet);

        $ledger = new WalletLedger();
        $ledger->setAmount($refund->getAmount());
        $ledger->setOperationType('DEBIT');
        $ledger->setConcept(WalletLedgerConceptEnum::REFUND);
        $ledger->setRefund($refund);
        $ledger->setCreatedAt(new \DateTimeImmutable());
        $wallet->addWalletLedger($ledger);
        $this->em->persist($ledger);

        $wallet->setAvailableBalance($wallet->calculateAvailableBalance());
        $wallet->setFrozenBalance($wallet->calculateFrozenBalance());
        $this->em->persist($wallet);
        $this->em->flush();
    }

    public function rejectRefund(Refund $refund, User $admin, ?string $adminNote = null): void
    {
        if ($refund->getStatus() !== RefundStatus::REVIEW) {
            throw new \DomainException('Solo se pueden rechazar reembolsos en revisión');
        }
        $refund->setStatus(RefundStatus::REJECTED);
        $refund->setResolvedAt(new \DateTimeImmutable());
        $refund->setUpdatedAt(new \DateTimeImmutable());
        if ($adminNote) {
            $refund->setAdminNote($adminNote);
        }
        $this->refundRepository->save($refund);

        $wallet = $this->walletRepository->findOneBy(['professional' => $refund->getProfessional()]);

        $wallet->setAvailableBalance($wallet->calculateAvailableBalance());
        $wallet->setFrozenBalance($wallet->calculateFrozenBalance());
        $this->em->persist($wallet);
        $this->em->flush();
    }

    public function getWalletForProfessional(User $professional): ?ProfessionalWallet
    {
        return $this->walletRepository->findOneBy(['professional' => $professional]);
    }
}
