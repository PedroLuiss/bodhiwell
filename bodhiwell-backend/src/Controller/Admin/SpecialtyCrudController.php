<?php

namespace App\Controller\Admin;

use App\Entity\Specialty;
use App\Enum\ClinicalLevelEnum;
use App\Enum\LegalFrameworkEnum;
use App\Services\SpecialtyImporterService;
use App\Utils\DeviceDetectionService;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextEditorField;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\Translation\TranslatorInterface;

class SpecialtyCrudController extends AbstractCrudController
{
    public function __construct(
        private readonly TranslatorInterface $translator,
        private readonly DeviceDetectionService $deviceDetectionService,
        private readonly SpecialtyImporterService $importerService,
        private readonly AdminUrlGenerator $adminUrlGenerator
    ) {}

    public static function getEntityFqcn(): string
    {
        return Specialty::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular($this->translator->trans('specialty.label_singular'))
            ->setEntityLabelInPlural($this->translator->trans('specialty.label_plural'))
            ->setPageTitle(Crud::PAGE_INDEX, $this->translator->trans('specialty.title'))
            ->setPageTitle(Crud::PAGE_NEW, $this->translator->trans('specialty.new'))
            ->setPageTitle(Crud::PAGE_EDIT, $this->translator->trans('specialty.edit'))
            ->setPaginatorPageSize($this->deviceDetectionService->getPaginatorPageSize());
    }

    public function configureActions(Actions $actions): Actions
    {
        $batchUploadAction = Action::new('batchUpload', $this->translator->trans('specialty.actions.batch_upload'), 'fa fa-file-import')
            ->linkToCrudAction('batchUpload')
            ->createAsGlobalAction()
            ->setCssClass('btn btn-primary');

        return $actions
            ->add(Crud::PAGE_INDEX, $batchUploadAction)
            ->add(Crud::PAGE_INDEX, Action::DETAIL)
            ->remove(Crud::PAGE_INDEX, Action::NEW)
            ->remove(Crud::PAGE_INDEX, Action::DELETE)
            ->remove(Crud::PAGE_DETAIL, Action::DELETE);
    }

    public function configureFields(string $pageName): iterable
    {
        yield TextField::new('name', $this->translator->trans('specialty.fields.name'));
        yield TextField::new('slug', $this->translator->trans('specialty.fields.slug'))->hideOnIndex();
        yield AssociationField::new('dimension', $this->translator->trans('specialty.fields.dimension'));
        yield AssociationField::new('required_base_study', $this->translator->trans('specialty.fields.required_base_study'))
            ->setRequired(false);

        yield ChoiceField::new('legal_framework', $this->translator->trans('specialty.fields.legal_framework'))
            ->setChoices([
                'Acto Médico' => LegalFrameworkEnum::MEDICAL_ACT,
                'Profesión Regulada' => LegalFrameworkEnum::REGULATED_PROFESSION,
                'Práctica No Regulada' => LegalFrameworkEnum::UNREGULATED_PRACTICE,
                'Especialidad' => LegalFrameworkEnum::SPECIALTY,
            ]);

        yield ChoiceField::new('clinical_level', $this->translator->trans('specialty.fields.clinical_level'))
            ->setChoices([
                'Alto' => ClinicalLevelEnum::HIGH,
                'Medio' => ClinicalLevelEnum::MEDIUM,
                'Bajo' => ClinicalLevelEnum::LOW,
                'Soporte' => ClinicalLevelEnum::SUPPORT,
            ]);

        yield BooleanField::new('msp_required', $this->translator->trans('specialty.fields.msp_required'));
        yield BooleanField::new('is_base_profession', $this->translator->trans('specialty.fields.is_base_profession'));

        yield TextField::new('public_title_male', $this->translator->trans('specialty.fields.public_title_male'))->hideOnIndex();
        yield TextField::new('public_title_female', $this->translator->trans('specialty.fields.public_title_female'))->hideOnIndex();
        yield TextField::new('public_title_neutral', $this->translator->trans('specialty.fields.public_title_neutral'))->hideOnIndex();

        yield TextEditorField::new('description', $this->translator->trans('specialty.fields.description'))->hideOnIndex();

        yield DateTimeField::new('createdAt', $this->translator->trans('specialty.fields.created_at'))->hideOnForm()->hideOnIndex();
        yield DateTimeField::new('updatedAt', $this->translator->trans('specialty.fields.updated_at'))->hideOnForm()->hideOnIndex();
    }

    public function batchUpload(Request $request): Response
    {
        if ($request->isMethod('POST')) {
            $file = $request->files->get('batch_file');
            if ($file) {
                try {
                    $result = $this->importerService->importFromFile($file->getPathname());
                    $this->addFlash('success', $this->translator->trans('specialty.import_success', [
                        '%created%' => $result['created'],
                        '%updated%' => $result['updated'],
                    ]));
                } catch (\Throwable $e) {
                    $this->addFlash('danger', $this->translator->trans('specialty.import_error', [
                        '%error%' => $e->getMessage(),
                    ]));
                }
            } else {
                $this->addFlash('warning', 'Por favor, selecciona un archivo válido.');
            }

            return $this->redirect($this->adminUrlGenerator->setController(self::class)->setAction(Action::INDEX)->generateUrl());
        }

        return $this->render('admin/specialty/batch_upload.html.twig', [
            'page_title' => $this->translator->trans('specialty.batch_upload_title'),
            'help_text' => $this->translator->trans('specialty.batch_upload_help'),
        ]);
    }
}
