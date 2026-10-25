<?php

namespace App\Command;

use App\Entity\ProfessionalWallet;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:wallets:reconcile', description: 'Verifica y reconcilia availableBalance/frozenBalance con los valores calculados.')]
class WalletsReconcileCommand extends Command
{
    public function __construct(private EntityManagerInterface $em, private LoggerInterface $logger)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption('fix', null, InputOption::VALUE_NONE, 'Si se establece, corrige los balances desalineados.')
            ->addOption('limit', null, InputOption::VALUE_OPTIONAL, 'Procesa solo los primeros N wallets.', null);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $fix   = (bool) $input->getOption('fix');
        $limit = $input->getOption('limit') !== null ? (int) $input->getOption('limit') : null;

        $repo = $this->em->getRepository(ProfessionalWallet::class);
        $wallets = $repo->findAll();
        if ($limit !== null) {
            $wallets = array_slice($wallets, 0, $limit);
        }

        $scanned = 0;
        $mismatches = 0;
        $corrected = 0;

        foreach ($wallets as $wallet) {
            ++$scanned;
            $storedAvailable = (string) $wallet->getAvailableBalance();
            $storedFrozen    = (string) $wallet->getFrozenBalance();
            $calcAvailable   = (string) $wallet->calculateAvailableBalance();
            $calcFrozen      = (string) $wallet->calculateFrozenBalance();

            $availableMismatch = $storedAvailable !== $calcAvailable;
            $frozenMismatch    = $storedFrozen !== $calcFrozen;

            if ($availableMismatch || $frozenMismatch) {
                ++$mismatches;
                $msg = sprintf(
                    'Wallet %s mismatch: stored (A:%s F:%s) vs calc (A:%s F:%s)',
                    $wallet->getUid(),
                    $storedAvailable,
                    $storedFrozen,
                    $calcAvailable,
                    $calcFrozen
                );
                $this->logger->warning($msg);
                $output->writeln('<comment>' . $msg . '</comment>');

                if ($fix) {
                    $wallet->setAvailableBalance($calcAvailable);
                    $wallet->setFrozenBalance($calcFrozen);
                    ++$corrected;
                }
            }
        }

        if ($fix && $corrected > 0) {
            $this->em->flush();
        }

        $summary = sprintf(
            'Reconcile summary: scanned=%d mismatches=%d corrected=%d fix=%s',
            $scanned,
            $mismatches,
            $corrected,
            $fix ? 'yes' : 'no'
        );
        $output->writeln('<info>' . $summary . '</info>');
        $this->logger->info($summary);

        return Command::SUCCESS;
    }
}
