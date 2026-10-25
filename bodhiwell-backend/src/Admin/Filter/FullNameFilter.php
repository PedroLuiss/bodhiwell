<?php

namespace App\Admin\Filter;

use Doctrine\ORM\QueryBuilder;
use EasyCorp\Bundle\EasyAdminBundle\Dto\EntityDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\FieldDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\FilterDataDto;
use EasyCorp\Bundle\EasyAdminBundle\Contracts\Filter\FilterInterface;
use EasyCorp\Bundle\EasyAdminBundle\Filter\FilterTrait;
use EasyCorp\Bundle\EasyAdminBundle\Form\Filter\Type\TextFilterType;
use Symfony\Contracts\Translation\TranslatableInterface;
use App\Entity\User;

final class FullNameFilter implements FilterInterface
{
    use FilterTrait;

    /**
     * @param TranslatableInterface|string|false|null $label
     */
    public static function new(string $propertyName = 'fullName', $label = 'Nombre y Apellido'): self
    {
        return (new self())
            ->setFilterFqcn(__CLASS__)
            ->setProperty($propertyName) // nombre simbólico
            ->setLabel($label)
            ->setFormType(TextFilterType::class)
            ->setFormTypeOption('translation_domain', 'EasyAdminBundle');
    }

    public function apply(QueryBuilder $queryBuilder, FilterDataDto $filterDataDto, ?FieldDto $fieldDto, EntityDto $entityDto): void
    {
        $rootAlias = $filterDataDto->getEntityAlias();
        $property = $filterDataDto->getProperty();

        $value = trim((string)$filterDataDto->getValue());
        if ($value === '') {
            return;
        }

        $rootEntities = $queryBuilder->getRootEntities();
        $rootEntityClass = $rootEntities[0] ?? null;
        if ($rootEntityClass === null) {
            return;
        }

        $em = $queryBuilder->getEntityManager();

        $tryPaths = [];
        $tryPaths[] = $property;
        $tryPaths[] = 'patient';
        $tryPaths[] = 'patientUser';
        $tryPaths[] = 'booking.patientUser';
        $tryPaths[] = 'booking.patient';
        $tryPaths[] = 'professional';

        $resolved = null;

        foreach ($tryPaths as $try) {
            $parts = explode('.', $try);
            $currentClass = $rootEntityClass;
            $valid = true;
            $resolvedParts = [];

            foreach ($parts as $part) {
                try {
                    $meta = $em->getClassMetadata($currentClass);
                } catch (\Exception $e) {
                    $valid = false;
                    break;
                }

                if ($meta->hasAssociation($part)) {
                    $resolvedParts[] = $part;
                    $currentClass = $meta->getAssociationTargetClass($part);
                } else {
                    $valid = false;
                    break;
                }
            }

            if ($valid) {
                $resolved = [
                    'path' => $try,
                    'parts' => $resolvedParts,
                    'target' => $currentClass,
                ];
                break;
            }
        }

        if ($resolved === null) {
            return;
        }

        $currentAlias = $rootAlias;
        foreach ($resolved['parts'] as $i => $part) {
            $joinAlias = $part . '_alias_' . $i;
            if (!in_array($joinAlias, $queryBuilder->getAllAliases(), true)) {
                $queryBuilder->leftJoin(sprintf('%s.%s', $currentAlias, $part), $joinAlias);
            }
            $currentAlias = $joinAlias;
        }

        if ($resolved['target'] !== User::class) {
            return;
        }

        $lower = mb_strtolower($value);
        $parts = preg_split('/\s+/', $lower);
        if ($parts && count($parts) >= 2) {
            $first = $parts[0];
            $last  = $parts[count($parts) - 1];
            $queryBuilder->andWhere("LOWER($currentAlias.first_name) LIKE :fn AND LOWER($currentAlias.last_name) LIKE :ln")
                ->setParameter('fn', "%$first%")
                ->setParameter('ln', "%$last%");
        } else {
            $queryBuilder->andWhere("(LOWER($currentAlias.first_name) LIKE :n OR LOWER($currentAlias.last_name) LIKE :n OR LOWER($currentAlias.email) LIKE :n OR $currentAlias.dni LIKE :n)")
                ->setParameter('n', "%$lower%");
        }
    }
}
