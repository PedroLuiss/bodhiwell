<?php

namespace App\Controller\Admin;

use App\Entity\User;
use App\Entity\Booking;
use App\Entity\Specialty;
use App\Entity\Availability;
use App\Entity\Consultation;
use App\Entity\Payment;
use App\Entity\ProfessionalWallet;
use App\Entity\Withdrawal;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Response;
use EasyCorp\Bundle\EasyAdminBundle\Config\MenuItem;
use EasyCorp\Bundle\EasyAdminBundle\Config\Dashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\Assets;
use Symfony\Contracts\Translation\TranslatorInterface;
use EasyCorp\Bundle\EasyAdminBundle\Attribute\AdminDashboard;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractDashboardController;
use App\Entity\SystemSettings;
use App\Entity\PlatformEarnings;
use App\Controller\Admin\SystemSettingsCrudController;
use App\Controller\Admin\PlatformEarningsCrudController;
use App\Enum\PaymentStatusEnum;

#[AdminDashboard(routePath: '/admin', routeName: 'admin')]
class DashboardController extends AbstractDashboardController
{

    private TranslatorInterface $translator;
    private EntityManagerInterface $em;

    public function __construct(TranslatorInterface $translator, EntityManagerInterface $em)
    {
        $this->translator = $translator;
        $this->em = $em;
    }

    public function index(): Response
    {
        $request = $this->container->get('request_stack')->getCurrentRequest();
        $conn = $this->em->getConnection();

        $currentMonth = (new \DateTime())->format('Y-m');
        $monthFilter = $request->query->get('month', $currentMonth);

        $totalIncome = $this->calculateTotalIncome($monthFilter);
        $totalAppointments = $this->calculateTotalAppointments($monthFilter);
        $newPatients = $this->calculateNewPatients($monthFilter);
        $activeBookings = $this->calculateActiveBookings();
        $bookingActivity = $this->calculateBookingActivity($monthFilter);
        $pendingWithdrawals = $this->fetchPendingWithdrawals();

        return $this->render('admin/dashboard.html.twig', [
            'metrics' => [
                'totalIncome' => $totalIncome,
                'totalAppointments' => $totalAppointments,
                'newPatients' => $newPatients,
                'activeBookings' => $activeBookings,
                'bookingActivity' => $bookingActivity,
                'pendingWithdrawals' => $pendingWithdrawals
            ],
            'monthFilter' => $monthFilter,
        ]);
    }

    private function calculateTotalIncome(string $monthFilter): float
    {
        return (float) $this->em->getConnection()->fetchOne(
            'SELECT COALESCE(SUM(amount),0) FROM payments WHERE DATE_FORMAT(created_at, "%Y-%m") = :month AND status = :status',
            ['month' => $monthFilter, 'status' => PaymentStatusEnum::APPROVED->value]
        );
    }

    private function calculateTotalAppointments(string $monthFilter): int
    {
        return (int) $this->em->getConnection()->fetchOne(
            'SELECT COUNT(id) FROM consultation WHERE DATE_FORMAT(created_at, "%Y-%m") = :month',
            ['month' => $monthFilter]
        );
    }

    private function calculateNewPatients(string $monthFilter): int
    {
        return (int) $this->em->getConnection()->fetchOne(
            'SELECT COUNT(id) FROM user WHERE type_account = "patient" AND DATE_FORMAT(created_at, "%Y-%m") = :month',
            ['month' => $monthFilter]
        );
    }

    private function calculateActiveBookings(): int
    {
        return (int) $this->em->getConnection()->fetchOne(
            'SELECT COUNT(id) FROM booking WHERE status = "active"'
        );
    }

    private function calculateBookingActivity(string $monthFilter): array
    {
        $bookingActivityRaw = $this->em->getConnection()->fetchAllAssociative(
            'SELECT DATE(date_booking_start) AS day, COUNT(id) AS count FROM booking WHERE DATE_FORMAT(date_booking_start, "%Y-%m") = :month GROUP BY day ORDER BY day ASC',
            ['month' => $monthFilter]
        );

        return [
            'labels' => array_column($bookingActivityRaw, 'day'),
            'data' => array_column($bookingActivityRaw, 'count'),
        ];
    }

