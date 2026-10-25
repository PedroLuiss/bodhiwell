<?php

namespace App\Controller\Admin;

use App\Entity\Booking;
use App\Entity\Consultation;
use App\Form\ConsultationDetailType;
use App\Enum\ConsultationTypeEnum;
use App\Repository\UserRepository;
use App\Repository\ProfessionRepository;
use Doctrine\ORM\EntityRepository;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Contracts\Translation\TranslatorInterface;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Filters;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\{
    TextareaField,
    DateTimeField,
    AssociationField,
    CollectionField
};
use App\Admin\Filter\SpecialtyFilter;
use EasyCorp\Bundle\EasyAdminBundle\Filter\ChoiceFilter;
use App\Admin\Filter\DateFilter;
use App\Admin\Filter\ManualChoiceFilter;
use EasyCorp\Bundle\EasyAdminBundle\Dto\SearchDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\EntityDto;
use EasyCorp\Bundle\EasyAdminBundle\Collection\FieldCollection;
use EasyCorp\Bundle\EasyAdminBundle\Collection\FilterCollection;
use Doctrine\ORM\QueryBuilder;
use EasyCorp\Bundle\EasyAdminBundle\Context\AdminContext;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;

use Symfony\Component\HttpFoundation\RequestStack;

use App\Utils\DeviceDetectionService;

class ConsultationCrudController extends AbstractCrudController
{
    public function __construct(
        private TranslatorInterface $translator,
        private UserRepository $userRepository,
        private ProfessionRepository $professionRepository,
        private AdminUrlGenerator $adminUrlGenerator,
        private RequestStack $requestStack,
        private DeviceDetectionService $deviceDetectionService
    ) {}

    public static function getEntityFqcn(): string
    {
        return Consultation::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        $user = $this->getUser();

        if (!$user || (
            !in_array('ROLE_ADMIN', $user->getRoles())
            && !in_array('ROLE_OWNER', $user->getRoles())
        )) {
            throw new AccessDeniedHttpException('Acceso denegado');
        }

        return $crud
            ->setEntityLabelInSingular($this->translator->trans('consultation.new'))
            ->setEntityLabelInPlural($this->translator->trans('consultation.label_plural'))
            ->setSearchFields(['booking.professionalUser.first_name', 'booking.professionalUser.last_name', 'booking.patientUser.first_name', 'booking.patientUser.last_name', 'uid'])
            ->setPaginatorPageSize($this->deviceDetectionService->getPaginatorPageSize());
    }

    public function configureActions(Actions $actions): Actions
    {
        $detail = Action::new(Action::DETAIL, $this->translator->trans('users.actions.details'), 'fa fa-eye')
            ->linkToCrudAction(Action::DETAIL);

        return $actions
            ->add(Crud::PAGE_INDEX, $detail);
    }

    public function detail(AdminContext $context)
    {
        $consultation = $context->getEntity()->getInstance();

        return $this->render('admin/consultation/detail.html.twig', [
            'consultation' => $consultation,
        ]);
    }

