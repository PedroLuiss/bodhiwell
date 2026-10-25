<?php

namespace App\Controller\Admin;

use App\Entity\WalletLedger;
use App\Entity\ProfessionalWallet;
use App\Entity\Payment;
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
use EasyCorp\Bundle\EasyAdminBundle\Filter\DateTimeFilter;
use EasyCorp\Bundle\EasyAdminBundle\Filter\ChoiceFilter;
use EasyCorp\Bundle\EasyAdminBundle\Filter\NumericFilter;
use App\Enum\WalletLedgerConceptEnum;
use App\Enum\WalletOperationTypeEnum;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Contracts\Translation\TranslatorInterface;
use Psr\Log\LoggerInterface;
use App\Admin\Filter\DateFilter;
use App\Admin\Filter\OperationMethodFilter;
use App\Repository\ProfessionalWalletRepository;
use EasyCorp\Bundle\EasyAdminBundle\Dto\SearchDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\EntityDto;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;
use App\Controller\Admin\ProfessionalWalletCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Collection\FieldCollection;
use EasyCorp\Bundle\EasyAdminBundle\Collection\FilterCollection;
use Doctrine\ORM\QueryBuilder;

use Symfony\Component\HttpFoundation\RequestStack;

use App\Utils\DeviceDetectionService;

#[IsGranted('ROLE_ADMIN')]
class WalletLedgerCrudController extends AbstractCrudController
{
    public function __construct(
        private LoggerInterface $logger,
        private EntityManagerInterface $em,
        private ProfessionalWalletRepository $walletRepo,
        private TranslatorInterface $translator,
        private AdminUrlGenerator $adminUrlGenerator,
        private RequestStack $requestStack,
        private DeviceDetectionService $deviceDetectionService
    ) {}

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

        if (!in_array('w', $qb->getAllAliases())) {
            $qb->leftJoin(sprintf('%s.wallet', $alias), 'w');
        }
        if (!in_array('p', $qb->getAllAliases())) {
            $qb->leftJoin('w.professional', 'p');
        }

        $term = trim((string)$searchDto->getQuery());
        if ($term !== '') {
            $lower = mb_strtolower($term);

            $conceptMatches = [];
            if (str_contains('pago', $lower) || str_contains('payment', $lower)) $conceptMatches[] = 'PAYMENT';
            if (str_contains('retiro', $lower) || str_contains('withdrawal', $lower)) $conceptMatches[] = 'WITHDRAWAL';
            if (str_contains('reembolso', $lower) || str_contains('refund', $lower)) $conceptMatches[] = 'REFUND';
            if (str_contains('ajuste', $lower) || str_contains('adjustment', $lower)) $conceptMatches[] = 'ADJUSTMENT';

            $typeMatches = [];
            if (str_contains('entrada', $lower) || str_contains('credito', $lower) || str_contains('crédito', $lower) || str_contains('credit', $lower)) $typeMatches[] = 'CREDIT';
            if (str_contains('salida', $lower) || str_contains('debito', $lower) || str_contains('débito', $lower) || str_contains('debit', $lower)) $typeMatches[] = 'DEBIT';

            $orConditions = [
                'LOWER(p.first_name) LIKE :term',
                'LOWER(CONCAT(p.first_name, \' \', p.last_name)) LIKE :term',
                'LOWER(' . $alias . '.methodLabel) LIKE :term',
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

            if (!empty($conceptMatches)) {
                $statusParamName = 'concept_matches';
                $orConditions[] = $alias . '.concept IN (:' . $statusParamName . ')';
                $qb->setParameter('concept_matches', array_unique($conceptMatches));
            }

            if (!empty($typeMatches)) {
                $typeParamName = 'type_matches';
                $orConditions[] = $alias . '.operationType IN (:' . $typeParamName . ')';
                $qb->setParameter('type_matches', array_unique($typeMatches));
            }

            $qb->andWhere('(' . implode(' OR ', $orConditions) . ')')
                ->setParameter('term', '%' . $lower . '%');
        }

        $request = $this->container->get('request_stack')->getCurrentRequest();
        if ($request) {
            $filtersData = $request->query->all('filters');
            if (!empty($filtersData['wallet']['value'])) {
                $walletId = $filtersData['wallet']['value'];
                $qb->andWhere('w.id = :wid')
                    ->setParameter('wid', $walletId);
            }
        }

        return $qb;
    }

    public static function getEntityFqcn(): string
    {
        return WalletLedger::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular($this->translator->trans('wallet_ledger.label_singular'))
            ->setEntityLabelInPlural($this->translator->trans('wallet_ledger.label_plural'))
            ->setDefaultSort(['createdAt' => 'DESC'])
            ->setPaginatorPageSize($this->deviceDetectionService->getPaginatorPageSize());
    }

    public function configureActions(Actions $actions): Actions
    {
        $backToWallets = Action::new('backToWallets', 'Volver a Billeteras')
            ->linkToUrl(function () {
                return $this->adminUrlGenerator
                    ->setController(ProfessionalWalletCrudController::class)
                    ->setAction(Action::INDEX)
                    ->generateUrl();
            })
            ->createAsGlobalAction()
            ->setCssClass('btn btn-secondary')
            ->setIcon('fa fa-arrow-left');

        return $actions
            ->add(Crud::PAGE_INDEX, $backToWallets)
            ->disable(Action::NEW, Action::EDIT, Action::DELETE);
    }

