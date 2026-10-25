<?php

namespace App\Form;

use App\Entity\Profession;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;

class ProfessionType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class, [
                'label'       => 'profession.fields.name',
                'required'    => true,
                'constraints' => [
                    new Assert\NotBlank(['message' => 'El nombre es obligatorio.']),
                    new Assert\Length([
                        'max'        => 255,
                        'maxMessage' => 'El nombre no puede tener más de {{ limit }} caracteres.',
                    ]),
                ],
            ])
            ->add('status', ChoiceType::class, [
                'label'       => 'profession.fields.status',
                'required'    => true,
                'choices'     => [
                    'En curso'    => 'en_curso',
                    'Congelada'   => 'congelada',
                    'Finalizada'  => 'finalizada',
                    'Suspendida'  => 'suspendida',
                    'Pendiente'   => 'pendiente',
                ],
                'constraints' => [
                    new Assert\NotBlank(['message' => 'El estado es obligatorio.']),
                ],
            ])
            ->add('institute', TextType::class, [
                'label'       => 'profession.fields.institute',
                'required'    => true,
                'constraints' => [
                    new Assert\NotBlank(['message' => 'El instituto es obligatorio.']),
                    new Assert\Length([
                        'max'        => 1000,
                        'maxMessage' => 'El instituto no debe exceder {{ limit }} caracteres.',
                    ]),
                ],
                'help'        => 'profession.fields.institute_help',
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Profession::class,
            
        ]);
    }
}
