<?php

namespace App\Controller\Admin;

use App\Entity\User;
use App\Form\StudiesType;
use App\Enum\PermissionEnum;
use App\Enum\ConsultTypeEnum;
use Doctrine\ORM\QueryBuilder;

use App\Enum\EntityPermissionEnum;
use App\Repository\ProfessionRepository;
use Doctrine\ORM\EntityManagerInterface;
use App\Services\UserRelationSyncService;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Field\Field;
use Symfony\Component\Routing\Annotation\Route;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Dto\EntityDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\SearchDto;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Field\FormField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use Symfony\Contracts\Translation\TranslatorInterface;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\CollectionField;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

use Symfony\Component\HttpFoundation\RequestStack;

use App\Utils\DeviceDetectionService;

class UserCrudController extends AbstractCrudController
{
    public function __construct(
        private TranslatorInterface $translator,
        private UserPasswordHasherInterface $passwordHasher,
        private UserRelationSyncService $relationSyncService,
        private ValidatorInterface $validator,
        private RequestStack $requestStack,
        private DeviceDetectionService $deviceDetectionService
    ) {}

    public static function getEntityFqcn(): string
    {
        return User::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setPageTitle(Crud::PAGE_INDEX, $this->translator->trans('users.title'))
            ->setPageTitle(Crud::PAGE_NEW,   $this->translator->trans('users.add_button'))
            ->setPageTitle(Crud::PAGE_EDIT,  $this->translator->trans('users.edit_button'))
            ->setFormOptions([
                'validation_groups' => fn($pageName) =>
                $pageName === Crud::PAGE_NEW
                    ? ['Default', 'create']
                    : ['Default'],
            ])
            ->setPaginatorPageSize($this->deviceDetectionService->getPaginatorPageSize());
    }

    public function createIndexQueryBuilder(SearchDto $searchDto, EntityDto $entityDto, $fields, $filters): QueryBuilder
    {
        $reflection = new \ReflectionClass(SearchDto::class);
        $newSearchDto = $reflection->newInstanceWithoutConstructor();

        foreach ($reflection->getProperties() as $property) {
            if ($property->getName() === 'query') {
                $property->setValue($newSearchDto, '');
                continue;
            }
            if ($property->getName() === 'cachedSortConfig') {
                continue;
            }

            $property->setAccessible(true);
            $originalProp = $reflection->getProperty($property->getName());
            $originalProp->setAccessible(true);
            if ($originalProp->isInitialized($searchDto)) {
                $property->setValue($newSearchDto, $originalProp->getValue($searchDto));
            }
        }

        $qb = parent::createIndexQueryBuilder($newSearchDto, $entityDto, $fields, $filters);
        $alias = $qb->getRootAliases()[0];

        $qb->andWhere($alias . '.roles NOT LIKE :role')
            ->setParameter('role', '%ROLE_OWNER%');

        $currentUser = $this->getUser();
        if ($currentUser instanceof User) {
            $qb->andWhere($alias . '.id != :currentUserId')
                ->setParameter('currentUserId', $currentUser->getId());
        }

        $term = trim((string)$searchDto->getQuery());
        if ($term !== '') {
            $lower = mb_strtolower($term);

            $orConditions = [
                'LOWER(' . $alias . '.first_name) LIKE :term',
                'LOWER(' . $alias . '.last_name) LIKE :term',
                'LOWER(' . $alias . '.email) LIKE :term',
                'LOWER(' . $alias . '.username) LIKE :term',
                'LOWER(' . $alias . '.uid) LIKE :term',
                'LOWER(CONCAT(' . $alias . '.first_name, \' \', ' . $alias . '.last_name)) LIKE :term',
            ];

            $qb->andWhere('(' . implode(' OR ', $orConditions) . ')')
                ->setParameter('term', '%' . $lower . '%');
        }

        return $qb;
    }

    public function configureActions(Actions $actions): Actions
    {
        return $actions
            ->add(Crud::PAGE_INDEX, Action::new('editPermissions', 'Gestionar Permisos')
                ->linkToRoute('admin_user_edit_permissions', fn(User $user) => ['id' => $user->getId()])
                ->displayIf(fn() => in_array('ROLE_OWNER', $this->getUser()->getRoles())));
    }

