<?php

namespace App\Command;

use App\Entity\ProfessionalWallet;
use App\Entity\User;
use App\Entity\WalletLedger;
use App\Enum\WalletStatusEnum;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:test:populate-wallet',
    description: 'Populates a professional wallet with test data to validate the admin view.',
)]
class PopulateWalletTestCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $professional = $this->entityManager->getRepository(User::class)->findOneBy([]);

        $users = $this->entityManager->getRepository(User::class)->findAll();
        foreach ($users as $user) {
            if (in_array('ROLE_PROFESSIONAL', $user->getRoles()) || in_array('ROLE_ADMIN', $user->getRoles())) {
                $professional = $user;
                break;
            }
        }

        if (!$professional) {
            $io->error('No professional user found.');
            return Command::FAILURE;
        }

        $io->section('Updating Wallet for User: ' . $professional->getEmail());

        $wallet = $this->entityManager->getRepository(ProfessionalWallet::class)->findOneBy(['professional' => $professional]);

        if (!$wallet) {
            $wallet = new ProfessionalWallet();
            $wallet->setProfessional($professional);
            $this->entityManager->persist($wallet);
            $io->text('Created new wallet.');
        } else {
            $io->text('Found existing wallet.');
        }

        $wallet->setStatus(WalletStatusEnum::ACTIVE->value);
        $io->text('Set Status to ACTIVE.');

        $ledger1 = new WalletLedger();
        $ledger1->setWallet($wallet);
        $ledger1->setAmount(500000);
        $ledger1->setOperationType('CREDIT');
        $ledger1->initUidAndCreatedAt();
        $this->entityManager->persist($ledger1);
        $io->text('Added Credit: 5,000.00');

        $ledger2 = new WalletLedger();
        $ledger2->setWallet($wallet);
        $ledger2->setAmount(100000);
        $ledger2->setOperationType('DEBIT');
        $ledger2->initUidAndCreatedAt();
        $this->entityManager->persist($ledger2);
        $io->text('Added Debit: 1,000.00');

        $wallet->setAvailableBalance(400000);

        $wallet->setFrozenBalance(150000);

        $wallet->setUpdatedAt(new \DateTimeImmutable());

        $this->entityManager->flush();

        $io->success('Wallet updated successfully! Check the Admin Panel.');
        $io->table(
            ['Field', 'Value'],
            [
                ['User', $professional->getEmail()],
                ['Status', $wallet->getStatus()],
                ['Available Balance', number_format($wallet->getAvailableBalance() / 100, 2)],
                ['Frozen Balance', number_format($wallet->getFrozenBalance() / 100, 2)],
                ['Total Balance (Calculated)', number_format($wallet->getBalanceTotal() / 100, 2)],
            ]
        );

        return Command::SUCCESS;
    }
}
