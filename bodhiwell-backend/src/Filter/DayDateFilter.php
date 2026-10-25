<?php

namespace App\Filter;

use Doctrine\ORM\QueryBuilder;
use EasyCorp\Bundle\EasyAdminBundle\Contracts\Filter\FilterInterface;
use EasyCorp\Bundle\EasyAdminBundle\Dto\EntityDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\FieldDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\FilterDataDto;
use EasyCorp\Bundle\EasyAdminBundle\Filter\FilterTrait;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Contracts\Translation\TranslatableInterface;

/**
 * Filter that expands a selected date into the whole day range [00:00:00 .. 23:59:59].
 */
final class DayDateFilter implements FilterInterface
{
    use FilterTrait;

    /**
     * @param TranslatableInterface|string|false|null $label
     */
    public static function new(string $propertyName, $label = null): self
    {
        return (new self())
            ->setFilterFqcn(__CLASS__)
            ->setProperty($propertyName)
            ->setLabel($label)
            ->setFormType(DateType::class)
            ->setFormTypeOption('widget', 'single_text')
            ->setFormTypeOption('html5', true)
            ->setFormTypeOption('format', 'yyyy-MM-dd')
            ->setFormTypeOption('translation_domain', 'EasyAdminBundle');
    }

    public function apply(QueryBuilder $queryBuilder, FilterDataDto $filterDataDto, ?FieldDto $fieldDto, EntityDto $entityDto): void
    {
        $value = $filterDataDto->getValue();
        if (empty($value)) {
            return;
        }

        if ($value instanceof \DateTimeInterface) {
            $selected = $value instanceof \DateTimeImmutable ? $value : \DateTimeImmutable::createFromMutable($value);
        } else {
            try {
                $selected = new \DateTimeImmutable($value);
            } catch (\Exception $e) {
                return;
            }
        }

        $start = $selected->setTime(0, 0, 0);
        $end   = $selected->setTime(23, 59, 59);

        $alias = $filterDataDto->getEntityAlias();
        $property = $filterDataDto->getProperty();
        $paramStart = $filterDataDto->getParameterName();
        $paramEnd = $filterDataDto->getParameter2Name();

        $queryBuilder->andWhere(sprintf('%s.%s BETWEEN :%s AND :%s', $alias, $property, $paramStart, $paramEnd))
            ->setParameter($paramStart, $start)
            ->setParameter($paramEnd, $end);
    }
}
