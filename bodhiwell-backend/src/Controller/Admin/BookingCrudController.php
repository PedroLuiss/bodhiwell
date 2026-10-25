<?php

namespace App\Controller\Admin;

use App\Entity\User;
use RuntimeException;
use App\Entity\Booking;
use App\Enum\BookingEnum;
use App\Enum\ConsultTypeEnum;
use App\Services\UserService;
use App\Services\BookingManagerService;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use App\Enum\ConsultationTypeEnum;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Filters;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use Symfony\Contracts\Translation\TranslatorInterface;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Filter\ChoiceFilter;
use EasyCorp\Bundle\EasyAdminBundle\Filter\EntityFilter;
use EasyCorp\Bundle\EasyAdminBundle\Filter\DateTimeFilter;
use EasyCorp\Bundle\EasyAdminBundle\Filter\BooleanFilter;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;
use EasyCorp\Bundle\EasyAdminBundle\Context\AdminContext;
use EasyCorp\Bundle\EasyAdminBundle\Dto\SearchDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\EntityDto;
use EasyCorp\Bundle\EasyAdminBundle\Collection\FieldCollection;
use EasyCorp\Bundle\EasyAdminBundle\Collection\FilterCollection;
use Doctrine\ORM\QueryBuilder;

use App\Repository\UserRepository;

use Symfony\Component\HttpFoundation\RequestStack;

use App\Utils\DeviceDetectionService;

class BookingCrudController extends AbstractCrudController
{
    public function __construct(
        private TranslatorInterface   $translator,
        private BookingManagerService $bookingManagerService,
        private UserService           $userService,
        private UserRepository        $userRepository,
        private EntityManagerInterface $em,
        private AdminUrlGenerator $adminUrlGenerator,
        private RequestStack $requestStack,
        private DeviceDetectionService $deviceDetectionService
    ) {}

