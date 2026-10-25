<?php

namespace App\Controller\Admin;

use Ramsey\Uuid\Uuid;
use App\Entity\Profession;
use Doctrine\ORM\EntityManagerInterface;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Field\FormField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use Symfony\Contracts\Translation\TranslatorInterface;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Dto\SearchDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\EntityDto;
use EasyCorp\Bundle\EasyAdminBundle\Collection\FieldCollection;
use EasyCorp\Bundle\EasyAdminBundle\Collection\FilterCollection;
use Doctrine\ORM\QueryBuilder;
use Symfony\Component\HttpFoundation\RequestStack;

use App\Utils\DeviceDetectionService;

class ProfessionCrudController extends AbstractCrudController
{
    public function __construct(
        private TranslatorInterface $translator,
        private RequestStack $requestStack,
        private DeviceDetectionService $deviceDetectionService
    ) {}

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

        $term = trim((string)$searchDto->getQuery());
        if ($term !== '') {
            $lower = mb_strtolower($term);

            $statusMatches = [];
            if (str_contains('activa', $lower) || str_contains('activo', $lower) || str_contains('active', $lower)) $statusMatches[] = 'active';
            if (str_contains('inactiva', $lower) || str_contains('inactivo', $lower) || str_contains('inactive', $lower)) $statusMatches[] = 'inactive';
            if (str_contains('revision', $lower) || str_contains('revisión', $lower) || str_contains('underreview', $lower)) $statusMatches[] = 'underReview';

            $orConditions = [
                'LOWER(' . $alias . '.name) LIKE :term',
                'LOWER(' . $alias . '.uid) LIKE :term',
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
                $orConditions[] = $alias . '.updatedAt LIKE :date_like';
                $qb->setParameter('date_like', $dateLike);
            } else {
                $orConditions[] = $alias . '.createdAt LIKE :term';
                $orConditions[] = $alias . '.updatedAt LIKE :term';
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

    public static function getEntityFqcn(): string
    {
        return Profession::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular($this->translator->trans('profession.label_singular'))
            ->setEntityLabelInPlural($this->translator->trans('profession.label_plural'))
            ->setPageTitle(Crud::PAGE_INDEX, $this->translator->trans('profession.title'))
            ->setPageTitle(Crud::PAGE_NEW, $this->translator->trans('profession.new'))
            ->setPageTitle(Crud::PAGE_EDIT, $this->translator->trans('profession.edit'))
            ->setPaginatorPageSize($this->deviceDetectionService->getPaginatorPageSize());
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            FormField::addTab($this->translator->trans('profession.tab.general')),
            TextField::new('name', $this->translator->trans('profession.fields.name')),
            ChoiceField::new('status', $this->translator->trans('profession.fields.status'))
                ->setChoices([
                    $this->translator->trans('profession.status.active') => 'active',
                    $this->translator->trans('profession.status.inactive') => 'inactive',
                    $this->translator->trans('profession.status.underReview') => 'underReview',
                ])
                ->renderExpanded(false)
                ->allowMultipleChoices(false)
                ->formatValue(function ($value, $entity) {
                    if ($value === null) return '';

                    $colorMap = [
                        'active' => 'success',
                        'inactive' => 'danger',
                        'underReview' => 'warning',
                    ];

                    $transMap = [
                        'active' => 'profession.status.active',
                        'inactive' => 'profession.status.inactive',
                        'underReview' => 'profession.status.underReview',
                    ];

                    $color = $colorMap[$value] ?? 'secondary';
                    $labelKey = $transMap[$value] ?? null;

                    $label = $labelKey ? $this->translator->trans($labelKey) : $value;
                    $label = mb_strtoupper($label);

                    return sprintf('<span class="badge badge-%s">%s</span>', $color, $label);
                })
                ->setTemplatePath('admin/field/raw.html.twig'),

            DateTimeField::new('createdAt', $this->translator->trans('profession.fields.created_at'))->hideOnForm(),
            DateTimeField::new('updatedAt', $this->translator->trans('profession.fields.updated_at'))->hideOnForm(),

        ];
    }

    public function configureActions(Actions $actions): Actions
    {
        return $actions
            ->add(Crud::PAGE_INDEX, Action::DETAIL)
            ->remove(Crud::PAGE_INDEX, Action::DELETE)
            ->remove(Crud::PAGE_DETAIL, Action::DELETE)
            ->update(Crud::PAGE_INDEX, Action::EDIT, function (Action $action) {
                return $action->setLabel('Modificar');
            })
            ->update(Crud::PAGE_INDEX, Action::DETAIL, function (Action $action) {
                return $action->setLabel('Ver detalles');
            });
    }

    public function persistEntity(EntityManagerInterface $entityManager, $entityInstance): void
    {
        if ($entityInstance instanceof Profession && empty($entityInstance->getUid())) {
            $entityInstance->setUid(Uuid::uuid4()->toString());
        }
        parent::persistEntity($entityManager, $entityInstance);
    }
}
