<?php

namespace App\Controller\Admin;

use App\Entity\User;
use App\Entity\Availability;
use Doctrine\ORM\EntityRepository;
use App\Enum\TypeAccountEnum;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Filters;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\CollectionField;
use App\Form\AvailabilitySlotType;
use Symfony\Contracts\Translation\TranslatorInterface;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use App\Repository\AvailabilityRepository;
use EasyCorp\Bundle\EasyAdminBundle\Context\AdminContext;
use App\Admin\Filter\DateFilter;
use App\Admin\Filter\SpecialtyFilter;
use App\Repository\ProfessionRepository;
use EasyCorp\Bundle\EasyAdminBundle\Filter\EntityFilter;
use EasyCorp\Bundle\EasyAdminBundle\Dto\SearchDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\EntityDto;
use EasyCorp\Bundle\EasyAdminBundle\Collection\FieldCollection;
use EasyCorp\Bundle\EasyAdminBundle\Collection\FilterCollection;
use Doctrine\ORM\QueryBuilder;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;
use App\Repository\UserRepository;

use App\Utils\DeviceDetectionService;

class AvailabilityCrudController extends AbstractCrudController
{

    public function __construct(
        private TranslatorInterface $translator,
        private ValidatorInterface $validator,
        private UrlGeneratorInterface $urlGenerator,
        private RequestStack $requestStack,
        private AvailabilityRepository $availabilityRepository,
        private ProfessionRepository $professionRepository,
        private AdminUrlGenerator $adminUrlGenerator,
        private UserRepository $userRepository,
        private DeviceDetectionService $deviceDetectionService
    ) {}

    public static function getEntityFqcn(): string
    {
        return Availability::class;
    }

    private function isFilteredByProfessional(): bool
    {
        $request = $this->requestStack->getCurrentRequest();
        if (!$request) return false;

        $filters = $request->query->all('filters');
        return !empty($filters['professionalUser']['value']);
    }

    public function createIndexQueryBuilder(
        SearchDto $searchDto,
        EntityDto $entityDto,
        FieldCollection $fields,
        FilterCollection $filters
    ): QueryBuilder {
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

        if ($this->isFilteredByProfessional()) {
            $qb->leftJoin(sprintf('%s.professionalUser', $alias), 'p_filter');
            $request = $this->requestStack->getCurrentRequest();
            $filtersData = $request->query->all('filters');
            $proId = $filtersData['professionalUser']['value'] ?? null;
            if ($proId) {
                $qb->andWhere('p_filter.id = :filterProId')
                    ->setParameter('filterProId', $proId);
            }
        } else {

            $subQb = $this->container->get('doctrine')->getManager()->createQueryBuilder();
            $subQb->select('MIN(a2.id)')
                ->from(Availability::class, 'a2')
                ->groupBy('a2.professionalUser');

            $qb->andWhere($qb->expr()->in($alias . '.id', $subQb->getDQL()));

            if (!in_array('p', $qb->getAllAliases())) {
                $qb->leftJoin(sprintf('%s.professionalUser', $alias), 'p');
            }
        }

        if (!in_array('ud', $qb->getAllAliases())) {
            if (!in_array('p', $qb->getAllAliases())) {
                $qb->leftJoin(sprintf('%s.professionalUser', $alias), 'p');
            }
            $qb->leftJoin('p.userDetails', 'ud');
        }

        if (!in_array('mp', $qb->getAllAliases())) {
            $qb->leftJoin('ud.mainProfession', 'mp');
        }

        $term = trim((string)$searchDto->getQuery());
        if ($term !== '') {
            $lower = mb_strtolower($term);

            $orConditions = [
                'LOWER(p.first_name) LIKE :term',
                'LOWER(p.last_name) LIKE :term',
                'LOWER(CONCAT(p.first_name, \' \', p.last_name)) LIKE :term',
                'LOWER(mp.name) LIKE :term',
                $alias . '.slots LIKE :term',
            ];

            $qb->andWhere('(' . implode(' OR ', $orConditions) . ')')
                ->setParameter('term', '%' . $lower . '%');
        }

        return $qb;
    }

    public function configureCrud(Crud $crud): Crud
    {
        $title = $this->translator->trans('availability.label_plural');

        if ($this->isFilteredByProfessional()) {
            $request = $this->requestStack->getCurrentRequest();
            $filters = $request->query->all('filters');
            $proId = $filters['professionalUser']['value'] ?? null;
            if ($proId) {
                $user = $this->userRepository->find($proId);
                if ($user) {
                    $name = $user->getFirstName() . ' ' . $user->getLastName();
                    $title = sprintf('<span class="text-primary fw-bold" style="font-size: 1.5rem;">%s</span>', $name);
                }
            }
        }

        return $crud
            ->setEntityLabelInPlural($this->translator->trans('availability.label_plural'))
            ->setEntityLabelInSingular($this->translator->trans('availability.label_singular'))
            ->setPageTitle(Crud::PAGE_NEW, $this->translator->trans('availability.new'))
            ->setPageTitle(Crud::PAGE_EDIT, $this->translator->trans('availability.edit'))
            ->setPageTitle(Crud::PAGE_INDEX, $title)
            ->setDefaultSort(['professionalUser' => 'ASC', 'dateAvailability' => 'ASC'])
            ->setPaginatorPageSize($this->deviceDetectionService->getPaginatorPageSize());
    }

