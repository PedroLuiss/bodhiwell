<?php

namespace App\Admin\Filter;

use Doctrine\ORM\QueryBuilder;
use EasyCorp\Bundle\EasyAdminBundle\Contracts\Filter\FilterInterface;
use EasyCorp\Bundle\EasyAdminBundle\Dto\EntityDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\FieldDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\FilterDataDto;
use EasyCorp\Bundle\EasyAdminBundle\Filter\FilterTrait;
use EasyCorp\Bundle\EasyAdminBundle\Form\Filter\Type\DateTimeFilterType;
use EasyCorp\Bundle\EasyAdminBundle\Form\Type\ComparisonType;
use Symfony\Component\Form\Extension\Core\Type\DateType;

class PaymentDateFilter implements FilterInterface
{
    use FilterTrait;

    public static function new(string $propertyName, $label = null): self
    {
        return (new self())
            ->setProperty($propertyName)
            ->setLabel($label)
            ->setFormType(DateTimeFilterType::class)
            ->setFormTypeOption('value_type', DateType::class);
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

        if ($comparison === ComparisonType::EQ) {
            $dateStr = $value instanceof \DateTimeInterface ? $value->format('Y-m-d') : $value;
            $start   = new \DateTime($dateStr . ' 00:00:00');
            $end     = new \DateTime($dateStr . ' 23:59:59');

            $qb->andWhere(sprintf('%s.%s BETWEEN :%s_start AND :%s_end', $alias, $property, $parameterName, $parameterName))
                ->setParameter($parameterName . '_start', $start)
                ->setParameter($parameterName . '_end', $end);
        } else {
            $qb->andWhere(sprintf('%s.%s %s :%s', $alias, $property, $comparison, $parameterName))
                ->setParameter($parameterName, $value);
        }
    }
}