    public function configureFilters(Filters $filters): Filters
    {
        $wallets = $this->walletRepo->findAll();
        $professionalChoices = [];
        foreach ($wallets as $wallet) {
            $pro = $wallet->getProfessional();
            if ($pro) {
                $fullName = trim($pro->getFirstName() . ' ' . $pro->getLastName());
                if ($fullName === '') {
                    $fullName = $pro->getEmail();
                }
                $professionalChoices[$fullName] = $wallet->getId();
            }
        }
        asort($professionalChoices);

        return $filters
            ->add(ChoiceFilter::new('operationType', 'Tipo de Operación')
                ->setChoices([
                    'Entrada (Crédito)' => 'CREDIT',
                    'Salida (Débito)' => 'DEBIT',
                ]))
            ->add(NumericFilter::new('amount', 'Monto'))
            ->add(DateFilter::new('createdAt', 'Fecha'))
            ->add(ChoiceFilter::new('wallet', 'Profesional')
                ->setChoices($professionalChoices))
            ->add(OperationMethodFilter::new('methodLabel', 'Método de operación'));
    }

    public function configureFields(string $pageName): iterable
    {
        yield AssociationField::new('wallet', 'Profesional')
            ->setFormTypeOption('choice_label', function (?ProfessionalWallet $wallet) {
                return (string) $wallet?->getProfessional() ?? '—';
            })
            ->formatValue(function ($value, $entity) {
                return (string) $entity->getWallet()?->getProfessional() ?? '—';
            });

        yield ChoiceField::new('concept', 'Concepto')
            ->setChoices(array_combine(
                array_map(fn($e) => $e->label(), WalletLedgerConceptEnum::cases()),
                WalletLedgerConceptEnum::cases()
            ))
            ->formatValue(fn($value) => $this->formatConcept($value))
            ->setTemplatePath('admin/field/raw.html.twig');

        yield TextField::new('methodLabel', 'Método')
            ->setSortable(false);

        yield MoneyField::new('amount', 'Monto')
            ->setCurrency('UYU')
            ->setTextAlign('left')
            ->setStoredAsCents(false)
            ->formatValue(function ($value, WalletLedger $entity) {
                $color = $entity->getOperationType() === 'CREDIT' ? 'green' : 'red';
                $sign = $entity->getOperationType() === 'CREDIT' ? '+' : '-';
                return sprintf('<span style="color: %s; font-weight: bold;">%s %s</span>', $color, $sign, $value);
            });

        yield ChoiceField::new('operationType', 'Operación')
            ->setChoices(array_combine(
                array_map(fn($e) => $e->value, WalletOperationTypeEnum::cases()),
                WalletOperationTypeEnum::cases()
            ))
            ->formatValue(fn($value) => $this->formatOperation($value))
            ->setTemplatePath('admin/field/raw.html.twig');

        yield DateTimeField::new('createdAt', 'Fecha Creación')
            ->setFormat('yyyy-MM-dd HH:mm')
            ->hideOnForm();
    }

    public function persistEntity(EntityManagerInterface $em, $entityInstance): void
    {
        parent::persistEntity($em, $entityInstance);
        $this->logger->info('Ledger entry created by admin', [
            'user' => $this->getUser()?->getUserIdentifier(),
            'ledgerId' => $entityInstance->getId()
        ]);
    }
    private function formatConcept($value): string
    {
        if ($value instanceof WalletLedgerConceptEnum) {
            $val = $value;
        } else {
            $val = WalletLedgerConceptEnum::tryFrom($value);
        }

        if (!$val) return (string)$value;

        // Custom colors if needed, or mapping
        $color = match ($val) {
            WalletLedgerConceptEnum::PAYMENT, WalletLedgerConceptEnum::FUNDS_RELEASE, WalletLedgerConceptEnum::INCOME_ON_HOLD => 'success',
            WalletLedgerConceptEnum::WITHDRAWAL, WalletLedgerConceptEnum::WITHDRAWAL_REQUEST => 'warning',
            WalletLedgerConceptEnum::REFUND, WalletLedgerConceptEnum::WITHDRAWAL_REJECTED => 'danger',
            WalletLedgerConceptEnum::ADJUSTMENT => 'info',
            default => 'secondary'
        };

        return sprintf('<span class="badge badge-%s">%s</span>', $color, $val->label());
    }

    private function formatOperation($value): string
    {
        if ($value instanceof WalletOperationTypeEnum) {
            $val = $value;
        } else {
            $val = WalletOperationTypeEnum::tryFrom($value);
        }

        if (!$val) return (string)$value;

        $color = match ($val) {
            WalletOperationTypeEnum::CREDIT => 'success',
            WalletOperationTypeEnum::DEBIT => 'danger',
        };

        $label = match ($val) {
            WalletOperationTypeEnum::CREDIT => 'Crédito',
            WalletOperationTypeEnum::DEBIT => 'Débito',
        };

        return sprintf('<span class="badge badge-%s">%s</span>', $color, $label);
    }
}
