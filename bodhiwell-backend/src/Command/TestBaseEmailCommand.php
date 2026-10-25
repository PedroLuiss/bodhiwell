<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:test-base-email',
    description: 'Tests the base email template layout by sending a dummy email to a specified address.',
)]
class TestBaseEmailCommand extends Command
{
    private MailerInterface $mailer;

    public function __construct(MailerInterface $mailer)
    {
        parent::__construct();
        $this->mailer = $mailer;
    }

    protected function configure(): void
    {
        $this->addArgument('email', InputArgument::REQUIRED, 'The recipient email address.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $toEmail = $input->getArgument('email');

        $fromEmail = $_ENV['MAIL_FROM_ADDRESS'] ?? 'no-reply@bodhiwell.com';

        $io->title('Sending Test Baese Email Template');
        $io->text("From: $fromEmail");
        $io->text("To: $toEmail");

        $email = (new TemplatedEmail())
            ->from($fromEmail)
            ->to($toEmail)
            ->subject('Test Base Template - Bodhiwell')
            ->htmlTemplate('emails/test_base_wrapper.html.twig');

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
