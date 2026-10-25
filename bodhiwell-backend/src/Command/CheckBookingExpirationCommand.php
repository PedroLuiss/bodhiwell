<?php

namespace App\Command;

use App\Services\BookingCancellationService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:check-booking-expiration',
    description: 'Checks for expired bookings (WAITING_PAYMENT > 45 mins) and cancels them.',
)]
class CheckBookingExpirationCommand extends Command
{
    public function __construct(
        private BookingCancellationService $bookingCancellationService
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Checking for expired bookings...');

        try {
            $count = $this->bookingCancellationService->checkAndCancelExpiredBookings();

            if ($count > 0) {
                $io->success(sprintf('Cancelled %d expired bookings.', $count));
            } else {
                $io->info('No expired bookings found.');
            }

            return Command::SUCCESS;
        } catch (\Throwable $e) {
            $io->error('An error occurred: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
