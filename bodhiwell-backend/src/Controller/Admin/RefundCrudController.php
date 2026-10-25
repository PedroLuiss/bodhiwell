<?php

namespace App\Controller\Admin;

use App\Entity\Refund;
use App\Entity\User;
use App\Enum\RefundStatus;
use App\Services\RefundService;
use App\Admin\Filter\DateFilter;
use App\Admin\Filter\FullNameFilter;
use Symfony\Contracts\Translation\TranslatorInterface;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\MoneyField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\FormField;
use EasyCorp\Bundle\EasyAdminBundle\Filter\ChoiceFilter;
use Symfony\Component\HttpFoundation\Response;
use EasyCorp\Bundle\EasyAdminBundle\Context\AdminContext;
use EasyCorp\Bundle\EasyAdminBundle\Config\Filters;
use EasyCorp\Bundle\EasyAdminBundle\Config\Assets;
use EasyCorp\Bundle\EasyAdminBundle\Config\Asset;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use App\Entity\Booking;
use Doctrine\ORM\EntityRepository;
use EasyCorp\Bundle\EasyAdminBundle\Dto\EntityDto;
use EasyCorp\Bundle\EasyAdminBundle\Config\KeyValueStore;
use Symfony\Component\Form\FormInterface;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;
use EasyCorp\Bundle\EasyAdminBundle\Factory\EntityFactory;
use EasyCorp\Bundle\EasyAdminBundle\Factory\FilterFactory;
use EasyCorp\Bundle\EasyAdminBundle\Collection\FilterCollection;
use EasyCorp\Bundle\EasyAdminBundle\Dto\SearchDto;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Doctrine\ORM\QueryBuilder;
use EasyCorp\Bundle\EasyAdminBundle\Collection\FieldCollection;
use Symfony\Component\HttpFoundation\RequestStack;

use App\Utils\DeviceDetectionService;

class RefundCrudController extends AbstractCrudController
{
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

        if (!in_array('patient', $qb->getAllAliases())) {
            $qb->leftJoin($alias . '.patient', 'patient');
        }
        if (!in_array('professional', $qb->getAllAliases())) {
            $qb->leftJoin($alias . '.professional', 'professional');
        }

        $term = trim((string)$searchDto->getQuery());
        if ($term !== '') {
            $lower = mb_strtolower($term);

            $statusMatches = [];
            $statusKeywords = [
                'review'    => ['review', 'revision', 'revisión'],
                'approved'  => ['approved', 'aprobado', 'aprobada'],
                'rejected'  => ['rejected', 'rechazado', 'rechazada'],
                'completed' => ['completed', 'completado', 'completada'],
            ];

            foreach ($statusKeywords as $status => $words) {
                foreach ($words as $word) {
                    if (str_contains($word, $lower) || str_contains($lower, $word)) {
                        $statusMatches[] = $status;
                        break;
                    }
                }
            }

            $orConditions = [
                'LOWER(' . $alias . '.uid) LIKE :term',
                'LOWER(patient.first_name) LIKE :term',
                'LOWER(patient.last_name) LIKE :term',
                'LOWER(professional.last_name) LIKE :term',
                'LOWER(CONCAT(patient.first_name, \' \', patient.last_name)) LIKE :term',
                'LOWER(CONCAT(professional.first_name, \' \', professional.last_name)) LIKE :term',
                'LOWER(' . $alias . '.reason) LIKE :term',
            ];

            $cleanAmount = preg_replace('/[^\d,]/', '', $lower);
            $cleanAmount = str_replace(',', '.', $cleanAmount);
            if (is_numeric($cleanAmount)) {
                $cents = (int)round((float)$cleanAmount * 100);
                $orConditions[] = $alias . '.amount = :amount_cents';
                $qb->setParameter('amount_cents', $cents);
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

                $orConditions[] = $alias . '.createdAt LIKE :date_like';
                $qb->setParameter('date_like', $dateLike);
            } else {
                $orConditions[] = $alias . '.createdAt LIKE :term';
            }

            if (!empty($statusMatches)) {
                $orConditions[] = $alias . '.status IN (:status_matches)';
                $qb->setParameter('status_matches', array_unique($statusMatches));
            }

            $qb->andWhere('(' . implode(' OR ', $orConditions) . ')')
                ->setParameter('term', '%' . $lower . '%');
        }

