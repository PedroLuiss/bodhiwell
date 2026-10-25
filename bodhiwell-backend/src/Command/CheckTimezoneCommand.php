<?php

namespace App\Command;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:check-timezone',
    description: 'Verifies the PHP and Database timezone configuration.',
)]
class CheckTimezoneCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $phpTz = date_default_timezone_get();
        $phpNow = new \DateTime();

        $io->section('PHP Configuration');
        $io->text("Default Timezone: <info>$phpTz</info>");
        $io->text("Current Time: <info>" . $phpNow->format('Y-m-d H:i:s P') . "</info>");

        if ($phpTz !== 'America/Montevideo') {
            $io->error('PHP Timezone is NOT America/Montevideo!');
        } else {
            $io->success('PHP Timezone is correct.');
        }

        $io->section('Database Configuration');
        try {
            $conn = $this->em->getConnection();

            $platform = $conn->getDatabasePlatform();
            if ($platform instanceof \Doctrine\DBAL\Platforms\PostgreSQLPlatform) {
                $sql = "SELECT current_setting('TIMEZONE') as tz, NOW() as time";
            } else {
                $sql = "SELECT @@session.time_zone as tz, NOW() as time";
            }

            $result = $conn->executeQuery($sql)->fetchAssociative();

            $io->text("DB Session Timezone: <info>" . $result['tz'] . "</info>");
            $io->text("DB Current Time: <info>" . $result['time'] . "</info>");

            if ($result['tz'] === 'America/Montevideo' || $result['tz'] === '-03:00') {
                $io->success('Database Timezone is correct.');
            } else {
                $io->warning('Database Timezone might be incorrect (expected America/Montevideo).');
            }
        } catch (\Throwable $e) {
            $io->error('Failed to query database: ' . $e->getMessage());
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