    #[Route('/admin/user/{id}/edit-permissions', name: 'admin_user_edit_permissions')]
    public function editPermissions(Request $request, EntityManagerInterface $em, int $id): Response
    {
        /**
         *  @var User|null $user 
         * */
        $user = $em->getRepository(User::class)->find($id);
        if (!$user) {
            throw $this->createNotFoundException('Usuario no encontrado');
        }

        if ($request->isMethod('POST')) {
            $permissions = $request->request->all()['permissions'] ?? [];
            $user->setPermissions($permissions);
            $em->flush();
            $this->addFlash('success', 'Permisos actualizados correctamente.');
        }

        return $this->render('admin/user_permissions.html.twig', [
            'user'              => $user,
            'entities'          => array_keys(EntityPermissionEnum::getPermissionsByEntity()),
            'permissions'       => PermissionEnum::cases(),
            'permissionsByEntity' => EntityPermissionEnum::getPermissionsByEntity(),
        ]);
    }

    public function configureFields(string $pageName): iterable
    {

        $commonFields = [
            FormField::addTab($this->translator->trans('users.tab_basic')),
            IdField::new('id')->hideOnForm(),
            TextField::new('email', $this->translator->trans('users.email'))->setRequired(true),
            TextField::new('username', $this->translator->trans('users.username'))->setRequired(true),
            TextField::new('firstName', $this->translator->trans('users.first_name'))->setRequired(true),
            TextField::new('lastName', $this->translator->trans('users.last_name'))->setRequired(true),
            ChoiceField::new('roles', $this->translator->trans('users.roles'))
                ->setChoices([
                    $this->translator->trans('users.roles_labels.user')         => 'ROLE_USER',
                    $this->translator->trans('users.roles_labels.admin')        => 'ROLE_ADMIN',
                ])
                ->allowMultipleChoices()
                ->renderExpanded(false)
                ->setRequired(true)
                ->setFormTypeOption('attr', ['class' => 'form-control']),
            IntegerField::new('consultTime', $this->translator->trans('users.consult_time'))
                ->setHelp('Duración de cada consulta (min).')
                ->setFormTypeOption('attr', ['min' => 5, 'step' => 5])
                ->setRequired(true),
            ChoiceField::new('userDetails.consultType', $this->translator->trans('users.consult_type'))
                ->setChoices(array_flip([
                    ConsultTypeEnum::PRESENTIAL->value => ConsultTypeEnum::PRESENTIAL->label(),
                    ConsultTypeEnum::VIRTUAL->value => ConsultTypeEnum::VIRTUAL->label(),
                    ConsultTypeEnum::HYBRID->value => ConsultTypeEnum::HYBRID->label(),
                ]))
                ->setRequired(false),
            TextField::new('uid')->hideOnForm(),
        ];

        if ($pageName === Crud::PAGE_NEW) {
            $commonFields[] = Field::new('plainPassword', 'Contraseña')
                ->setFormType(PasswordType::class)
                ->setRequired(true)
                ->setHelp('Debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.')
                ->setFormTypeOptions([
                    'attr' => [
                        'pattern' => '(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).{8,}',
                        'title'   => 'Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo'
                    ]
                ]);
        }



        $professionsTab = [
            FormField::addTab($this->translator->trans('users.tab_professions')),
            AssociationField::new('professions', $this->translator->trans('users.professions'))
                ->setFormTypeOption('by_reference', false)
                ->setFormTypeOptions([
                    'query_builder' => function (ProfessionRepository $repo) {
                        return $repo->createQueryBuilder('p')
                            ->andWhere('p.status IN (:allowed)')
                            ->setParameter('allowed', ['active'])
                            ->orderBy('p.name', 'ASC');
                    },
                ])
                ->onlyOnForms(),
        ];

        $studiesTab = [
            FormField::addTab($this->translator->trans('users.tab_studies')),
            CollectionField::new(
                'studies',
                $this->translator->trans('users.studies')
            )
                ->setEntryType(StudiesType::class)
                ->allowAdd()
                ->allowDelete()
                ->setFormTypeOptions(['by_reference' => false])
                ->onlyOnForms()
        ];

        return array_merge(
            $commonFields,
            $professionsTab,
            $studiesTab
        );
    }

    public function persistEntity(EntityManagerInterface $entityManager, $entityInstance): void
    {
        if ($entityInstance instanceof User && $entityInstance->getPlainPassword()) {
            $entityInstance->setPassword(
                $this->passwordHasher->hashPassword($entityInstance, $entityInstance->getPlainPassword())
            );
        }

        $this->relationSyncService->sync($entityInstance);

        parent::persistEntity($entityManager, $entityInstance);
    }


    public function updateEntity(EntityManagerInterface $entityManager, $entityInstance): void
    {
        if ($entityInstance instanceof User && $entityInstance->getPlainPassword()) {
            $entityInstance->setPassword(
                $this->passwordHasher->hashPassword($entityInstance, $entityInstance->getPlainPassword())
            );
        }

        $this->relationSyncService->sync($entityInstance);

        parent::updateEntity($entityManager, $entityInstance);
    }
}