    private function fetchPendingWithdrawals(): array
    {
        return $this->em->getConnection()->fetchAllAssociative(
            'SELECT id, professional_id, amount, DATE_FORMAT(created_at, "%Y-%m-%d") AS date FROM withdrawal WHERE status = "pending"'
        );
    }

    public function configureDashboard(): Dashboard
    {
        return Dashboard::new()
            ->setTitle('')
            ->setFaviconPath('favicon.png');
    }

    public function configureAssets(): Assets
    {
        return Assets::new()
            ->addCssFile('css/admin.css');
    }

    public function configureMenuItems(): iterable
    {
        /**
         * @var User $user
         */
        $user = $this->getUser();
        $isGranted = $user && (in_array('ROLE_ADMIN', $user->getRoles()) || in_array('ROLE_OWNER', $user->getRoles()));

        yield MenuItem::linkToDashboard('Dashboard', 'fa fa-home');

        if ($isGranted) {
            yield MenuItem::section('Configuración');
            yield MenuItem::linkToCrud('Ajustes del Sistema', 'fa fa-cogs', SystemSettings::class)
                ->setController(SystemSettingsCrudController::class);
            yield MenuItem::linkToCrud('Reporte de Ganancias', 'fa fa-sack-dollar', PlatformEarnings::class)
                ->setController(PlatformEarningsCrudController::class);
            yield MenuItem::linkToCrud($this->translator->trans('specialty.label_plural'), 'fa-solid fa-list-check', Specialty::class);
        }

        // yield MenuItem::linkToCrud($this->translator->trans('users.title'), 'fas fa-user', User::class)
        //     ->setController(UserCrudController::class);

        if ($isGranted) {
            yield MenuItem::section($this->translator->trans('community.section'));
            yield MenuItem::linkToCrud($this->translator->trans('users.patient_plural'), 'fas fa-user', User::class)
                ->setController(UserPatientCrudController::class);
            yield MenuItem::linkToCrud($this->translator->trans('users.professional_plural'), 'fa fa-briefcase', User::class)
                ->setController(UserProfessionalCrudController::class);
            yield MenuItem::linkToCrud('Validación de Estudios', 'fa fa-graduation-cap', \App\Entity\Studies::class)
                ->setController(\App\Controller\Admin\StudiesCrudController::class);
        }

        if ($isGranted) {
            yield MenuItem::section($this->translator->trans('agenda.section'));
            yield MenuItem::linkToCrud($this->translator->trans('availability.label_plural'), 'fa fa-calendar-plus', Availability::class);
            yield MenuItem::linkToCrud($this->translator->trans('booking.label_plural'), 'fa fa-calendar-check', Booking::class);
            yield MenuItem::linkToCrud($this->translator->trans('consultation.label_plural'), 'fa fa-stethoscope', Consultation::class);
        }

        if ($isGranted) {
            yield MenuItem::section($this->translator->trans('transactions.section'));
            yield MenuItem::linkToCrud($this->translator->trans('payment.label_plural'), 'fa fa-credit-card', Payment::class);
            yield MenuItem::linkToCrud($this->translator->trans('withdrawal.label_plural'), 'fa fa-money-bill-transfer', Withdrawal::class);
            // yield MenuItem::linkToCrud($this->translator->trans('refund.label_plural'), 'fa fa-rotate-left', Refund::class);
        }

        if ($isGranted) {
            yield MenuItem::section($this->translator->trans('wallet.section'));
            // yield MenuItem::linkToCrud($this->translator->trans('transaction.label_plural'), 'fa fa-exchange', Transaction::class);
            yield MenuItem::linkToCrud($this->translator->trans('professional_wallet.label_plural'), 'fa fa-wallet', ProfessionalWallet::class);
            // yield MenuItem::linkToCrud($this->translator->trans('wallet_ledger.label_plural'), 'fa fa-list', WalletLedger::class);
        }
    }
}