    public function configureFields(string $pageName): iterable
    {
        $choices = array_flip(ConsultationTypeEnum::labels());

        yield ChoiceField::new('type', $this->translator->trans('consultation.fields.type'))
            ->setChoices($choices)
            ->renderAsBadges()
            ->setFormTypeOption('choice_loader', null)
            ->setFormTypeOption('choices', ConsultationTypeEnum::cases())
            ->setFormTypeOption(
                'choice_label',
                fn(ConsultationTypeEnum $e) =>
                ConsultationTypeEnum::labels()[$e->value]
            );

        yield TextField::new('booking.patientUser', $this->translator->trans('users.patient'))
            ->onlyOnIndex()
            ->formatValue(function ($value, $entity) {
                $user = $entity->getBooking()?->getPatientUser();
                if (!$user) return '';

                $name = $user->getFirstName() . ' ' . $user->getLastName();

                $url = $this->adminUrlGenerator
                    ->setController(\App\Controller\Admin\UserPatientCrudController::class)
                    ->setAction(Action::DETAIL)
                    ->setEntityId($user->getId())
                    ->generateUrl();

                return sprintf('<a href="%s">%s</a>', $url, $name);
            })
            ->setTemplatePath('admin/field/raw.html.twig');

        yield TextField::new('booking.professionalUser', $this->translator->trans('users.professional'))
            ->onlyOnIndex()
            ->formatValue(function ($value, $entity) {
                $user = $entity->getBooking()?->getProfessionalUser();
                if (!$user) return '';

                $name = $user->getFirstName() . ' ' . $user->getLastName();

                $url = $this->adminUrlGenerator
                    ->setController(\App\Controller\Admin\UserProfessionalCrudController::class)
                    ->setAction(Action::DETAIL)
                    ->setEntityId($user->getId())
                    ->generateUrl();

                return sprintf('<a href="%s">%s</a>', $url, $name);
            })
            ->setTemplatePath('admin/field/raw.html.twig');

        yield DateTimeField::new('createdAt', $this->translator->trans('consultation.fields.created_at'))
            ->onlyOnIndex()
            ->setFormat('dd/MM/yyyy HH:mm');

        yield TextareaField::new('reserveReason', $this->translator->trans('consultation.fields.reserve_reason'))
            ->setMaxLength(5000)
            ->hideOnIndex();

        yield BooleanField::new('quoteForInvited', $this->translator->trans('consultation.fields.quote_for_invited'))
            ->renderAsSwitch(false)
            ->hideOnIndex();

        yield TextareaField::new('notes', $this->translator->trans('consultation.fields.notes'))
            ->hideOnIndex();

        $bookingFormField = AssociationField::new('booking', $this->translator->trans('booking.label_plural'))
            ->setFormTypeOptions([
                'choice_label' => function (Booking $b) {
                    $prof = $b->getProfessionalUser();
                    $pat  = $b->getPatientUser();
                    $profName = $prof ? $prof->getFirstName() . ' ' . $prof->getLastName() : '';
                    $patName  = $pat ? $pat->getFirstName() . ' ' . $pat->getLastName() : '';
                    $dt = $b->getDateBookingStart();
                    $dateStr = $dt ? $dt->format('Y-m-d H:i') : '';
                    return sprintf('%s - %s - %s', $profName, $patName, $dateStr);
                },
                'query_builder' => function (EntityRepository $er) use ($pageName) {
                    $qb = $er->createQueryBuilder('b')
                        ->leftJoin('b.consultation', 'c')
                        ->where('c.id IS NULL');

                    if ($pageName === Crud::PAGE_EDIT) {
                        $current = $this->getContext()->getEntity()->getInstance();
                        $book    = $current->getBooking();
                        if ($book && $book->getId()) {
                            $qb->orWhere('b.id = :bid')
                                ->setParameter('bid', $book->getId());
                        }
                    }

                    return $qb;
                },
            ])
            ->onlyOnForms();

        yield $bookingFormField;

        yield CollectionField::new(
            'consultationDetails',
            $this->translator->trans('consultation.details_label')
        )
            ->setEntryType(ConsultationDetailType::class)
            ->setFormTypeOptions([
                'by_reference' => false,

            ])
            ->onlyOnForms();
    }

