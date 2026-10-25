<?php

namespace App\Command;

use App\Entity\Payment;
use App\Enum\PaymentStatusEnum;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:payment:update-status', description: 'Actualiza el status de un Payment y dispara el listener')]
class UpdatePaymentStatusCommand extends Command
{
    public function __construct(private EntityManagerInterface $em)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('paymentUid', InputArgument::REQUIRED, 'UID del Payment')
            ->addArgument('status', InputArgument::REQUIRED, 'Nuevo status (pending, authorized, captured, partially_captured, refunded, partially_refunded)');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $uid    = $input->getArgument('paymentUid');
        $status = $input->getArgument('status');

        $payment = $this->em->getRepository(Payment::class)->findOneBy(['uid' => $uid]);
        if (!$payment) {
            $output->writeln('Payment no encontrado.');
            return Command::FAILURE;
        }

        $enumValues = array_map(fn($e) => $e->value, PaymentStatusEnum::cases());
        if (!in_array($status, $enumValues, true)) {
            $output->writeln('Status inválido. Permitidos: ' . implode(', ', $enumValues));
            return Command::FAILURE;
        }

        $payment->setStatus(PaymentStatusEnum::from($status));
        $this->em->flush();

        $output->writeln("Status actualizado a {$status}. Listener ejecutado (si aplica).");
        return Command::SUCCESS;
    }
}
