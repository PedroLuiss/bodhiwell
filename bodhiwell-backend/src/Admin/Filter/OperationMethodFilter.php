<?php

namespace App\Admin\Filter;

use Doctrine\ORM\QueryBuilder;
use EasyCorp\Bundle\EasyAdminBundle\Dto\EntityDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\FieldDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\FilterDataDto;
use EasyCorp\Bundle\EasyAdminBundle\Contracts\Filter\FilterInterface;
use EasyCorp\Bundle\EasyAdminBundle\Filter\FilterTrait;
use EasyCorp\Bundle\EasyAdminBundle\Form\Filter\Type\TextFilterType;

final class OperationMethodFilter implements FilterInterface
{
    use FilterTrait;

    public static function new(string $propertyName = 'methodLabel', $label = 'Método'): self
    {
        return (new self())
            ->setFilterFqcn(__CLASS__)
            ->setProperty($propertyName)
            ->setLabel($label)
            ->setFormType(TextFilterType::class)
            ->setFormTypeOption('translation_domain', false);
    }

    public function apply(QueryBuilder $queryBuilder, FilterDataDto $filterDataDto, ?FieldDto $fieldDto, EntityDto $entityDto): void
    {
        $value = trim((string) $filterDataDto->getValue());
        if ($value === '') {
            return;
        }

        $rootAlias = $filterDataDto->getEntityAlias();
        $aliases = $queryBuilder->getAllAliases();

        if (!in_array('payment_method_alias', $aliases, true)) {
            $queryBuilder->leftJoin(sprintf('%s.payment', $rootAlias), 'payment_method_alias');
        }
        if (!in_array('withdrawal_method_alias', $aliases, true)) {
            $queryBuilder->leftJoin(sprintf('%s.withdrawal', $rootAlias), 'withdrawal_method_alias');
        }

        $term = '%' . mb_strtolower($value) . '%';
        $orX = $queryBuilder->expr()->orX();
        $orX->add('LOWER(payment_method_alias.paymentMethod) LIKE :method');
        $orX->add('LOWER(withdrawal_method_alias.withdrawalMethod) LIKE :method');

        $queryBuilder
            ->andWhere($orX)
            ->setParameter('method', $term);
    }
}