    public function configureFields(string $pageName): iterable
    {
        if ($pageName === Crud::PAGE_INDEX && !$this->isFilteredByProfessional()) {
            yield AssociationField::new('professionalUser', $this->translator->trans('availability.fields.professional'))
                ->setSortable(true);

            yield TextField::new('nextDates', $this->translator->trans('availability.fields.next_dates'))
                ->setVirtual(true)
                ->formatValue(function ($value, $entity) {
                    if (!$entity instanceof Availability) return '';
                    $dates = $this->availabilityRepository->getNextAvailabilityDates($entity->getProfessionalUser(), 4);

                    if (empty($dates)) return $this->translator->trans('availability.no_future_dates');

                    $hasMore = count($dates) > 3;
                    $displayDates = array_slice($dates, 0, 3);

                    $meses = ['Jan' => 'Ene', 'Feb' => 'Feb', 'Mar' => 'Mar', 'Apr' => 'Abr', 'May' => 'May', 'Jun' => 'Jun', 'Jul' => 'Jul', 'Aug' => 'Ago', 'Sep' => 'Sep', 'Oct' => 'Oct', 'Nov' => 'Nov', 'Dec' => 'Dic'];

                    $formatted = array_map(function ($d) use ($meses) {
                        return $d->format('d') . ' ' . ($meses[$d->format('M')] ?? $d->format('M'));
                    }, $displayDates);

                    $str = implode(', ', $formatted);

                    if ($hasMore) {
                        $str .= '...';
                    }
                    return $str;
                });

            yield TextField::new('daysSummary', $this->translator->trans('availability.fields.days_summary'))
                ->setVirtual(true)
                ->formatValue(function ($value, $entity) {
                    if (!$entity instanceof Availability) return '';
                    $count = $this->availabilityRepository->countFutureAvailabilities($entity->getProfessionalUser());
                    return sprintf($this->translator->trans('availability.days_active_blocks'), $count);
                });

            return;
        }

        if ($pageName !== Crud::PAGE_INDEX) {
            yield AssociationField::new('professionalUser', $this->translator->trans('availability.fields.professional'))
                ->setFormTypeOptions([
                    'choice_label' => fn(User $u) => $u->getFirstName() . ' ' . $u->getLastName(),
                    'query_builder' => function (EntityRepository $er) {
                        return $er->createQueryBuilder('u')
                            ->andWhere('u.type_account = :pro')
                            ->setParameter('pro', TypeAccountEnum::PROFESSIONAL->value)
                            ->orderBy('u.first_name', 'ASC');
                    },
                ]);
        }

        yield DateField::new('dateAvailability', $this->translator->trans('availability.fields.date_availability'))
            ->setRequired(true)
            ->setColumns(12)
            ->formatValue(function ($value, Availability $entity) {
                if (!$value instanceof \DateTimeInterface) {
                    return '';
                }
                $dia = (int)$value->format('N'); // 1..7
                $dias = [1 => 'Lunes', 2 => 'Martes', 3 => 'Miércoles', 4 => 'Jueves', 5 => 'Viernes', 6 => 'Sábado', 7 => 'Domingo'];
                $labelDia = $dias[$dia] ?? '';
                $fecha = $value->format('d M Y');
                $mesMap = ['Jan' => 'ene', 'Feb' => 'feb', 'Mar' => 'mar', 'Apr' => 'abr', 'May' => 'may', 'Jun' => 'jun', 'Jul' => 'jul', 'Aug' => 'ago', 'Sep' => 'sep', 'Oct' => 'oct', 'Nov' => 'nov', 'Dec' => 'dic'];
                [$d, $M, $Y] = explode(' ', $fecha);
                $M = $mesMap[$M] ?? $M;
                return sprintf('%s - %s %s %s', $labelDia, $d, $M, $Y);
            });

        yield CollectionField::new('slots', $this->translator->trans('availability.fields.slots'))
            ->setLabel($this->translator->trans('availability.fields.slots_label'))
            ->setEntryType(AvailabilitySlotType::class)
            ->allowAdd()
            ->allowDelete()
            ->setFormTypeOptions([
                'by_reference' => false,
                'entry_options' => [
                    'label' => false,
                ],
            ])
            ->setColumns(3)
            ->formatValue(function ($value) {
                if (!is_array($value)) {
                    return '';
                }
                $lines = [];
                foreach (array_values($value) as $i => $s) {
                    $start = $s['start'] ?? null;
                    $end   = $s['end'] ?? null;
                    if ($start && $end) {
                        $lines[] = sprintf('<div class="mb-1"><span class="badge badge-info">Bloque %d</span> %s - %s</div>', $i + 1, $start, $end);
                    }
                }
                return implode('', $lines);
            });
    }

