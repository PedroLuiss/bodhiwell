<?php

namespace App\Admin\Filter;

use Doctrine\ORM\QueryBuilder;
use EasyCorp\Bundle\EasyAdminBundle\Contracts\Filter\FilterInterface;
use EasyCorp\Bundle\EasyAdminBundle\Dto\EntityDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\FieldDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\FilterDataDto;
use EasyCorp\Bundle\EasyAdminBundle\Filter\FilterTrait;
use EasyCorp\Bundle\EasyAdminBundle\Form\Filter\Type\NumericFilterType;

class PaymentMoneyFilter implements FilterInterface
{
    use FilterTrait;

    public static function new(string $propertyName, $label = null): self
    {
        return (new self())
            ->setProperty($propertyName)
            ->setLabel($label)
            ->setFormType(NumericFilterType::class);
    }

    public function apply(QueryBuilder $qb, FilterDataDto $filterDataDto, ?FieldDto $fieldDto, EntityDto $entityDto): void
    {
        $value = $filterDataDto->getValue();
        if ($value === null) {
            return;
        }

        $alias         = $filterDataDto->getEntityAlias();
        $property      = $filterDataDto->getProperty();
        $comparison    = $filterDataDto->getComparison();
        $parameterName = $filterDataDto->getParameterName();

        $valueInCents = (int) round($value * 100);

        $qb->andWhere(sprintf('%s.%s %s :%s', $alias, $property, $comparison, $parameterName))
            ->setParameter($parameterName, $valueInCents);
    }
}
