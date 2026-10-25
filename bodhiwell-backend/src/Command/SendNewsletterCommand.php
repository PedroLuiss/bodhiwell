<?php

namespace App\Command;

use App\Entity\User;
use App\Enum\NotificationTypeEnum;
use App\Repository\UserRepository;
use App\Services\Notification\NotificationManager;
use App\Message\SendMassiveEmailMessage;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Messenger\Stamp\DelayStamp;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:send-newsletter',
    description: 'Sends a newsletter notification to all subscribed users.',
)]
class SendNewsletterCommand extends Command
{
    public function __construct(
        private UserRepository $userRepository,
        private NotificationManager $notificationManager,
        private MessageBusInterface $bus,
        private int $mailerDelayMs
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('title', InputArgument::REQUIRED, 'The title of the newsletter')
            ->addArgument('body', InputArgument::REQUIRED, 'The body content of the newsletter');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $title = $input->getArgument('title');
        $body = $input->getArgument('body');

        $io->title('Sending Newsletter');
        $io->text("Title: $title");
        $io->text("Body: $body");

        $users = $this->userRepository->findBy(['newsletterActive' => true]);
        $count = count($users);

        if ($count === 0) {
            $io->warning('No users subscribed to the newsletter.');
            return Command::SUCCESS;
        }

        $io->progressStart($count);

        $delay = 0;
        foreach ($users as $user) {
            try {
                $this->notificationManager->notifyUser(
                    $user,
                    NotificationTypeEnum::SYSTEM,
                    $title,
                    $body,
                    ['type' => 'newsletter']
                );

                $stamps = [];
                if ($delay > 0) {
                    $stamps[] = new DelayStamp($delay);
                }

                $this->bus->dispatch(
                    new SendMassiveEmailMessage(
                        $user->getId(),
                        $title,
                        $body
                    ),
                    $stamps
                );

                $delay += $this->mailerDelayMs;
            } catch (\Throwable $e) {
                $io->error(sprintf('Error dispatching for user %s: %s', $user->getEmail(), $e->getMessage()));
            }

            $io->progressAdvance();
        }

        $io->progressFinish();
        $io->success(sprintf('Newsletter sent to %d users.', $count));

        return Command::SUCCESS;
    }
}
