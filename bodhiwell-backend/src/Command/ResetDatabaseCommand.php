<?php

namespace App\Command;

use Doctrine\DBAL\Connection;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

#[AsCommand(
    name: 'app:db:reset',
    description: 'Borra todos los registros de la base de datos. Solo disponible en entornos no productivos.'
)]
class ResetDatabaseCommand extends Command
{
    public function __construct(
        private Connection $connection,
        #[Autowire('%kernel.environment%')]
        private string $appEnv
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $env = strtolower(trim($this->appEnv));
        if (in_array($env, ['prod', 'production'], true)) {
            $io->error('Este comando está deshabilitado en el entorno de producción.');
            return Command::FAILURE;
        }

        $io->warning('¡Atención! Se borrarán TODOS los registros de TODAS las tablas.');
        $io->text('Entorno actual: <fg=yellow>' . $env . '</>');
        $io->text('Única tabla que se CONSERVA (control interno): <info>doctrine_migration_versions</info>');
        $io->newLine();

        if (!$io->confirm('¿Deseas continuar?', false)) {
            $io->comment('Operación cancelada.');
            return Command::SUCCESS;
        }

        $dbName = $this->connection->getDatabase();
        $rows = $this->connection->fetchAllAssociative(
            'SELECT TABLE_NAME FROM information_schema.TABLES
             WHERE TABLE_SCHEMA = :db AND TABLE_TYPE = "BASE TABLE"
             AND TABLE_NAME != "doctrine_migration_versions"
             ORDER BY TABLE_NAME',
            ['db' => $dbName]
        );
        $tables = array_column($rows, 'TABLE_NAME');

        if (empty($tables)) {
            $io->comment('No se encontraron tablas para vaciar.');
            return Command::SUCCESS;
        }

        $this->connection->executeStatement('SET FOREIGN_KEY_CHECKS=0');
        $io->progressStart(count($tables));

        $truncated = [];
        $errors = [];

        foreach ($tables as $table) {
            try {
                $this->connection->executeStatement('TRUNCATE TABLE `' . $table . '`');
                $truncated[] = $table;
            } catch (\Throwable $e) {
                $errors[$table] = $e->getMessage();
            }
            $io->progressAdvance();
        }

        $this->connection->executeStatement('SET FOREIGN_KEY_CHECKS=1');
        $io->progressFinish();

        if (!empty($errors)) {
            foreach ($errors as $table => $msg) {
                $io->error("Error al truncar '$table': $msg");
            }
        }

        $io->success(sprintf('%d tabla(s) vaciada(s) correctamente.', count($truncated)));

        $io->note([
            'Para crear un usuario administrador ejecuta:',
            '  php bin/console app:user:create <email> --admin --first=Admin --last=User --password=<pass>',
        ]);

        return Command::SUCCESS;
    }
}