    public static function getEntityFqcn(): string
    {
        return Booking::class;
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

        if (!in_array('professionalUser', $qb->getAllAliases())) {
            $qb->leftJoin($alias . '.professionalUser', 'professionalUser');
        }
        if (!in_array('patientUser', $qb->getAllAliases())) {
            $qb->leftJoin($alias . '.patientUser', 'patientUser');
        }

        $term = trim((string)$searchDto->getQuery());
        if ($term !== '') {
            $lower = mb_strtolower($term);

            $statusMatches = [];
            $keywords = [
                'WAITING_PAYMENT'  => ['esperando pago', 'pago', 'waiting'],
                'PROCESSING'       => ['procesando', 'process'],
                'PENDING_PROVIDER' => ['proveedor', 'provider', 'pendiente'],
                'CONFIRMED'        => ['confirmada', 'confirmado', 'confirm'],
                'CANCELLED'        => ['cancelada', 'cancelado', 'cancel'],
                'COMPLETED'        => ['completada', 'completado', 'complete'],
                'PENDING'          => ['pendiente', 'pend']
            ];

            foreach ($keywords as $status => $words) {
                foreach ($words as $word) {
                    if (str_contains($word, $lower) || str_contains($lower, $word)) {
                        $statusMatches[] = $status;
                        break;
                    }
                }
            }

            $typeMatches = [];
            if (str_contains('virtual', $lower)) $typeMatches[] = 'virtual';
            if (str_contains('presencial', $lower) || str_contains('presential', $lower)) $typeMatches[] = 'presential';

            $orConditions = [
                'LOWER(professionalUser.first_name) LIKE :term',
                'LOWER(professionalUser.last_name) LIKE :term',
                'LOWER(patientUser.first_name) LIKE :term',
                'LOWER(patientUser.last_name) LIKE :term',
                'LOWER(CONCAT(professionalUser.first_name, \' \', professionalUser.last_name)) LIKE :term',
                'LOWER(CONCAT(patientUser.first_name, \' \', patientUser.last_name)) LIKE :term',
                'LOWER(' . $alias . '.reserveReason) LIKE :term',
            ];

            if (in_array($lower, ['si', 'sí', 'yes'])) {
                $orConditions[] = $alias . '.quoteForInvited = :is_invited_true';
                $qb->setParameter('is_invited_true', true);
            }
            if (in_array($lower, ['no', 'not'])) {
                $orConditions[] = $alias . '.quoteForInvited = :is_invited_false';
                $qb->setParameter('is_invited_false', false);
            }

            $months = ['ene' => 1, 'feb' => 2, 'mar' => 3, 'abr' => 4, 'may' => 5, 'jun' => 6, 'jul' => 7, 'ago' => 8, 'sep' => 9, 'oct' => 10, 'nov' => 11, 'dic' => 12];
            $searchDay = null;
            $searchMonth = null;
            $searchYear = null;

            foreach ($months as $k => $v) {
                if (str_contains($lower, $k)) {
                    $searchMonth = $v;
                    if (preg_match('/(\d{1,2})\s*' . $k . '/', $lower, $matches)) {
                        $searchDay = (int)$matches[1];
                    } elseif (preg_match('/' . $k . '\s*(\d{1,2})/', $lower, $matches)) {
                        $searchDay = (int)$matches[1];
                    }
                    break;
                }
            }
            if (preg_match('/(20\d{2})/', $lower, $matches)) {
                $searchYear = (int)$matches[1];
            }

            if ($searchMonth || $searchYear) {
                $dateLike = '%';

                if ($searchYear) {
                    $dateLike = $searchYear . '-';
                } else {
                    $dateLike .= '%-';
                }

                if ($searchMonth) {
                    $dateLike .= sprintf('%02d', $searchMonth) . '-';
                } else {
                    $dateLike .= '%-';
                }

                if ($searchDay) {
                    $dateLike .= sprintf('%02d', $searchDay) . '%';
                } else {
                    $dateLike .= '%';
                }

                $orConditions[] = $alias . '.dateBookingStart LIKE :date_like';
                $qb->setParameter('date_like', $dateLike);
            } else {
                $orConditions[] = $alias . '.dateBookingStart LIKE :term';
            }

            if (!empty($statusMatches)) {
                $orConditions[] = $alias . '.status IN (:status_matches)';
                $qb->setParameter('status_matches', array_unique($statusMatches));
            }

            if (!empty($typeMatches)) {
                $orConditions[] = $alias . '.type IN (:type_matches)';
                $qb->setParameter('type_matches', array_unique($typeMatches));
            }

            $qb->andWhere('(' . implode(' OR ', $orConditions) . ')')
                ->setParameter('term', '%' . $lower . '%');
        }

        return $qb;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setPageTitle(Crud::PAGE_INDEX,  $this->translator->trans('booking.label_plural'))
            ->setPageTitle(Crud::PAGE_NEW,    $this->translator->trans('booking.create', [], 'messages'))
            ->setPageTitle(Crud::PAGE_EDIT,   $this->translator->trans('booking.edit', [], 'messages'))
            ->setPageTitle(Crud::PAGE_DETAIL, $this->translator->trans('booking.detail', [], 'messages'))
            ->setDefaultSort(['dateBookingStart' => 'DESC'])
            ->setPaginatorPageSize($this->deviceDetectionService->getPaginatorPageSize())
            ->setSearchFields([
                'professionalUser.first_name',
                'professionalUser.last_name',
                'patientUser.first_name',
                'patientUser.last_name',
                'status',
                'dateBookingStart',
                'reserveReason',
            ]);
    }

