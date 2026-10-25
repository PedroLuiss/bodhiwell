<?php

namespace App\Controller\Admin;

use App\Entity\Studies;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use App\Enum\StudyType;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;

use Symfony\Contracts\Translation\TranslatorInterface;

class StudiesCrudController extends AbstractCrudController
{
    public function __construct(
        private TranslatorInterface $translator
    ) {}

    public static function getEntityFqcn(): string
    {
        return Studies::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular($this->translator->trans('studies.singular', [], 'messages'))
            ->setEntityLabelInPlural($this->translator->trans('studies.plural', [], 'messages'))
            ->setSearchFields(['name', 'institute', 'user.first_name', 'user.last_name']);
    }

    public function configureActions(Actions $actions): Actions
    {
        return $actions
            ->disable(Action::NEW);
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            AssociationField::new('user', $this->translator->trans('studies.professional', [], 'messages'))
                ->setFormTypeOption('disabled', true),
            TextField::new('name', $this->translator->trans('studies.fields.name', [], 'messages')),
            TextField::new('institute', $this->translator->trans('studies.fields.institute', [], 'messages')),
            ChoiceField::new('type', $this->translator->trans('studies.fields.type', [], 'messages'))
                ->setChoices(StudyType::choices()),
            DateField::new('dateStart', $this->translator->trans('studies.fields.date_start', [], 'messages')),
            DateField::new('dateEnd', $this->translator->trans('studies.fields.date_end', [], 'messages')),
            BooleanField::new('is_validated', $this->translator->trans('studies.fields.is_validated', [], 'messages')),
        ];
    }
}
