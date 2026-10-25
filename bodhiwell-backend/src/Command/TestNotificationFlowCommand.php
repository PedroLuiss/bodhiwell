<?php

namespace App\Command;

use App\Entity\User;
use App\Enum\NotificationTypeEnum;
use App\Services\Notification\NotificationManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:test-notification-flow',
    description: 'Simula eventos para probar notificaciones.',
)]
class TestNotificationFlowCommand extends Command
{
    public function __construct(
        private NotificationManager $notificationManager,
        private EntityManagerInterface $em
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addArgument('email', InputArgument::REQUIRED, 'Email del usuario a notificar');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $email = $input->getArgument('email');

        $user = $this->em->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) {
            $io->error("Usuario no encontrado: $email");
            return Command::FAILURE;
        }

        $io->section("Probando notificaciones para: " . $user->getEmail());

        // 1. Simular Reserva (Booking)
        $io->text("1. Enviando simulación de Reserva...");
        $this->notificationManager->notifyUser(
            $user,
            NotificationTypeEnum::BOOKING,
            'Nueva Reserva (Test)',
            'Un consultante ha reservado una cita contigo.',
            ['booking_id' => 123]
        );

        // 2. Simular Pago (Payment)
        $io->text("2. Enviando simulación de Pago...");
        $this->notificationManager->notifyUser(
            $user,
            NotificationTypeEnum::PAYMENT,
            'Pago Recibido (Test)',
            'Has recibido un pago de $50.00.',
            ['transaction_id' => 999]
        );

        // 3. Simular Sistema (System/Welcome)
        $io->text("3. Enviando simulación de Sistema...");
        $this->notificationManager->notifyUser(
            $user,
            NotificationTypeEnum::SYSTEM,
            'Bienvenido (Test)',
            'Gracias por registrarte en Bodhiwell.',
            []
        );

        $io->success("Notificaciones enviadas. Revisa la tabla 'notification' y los logs.");
        return Command::SUCCESS;
    }
}
