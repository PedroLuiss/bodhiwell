<?php

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;
use App\Entity\User;

class UserType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('plainPassword', PasswordType::class, [
                'mapped'      => true,
                'required'    => true,
                'constraints' => [
                    new Assert\NotBlank(['message'=>'La contraseña es obligatoria.']),
                    new Assert\Length([
                      'min' => 8, 'minMessage'=>'Debe tener al menos {{ limit }} caracteres.'
                    ]),
                    new Assert\Regex([
                      'pattern'=>'/[A-Z]/','message'=>'Debe contener al menos una mayúscula.'
                    ]),
                    // etc…
                ],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => User::class,
            'validation_groups' => ['Default', 'create'],
        ]);
    }
}
