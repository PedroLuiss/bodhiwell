<?php

namespace App\Command;

use App\Entity\Withdrawal;
use App\Repository\WithdrawalRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Ramsey\Uuid\Uuid;
use App\Enum\WithdrawalStatusEnum;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'app:withdrawals:cron',
    description: 'Genera retiros programados (día 15 y último día del mes).',
)]
class WithdrawalsCronCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em,
        private WithdrawalRepository $withdrawalRepo,
        private LoggerInterface $logger
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $today = new \DateTimeImmutable('today');
        $day   = (int) $today->format('d');
        $lastDay = (int) $today->format('t');

        if (!in_array($day, [15, $lastDay], true)) {
            $output->writeln('Hoy no corresponde ejecutar retiros programados.');
            return Command::SUCCESS;
        }

        $existing = $this->withdrawalRepo->findOneBy(['date' => $today]);
        if ($existing) {
            $output->writeln('Ya existe un retiro para esta fecha, no se duplica.');
            $this->logger->info('[WithdrawalsCron] ejecución idempotente', ['date' => $today->format('Y-m-d')]);
            return Command::SUCCESS;
        }

        $withdrawal = new Withdrawal();
        $withdrawal->setUid(Uuid::uuid4()->toString());
        $withdrawal->setDate($today);
        $withdrawal->setAmount('0.00');
        $withdrawal->setStatus(WithdrawalStatusEnum::PENDING);

        $this->withdrawalRepo->save($withdrawal);

        $output->writeln('Retiro programado creado: ' . $withdrawal->getUid());
        $this->logger->info('[WithdrawalsCron] retiro creado', [
            'uid' => $withdrawal->getUid(),
            'date' => $today->format('Y-m-d'),
        ]);

        return Command::SUCCESS;
    }
}