    public function configureFields(string $pageName): iterable
    {
        $statusChoices = [];
        foreach (BookingEnum::cases() as $status) {
            $translatedLabel = $this->translator->trans('booking.status.' . strtolower($status->value));
            if ($translatedLabel === 'booking.status.' . strtolower($status->value)) {
                $translatedLabel = $status->label();
            }
            $statusChoices[$translatedLabel] = $status;
        }

        $typeChoices = array_flip(ConsultationTypeEnum::labels());
        $formChoices = ConsultationTypeEnum::cases();

        $professional = null;
        $booking = $this->getContext()->getEntity()->getInstance();

        if ($booking instanceof Booking && $booking->getProfessionalUser()) {
            $professional = $booking->getProfessionalUser();
        }

        $request = $this->getContext()->getRequest();
        $isPost = $request && $request->isMethod('POST');

        if (!$isPost && $professional) {
            $details = $professional->getUserDetails();
            $proType = $details?->getConsultType();

            if ($proType) {
                $proType = strtolower(trim($proType));

                if ($proType === ConsultTypeEnum::VIRTUAL->value) {
                    $typeChoices = array_filter($typeChoices, fn($v) => $v === ConsultationTypeEnum::VIRTUAL->value);
                    $formChoices = [ConsultationTypeEnum::VIRTUAL];
                } elseif ($proType === ConsultTypeEnum::PRESENTIAL->value) {
                    $typeChoices = array_filter($typeChoices, fn($v) => $v === ConsultationTypeEnum::PRESENTIAL->value);
                    $formChoices = [ConsultationTypeEnum::PRESENTIAL];
                }
            }
        }

        $statusField = ChoiceField::new('status', $this->translator->trans('booking.fields.status'))
            ->setChoices($statusChoices)
            ->setColumns(6);

        $isIndexOrDetail = in_array($pageName, [Crud::PAGE_INDEX, Crud::PAGE_DETAIL]);
        if ($isIndexOrDetail) {
            $statusField = ChoiceField::new('status', $this->translator->trans('booking.fields.status'))
                ->formatValue(function ($value, $entity) {
                    if (!$value instanceof BookingEnum) {
                        return $value;
                    }

                    $colorMap = [
                        BookingEnum::WAITING_PAYMENT->value  => 'warning',
                        BookingEnum::PROCESSING->value       => 'info',
                        BookingEnum::PENDING_PROVIDER->value => 'info',
                        BookingEnum::CONFIRMED->value        => 'success',
                        BookingEnum::CANCELLED->value        => 'danger',
                        BookingEnum::COMPLETED->value        => 'success',
                        BookingEnum::PENDING->value          => 'secondary',
                    ];

                    $color = $colorMap[$value->value] ?? 'secondary';
                    $label = $this->translator->trans('booking.status.' . strtolower($value->value));
                    if ($label === 'booking.status.' . strtolower($value->value)) {
                        $label = $value->label();
                    }
                    $label = strtoupper($label);

                    return sprintf('<span class="badge badge-%s">%s</span>', $color, $label);
                })
                ->setTemplatePath('admin/field/raw.html.twig');
        }

        $fields = [

            AssociationField::new('professionalUser', $this->translator->trans('users.professional'))
                ->setFormTypeOptions([
                    'query_builder' => fn(EntityRepository $r) =>
                    $r->createQueryBuilder('u')
                        ->andWhere('u.type_account = :type')
                        ->setParameter('type', 'professional')
                        ->orderBy('u.last_name', 'ASC')
                        ->addOrderBy('u.first_name', 'ASC'),
                    'choice_label'  => fn(User $u) => trim($u->getFirstName() . ' ' . $u->getLastName()),
                ])
                ->formatValue(function ($value, $entity) {
                    if (!$value) return '';

                    $name = $value instanceof User ? trim($value->getFirstName() . ' ' . $value->getLastName()) : (string)$value;
                    if (!$value instanceof User) return $name;

                    $url = $this->adminUrlGenerator
                        ->setController(\App\Controller\Admin\UserProfessionalCrudController::class)
                        ->setAction(Action::DETAIL)
                        ->setEntityId($value->getId())
                        ->generateUrl();

                    return sprintf('<a href="%s">%s</a>', $url, $name);
                })
                ->setTemplatePath('admin/field/raw.html.twig'),

            AssociationField::new('patientUser', $this->translator->trans('users.patient'))
                ->setFormTypeOptions([
                    'query_builder' => fn(EntityRepository $r) =>
                    $r->createQueryBuilder('u')
                        ->andWhere('u.type_account NOT IN (:excluded)')
                        ->setParameter('excluded', ['owner', 'admin'])
                        ->orderBy('u.last_name', 'ASC')
                        ->addOrderBy('u.first_name', 'ASC'),
                    'choice_label'  => fn(User $u) => trim($u->getFirstName() . ' ' . $u->getLastName()),
                ])
                ->formatValue(function ($value, $entity) {
                    if (!$value) return '';

                    $name = $value instanceof User ? trim($value->getFirstName() . ' ' . $value->getLastName()) : (string)$value;
                    if (!$value instanceof User) return $name;

                    $url = $this->adminUrlGenerator
                        ->setController(\App\Controller\Admin\UserPatientCrudController::class)
                        ->setAction(Action::DETAIL)
                        ->setEntityId($value->getId())
                        ->generateUrl();

                    return sprintf('<a href="%s">%s</a>', $url, $name);
                })
                ->setTemplatePath('admin/field/raw.html.twig'),

            ChoiceField::new('type', $this->translator->trans('booking.fields.type'))
                ->setChoices($typeChoices)
                ->renderAsBadges()
                ->setFormTypeOption('choice_loader', null)
                ->setFormTypeOption('choices', $formChoices)
                ->setFormTypeOption(
                    'choice_label',
                    fn(ConsultationTypeEnum $e) =>
                    ConsultationTypeEnum::labels()[$e->value]
                ),

            DateTimeField::new('dateBookingStart', $this->translator->trans('booking.fields.date_start'))
                ->setFormat('dd/MM/yyyy HH:mm'),

            DateTimeField::new('dateBookingEnd', $this->translator->trans('booking.fields.date_end'))
                ->setFormat('dd/MM/yyyy HH:mm')
                ->hideOnForm(),

            $statusField,

            TextareaField::new('reserveReason', $this->translator->trans('booking.fields.reserve_reason'))
                ->setMaxLength(5000),

            BooleanField::new('quoteForInvited', $this->translator->trans('booking.fields.quote_for_invited'))
                ->renderAsSwitch(false),

            TextareaField::new('notes', $this->translator->trans('booking.fields.notes'))
                ->hideOnIndex(),

            DateTimeField::new('createdAt', $this->translator->trans('booking.fields.created_at'))
                ->hideOnForm()->hideOnIndex()
                ->setFormat('dd/MM/yyyy HH:mm'),

            DateTimeField::new('updatedAt', $this->translator->trans('booking.fields.updated_at'))
                ->hideOnForm()->hideOnIndex()
                ->setFormat('dd/MM/yyyy HH:mm'),
        ];

        if ($pageName === Crud::PAGE_EDIT) {
            foreach ($fields as $index => $field) {
                if ($field instanceof TextareaField && $field->getAsDto()->getProperty() === 'notes') {
                    continue;
                }

                $fields[$index] = $field->setFormTypeOption('disabled', true);
            }
        }

        return $fields;
    }

