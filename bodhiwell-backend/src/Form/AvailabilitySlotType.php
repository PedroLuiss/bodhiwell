<?php

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TimeType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;

class AvailabilitySlotType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('start', TimeType::class, [
                'label' => 'Inicio',
                'input' => 'string',
                'widget' => 'single_text',
                'with_seconds' => false,
                'html5' => true,
                'input_format' => 'H:i',
                'constraints' => [
                    new Assert\NotBlank(message: 'Requerido'),
                ],
            ])
            ->add('end', TimeType::class, [
                'label' => 'Fin',
                'input' => 'string',
                'widget' => 'single_text',
                'with_seconds' => false,
                'html5' => true,
                'input_format' => 'H:i',
                'constraints' => [
                    new Assert\NotBlank(message: 'Requerido'),
                ],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => null,
        ]);
    }
}