    public function configureFilters(Filters $filters): Filters
    {
        $professionals = $this->userRepository->createQueryBuilder('u')
            ->andWhere('u.type_account = :type')
            ->setParameter('type', 'professional')
            ->orderBy('u.last_name', 'ASC')
            ->addOrderBy('u.first_name', 'ASC')
            ->getQuery()
            ->getResult();

        $professionalChoices = [];
        foreach ($professionals as $pro) {
            $fullName = trim($pro->getFirstName() . ' ' . $pro->getLastName());
            if ($fullName === '') $fullName = $pro->getEmail();
            $professionalChoices[$fullName] = $pro->getId();
        }

        $patients = $this->userRepository->createQueryBuilder('u')
            ->andWhere('u.type_account NOT IN (:excluded)')
            ->setParameter('excluded', ['owner', 'admin'])
            ->orderBy('u.last_name', 'ASC')
            ->addOrderBy('u.first_name', 'ASC')
            ->getQuery()
            ->getResult();

        $patientChoices = [];
        foreach ($patients as $pat) {
            $fullName = trim($pat->getFirstName() . ' ' . $pat->getLastName());
            if ($fullName === '') $fullName = $pat->getEmail();
            $patientChoices[$fullName] = $pat->getId();
        }

        $professions = $this->professionRepository->findAll();
        $specialtyChoices = [];
        foreach ($professions as $p) {
            $specialtyChoices[$p->getName()] = $p->getId();
        }

        return $filters
            ->add(DateFilter::new('createdAt', $this->translator->trans('consultation.fields.created_at')))
            ->add(
                ManualChoiceFilter::new('patientId', $this->translator->trans('users.patient'))
                    ->setChoices($patientChoices)
            )
            ->add(
                ManualChoiceFilter::new('professionalId', $this->translator->trans('users.professional'))
                    ->setChoices($professionalChoices)
            )
            ->add(SpecialtyFilter::new('specialty', $this->translator->trans('users.specialty')));
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

        if (!in_array('b', $qb->getAllAliases())) {
            $qb->leftJoin(sprintf('%s.booking', $alias), 'b');
        }

        if (!in_array('p', $qb->getAllAliases())) {
            $qb->leftJoin('b.professionalUser', 'p');
        }
        if (!in_array('pat', $qb->getAllAliases())) {
            $qb->leftJoin('b.patientUser', 'pat');
        }
        if (!in_array('ud', $qb->getAllAliases())) {
            $qb->leftJoin('p.userDetails', 'ud');
        }
        if (!in_array('mp', $qb->getAllAliases())) {
            $qb->leftJoin('ud.mainProfession', 'mp');
        }

        $term = trim((string)$searchDto->getQuery());
        if ($term !== '') {
            $lower = mb_strtolower($term);

            $statusMatches = [];
            $statusKeywords = [
                'pending'   => ['pending', 'pendiente'],
                'completed' => ['completed', 'completada', 'completado'],
                'cancelled' => ['cancelled', 'cancelada', 'cancelado'],
            ];

            foreach ($statusKeywords as $status => $words) {
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
                'LOWER(' . $alias . '.uid) LIKE :term',
                'LOWER(p.first_name) LIKE :term',
                'LOWER(p.last_name) LIKE :term',
                'LOWER(pat.first_name) LIKE :term',
                'LOWER(pat.last_name) LIKE :term',
                'LOWER(CONCAT(p.first_name, \' \', p.last_name)) LIKE :term',
                'LOWER(CONCAT(pat.first_name, \' \', pat.last_name)) LIKE :term',
                'LOWER(mp.name) LIKE :term',
                'LOWER(' . $alias . '.notes) LIKE :term',
                'LOWER(' . $alias . '.reserveReason) LIKE :term',
            ];

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
                $orConditions[] = $alias . '.consultationStatus IN (:status_matches)';
                $qb->setParameter('status_matches', array_unique($statusMatches));
            }

            if (!empty($typeMatches)) {
                $orConditions[] = $alias . '.type IN (:type_matches)';
                $qb->setParameter('type_matches', array_unique($typeMatches));
            }

            $qb->andWhere('(' . implode(' OR ', $orConditions) . ')')
                ->setParameter('term', '%' . $lower . '%');
        }

        $request = $this->getContext()->getRequest();
        if ($request) {
            $filtersData = $request->query->all('filters');

            if (!empty($filtersData['patientId']['value'])) {
                $patientId = $filtersData['patientId']['value'];
                $qb->andWhere('b.patientUser = :pid')
                    ->setParameter('pid', $patientId);
            }

            if (!empty($filtersData['professionalId']['value'])) {
                $professionalId = $filtersData['professionalId']['value'];
                $qb->andWhere('b.professionalUser = :prid')
                    ->setParameter('prid', $professionalId);
            }
        }

        return $qb;
    }
}