    public function configureFilters(Filters $filters): Filters
    {
        $filterChoices = [];
        foreach (BookingEnum::cases() as $status) {
            $filterChoices[$status->label()] = $status->value;
        }

        return $filters
            ->add(
                EntityFilter::new('professionalUser', $this->translator->trans('users.professional'))
                    ->setFormTypeOption('value_type_options', [
                        'query_builder' => function (EntityRepository $er) {
                            return $er->createQueryBuilder('u')
                                ->andWhere('u.type_account = :type')
                                ->setParameter('type', 'professional')
                                ->orderBy('u.last_name', 'ASC')
                                ->addOrderBy('u.first_name', 'ASC');
                        },
                        'choice_label' => function (User $u) {
                            $fullName = trim($u->getFirstName() . ' ' . $u->getLastName());
                            return $fullName ?: $u->getEmail();
                        },
                    ])
            )
            ->add(
                EntityFilter::new('patientUser', $this->translator->trans('users.patient'))
                    ->setFormTypeOption('value_type_options', [
                        'query_builder' => function (EntityRepository $er) {
                            return $er->createQueryBuilder('u')
                                ->andWhere('u.type_account NOT IN (:excluded)')
                                ->setParameter('excluded', ['owner', 'admin'])
                                ->orderBy('u.last_name', 'ASC')
                                ->addOrderBy('u.first_name', 'ASC');
                        },
                        'choice_label' => function (User $u) {
                            $fullName = trim($u->getFirstName() . ' ' . $u->getLastName());
                            return $fullName ?: $u->getEmail();
                        },
                    ])
            )
            ->add(
                ChoiceFilter::new('status')
                    ->setChoices($filterChoices)
            )
            ->add(
                ChoiceFilter::new('type', $this->translator->trans('booking.fields.type'))
                    ->setChoices(array_flip(ConsultationTypeEnum::labels()))
            )
            ->add(BooleanFilter::new('quoteForInvited', $this->translator->trans('booking.fields.quote_for_invited')))
            ->add(DateTimeFilter::new('dateBookingStart', $this->translator->trans('booking.fields.date_start')))
            ->add(DateTimeFilter::new('dateBookingEnd', $this->translator->trans('booking.fields.date_end')));
    }

