<?php

namespace App\Admin\Filter;

use Doctrine\ORM\QueryBuilder;
use EasyCorp\Bundle\EasyAdminBundle\Dto\EntityDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\FieldDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\FilterDataDto;
use EasyCorp\Bundle\EasyAdminBundle\Contracts\Filter\FilterInterface;
use EasyCorp\Bundle\EasyAdminBundle\Filter\FilterTrait;
use EasyCorp\Bundle\EasyAdminBundle\Form\Filter\Type\TextFilterType;

final class FullUserNameFilter implements FilterInterface
{
    use FilterTrait;

    /**
     * @param string|false|null $label
     */
    public static function new(string $propertyName = 'fullName', $label = 'Nombre y Apellido'): self
    {
        return (new self())
            ->setFilterFqcn(__CLASS__)
            ->setProperty($propertyName)
            ->setLabel($label)
            ->setFormType(TextFilterType::class)
            ->setFormTypeOption('translation_domain', 'EasyAdminBundle');
    }

    public function apply(QueryBuilder $queryBuilder, FilterDataDto $filterDataDto, ?FieldDto $fieldDto, EntityDto $entityDto): void
    {
        $alias = $filterDataDto->getEntityAlias();
        $value = trim((string) $filterDataDto->getValue());
        if ($value === '') {
            return;
        }

        $lower = mb_strtolower($value);
        $parts = preg_split('/\s+/', $lower);

        if ($parts && count($parts) >= 2) {
            $first = $parts[0];
            $last = $parts[count($parts) - 1];
            $queryBuilder->andWhere(sprintf('LOWER(%s.first_name) LIKE :fn AND LOWER(%s.last_name) LIKE :ln', $alias, $alias))
                ->setParameter('fn', "%$first%")
                ->setParameter('ln', "%$last%");
            return;
        }

        $paramName = 'full_user_' . uniqid();
        $paramPlaceholder = ':' . $paramName;
        $queryBuilder->andWhere(sprintf('(
            LOWER(%s.first_name) LIKE %s OR
            LOWER(%s.last_name) LIKE %s OR
            LOWER(%s.email) LIKE %s OR
            %s.dni LIKE %s OR
            %s.phone_number LIKE %s
        )', $alias, $paramPlaceholder, $alias, $paramPlaceholder, $alias, $paramPlaceholder, $alias, $paramPlaceholder, $alias, $paramPlaceholder))
            ->setParameter($paramName, "%$lower%");
    }
}
