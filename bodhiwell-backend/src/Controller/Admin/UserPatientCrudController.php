<?php

namespace App\Controller\Admin;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use EasyCorp\Bundle\EasyAdminBundle\Collection\FieldCollection;
use EasyCorp\Bundle\EasyAdminBundle\Collection\FilterCollection;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Config\Filters;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;
use EasyCorp\Bundle\EasyAdminBundle\Context\AdminContext;
use EasyCorp\Bundle\EasyAdminBundle\Dto\EntityDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\SearchDto;
use EasyCorp\Bundle\EasyAdminBundle\Field\EmailField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\FormField;
use App\Admin\Filter\FullUserNameFilter;
use Symfony\Contracts\Translation\TranslatorInterface;
use Doctrine\ORM\QueryBuilder;
use App\Enum\LatamCountryEnum;

use Symfony\Component\HttpFoundation\RequestStack;

use App\Utils\DeviceDetectionService;

class UserPatientCrudController extends AbstractCrudController
{
    public function __construct(
        private TranslatorInterface $translator,
        private AdminUrlGenerator $adminUrlGenerator,
        private RequestStack $requestStack,
        private DeviceDetectionService $deviceDetectionService
    ) {}

    public static function getEntityFqcn(): string
    {
        return User::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular($this->translator->trans('users.patient_singular'))
            ->setEntityLabelInPlural($this->translator->trans('users.patient_plural'))
            ->setPageTitle(Crud::PAGE_INDEX, $this->translator->trans('users.patient_plural'))
            ->setDefaultSort(['id' => 'DESC'])
            ->setSearchFields(['first_name', 'last_name', 'email', 'dni', 'phone_number'])
            ->setPaginatorPageSize($this->deviceDetectionService->getPaginatorPageSize());
    }

    public function configureFields(string $pageName): iterable
    {
        $fullNameField = TextField::new('first_name', $this->translator->trans('users.full_name'))
            ->formatValue(function ($value, ?User $user) {
                if (!$user) {
                    return (string)$value;
                }
                $name = trim(($user->getFirstName() ?? '') . ' ' . ($user->getLastName() ?? ''));

                $url = $this->adminUrlGenerator
                    ->setController(self::class)
                    ->setAction(Action::DETAIL)
                    ->setEntityId($user->getId())
                    ->generateUrl();

                return sprintf('<a href="%s">%s</a>', $url, $name);
            })
            ->setTemplatePath('admin/field/raw.html.twig');

        if ($pageName === Crud::PAGE_INDEX) {
            return [
                $fullNameField,
                TextField::new('dni', $this->translator->trans('users.dni')),
                EmailField::new('email', $this->translator->trans('users.email')),
                TextField::new('phone_number', $this->translator->trans('users.phone_number')),
            ];
        }

        if ($pageName === Crud::PAGE_DETAIL) {
            return [
                FormField::addPanel($this->translator->trans('users.personal_info')),
                TextField::new('first_name', $this->translator->trans('users.first_name')),
                TextField::new('last_name', $this->translator->trans('users.last_name')),
                TextField::new('dni', $this->translator->trans('users.dni')),
                DateField::new('userDetails.dateBirth', $this->translator->trans('users.date_birth')),
                TextField::new('userDetails.gender', $this->translator->trans('users.gender'))
                    ->formatValue(function ($value) {
                        return $this->translator->trans('users.gender_' . ($value ?? 'other'));
                    }),
                TextField::new('phone_number', $this->translator->trans('users.phone_number')),
                EmailField::new('email', $this->translator->trans('users.email')),
                TextField::new('userDetails.country', $this->translator->trans('users.country'))
                    ->formatValue(function ($value) {
                        if (!$value) return null;
                        $country = LatamCountryEnum::tryFrom($value);
                        return $country?->label() ?? $value;
                    }),
                TextField::new('userDetails.city', $this->translator->trans('users.city')),
                TextField::new('userDetails.address', $this->translator->trans('users.address')),
                TextField::new('userDetails.zipcode', $this->translator->trans('users.zipcode')),

                FormField::addPanel($this->translator->trans('users.extra_info')),
                TextareaField::new('userDetails.about', $this->translator->trans('users.about'))
                    ->setMaxLength(65535)
                    ->renderAsHtml(),
            ];
        }

        return [
            FormField::addPanel($this->translator->trans('users.personal_info')),
            IdField::new('id')->hideOnForm(),
            TextField::new('first_name', $this->translator->trans('users.first_name')),
            TextField::new('last_name', $this->translator->trans('users.last_name')),
            TextField::new('dni', $this->translator->trans('users.dni')),
            DateField::new('userDetails.dateBirth', $this->translator->trans('users.date_birth')),
            ChoiceField::new('userDetails.gender', $this->translator->trans('users.gender'))
                ->setChoices([
                    $this->translator->trans('users.gender_female') => 'female',
                    $this->translator->trans('users.gender_male') => 'male',
                    $this->translator->trans('users.gender_other') => 'other',
                ]),
            TextField::new('phone_number', $this->translator->trans('users.phone_number')),
            EmailField::new('email', $this->translator->trans('users.email')),
            ChoiceField::new('userDetails.country', $this->translator->trans('users.country'))
                ->setChoices(LatamCountryEnum::choices()),
            TextField::new('userDetails.city', $this->translator->trans('users.city')),
            TextField::new('userDetails.address', $this->translator->trans('users.address')),
            TextField::new('userDetails.zipcode', $this->translator->trans('users.zipcode')),

            FormField::addPanel($this->translator->trans('users.extra_info')),
            TextareaField::new('userDetails.about', $this->translator->trans('users.about'))
                ->setMaxLength(65535),
        ];
    }

