<?php

namespace App\Form;

use App\Entity\Studies;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Constraints\NotNull;

class StudiesType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class, [
                'label'       => 'studies.fields.name',
                'required'    => true,
                'constraints' => [
                    new Assert\NotBlank(['message' => 'El nombre es obligatorio.']),
                    new Assert\Length([
                        'max' => 255,
                        'maxMessage' => 'El nombre no debe exceder los {{ limit }} caracteres.',
                    ]),
                ],
            ])
            ->add('institute', TextType::class, [
                'label'       => 'studies.fields.institute',
                'required'    => true,
                'constraints' => [
                    new Assert\NotBlank(['message' => 'El instituto es obligatorio.']),
                    new Assert\Length([
                        'max' => 1000,
                        'maxMessage' => 'El instituto no debe exceder los {{ limit }} caracteres.',
                    ]),
                ],
            ])
            ->add('status', ChoiceType::class, [
                'label'       => 'studies.fields.status',
                'required'    => true,
                'choices'     => [
                    'En curso'   => 'in_progress',
                    'Finalizado' => 'finished',
                    'Suspendido' => 'suspended',
                    'Pendiente'  => 'pending',
                ],
                'constraints' => [
                    new Assert\NotBlank(['message' => 'El estado es obligatorio.']),
                ],
            ])
            ->add('type', TextType::class, [
                'label'       => 'studies.fields.type',
                'required'    => true,
                'constraints' => [
                    new Assert\NotBlank(['message' => 'El tipo de formación es obligatorio.']),
                    new Assert\Length([
                        'max' => 255,
                        'maxMessage' => 'El tipo no debe exceder los {{ limit }} caracteres.',
                    ]),
                ],
            ])
            ->add('dateStart', DateTimeType::class, [
                'label'    => 'studies.fields.date_start',
                'widget'   => 'single_text',
                'html5'    => true,
                'required' => true,
                'constraints' => [
                    new NotNull(['message' => 'La fecha de inicio es obligatoria.']),
                ],
            ])
            ->add('dateEnd', DateTimeType::class, [
                'label'    => 'studies.fields.date_end',
                'widget'   => 'single_text',
                'html5'    => true,
                'required' => true,
                'constraints' => [
                    new NotNull(['message' => 'La fecha de finalización es obligatoria.']),
                ],
            ])
            ->add('file', FileType::class, [
                'label' => 'studies.fields.certificate',
                'required' => false,
                'mapped' => true,
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Studies::class,

        ]);
    }
}
