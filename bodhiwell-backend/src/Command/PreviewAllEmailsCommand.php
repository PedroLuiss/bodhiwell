<?php

namespace App\Command;

use App\Entity\Booking;
use App\Entity\User;
use App\Enum\ConsultationTypeEnum;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Twig\Environment;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use DateTimeImmutable;
use Exception;

#[AsCommand(
    name: 'app:preview-all-emails',
    description: 'Generates HTML previews for all Bodhiwell system emails in public/email_previews/',
)]
class PreviewAllEmailsCommand extends Command
{
    private string $publicDir;

    public function __construct(
        private Environment $twig,
        ParameterBagInterface $params
    ) {
        parent::__construct();
        $this->publicDir = $params->get('kernel.project_dir') . '/public/email_previews';
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Generating Bodhiwell Email Previews');

        if (!is_dir($this->publicDir)) {
            mkdir($this->publicDir, 0777, true);
        }

        // --- 1. MOCK DATA ---
        $professional = new User();
        $professional->setEmail('professional@test.com');
        $professional->setFirstName('Jela');
        $professional->setLastName('Liota');
        $professional->setUsername('jela_liota');

        $patient = new User();
        $patient->setEmail('patient@test.com');
        $patient->setFirstName('Maria');
        $patient->setLastName('Cliente');
        $patient->setUsername('maria_cliente');

        $booking = new Booking();
        $booking->setUid('bk-123-abc');
        $booking->setProfessionalUser($professional);
        $booking->setPatientUser($patient);
        $booking->setDateBookingStart(new DateTimeImmutable('+1 day 10:00:00'));
        $booking->setType(ConsultationTypeEnum::VIRTUAL);
        $booking->setNotes('Esta es una nota de prueba para la reserva.');

        $portalUrl = 'http://localhost:8000';

        // --- 2. DEFINE EMAILS TO TEST ---
        $emails = [
            'welcome' => [
                'template' => 'emails/user/welcome.html.twig',
                'context' => ['user' => $patient, 'portalUrl' => $portalUrl]
            ],
            'password_recovery' => [
                'template' => 'emails/password_recovery.html.twig',
                'context' => ['user' => $patient, 'reset_link' => $portalUrl . '/reset-password/token123']
            ],
            'newsletter' => [
                'template' => 'emails/user/newsletter.html.twig',
                'context' => [
                    'user' => $patient,
                    'newsletterTitle' => 'Tu Bienestar Semanal',
                    'newsletterBody' => "Hola Maria,\n\nEsta semana te traemos consejos sobre meditación y salud mental.\n\nEsperamos que te sean de mucha utilidad.",
                    'portalUrl' => $portalUrl
                ]
            ],
            'profile_approved' => [
                'template' => 'emails/professional/profile_approved.html.twig',
                'context' => ['user' => $professional, 'portalUrl' => $portalUrl]
            ],
            'profile_rejected' => [
                'template' => 'emails/professional/profile_rejected.html.twig',
                'context' => ['user' => $professional, 'portalUrl' => $portalUrl]
            ],
            'booking_created_patient' => [
                'template' => 'emails/booking/created.html.twig',
                'context' => ['booking' => $booking, 'recipient' => $patient, 'portalUrl' => $portalUrl]
            ],
            'booking_created_pro' => [
                'template' => 'emails/booking/created.html.twig',
                'context' => ['booking' => $booking, 'recipient' => $professional, 'portalUrl' => $portalUrl]
            ],
            'booking_confirmed_patient' => [
                'template' => 'emails/booking/confirmed.html.twig',
                'context' => ['booking' => $booking, 'recipient' => $patient, 'portalUrl' => $portalUrl]
            ],
            'booking_confirmed_pro' => [
                'template' => 'emails/booking/confirmed.html.twig',
                'context' => ['booking' => $booking, 'recipient' => $professional, 'portalUrl' => $portalUrl]
            ],
            'booking_canceled_patient' => [
                'template' => 'emails/booking/canceled.html.twig',
                'context' => ['booking' => $booking, 'recipient' => $patient, 'portalUrl' => $portalUrl]
            ],
            'booking_canceled_pro' => [
                'template' => 'emails/booking/canceled.html.twig',
                'context' => ['booking' => $booking, 'recipient' => $professional, 'portalUrl' => $portalUrl]
            ],
            'booking_pending_payment' => [
                'template' => 'emails/booking/pending_payment.html.twig',
                'context' => ['booking' => $booking, 'recipient' => $patient, 'portalUrl' => $portalUrl]
            ],
            'booking_payment_reminder_friendly' => [
                'template' => 'emails/booking/payment_reminder_friendly.html.twig',
                'context' => ['booking' => $booking, 'recipient' => $patient, 'portalUrl' => $portalUrl]
            ],
            'booking_payment_reminder_urgent' => [
                'template' => 'emails/booking/payment_reminder_urgent.html.twig',
                'context' => ['booking' => $booking, 'recipient' => $patient, 'portalUrl' => $portalUrl]
            ],
            'booking_reminder' => [
                'template' => 'emails/booking/reminder.html.twig',
                'context' => ['booking' => $booking, 'recipient' => $patient, 'portalUrl' => $portalUrl]
            ],
        ];

        // --- 3. GENERATE FILES ---
        $generated = [];
        foreach ($emails as $key => $data) {
            try {
                $content = $this->twig->render($data['template'], $data['context']);
                $filename = $key . '.html';
                file_put_contents($this->publicDir . '/' . $filename, $content);
                $generated[] = $filename;
                $io->text("Generated: $filename");
            } catch (Exception $e) {
                $io->error("Failed to generate $key: " . $e->getMessage());
            }
        }

        // --- 4. CREATE INDEX ---
        $indexContent = "<html><body style='font-family: sans-serif; padding: 20px; background-color: #f4f4f4;'>";
        $indexContent .= "<div style='max-width: 800px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>";
        $indexContent .= "<h1 style='color: #2D3748;'>Email Previews - Bodhiwell</h1>";
        $indexContent .= "<ul style='padding: 0; list-style: none;'>";

        foreach ($generated as $file) {
            $label = ucwords(str_replace(['_', '.html'], [' ', ''], $file));
            $indexContent .= "<li style='margin-bottom: 10px; border-bottom: 1px solid #edf2f7; padding-bottom: 5px;'>";
            $indexContent .= "<a href='$file' style='text-decoration: none; color: #4A5568; font-weight: bold; display: block;' target='_blank'>$label</a>";
            $indexContent .= "<small style='color: #A0AEC0;'>Template: $file</small>";
            $indexContent .= "</li>";
        }

        $indexContent .= "</ul></div></body></html>";
        file_put_contents($this->publicDir . '/index.html', $indexContent);

        $io->success('All previews generated.');
        $io->note('You can view them at: /email_previews/index.html');

        return Command::SUCCESS;
    }
}
