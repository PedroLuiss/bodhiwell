<?php

namespace App\Admin\Filter;

use Doctrine\ORM\QueryBuilder;
use EasyCorp\Bundle\EasyAdminBundle\Contracts\Filter\FilterInterface;
use EasyCorp\Bundle\EasyAdminBundle\Dto\EntityDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\FieldDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\FilterDataDto;
use EasyCorp\Bundle\EasyAdminBundle\Filter\FilterTrait;
use EasyCorp\Bundle\EasyAdminBundle\Form\Filter\Type\ChoiceFilterType;

class PaymentPatientFilter implements FilterInterface
{
    use FilterTrait;

    public static function new(string $propertyName, $label = null): self
    {
        return (new self())
            ->setProperty($propertyName)
            ->setLabel($label)
            ->setFormType(ChoiceFilterType::class)
            ->setFormTypeOption('translation_domain', 'EasyAdminBundle');
    }

    public function setChoices(array $choices): self
    {
        $this->dto->setFormTypeOption('value_type_options.choices', $choices);
        return $this;
    }

    public function apply(QueryBuilder $qb, FilterDataDto $filterDataDto, ?FieldDto $fieldDto, EntityDto $entityDto): void
    {
        $value = $filterDataDto->getValue();
        if ($value === null) {
            return;
        }

        $alias = $filterDataDto->getEntityAlias();

        $existingAliases = $qb->getAllAliases();

        if (!in_array('booking', $existingAliases)) {
            $qb->leftJoin($alias . '.booking', 'booking');
        }

        if (!in_array('patientUser', $qb->getAllAliases())) {
            $qb->leftJoin('booking.patientUser', 'patientUser');
        }

        $parameterName = $filterDataDto->getParameterName();

        if (is_array($value)) {
            $qb->andWhere('patientUser.id IN (:' . $parameterName . ')')
                ->setParameter($parameterName, $value);
        } else {
            $qb->andWhere('patientUser.id = :' . $parameterName)
                ->setParameter($parameterName, $value);
        }
    }
}
