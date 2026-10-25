<?php

namespace App\Controller\Admin;

use App\Entity\PlatformEarnings;
use App\Repository\PlatformEarningsRepository;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateField;
use EasyCorp\Bundle\EasyAdminBundle\Field\MoneyField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Config\KeyValueStore;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;
use Symfony\Component\Security\Http\Attribute\IsGranted;

use Symfony\Component\HttpFoundation\RequestStack;

use App\Utils\DeviceDetectionService;

#[IsGranted('ROLE_ADMIN')]
class PlatformEarningsCrudController extends AbstractCrudController
{
    public function __construct(
        private PlatformEarningsRepository $platformEarningsRepository,
        private AdminUrlGenerator $adminUrlGenerator,
        private RequestStack $requestStack,
        private DeviceDetectionService $deviceDetectionService
    ) {}

    public static function getEntityFqcn(): string
    {
        return PlatformEarnings::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setPageTitle(Crud::PAGE_INDEX, 'Reporte de Ganancias')
            ->setEntityLabelInSingular('Ganancia')
            ->setEntityLabelInPlural('Ganancias de Plataforma')
            ->setDefaultSort(['createdAt' => 'DESC'])
            ->setPaginatorPageSize($this->deviceDetectionService->getPaginatorPageSize())
            ->overrideTemplate('crud/index', 'admin/platform_earnings/index.html.twig');
    }

    public function configureActions(Actions $actions): Actions
    {
        return $actions
            ->disable(Action::NEW, Action::EDIT, Action::DELETE)
            ->setPermission(Action::INDEX, 'ROLE_ADMIN');
    }

    public function configureFields(string $pageName): iterable
    {
        yield DateField::new('createdAt', 'Fecha')
            ->setFormat('dd/MM/yyyy HH:mm');

        yield TextField::new('booking', 'Concepto')
            ->setTemplatePath('admin/platform_earnings/booking_link.html.twig')
            ->formatValue(function ($value, $entity) {
                if ($entity instanceof PlatformEarnings && $entity->getBooking()) {
                    $booking = $entity->getBooking();

                    $url = $this->adminUrlGenerator
                        ->setController(BookingCrudController::class)
                        ->setAction(Action::DETAIL)
                        ->setEntityId($booking->getId())
                        ->generateUrl();

                    return [
                        'url' => $url,
                        'uid' => substr($booking->getUid(), 0, 8)
                    ];
                }
                return null;
            });

        yield MoneyField::new('amount', 'Monto')
            ->setCurrency('UYU')
            ->setStoredAsCents(false);
    }

    public function configureResponseParameters(KeyValueStore $responseParameters): KeyValueStore
    {
        $totalEarnings = $this->platformEarningsRepository->calculateTotalEarnings();
        $responseParameters->set('totalEarnings', $totalEarnings);

        return $responseParameters;
    }
}
