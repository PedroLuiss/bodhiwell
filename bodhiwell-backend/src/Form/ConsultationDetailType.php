<?php

namespace App\Form;

use App\Entity\ConsultationDetail;
use App\Enum\ConsultationDetailTypeEnum;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;

class ConsultationDetailType extends AbstractType
{
    private TranslatorInterface $translator;

    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('detailKey', ChoiceType::class, [
                'label'      => $this->translator->trans('consultation_detail.fields.detail_key'),
                'choices'  => ConsultationDetailTypeEnum::choices($this->translator),
                'constraints'=> [
                    new NotBlank([
                        'message' => 'Debes seleccionar el tipo de detalle.',
                    ]),
                ],
            ])
            ->add('detailValue', null, [
                'label'      => $this->translator->trans('consultation_detail.fields.detail_value'),
                'constraints'=> [
                    new NotBlank([
                        'message' => 'Debes completar el valor del detalle.',
                    ]),
                ],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => ConsultationDetail::class,
        ]);
    }
}