    public function configureFilters(Filters $filters): Filters
    {
        return $filters
            ->add(
                EntityFilter::new('professionalUser', $this->translator->trans('availability.fields.professional'))
                    ->setFormTypeOption('value_type_options', [
                        'query_builder' => function (EntityRepository $er) {
                            return $er->createQueryBuilder('u')
                                ->andWhere('u.type_account = :type')
                                ->setParameter('type', TypeAccountEnum::PROFESSIONAL->value)
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
                DateFilter::new('dateAvailability', $this->translator->trans('availability.fields.date_availability'))
            )
            ->add(
                SpecialtyFilter::new('specialty', $this->translator->trans('users.specialty'))
            );
    }

    public function configureActions(Actions $actions): Actions
    {
        $viewGrouped = Action::new('viewGrouped', $this->translator->trans('availability.actions.view_grouped'), 'fa fa-th-list')
            ->linkToCrudAction('viewGrouped')
            ->createAsGlobalAction();

        $viewAvailabilities = Action::new('viewAvailabilities', $this->translator->trans('availability.actions.view_availabilities'))
            ->setIcon('fa fa-eye')
            ->displayIf(fn($entity) => !$this->isFilteredByProfessional())
            ->linkToUrl(function ($entity) {
                $pro = ($entity instanceof User) ? $entity : $entity->getProfessionalUser();
                return $this->adminUrlGenerator
                    ->setController(self::class)
                    ->setAction(Action::INDEX)
                    ->set('filters[professionalUser][comparison]', '=')
                    ->set('filters[professionalUser][value]', $pro->getId())
                    ->generateUrl();
            });

        $backToList = Action::new('backToList', $this->translator->trans('action.back_to_list'), 'fa fa-arrow-left')
            ->createAsGlobalAction()
            ->linkToUrl(function () {
                return $this->adminUrlGenerator
                    ->setController(self::class)
                    ->setAction(Action::INDEX)
                    ->unset('filters')
                    ->generateUrl();
            });

        $actions
            ->add(Crud::PAGE_INDEX, $viewGrouped)
            ->add(Crud::PAGE_INDEX, $viewAvailabilities)
            ->update(Crud::PAGE_INDEX, Action::NEW, fn(Action $a) => $a->setIcon('fa fa-plus')->setLabel($this->translator->trans('availability.new')));

        if (!$this->isFilteredByProfessional()) {
            $actions->remove(Crud::PAGE_INDEX, Action::EDIT);
            $actions->remove(Crud::PAGE_INDEX, Action::DELETE);
        } else {
            $actions->add(Crud::PAGE_INDEX, $backToList);
            $actions->remove(Crud::PAGE_INDEX, 'viewAvailabilities');
        }

        return $actions;
    }

    public function viewGrouped(AdminContext $context)
    {
        $request = $context->getRequest();
        $groupBy = $request->query->get('groupBy', 'day');
        $page = max(1, (int)$request->query->get('page', 1));
        $limit = max(1, (int)$request->query->get('limit', 10));
        $filters = [];

        $data = $this->availabilityRepository->aggregateAvailability($groupBy, $filters);

        $groupKeys = array_keys($data);
        $totalGroups = count($groupKeys);
        $totalPages = (int)ceil($totalGroups / $limit);
        $page = min($page, $totalPages > 0 ? $totalPages : 1);
        $offset = ($page - 1) * $limit;
        $pagedKeys = array_slice($groupKeys, $offset, $limit);
        $pagedGroups = [];
        foreach ($pagedKeys as $key) {
            $pagedGroups[$key] = $data[$key];
        }

        return $this->render('admin/availability/grouped.html.twig', [
            'groupBy' => $groupBy,
            'groups'  => $pagedGroups,
            'ea'      => $context,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'totalPages' => $totalPages,
                'totalGroups' => $totalGroups,
            ],
        ]);
    }

    public function persistEntity(EntityManagerInterface $em, $entityInstance): void
    {
        if ($entityInstance instanceof Availability) {
            $violations = $this->validator->validate($entityInstance);
            if (count($violations) > 0) {
                foreach ($violations as $v) {
                    $this->addFlash('danger', $v->getMessage());
                }

                $request = $this->requestStack->getCurrentRequest();
                $referer = $request ? $request->headers->get('referer') : null;
                $location = $referer ?? $this->urlGenerator->generate('admin');

                throw new BadRequestHttpException('Validación fallida', null, 0, ['Location' => $location]);
            }
        }

        parent::persistEntity($em, $entityInstance);
    }

    public function updateEntity(EntityManagerInterface $em, $entityInstance): void
    {
        if ($entityInstance instanceof Availability) {
            $violations = $this->validator->validate($entityInstance);
            if (count($violations) > 0) {
                foreach ($violations as $v) {
                    $this->addFlash('danger', $v->getMessage());
                }

                $request = $this->requestStack->getCurrentRequest();
                $referer = $request ? $request->headers->get('referer') : null;
                $location = $referer ?? $this->urlGenerator->generate('admin');

                throw new BadRequestHttpException('Validación fallida', null, 0, ['Location' => $location]);
            }
        }

        parent::updateEntity($em, $entityInstance);
    }
}
