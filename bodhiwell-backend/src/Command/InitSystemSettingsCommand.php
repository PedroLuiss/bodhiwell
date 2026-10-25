<?php

namespace App\Command;

use App\Entity\SystemSettings;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:settings:init',
    description: 'Initializes system settings if they do not exist',
)]
class InitSystemSettingsCommand extends Command
{
    private const REQUIRED_SETTINGS = [
        'booking_commission_percentage' => '15.00',
        'default_about_fallback' => 'En Bodhiwell creemos que cada profesional acompaña desde una mirada propia, integrando experiencia, formación y propósito personal. Este espacio refleja la diversidad de enfoques que enriquecen la comunidad y el acompañamiento del bienestar humano.',
        'default_professional_info_fallback' => 'La comunidad Bodhiwell reúne profesionales con trayectorias y formaciones diversas, comprometidos con el acompañamiento responsable del bienestar. Cada recorrido profesional aporta una mirada única dentro de un enfoque integrador y humano.',
        'default_about_placeholder' => 'Acompaño procesos de bienestar desde una mirada integrativa, priorizando la escucha, el respeto por los tiempos de cada persona y el trabajo interdisciplinario cuando la situación lo requiere.',
        'default_professional_info_placeholder' => 'Médico egresado de la Universidad de la República. Formación en Medicina Integrativa y actualización continua en abordajes complementarios. Más de 12 años de experiencia clínica en acompañamiento de enfermedades crónicas y promoción del bienestar. Trabajo de manera interdisciplinaria cuando la situación lo requiere.',
    ];

    public function __construct(
        private EntityManagerInterface $entityManager
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $settingRepository = $this->entityManager->getRepository(SystemSettings::class);

        foreach (self::REQUIRED_SETTINGS as $key => $defaultValue) {
            $existing = $settingRepository->findOneBy(['settingKey' => $key]);

            if (!$existing) {
                $setting = new SystemSettings();
                $setting->setSettingKey($key);
                $setting->setSettingValue($defaultValue);
                $this->entityManager->persist($setting);
                $io->text(sprintf('Created setting: %s = %s', $key, $defaultValue));
            } else {
                $io->text(sprintf('Setting %s already exists.', $key));
            }
        }

        $this->entityManager->flush();

        $io->success('System settings initialization complete.');

        return Command::SUCCESS;
    }
}
