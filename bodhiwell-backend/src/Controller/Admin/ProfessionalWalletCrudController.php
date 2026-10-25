<?php

namespace App\Controller\Admin;

use App\Entity\ProfessionalWallet;
use App\Enum\WalletStatusEnum;
use Doctrine\ORM\EntityManagerInterface;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Filters;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\MoneyField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Filter\EntityFilter;
use EasyCorp\Bundle\EasyAdminBundle\Filter\ChoiceFilter;
use App\Repository\UserRepository;
use App\Admin\Filter\ManualChoiceFilter;
use App\Admin\Filter\PaymentDateFilter;
use EasyCorp\Bundle\EasyAdminBundle\Dto\SearchDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\EntityDto;
use EasyCorp\Bundle\EasyAdminBundle\Collection\FieldCollection;
use EasyCorp\Bundle\EasyAdminBundle\Collection\FilterCollection;
use Doctrine\ORM\QueryBuilder;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Contracts\Translation\TranslatorInterface;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;

use Symfony\Component\HttpFoundation\RequestStack;

use App\Utils\DeviceDetectionService;

#[IsGranted('ROLE_ADMIN')]
class ProfessionalWalletCrudController extends AbstractCrudController
{
    public function __construct(
        private LoggerInterface $logger,
        private EntityManagerInterface $em,
        private TranslatorInterface $translator,
        private UserRepository $userRepository,
        private AdminUrlGenerator $adminUrlGenerator,
        private RequestStack $requestStack,
        private DeviceDetectionService $deviceDetectionService
    ) {}

    public static function getEntityFqcn(): string
    {
        return ProfessionalWallet::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular($this->translator->trans('professional_wallet.label_singular'))
            ->setEntityLabelInPlural($this->translator->trans('professional_wallet.label_plural'))
            ->setDefaultSort(['updatedAt' => 'DESC'])
            ->setPaginatorPageSize($this->deviceDetectionService->getPaginatorPageSize());
    }

    public function configureActions(Actions $actions): Actions
    {
        $viewLedger = Action::new('viewLedger', 'Ver Movimientos')
            ->linkToUrl(function (ProfessionalWallet $wallet) {
                return $this->adminUrlGenerator
                    ->setController(WalletLedgerCrudController::class)
                    ->setAction(Action::INDEX)
                    ->set('filters', ['wallet' => ['value' => $wallet->getId(), 'comparison' => '=']])
                    ->generateUrl();
            })
            ->setIcon('fa fa-list');

        return $actions
            ->add(Crud::PAGE_INDEX, $viewLedger)
            ->disable(Action::NEW, Action::EDIT, Action::DELETE);
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

        return $filters
            ->add(
                ManualChoiceFilter::new('professionalId', $this->translator->trans('users.professional'))
                    ->setChoices($professionalChoices)
            )
            ->add(ChoiceFilter::new('status', $this->translator->trans('wallet.fields.status'))->setChoices([
                $this->translator->trans('wallet.status.active') => WalletStatusEnum::ACTIVE->value,
                $this->translator->trans('wallet.status.blocked') => WalletStatusEnum::BLOCKED->value,
                $this->translator->trans('wallet.status.pending') => WalletStatusEnum::PENDING->value,
            ]))
            ->add(PaymentDateFilter::new('updatedAt', $this->translator->trans('wallet.fields.updated_at')));
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

        if (!in_array('p', $qb->getAllAliases())) {
            $qb->leftJoin($alias . '.professional', 'p');
        }

        $term = trim((string)$searchDto->getQuery());
        if ($term !== '') {
            $lower = mb_strtolower($term);

            $statusMatches = [];
            $statusKeywords = [
                'active'  => ['active', 'activa', 'activo'],
                'blocked' => ['blocked', 'bloqueada', 'bloqueado'],
                'pending' => ['pending', 'pendiente'],
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
                'LOWER(p.first_name) LIKE :term',
                'LOWER(p.last_name) LIKE :term',
                'LOWER(p.email) LIKE :term',
                'LOWER(CONCAT(p.first_name, \' \', p.last_name)) LIKE :term',
            ];

            $cleanAmount = preg_replace('/[^\d,]/', '', $lower);
            $cleanAmount = str_replace(',', '.', $cleanAmount);

            if (is_numeric($cleanAmount)) {
                $cents = (int)round((float)$cleanAmount * 100);
                $orConditions[] = $alias . '.availableBalance = :amount_cents';
                $orConditions[] = $alias . '.frozenBalance = :amount_cents';
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

                $orConditions[] = $alias . '.updatedAt LIKE :date_like';
                $qb->setParameter('date_like', $dateLike);
            } else {
                $orConditions[] = $alias . '.updatedAt LIKE :term';
            }

            if (!empty($statusMatches)) {
                $orConditions[] = $alias . '.status IN (:status_matches)';
                $qb->setParameter('status_matches', array_unique($statusMatches));
            }

            $orConditions[] = $alias . '.updatedAt LIKE :term';

            $qb->andWhere('(' . implode(' OR ', $orConditions) . ')')
                ->setParameter('term', '%' . $lower . '%');
        }

        $request = $this->getContext()->getRequest();
        if ($request) {
            $filtersData = $request->query->all('filters');

            if (!empty($filtersData['professionalId']['value'])) {
                $professionalId = $filtersData['professionalId']['value'];
                $qb->andWhere($alias . '.professional = :pid')
                    ->setParameter('pid', $professionalId);
            }
        }

        return $qb;
    }

    public function configureFields(string $pageName): iterable
    {
        yield TextField::new('uid', 'UID')->hideOnIndex();

        yield ChoiceField::new('status', $this->translator->trans('wallet.fields.status'))
            ->setChoices([
                $this->translator->trans('wallet.status.active') => WalletStatusEnum::ACTIVE->value,
                $this->translator->trans('wallet.status.blocked') => WalletStatusEnum::BLOCKED->value,
                $this->translator->trans('wallet.status.pending') => WalletStatusEnum::PENDING->value,
            ])
            ->formatValue(function ($value, $entity) {
                if ($value instanceof WalletStatusEnum) {
                    $val = $value->value;
                } else {
                    $val = $value;
                }

                $label = strtoupper($this->translator->trans('wallet.status.' . strtolower($val)));

                $colorMap = [
                    WalletStatusEnum::ACTIVE->value => 'success',
                    WalletStatusEnum::BLOCKED->value => 'danger',
                    WalletStatusEnum::PENDING->value => 'warning',
                ];
                $color = $colorMap[$val] ?? 'secondary';

                return sprintf('<span class="badge badge-%s">%s</span>', $color, $label);
            })
            ->setTemplatePath('admin/field/raw.html.twig');

        yield AssociationField::new('professional', $this->translator->trans('users.professional'))
            ->setFormTypeOption('choice_label', 'email');

        yield MoneyField::new('availableBalance', $this->translator->trans('wallet.fields.available_balance'))
            ->setCurrency('UYU')
            ->setStoredAsCents(false) // Fix display to match user expectation (integer = units)
            ->setTextAlign('left')
            ->hideOnForm();

        yield MoneyField::new('frozenBalance', $this->translator->trans('wallet.fields.frozen_balance'))
            ->setCurrency('UYU')
            ->setStoredAsCents(false)
            ->setTextAlign('left')
            ->hideOnForm();

        yield DateTimeField::new('updatedAt', $this->translator->trans('wallet.fields.updated_at'))
            ->setFormat('yyyy-MM-dd HH:mm')
            ->hideOnForm();
    }
}
