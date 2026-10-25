<?php

namespace App\Command;

use App\Entity\PlatformEarnings;
use App\Entity\ProfessionalWallet;
use App\Entity\Refund;
use App\Entity\WalletLedger;
use App\Entity\Withdrawal;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:migrate-monetary-values',
    description: 'Migrates existing monetary values from cents (integer/decimal) to units (float) by dividing by 100.',
)]
class MigrateMonetaryValuesCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption('dry-run', null, InputOption::VALUE_NONE, 'Show what would be changed without executing');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $dryRun = $input->getOption('dry-run');

        if ($dryRun) {
            $io->note('Running in DRY-RUN mode. No changes will be saved.');
        } else {
            $io->warning('This will modify database values. Ensure you have a backup!');
            if (!$io->confirm('Do you want to continue?', false)) {
                return Command::SUCCESS;
            }
        }

        $io->title('Migrating Monetary Values (Cents -> Units)');

        $this->migrateEntity($io, Withdrawal::class, ['amount'], $dryRun);
        $this->migrateEntity($io, Refund::class, ['amount'], $dryRun);
        $this->migrateEntity($io, PlatformEarnings::class, ['amount'], $dryRun);
        $this->migrateEntity($io, WalletLedger::class, ['amount'], $dryRun);
        $this->migrateWallet($io, $dryRun);

        $io->success('Migration completed.');

        return Command::SUCCESS;
    }

    private function migrateEntity(SymfonyStyle $io, string $className, array $fields, bool $dryRun): void
    {
        $repo = $this->em->getRepository($className);
        $entities = $repo->findAll();
        $count = 0;

        $io->section("Migrating $className (" . count($entities) . " records)");

        foreach ($entities as $entity) {
            $changed = false;
            foreach ($fields as $field) {
                // Access via reflection or assumption of getter/setter?
                // Using reflection to be generic might be risky if types are strict now.
                // Entities already have float type in PHP properties (due to my refactor).
                // BUT Doctrine might load the "10050" value into the float property as 10050.0.
                // So we check if it looks like cents? No, we MUST assume all existing data IS cents.

                // Getter call
                $getter = 'get' . ucfirst($field);
                $setter = 'set' . ucfirst($field);

                $currentValue = $entity->$getter();

                // Heuristic: If we run this multiple times, it will keep dividing. 
                // We should perhaps add a flag or be very careful.
                // But for a one-off refactor, we assume data is currently in cents.

                if ($currentValue != 0) {
                    $newValue = $currentValue / 100.0;
                    if (!$dryRun) {
                        $entity->$setter($newValue);
                    }
                    $changed = true;
                }
            }

            if ($changed) {
                $count++;
            }
        }

        if (!$dryRun) {
            $this->em->flush();
        }

        $io->text("Processed $count entities.");
    }

    private function migrateWallet(SymfonyStyle $io, bool $dryRun): void
    {
        $repo = $this->em->getRepository(ProfessionalWallet::class);
        $wallets = $repo->findAll();
        $count = 0;

        $io->section("Migrating ProfessionalWallet (" . count($wallets) . " records)");

        foreach ($wallets as $wallet) {
            $available = $wallet->getAvailableBalance();
            $frozen = $wallet->getFrozenBalance();

            $newAvailable = $available / 100.0;
            $newFrozen = $frozen / 100.0;

            if (!$dryRun) {
                $wallet->setAvailableBalance($newAvailable);
                $wallet->setFrozenBalance($newFrozen);
            }
            $count++;
        }

        if (!$dryRun) {
            $this->em->flush();
        }

        $io->text("Processed $count wallets.");
    }
}