    public function configureActions(Actions $actions): Actions
    {
        $summary = Action::new('summary', $this->translator->trans('booking.actions.summary'), 'fa fa-eye')
            ->linkToCrudAction('summary')
            ->displayIf(fn($entityDto) => $this->isGranted('ROLE_ADMIN'));


        return $actions
            ->add(Crud::PAGE_INDEX, $summary)
            ->add(Crud::PAGE_DETAIL, $summary)
            ->update(Crud::PAGE_INDEX, Action::NEW, fn(Action $a) => $a->setIcon('fa fa-plus')->setLabel($this->translator->trans('booking.new')));
    }

    public function summary(AdminContext $context)
    {
        $id = $context->getRequest()->query->get('entityId');

        if (!$id) {
            throw new RuntimeException($this->translator->trans('booking.error.no_id', [], 'messages'));
        }

        $booking = $this->em->getRepository(Booking::class)->find($id);

        if (!$booking) {
            throw new RuntimeException($this->translator->trans('booking.error.not_found', [], 'messages'));
        }

        $summary = $this->bookingManagerService->serializeBookings($booking);

        return $this->render('admin/booking/summary.html.twig', [
            'booking' => $booking,
            'summary' => $summary,
        ]);
    }

    public function persistEntity(EntityManagerInterface $em, $entityInstance): void
    {
        if (!$entityInstance instanceof Booking) {
            parent::persistEntity($em, $entityInstance);
            return;
        }

        try {
            $this->bookingManagerService->assignAvailability($entityInstance);

            $this->bookingManagerService->finalizeBooking($entityInstance);
            $this->addFlash('success', $this->translator->trans('booking.flash.created', [], 'messages'));
        } catch (RuntimeException $e) {
            $this->addFlash('danger', $e->getMessage());
            return;
        }
    }

    public function updateEntity(EntityManagerInterface $em, $entityInstance): void
    {
        if (!$entityInstance instanceof Booking) {
            parent::updateEntity($em, $entityInstance);
            return;
        }

        try {
            $this->bookingManagerService->assignAvailability($entityInstance);

            $this->bookingManagerService->finalizeBooking($entityInstance);
            $this->addFlash('success', $this->translator->trans('booking.flash.updated', [], 'messages'));
        } catch (RuntimeException $e) {
            $this->addFlash('danger', $e->getMessage());
            return;
        }
    }
}