    public function configureFilters(Filters $filters): Filters
    {
        return $filters
            ->add(FullUserNameFilter::new('fullName', $this->translator->trans('users.full_name')))
            ->add('dni')
            ->add('email')
            ->add('phone_number');
    }

    public function configureActions(Actions $actions): Actions
    {
        $detail = Action::new(Action::DETAIL, $this->translator->trans('users.actions.details'))
            ->linkToCrudAction(Action::DETAIL)
            ->setIcon('fa fa-eye');

        $viewConsultations = Action::new('viewConsultations', $this->translator->trans('users.actions.view_consultations'), 'fa fa-notes-medical')
            ->linkToUrl(function (User $user) {
                /** @var AdminUrlGenerator $urlGen */
                $urlGen = $this->container->get(AdminUrlGenerator::class);

                return $urlGen
                    ->setController(\App\Controller\Admin\ConsultationCrudController::class)
                    ->setAction(Crud::PAGE_INDEX)
                    ->set('filters', ['patientId' => ['value' => $user->getId()]])
                    ->generateUrl();
            })
            ->displayIf(fn(?User $u) => $u !== null);

        $viewBookings = Action::new('viewBookings', $this->translator->trans('users.actions.view_bookings'), 'fa fa-calendar-check')
            ->linkToUrl(function (User $user) {
                /** @var AdminUrlGenerator $urlGen */
                $urlGen = $this->container->get(AdminUrlGenerator::class);

                return $urlGen
                    ->setController(\App\Controller\Admin\BookingCrudController::class)
                    ->setAction(Crud::PAGE_INDEX)
                    ->set('filters', ['patientUser' => ['value' => $user->getId()]])
                    ->generateUrl();
            })
            ->displayIf(fn(?User $u) => $u !== null);

        return $actions
            ->add(Crud::PAGE_INDEX, $detail)
            ->add(Crud::PAGE_INDEX, $viewConsultations)
            ->add(Crud::PAGE_INDEX, $viewBookings)
            ->add(Crud::PAGE_DETAIL, $viewConsultations)
            ->add(Crud::PAGE_DETAIL, $viewBookings)
            ->update(Crud::PAGE_INDEX, Action::DELETE, function (Action $action) {
                return $action
                    ->setLabel($this->translator->trans('users.actions.delete'))
                    ->setCssClass('ea-action text-danger')
                    ->setIcon('fa fa-trash');
            })
            ->disable(Action::NEW);
    }


    public function createIndexQueryBuilder(SearchDto $searchDto, EntityDto $entityDto, FieldCollection $fields, FilterCollection $filters): QueryBuilder
    {
        $reflection = new \ReflectionClass(SearchDto::class);
        $newSearchDto = $reflection->newInstanceWithoutConstructor();

        foreach ($reflection->getProperties() as $property) {
            if ($property->getName() === 'query') {
                $property->setValue($newSearchDto, '');
                continue;
            }
            if ($property->getName() === 'cachedSortConfig') {
                continue;
            }

            $property->setAccessible(true);
            $originalProp = $reflection->getProperty($property->getName());
            $originalProp->setAccessible(true);
            if ($originalProp->isInitialized($searchDto)) {
                $property->setValue($newSearchDto, $originalProp->getValue($searchDto));
            }
        }

        $qb = parent::createIndexQueryBuilder($newSearchDto, $entityDto, $fields, $filters);
        $alias = $qb->getRootAliases()[0];
        $qb->andWhere(sprintf('%s.type_account = :type', $alias))
            ->setParameter('type', 'patient');

        $term = trim((string)$searchDto->getQuery());
        if ($term !== '') {
            $lower = mb_strtolower($term);

            $qb->andWhere('(
                LOWER(' . $alias . '.first_name) LIKE :term OR
                LOWER(' . $alias . '.last_name) LIKE :term OR
                LOWER(' . $alias . '.email) LIKE :term OR
                ' . $alias . '.dni LIKE :term OR
                ' . $alias . '.phone_number LIKE :term OR
                LOWER(CONCAT(' . $alias . '.first_name, \' \', ' . $alias . '.last_name)) LIKE :term
            )')
                ->setParameter('term', '%' . $lower . '%');
        }

        return $qb;
    }

    public function persistEntity(EntityManagerInterface $entityManager, $entityInstance): void
    {
        if ($entityInstance instanceof User) {
            $entityInstance->setTypeAccount('patient');
        }
        parent::persistEntity($entityManager, $entityInstance);
    }

    public function updateEntity(EntityManagerInterface $entityManager, $entityInstance): void
    {
        if ($entityInstance instanceof User) {
            $entityInstance->setTypeAccount('patient');
        }
        parent::updateEntity($entityManager, $entityInstance);
    }
}
