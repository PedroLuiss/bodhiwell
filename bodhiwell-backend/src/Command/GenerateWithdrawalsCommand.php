<?php

namespace App\Command;

use Psr\Log\LoggerInterface;
use App\Services\WalletService;
use Symfony\Component\Console\Command\Command;
use App\Repository\ProfessionalWalletRepository;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'app:generate-withdrawals',
    description: 'Generates automatic withdrawals for professionals on the 15th and last day of the month.',
)]
class GenerateWithdrawalsCommand extends Command
{
    public function __construct(
        private ProfessionalWalletRepository $walletRepo,
        private WalletService $walletService,
        private LoggerInterface $logger
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption('force', null, InputOption::VALUE_NONE, 'Generar retiros sin importar la fecha');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $force = $input->getOption('force');
        $today = new \DateTimeImmutable("America/Montevideo");

        $day = (int) $today->format('d');
        $lastDay = (int) $today->format('t');

        $isPayday = ($day === 15) || ($day === $lastDay);

        if (!$isPayday && !$force) {
            $io->warning("Today is not a scheduled withdrawal day (15th or End of Month). Skipping. Use --force to bypass.");
            $this->logger->info("GenerateWithdrawalsCommand skipped: Not a payday ($day / $lastDay).");
            // Returning SUCCESS as this is valid logic (cron runs daily)
            return Command::SUCCESS;
        }

        $io->title('Starting Automatic Withdrawal Generation');
        $this->logger->info("Starting Automatic Withdrawal Generation");

        $queryBuilder = $this->walletRepo->createQueryBuilder('w')
            ->where('w.availableBalance > 0')
            ->andWhere('w.status = :status')
            ->setParameter('status', 'active');

        $iterableResult = $queryBuilder->getQuery()->toIterable();

        $processedCount = 0;
        $errorCount = 0;

        foreach ($iterableResult as $wallet) {
            try {
                $this->walletService->createAutomaticWithdrawal($wallet);
                $processedCount++;
                if ($processedCount % 100 === 0) {
                    $io->text("Processed $processedCount wallets...");
                }
            } catch (\Throwable $e) {
                $errorCount++;
                $io->error("Failed processing wallet ID {$wallet->getId()}: {$e->getMessage()}");
            }
        }

        $io->success("Finished! Processed: $processedCount. Errors: $errorCount.");
        $this->logger->info("Finished Automatic Withdrawal Generation. Processed: $processedCount. Errors: $errorCount.");

        return $errorCount > 0 ? Command::FAILURE : Command::SUCCESS;
    }
}
