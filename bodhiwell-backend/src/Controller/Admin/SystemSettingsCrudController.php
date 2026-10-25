<?php

namespace App\Controller\Admin;

use App\Entity\SystemSettings;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\NumberField;
use EasyCorp\Bundle\EasyAdminBundle\Field\PercentField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\HttpFoundation\RequestStack;

use App\Utils\DeviceDetectionService;

#[IsGranted('ROLE_ADMIN')]
class SystemSettingsCrudController extends AbstractCrudController
{
    public function __construct(
        private RequestStack $requestStack,
        private DeviceDetectionService $deviceDetectionService
    ) {}

    public static function getEntityFqcn(): string
    {
        return SystemSettings::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setPageTitle(Crud::PAGE_INDEX, 'Configuración del Sistema')
            ->setPageTitle(Crud::PAGE_EDIT, 'Editar Configuración')
            ->setEntityLabelInSingular('Configuración')
            ->setEntityLabelInPlural('Configuraciones')
            ->setSearchFields(['settingKey', 'settingValue'])
            ->setPaginatorPageSize($this->deviceDetectionService->getPaginatorPageSize());
    }

    public function configureActions(Actions $actions): Actions
    {
        return $actions
            ->disable(Action::NEW, Action::DELETE)
            ->setPermission(Action::EDIT, 'ROLE_ADMIN')
            ->setPermission(Action::INDEX, 'ROLE_ADMIN');
    }

    public function configureFields(string $pageName): iterable
    {
        $settingKey = TextField::new('settingKey', 'Clave de Configuración')
            ->setFormTypeOption('disabled', true);

        $settingValue = TextField::new('settingValue', 'Valor');

        if ($pageName === Crud::PAGE_EDIT) {
            $entity = $this->getContext()->getEntity()->getInstance();
            if ($entity instanceof SystemSettings) {
                if ($entity->getSettingKey() === 'booking_commission_percentage') {
                    $settingValue = NumberField::new('settingValue', 'Porcentaje de Comisión')
                        ->setHelp('Porcentaje aplicado a las reservas futuras (Ej. 15 para 15%)')
                        ->setNumDecimals(2)
                        ->setFormTypeOption('attr', ['min' => 0, 'max' => 100, 'step' => 0.01]);
                }
            }
        }

        return [
            $settingKey,
            $settingValue,
        ];
    }
}