        return $qb;
    }

    public function __construct(
        private RefundService $refundService,
        private TranslatorInterface $translator,
        private EntityFactory $entityFactory,
        private AdminUrlGenerator $adminUrlGenerator,
        private RequestStack $requestStack,
        private DeviceDetectionService $deviceDetectionService
    ) {}

    public static function getEntityFqcn(): string
    {
        return Refund::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular($this->translator->trans('refund.label_singular'))
            ->setEntityLabelInPlural($this->translator->trans('refund.label_plural'))
            ->setSearchFields(['uid', 'patient.email', 'patient.firstName', 'patient.lastName'])
            ->setDefaultSort(['createdAt' => 'DESC'])
            ->setPaginatorPageSize($this->deviceDetectionService->getPaginatorPageSize());
    }

    public function configureAssets(Assets $assets): Assets
    {
        return $assets
            ->addJsFile(Asset::new('assets/js/admin/refund_booking_updater.js'));
    }

    public function configureActions(Actions $actions): Actions
    {
        $exportAction = Action::new('export', 'Exportar CSV')
            ->linkToCrudAction('export')
            ->createAsGlobalAction()
            ->setCssClass('btn btn-success')
            ->setIcon('fa fa-download');

        $approveAction = Action::new('approve', $this->translator->trans('refund.actions.approve'))
            ->linkToCrudAction('approve')
            ->addCssClass('text-success')
            ->setIcon('fa fa-check')
            ->displayIf(fn(Refund $refund) => $refund->getStatus() === RefundStatus::REVIEW);

        $rejectAction = Action::new('reject', $this->translator->trans('refund.actions.reject'))
            ->linkToCrudAction('reject')
            ->addCssClass('text-danger')
            ->setIcon('fa fa-times')
            ->displayIf(fn(Refund $refund) => $refund->getStatus() === RefundStatus::REVIEW);

        return $actions
            ->add(Crud::PAGE_INDEX, $exportAction)
            ->add(Crud::PAGE_INDEX, $approveAction)
            ->add(Crud::PAGE_INDEX, $rejectAction)
            ->add(Crud::PAGE_DETAIL, $approveAction)
            ->add(Crud::PAGE_DETAIL, $rejectAction)
            ->disable(Action::DELETE, Action::EDIT)
            ->add(Crud::PAGE_INDEX, Action::DETAIL);
    }

    public function export(AdminContext $context): StreamedResponse
    {
        $entityDto = $this->entityFactory->create(self::getEntityFqcn());

        $crudDto = $context->getCrud();
        if (null === $crudDto) {
            $crudDto = $this->configureCrud(Crud::new())->getAsDto();
        }

        $searchDto = $context->getSearch();
        if (null === $searchDto) {
            $request = $context->getRequest();
            $searchDto = new SearchDto(
                $request,
                $crudDto->getSearchFields(),
                $request->query->get('query'),
                $crudDto->getDefaultSort(),
                $request->query->all('sort'),
                $request->query->all('filters')
            );
        }

        $fields = FieldCollection::new($this->configureFields(Crud::PAGE_INDEX));

        $filterConfigDto = $this->configureFilters(Filters::new())->getAsDto();
        $filters = $this->container->get(FilterFactory::class)->create($filterConfigDto, $fields, $entityDto);

        $qb = $this->createIndexQueryBuilder($searchDto, $entityDto, $fields, $filters);
        $refunds = $qb->getQuery()->getResult();

        $response = new StreamedResponse(function () use ($refunds) {
            $handle = fopen('php://output', 'w+');

            fputs($handle, "\xEF\xBB\xBF");

            fputcsv($handle, ['Id', 'Fecha', 'Consultante', 'Profesional', 'Reserva', 'Monto', 'Estado', 'Motivo'], ';');

            foreach ($refunds as $refund) {
                /** @var Refund $refund */
                $patient = $refund->getPatient();
                $patientName = $patient ? sprintf('%s %s', $patient->getFirstName(), $patient->getLastName()) : 'N/A';

                $professional = $refund->getProfessional();
                $profName = $professional ? sprintf('%s %s', $professional->getFirstName(), $professional->getLastName()) : 'N/A';

                $booking = $refund->getBooking();
                $bookingInfo = $booking ? $booking->getUid() : 'N/A';

                fputcsv($handle, [
                    $refund->getUid(),
                    $refund->getCreatedAt()->format('Y-m-d H:i:s'),
                    $patientName,
                    $profName,
                    $bookingInfo,
                    number_format($refund->getAmount() / 100, 2, ',', ''),
                    $refund->getStatus()->value,
                    $refund->getReason()
                ], ';');
            }

            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
        $response->headers->set('Content-Disposition', 'attachment; filename="reembolsos.csv"');

        return $response;
    }

    public function createNewFormBuilder(EntityDto $entityDto, KeyValueStore $formOptions, AdminContext $context): FormBuilderInterface
    {
        $formBuilder = parent::createNewFormBuilder($entityDto, $formOptions, $context);
        return $this->addBookingEventListener($formBuilder);
    }

    public function createEditFormBuilder(EntityDto $entityDto, KeyValueStore $formOptions, AdminContext $context): FormBuilderInterface
    {
        $formBuilder = parent::createEditFormBuilder($entityDto, $formOptions, $context);
        return $this->addBookingEventListener($formBuilder);
    }

    private function addBookingEventListener(FormBuilderInterface $formBuilder): FormBuilderInterface
    {
        $formBuilder->addEventListener(FormEvents::PRE_SET_DATA, function (FormEvent $event) {
            $refund = $event->getData();
            $form = $event->getForm();
            $patient = $refund instanceof Refund ? $refund->getPatient() : null;

            $this->addBookingField($form, $patient);
        });

        $formBuilder->addEventListener(FormEvents::PRE_SUBMIT, function (FormEvent $event) {
            $data = $event->getData();
            $patientId = $data['patient'] ?? null;
            $form = $event->getForm();

            if ($patientId) {
                $this->addBookingField($form, $patientId);
            }
        });

        return $formBuilder;
    }

    private function addBookingField(FormInterface $form, $patientOrId)
    {
        $form->add('booking', EntityType::class, [
            'class' => Booking::class,
            'placeholder' => $this->translator->trans('refund.placeholders.select_booking'),
            'label' => $this->translator->trans('refund.fields.booking'),
            'required' => false,
            'choice_label' => function (Booking $booking) {
                return sprintf(
                    '%s - %s',
                    $booking->getDateBookingStart() ? $booking->getDateBookingStart()->format('d/m/Y H:i') : $this->translator->trans('refund.placeholders.no_date'),
                    $booking->getStatus() ?? ''
                );
            },
            'query_builder' => function (EntityRepository $er) use ($patientOrId) {
                if (!$patientOrId) {
                    return $er->createQueryBuilder('b')->where('1=0');
                }

                $qb = $er->createQueryBuilder('b');

                if ($patientOrId instanceof User) {
                    $qb->where('b.patientUser = :patient')
                        ->setParameter('patient', $patientOrId);
                } else {
                    $qb->where('b.patientUser = :patientId')
                        ->setParameter('patientId', $patientOrId);
                }

                return $qb->orderBy('b.dateBookingStart', 'DESC');
            },
        ]);
    }

    public function configureFields(string $pageName): iterable
    {
        yield FormField::addColumn(6);
        yield AssociationField::new('professional')->setLabel($this->translator->trans('refund.fields.professional'))
            ->hideOnForm()
            ->formatValue(function ($value, $entity) {
                if (!$value) return 'N/A';

                $name = method_exists($value, 'getFullName') ? $value->getFullName() : (string)$value;
                if ($value instanceof User) {
                    $name = $value->getFirstName() . ' ' . $value->getLastName();
                }

                $url = $this->adminUrlGenerator
                    ->setController(\App\Controller\Admin\UserProfessionalCrudController::class)
                    ->setAction(Action::DETAIL)
                    ->setEntityId($value->getId())
                    ->generateUrl();

                return sprintf('<a href="%s">%s</a>', $url, $name);
            })
            ->setTemplatePath('admin/field/raw.html.twig');

        yield AssociationField::new('patient')->setLabel($this->translator->trans('refund.fields.patient'))
            ->formatValue(function ($value, $entity) {
                if (!$value) return 'N/A';

                $name = method_exists($value, 'getFullName') ? $value->getFullName() : (string)$value;
                if ($value instanceof User) {
                    $name = $value->getFirstName() . ' ' . $value->getLastName();
                }

                $url = $this->adminUrlGenerator
                    ->setController(\App\Controller\Admin\UserPatientCrudController::class)
                    ->setAction(Action::DETAIL)
                    ->setEntityId($value->getId())
                    ->generateUrl();

                return sprintf('<a href="%s">%s</a>', $url, $name);
            })
            ->setTemplatePath('admin/field/raw.html.twig');

        yield AssociationField::new('booking')->setLabel($this->translator->trans('refund.fields.booking'));
        yield MoneyField::new('amount')
            ->setCurrency('UYU')
            ->setStoredAsCents(false)
            ->setLabel($this->translator->trans('refund.fields.amount'));

        yield FormField::addColumn(12);
        yield TextareaField::new('reason')
            ->setLabel($this->translator->trans('refund.fields.reason'))
            ->setColumns(6);

        $statusChoices = [];
        foreach (RefundStatus::cases() as $case) {
            $statusChoices[$case->name] = $case;
        }

        yield ChoiceField::new('status')
            ->setChoices($statusChoices)
            ->setLabel($this->translator->trans('refund.fields.status'))
            ->formatValue(function ($value, $entity) {
                if ($value instanceof RefundStatus) {
                    $val = $value->value;
                } else {
                    $val = $value;
                }

                $label = strtoupper($this->translator->trans('refund.status.' . strtolower($val)));

                $colorMap = [
                    RefundStatus::REVIEW->value => 'warning',
                    RefundStatus::APPROVED->value => 'success',
                    RefundStatus::REJECTED->value => 'danger',
                    RefundStatus::COMPLETED->value => 'success',
                ];
                $color = $colorMap[$val] ?? 'secondary';

                return sprintf('<span class="badge badge-%s">%s</span>', $color, $label);
            })
            ->setTemplatePath('admin/field/raw.html.twig')
            ->hideOnForm();

        yield DateTimeField::new('createdAt')->setLabel($this->translator->trans('refund.fields.created_at'))->hideOnForm();
        yield TextareaField::new('adminNote')->setLabel($this->translator->trans('refund.fields.admin_note'))->hideOnForm();
    }

    public function configureFilters(Filters $filters): Filters
    {
        return $filters
            ->add(FullNameFilter::new('patient', $this->translator->trans('refund.fields.patient')))
            ->add(DateFilter::new('createdAt', $this->translator->trans('refund.fields.created_at')))
            ->add(ChoiceFilter::new('status', $this->translator->trans('refund.fields.status'))->setChoices([
                $this->translator->trans('refund.status.review') => RefundStatus::REVIEW,
                $this->translator->trans('refund.status.approved') => RefundStatus::APPROVED,
                $this->translator->trans('refund.status.rejected') => RefundStatus::REJECTED,
            ]));
    }

    public function persistEntity(EntityManagerInterface $entityManager, $entityInstance): void
    {
        if (!$entityInstance instanceof Refund) {
            return;
        }

        if ($entityInstance->getBooking() && $entityInstance->getPatient()) {
            $bookingPatient = $entityInstance->getBooking()->getPatientUser();
            if ($bookingPatient->getId() !== $entityInstance->getPatient()->getId()) {
                throw new \RuntimeException($this->translator->trans('refund.error.validation_booking_mismatch', [
                    '%booking_email%' => $bookingPatient->getEmail(),
                    '%patient_email%' => $entityInstance->getPatient()->getEmail()
                ]));
            }
        }

        if (!$entityInstance->getProfessional() && $entityInstance->getBooking()) {
            $entityInstance->setProfessional($entityInstance->getBooking()->getProfessionalUser());
        }

        try {
            $this->refundService->createRefund(
                $entityInstance->getPatient(),
                $entityInstance->getProfessional(),
                $entityInstance->getBooking(),
                (int)$entityInstance->getAmount(),
                $entityInstance->getReason(),
                $entityInstance
            );
        } catch (\Exception $e) {
            throw new \RuntimeException($this->translator->trans('refund.error.creation_failed') . $e->getMessage());
        }
    }

    public function approve(AdminContext $context, EntityManagerInterface $em): Response
    {
        $refundId = $context->getRequest()->query->get('entityId');
        $refund = $em->getRepository(Refund::class)->find($refundId);

        /** @var AdminUrlGenerator $adminUrlGenerator */
        $adminUrlGenerator = $this->container->get(AdminUrlGenerator::class);

        if (!$refund) {
            $this->addFlash('danger', 'Reembolso no encontrado');
            return $this->redirect($adminUrlGenerator->setController(self::class)->setAction(Crud::PAGE_INDEX)->generateUrl());
        }

        $admin = $this->getUser();

        try {
            $this->refundService->approveRefund($refund, $admin, $this->translator->trans('refund.notes.approved_admin'));
            $this->addFlash('success', $this->translator->trans('refund.flash.approved_success'));
        } catch (\Exception $e) {
            $this->addFlash('danger', $this->translator->trans('refund.flash.error_prefix') . $e->getMessage());
        }

        return $this->redirect($adminUrlGenerator->setController(self::class)->setAction(Crud::PAGE_DETAIL)->setEntityId($refund->getId())->generateUrl());
    }

    public function reject(AdminContext $context, EntityManagerInterface $em): Response
    {
        $refundId = $context->getRequest()->query->get('entityId');
        $refund = $em->getRepository(Refund::class)->find($refundId);

        /** @var AdminUrlGenerator $adminUrlGenerator */
        $adminUrlGenerator = $this->container->get(AdminUrlGenerator::class);

        if (!$refund) {
            $this->addFlash('danger', 'Reembolso no encontrado');
            return $this->redirect($adminUrlGenerator->setController(self::class)->setAction(Crud::PAGE_INDEX)->generateUrl());
        }

        $admin = $this->getUser();

        try {
            $this->refundService->rejectRefund($refund, $admin, $this->translator->trans('refund.notes.rejected_admin'));
            $this->addFlash('danger', $this->translator->trans('refund.flash.rejected_success'));
        } catch (\Exception $e) {
            $this->addFlash('danger', $this->translator->trans('refund.flash.error_prefix') . $e->getMessage());
        }

        return $this->redirect($adminUrlGenerator->setController(self::class)->setAction(Crud::PAGE_DETAIL)->setEntityId($refund->getId())->generateUrl());
    }
}
