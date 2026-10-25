<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:test-email',
    description: 'Tests email sending from env config',
)]
class TestEmailCommand extends Command
{
    private MailerInterface $mailer;

    public function __construct(MailerInterface $mailer)
    {
        parent::__construct();
        $this->mailer = $mailer;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $toEmail = 'g3rardo21@gmail.com';

        // Try to get from address from env, fallback to a default
        $fromEmail = $_ENV['MAIL_FROM_ADDRESS'] ?? 'no-reply@bodhiwell.com';

        $io->title('Sending Test Email');
        $io->text("From: $fromEmail");
        $io->text("To: $toEmail");
        $io->text("Using DSN: " . ($_ENV['MAILER_DSN'] ?? 'Not set in $_ENV'));

        $email = (new Email())
            ->from($fromEmail)
            ->to($toEmail)
            ->subject('Test Email from Bodhiwell Backend')
            ->text('This is a test email to verify MAILER_DSN configuration is working properly.');

        try {
            $this->mailer->send($email);
            $io->success('Email sent successfully!');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error('Failed to send email: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
