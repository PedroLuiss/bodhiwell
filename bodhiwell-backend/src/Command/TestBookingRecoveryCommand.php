<?php

namespace App\Command;

use App\Entity\Booking;
use App\Entity\User;
use App\Enum\BookingEnum;
use App\Enum\ConsultationTypeEnum;
use App\Repository\BookingRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:test-booking-recovery',
    description: 'Creates a test booking with a specific creation time offset to test recovery logic.',
)]
class TestBookingRecoveryCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserRepository $userRepository,
        private BookingRepository $bookingRepository
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addArgument('offsetMinutes', InputArgument::REQUIRED, 'Minutes ago the booking was created (e.g., 20, 35, 50)');
        $this->addArgument('patientEmail', InputArgument::OPTIONAL, 'Email of the patient');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $offset = (int) $input->getArgument('offsetMinutes');
        $patientEmail = $input->getArgument('patientEmail');

        $professional = $this->userRepository->findOneBy(['type_account' => 'professional']);
        if (!$professional) {
            $io->error('No professional found.');
            return Command::FAILURE;
        }

        $patient = null;
        if ($patientEmail) {
            $patient = $this->userRepository->findOneBy(['email' => $patientEmail]);
        }

        if (!$patient) {
            $patient = $this->userRepository->findOneBy(['type_account' => 'patient']);
        }

        if (!$patient) {
            $io->error('No patient found.');
            return Command::FAILURE;
        }

        $booking = new Booking();
        $booking->setProfessionalUser($professional);
        $booking->setPatientUser($patient);
        $booking->setDateBookingStart(new \DateTimeImmutable('+1 day'));
        $booking->setDateBookingEnd(new \DateTimeImmutable('+1 day 1 hour'));
        $booking->setStatus(BookingEnum::WAITING_PAYMENT);
        $booking->setType(ConsultationTypeEnum::VIRTUAL); // Default

        $this->entityManager->persist($booking);
        $this->entityManager->flush();

        $createdAt = new \DateTimeImmutable(sprintf('-%d minutes', $offset));
        $booking->setCreatedAt($createdAt);
        $booking->setUpdatedAt($createdAt);

        $this->entityManager->flush();

        $io->success(sprintf(
            'Created booking #%d (%s) created %d minutes ago (%s).',
            $booking->getId(),
            $booking->getUid(),
            $offset,
            $createdAt->format('Y-m-d H:i:s')
        ));

        $io->note('Run "php bin/console app:monitor-pending-bookings" to test the logic.');

        return Command::SUCCESS;
    }
}
