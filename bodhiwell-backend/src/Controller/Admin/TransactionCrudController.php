<?php

namespace App\Controller\Admin;

use App\Entity\Transaction;
use App\Enum\TransactionTypeEnum;
use Doctrine\ORM\EntityManagerInterface;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Filters;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Filter\ChoiceFilter;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Contracts\Translation\TranslatorInterface;

use EasyCorp\Bundle\EasyAdminBundle\Dto\SearchDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\EntityDto;
use EasyCorp\Bundle\EasyAdminBundle\Collection\FieldCollection;
use EasyCorp\Bundle\EasyAdminBundle\Collection\FilterCollection;
use Doctrine\ORM\QueryBuilder;
use Symfony\Component\HttpFoundation\RequestStack;

use App\Utils\DeviceDetectionService;

#[IsGranted('ROLE_ADMIN')]
class TransactionCrudController extends AbstractCrudController
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

        if (!in_array('p', $qb->getAllAliases())) {
            $qb->leftJoin($alias . '.payment', 'p');
        }

        $term = trim((string)$searchDto->getQuery());
        if ($term !== '') {
            $lower = mb_strtolower($term);

            $typeMatches = [];
            if (str_contains('init', $lower) || str_contains('inicio', $lower)) $typeMatches[] = 'init';
            if (str_contains('capture', $lower) || str_contains('captura', $lower)) $typeMatches[] = 'capture';
            if (str_contains('reject', $lower) || str_contains('rechaz', $lower)) $typeMatches[] = 'reject';

            $orConditions = [
                'LOWER(' . $alias . '.uid) LIKE :term',
                'LOWER(p.uid) LIKE :term',
                'LOWER(' . $alias . '.idempotencyKey) LIKE :term',
                $alias . '.payload LIKE :term',
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

            if (!empty($typeMatches)) {
                $typeParamName = 'type_matches';
                $orConditions[] = $alias . '.type IN (:' . $typeParamName . ')';
                $qb->setParameter('type_matches', array_unique($typeMatches));
            }

            $qb->andWhere('(' . implode(' OR ', $orConditions) . ')')
                ->setParameter('term', '%' . $lower . '%');
        }

        return $qb;
    }
    public function __construct(
        private TranslatorInterface $translator,
        private LoggerInterface $logger,
        private EntityManagerInterface $em,
        private RequestStack $requestStack,
        private DeviceDetectionService $deviceDetectionService
    ) {}

    public static function getEntityFqcn(): string
    {
        return Transaction::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular($this->translator->trans('transaction.label_singular'))
            ->setEntityLabelInPlural($this->translator->trans('transaction.label_plural'))
            ->setDefaultSort(['createdAt' => 'DESC'])
            ->setPaginatorPageSize($this->deviceDetectionService->getPaginatorPageSize());
    }

    public function configureActions(Actions $actions): Actions
    {
        return $actions
            ->disable(Action::NEW, Action::EDIT, Action::DELETE);
    }

    public function configureFilters(Filters $filters): Filters
    {
        return $filters
            ->add(
                ChoiceFilter::new('type', $this->translator->trans('transaction.fields.type'))
                    ->setChoices([
                        'Init'    => TransactionTypeEnum::INIT,
                        'Capture' => TransactionTypeEnum::CAPTURE,
                        'Reject'  => TransactionTypeEnum::REJECT,
                    ])
            );
    }

    public function configureFields(string $pageName): iterable
    {
        yield TextField::new('uid', 'UID')->hideOnForm();
        yield AssociationField::new('payment', $this->translator->trans('transaction.fields.payment'));

        yield ChoiceField::new('type', $this->translator->trans('transaction.fields.type'))
            ->setChoices([
                'Init'    => TransactionTypeEnum::INIT,
                'Capture' => TransactionTypeEnum::CAPTURE,
                'Reject'  => TransactionTypeEnum::REJECT,
            ])
            ->hideOnIndex();

        yield TextField::new('typeLabel', $this->translator->trans('transaction.fields.type'))
            ->onlyOnIndex();

        yield TextareaField::new('payload', $this->translator->trans('transaction.fields.payload'))
            ->formatValue(function ($value) {
                return $value ? json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) : '';
            })
            ->hideOnIndex();

        yield TextField::new('idempotencyKey', 'Idempotency Key')->hideOnIndex();

        yield DateTimeField::new('createdAt', $this->translator->trans('transaction.fields.created_at'))
            ->setFormat('yyyy-MM-dd HH:mm')
            ->hideOnForm();
    }
}
