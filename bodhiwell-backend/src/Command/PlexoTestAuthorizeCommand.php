<?php

namespace App\Command;

use App\Services\PlexoClient;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:plexo:test-authorize',
    description: 'Prueba la llamada authorize a Plexo con firma válida',
)]
class PlexoTestAuthorizeCommand extends Command
{
    public function __construct(private PlexoClient $plexoClient)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $request = [
            "Action" => 3,
            "ClientInformation" => [
                "Name" => "Francisco Vidal",
                "Address" => "Av Italia 2020",
                "Email" => "fvidal@plexo.com.uy",
                "Identification" => "12345678",
                "IdentificationType" => "0",
            ],
            "DoNotUseCallback" => false,
            "LimitIssuers" => ["4", "4_1", "13"],
            "MetaReference" => "19099997",
            "RedirectUri" => "https://api-dev-bdw.softmena.dev/webhook/plexo/transaction",
            "Type" => 0,
        ];

        $io->section('Enviando request authorize a Plexo...');
        try {
            $response = $this->plexoClient->authorize($request);
            $io->success('Respuesta recibida correctamente:');
            $io->writeln(json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            return Command::SUCCESS;
        } catch (\Throwable $e) {
            $io->error('Error al ejecutar la prueba: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
