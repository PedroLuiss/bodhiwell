<?php

namespace App\Controller\Admin;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\QueryBuilder;
use EasyCorp\Bundle\EasyAdminBundle\Collection\FieldCollection;
use EasyCorp\Bundle\EasyAdminBundle\Collection\FilterCollection;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Dto\EntityDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\SearchDto;
use EasyCorp\Bundle\EasyAdminBundle\Field\EmailField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\UrlField;
use EasyCorp\Bundle\EasyAdminBundle\Field\FormField;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\Field;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Context\AdminContext;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;
use App\Enum\UserStatusEnum;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;
use EasyCorp\Bundle\EasyAdminBundle\Config\Filters;
use App\Admin\Filter\FullUserNameFilter;
use App\Admin\Filter\SpecialtyFilter;
use Symfony\Contracts\Translation\TranslatorInterface;
use Doctrine\ORM\EntityManagerInterface as Em;
use App\Enum\ConsultTypeEnum;
use App\Enum\ConsultationStatusEnum;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use App\Entity\Profession;
use Symfony\Component\HttpFoundation\RequestStack;
use App\Utils\DeviceDetectionService;

class UserProfessionalCrudController extends AbstractCrudController
{
    private array $patientsAttendedMap = [];
    private array $consultationsCompletedMap = [];

    public function __construct(
        private TranslatorInterface $translator,
        private Em $em,
        private AdminUrlGenerator $adminUrlGenerator,
        private \App\Services\UserService $userService,
        private \App\Mailer\UserMailer $userMailer,
        private \App\Services\Notification\NotificationManager $notificationManager,
        private \Psr\Log\LoggerInterface $logger,
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
            ->setEntityLabelInSingular($this->translator->trans('users.professional_singular'))
            ->setEntityLabelInPlural($this->translator->trans('users.professional_plural'))
            ->setPageTitle(Crud::PAGE_INDEX, $this->translator->trans('users.professional_plural'))
            ->setDefaultSort(['id' => 'DESC'])
            ->setSearchFields(['first_name', 'last_name', 'dni', 'phone_number'])
            ->setPaginatorPageSize($this->deviceDetectionService->getPaginatorPageSize());
    }

    public function configureActions(Actions $actions): Actions
    {
        $detail = Action::new(Action::DETAIL, $this->translator->trans('users.actions.details'))
            ->linkToCrudAction(Action::DETAIL)
            ->setIcon('fa fa-eye');

        $viewConsultations = Action::new('viewConsultations', $this->translator->trans('users.actions.view_consultations'), 'fa fa-notes-medical')
            ->linkToUrl(function (User $user) {
                /** @var AdminUrlGenerator $urlGen */
                $urlGen = $this->container->get(AdminUrlGenerator::class);
                return $urlGen
                    ->setController(\App\Controller\Admin\ConsultationCrudController::class)
                    ->setAction(Crud::PAGE_INDEX)
                    ->set('filters', ['professionalId' => ['value' => $user->getId()]])
                    ->generateUrl();
            })
            ->displayIf(fn(?User $u) => $u !== null);

        $viewBookings = Action::new('viewBookings', $this->translator->trans('users.actions.view_bookings'), 'fa fa-calendar-check')
            ->linkToUrl(function (User $user) {
                /** @var AdminUrlGenerator $urlGen */
                $urlGen = $this->container->get(AdminUrlGenerator::class);
                return $urlGen
                    ->setController(\App\Controller\Admin\BookingCrudController::class)
                    ->setAction(Crud::PAGE_INDEX)
                    ->set('filters', ['professionalUser' => ['value' => $user->getId()]])
                    ->generateUrl();
            })
            ->displayIf(fn(?User $u) => $u !== null);

        $approve = Action::new('approveUser', $this->translator->trans('users.actions.approve'), 'fa fa-check')
            ->linkToCrudAction('approveUser')
            ->setCssClass('btn btn-success')
            ->displayIf(fn(User $user) => in_array($user->getStatus(), [
                UserStatusEnum::PENDING_APPROVAL->value,
                UserStatusEnum::REJECTED->value
            ], true));

        $reject = Action::new('rejectUser', $this->translator->trans('users.actions.reject'), 'fa fa-ban')
            ->linkToCrudAction('rejectUser')
            ->setCssClass('btn btn-danger')
            ->displayIf(fn(User $user) => $user->getStatus() === UserStatusEnum::PENDING_APPROVAL->value);

        return $actions
            ->add(Crud::PAGE_INDEX, $detail)
            ->add(Crud::PAGE_INDEX, $viewConsultations)
            ->add(Crud::PAGE_INDEX, $viewBookings)
            ->add(Crud::PAGE_DETAIL, $viewConsultations)
            ->add(Crud::PAGE_DETAIL, $viewBookings)
            ->add(Crud::PAGE_DETAIL, $approve)
            ->add(Crud::PAGE_DETAIL, $reject)
            ->update(Crud::PAGE_INDEX, Action::DELETE, function (Action $action) {
                return $action
                    ->setLabel($this->translator->trans('users.actions.delete'))
                    ->setCssClass('ea-action text-danger')
                    ->setIcon('fa fa-trash');
            })
            ->disable(Action::NEW);
    }

    public function approveUser(AdminContext $context): RedirectResponse
    {
        $id = $context->getRequest()->query->get('entityId');
        $user = $this->em->getRepository(User::class)->find($id);

        if (!$user instanceof User) {
            throw new \RuntimeException('Invalid user entity');
        }

        $user->setStatus(UserStatusEnum::ACTIVE->value);
        $this->em->flush();

        try {
            $this->userMailer->sendProfileApproved($user);
        } catch (\Throwable $e) {
            $this->logger->error('Error sending approval email', ['error' => $e->getMessage(), 'user_id' => $user->getId()]);
        }

        try {
            $title = $this->translator->trans('notifications.profile_approved.title', [], 'messages');
            $body = $this->translator->trans('notifications.profile_approved.body', [], 'messages');

            if ($title === 'notifications.profile_approved.title') {
                $title = 'Perfil Aprobado';
                $body = 'Tu perfil profesional ha sido aprobado. ¡Bienvenido!';
            }

            $this->notificationManager->notifyUser(
                $user,
                \App\Enum\NotificationTypeEnum::SYSTEM,
                $title,
                $body,
                ['action' => 'profile_approved']
            );
        } catch (\Throwable $e) {
            $this->logger->error('Error sending approval notification', ['error' => $e->getMessage(), 'user_id' => $user->getId()]);
        }

        $this->addFlash('success', $this->translator->trans('flash_messages.user_approved', [], 'messages'));

        return $this->redirect($context->getReferrer() ?? $this->adminUrlGenerator->setController(self::class)->setAction(Action::INDEX)->generateUrl());
    }

    public function rejectUser(AdminContext $context): Response
    {
        $id = $context->getRequest()->query->get('entityId');
        $user = $this->em->getRepository(User::class)->find($id);

        if (!$user instanceof User) {
            throw new \RuntimeException('Invalid user entity');
        }

        if ($context->getRequest()->isMethod('POST')) {
            $reason = $context->getRequest()->request->get('rejection_reason');

            if (empty($reason)) {
                $this->addFlash('danger', 'Debe ingresar una razón para el rechazo.');
            } else {
                if ($user->getUserDetails()) {
                    $user->getUserDetails()->setRejectionReason($reason);
                }

                $user->setStatus(UserStatusEnum::REJECTED->value);
                $this->em->flush();

                try {
                    $this->userMailer->sendProfileRejected($user);
                } catch (\Throwable $e) {
                    $this->logger->error('Error sending rejection email', ['error' => $e->getMessage(), 'user_id' => $user->getId()]);
                }

                try {
                    $title = $this->translator->trans('notifications.profile_rejected.title', [], 'messages');
                    $body = $this->translator->trans('notifications.profile_rejected.body', [], 'messages');

                    if ($title === 'notifications.profile_rejected.title') {
                        $title = 'Perfil Rechazado';
                        $body = 'Tu perfil ha sido rechazado. Revisa tu correo para más detalles.';
                    }

                    $this->notificationManager->notifyUser(
                        $user,
                        \App\Enum\NotificationTypeEnum::SYSTEM,
                        $title,
                        $body,
                        ['action' => 'profile_rejected']
                    );
                } catch (\Throwable $e) {
                    $this->logger->error('Error sending rejection notification', ['error' => $e->getMessage(), 'user_id' => $user->getId()]);
                }

                $this->addFlash('danger', $this->translator->trans('flash_messages.user_rejected', [], 'messages'));

                return $this->redirect($this->adminUrlGenerator->setController(self::class)->setAction(Action::INDEX)->generateUrl());
            }
        }

        return $this->render('admin/page/reject_user.html.twig', [
            'user' => $user,
            'actionUrl' => $this->adminUrlGenerator
                ->setController(self::class)
                ->setAction('rejectUser')
                ->setEntityId($user->getId())
                ->generateUrl(),
            'returnUrl' => $this->adminUrlGenerator
                ->setController(self::class)
                ->setAction(Action::INDEX)
                ->generateUrl(),
        ]);
    }

    public function configureFilters(Filters $filters): Filters
    {
        return $filters
            ->add(FullUserNameFilter::new('fullName', $this->translator->trans('users.full_name')))
            ->add(SpecialtyFilter::new('specialty', $this->translator->trans('users.specialty')))
            ->add('status');
    }

    public function configureFields(string $pageName): iterable
    {
        if ($pageName === Crud::PAGE_INDEX) {
            return [
                TextField::new('first_name', $this->translator->trans('users.first_name'))
                    ->formatValue(function ($value, $entity) {
                        if (!$entity instanceof User)
                            return $value;
                        $url = $this->adminUrlGenerator->setController(self::class)->setAction(Action::DETAIL)->setEntityId($entity->getId())->generateUrl();
                        return sprintf('<a href="%s">%s</a>', $url, $value);
                    })
                    ->setTemplatePath('admin/field/raw.html.twig'),
                TextField::new('last_name', $this->translator->trans('users.last_name'))
                    ->formatValue(function ($value, $entity) {
                        if (!$entity instanceof User)
                            return $value;
                        $url = $this->adminUrlGenerator->setController(self::class)->setAction(Action::DETAIL)->setEntityId($entity->getId())->generateUrl();
                        return sprintf('<a href="%s">%s</a>', $url, $value);
                    })
                    ->setTemplatePath('admin/field/raw.html.twig'),
                TextField::new('specialty', $this->translator->trans('users.specialty')),
                TextField::new('status', $this->translator->trans('users.status'))
                    ->formatValue(function ($value) {
                        $key = 'users.status_' . strtolower($value ?? '');
                        $label = $this->translator->trans($key);
                        if ($label === $key) {
                            $label = $value ?? '';
                        }
                        $label = mb_strtoupper($label, 'UTF-8');

                        $colorMap = [
                            'active' => 'success',
                            'pending_completion' => 'secondary',
                            'pending_approval' => 'warning',
                            'rejected' => 'danger',
                        ];
                        $color = $colorMap[$value] ?? 'secondary';

                        return sprintf('<span class="badge badge-%s">%s</span>', $color, $label);
                    })
                    ->setTemplatePath('admin/field/raw.html.twig')
                    ->setFormTypeOption('disabled', true),
                IntegerField::new('patientsAttended', $this->translator->trans('users.patients_attended'))
                    ->setSortable(false)
                    ->formatValue(function ($value, $entity) {
                        if (!($entity instanceof User)) {
                            return 0;
                        }
                        return (int) ($this->patientsAttendedMap[$entity->getId()] ?? 0);
                    }),
                IntegerField::new('consultationsCompleted', $this->translator->trans('users.consultations_completed'))
                    ->setSortable(false)
                    ->formatValue(function ($value, $entity) {
                        if (!($entity instanceof User)) {
                            return 0;
                        }
                        return (int) ($this->consultationsCompletedMap[$entity->getId()] ?? 0);
                    }),
            ];
        }

        if ($pageName === Crud::PAGE_DETAIL) {
            $fields = [
                FormField::addPanel($this->translator->trans('users.personal_info')),
                TextField::new('dni', $this->translator->trans('users.dni')),
                TextField::new('userDetails.holderName', $this->translator->trans('users.holder_name')),
                TextField::new('userDetails.accountNumber', $this->translator->trans('users.account_number')),
                TextField::new('phone_number', $this->translator->trans('users.phone_number')),
                DateField::new('userDetails.dateBirth', $this->translator->trans('users.date_birth')),
                TextField::new('userDetails.prefixProfessional', $this->translator->trans('users.prefix')),
                TextField::new('first_name', $this->translator->trans('users.first_name')),
                TextField::new('last_name', $this->translator->trans('users.last_name')),
                EmailField::new('email', $this->translator->trans('users.email')),

                FormField::addPanel($this->translator->trans('users.media_profile')),
                ChoiceField::new('userDetails.profileMediaType', $this->translator->trans('users.media_type'))
                    ->setChoices([
                        $this->translator->trans('users.media_image') => 'image',
                        $this->translator->trans('users.media_video') => 'video'
                    ])
                    ->renderAsBadges(['image' => 'info', 'video' => 'warning']),
                UrlField::new('userDetails.profileVideoUrl', $this->translator->trans('users.video_url')),

                FormField::addPanel($this->translator->trans('users.extra_info')),
                TextField::new('userDetails.baseProfession', $this->translator->trans('users.base_profession'))
                    ->formatValue(function ($value, ?User $user) {
                        if (!$user || !$user->getUserDetails())
                            return '';
                        $profession = $user->getUserDetails()->getBaseProfession();
                        return $profession ? $profession->getName() : '';
                    }),
                TextField::new('userDetails.consultType', $this->translator->trans('users.consult_type'))
                    ->formatValue(function ($value) {
                        if (!$value)
                            return null;
                        $consultType = ConsultTypeEnum::tryFrom($value);
                        return $consultType?->label() ?? $value;
                    }),
                TextField::new('specialty', $this->translator->trans('users.specialties'))
                    ->formatValue(function ($value, ?User $user) {
                        if (!$user)
                            return '';
                        $specialties = $user->getSpecialties();
                        if (!$specialties || $specialties->isEmpty())
                            return '';

                        $specialtyNames = array_map(fn($s) => $s->getName(), $specialties->toArray());
                        return sprintf('<span style="padding-left: 10px;">%s</span>', implode(', ', $specialtyNames));
                    })
                    ->renderAsHtml(),
                TextareaField::new('userDetails.about', $this->translator->trans('users.about'))
                    ->setMaxLength(65535)
                    ->renderAsHtml(),
            ];

            $user = $this->getContext()?->getEntity()?->getInstance();
            if ($user instanceof User && $user->getStatus() === UserStatusEnum::REJECTED->value) {
                $fields[] = FormField::addPanel('Rechazo');
                $fields[] = TextareaField::new('userDetails.rejectionReason', 'Razón del rechazo');
            }

            $fields[] = FormField::addPanel($this->translator->trans('users.titulations'));
            $fields[] = TextareaField::new('professionsDetail', $this->translator->trans('users.other_professions'))
                ->onlyOnDetail()
                ->renderAsHtml();
            $fields[] = TextareaField::new('studiesDetail', $this->translator->trans('users.studies'))
                ->onlyOnDetail()
                ->renderAsHtml();


            return $fields;
        }

        return [
            FormField::addPanel($this->translator->trans('users.personal_info')),
            IdField::new('id')->hideOnForm(),
            TextField::new('dni', $this->translator->trans('users.dni')),
            TextField::new('userDetails.holderName', $this->translator->trans('users.holder_name')),
            TextField::new('userDetails.accountNumber', $this->translator->trans('users.account_number')),
            TextField::new('userDetails.bankName', $this->translator->trans('users.bank_name')),
            TextField::new('phone_number', $this->translator->trans('users.phone_number')),
            DateField::new('userDetails.dateBirth', $this->translator->trans('users.date_birth')),
            TextField::new('userDetails.prefixProfessional', $this->translator->trans('users.prefix'))->setRequired(false),
            TextField::new('first_name', $this->translator->trans('users.first_name')),
            TextField::new('last_name', $this->translator->trans('users.last_name')),
            EmailField::new('email', $this->translator->trans('users.email')),

            FormField::addPanel($this->translator->trans('users.media_profile')),
            ChoiceField::new('userDetails.profileMediaType', $this->translator->trans('users.media_type'))
                ->setChoices([
                    $this->translator->trans('users.media_image') => 'image',
                    $this->translator->trans('users.media_video') => 'video'
                ]),
            UrlField::new('userDetails.profileVideoUrl', $this->translator->trans('users.video_url')),

            FormField::addPanel($this->translator->trans('users.extra_info')),
            TextField::new('userDetails.baseProfession', $this->translator->trans('users.base_profession'))
                ->setFormType(EntityType::class)
                ->setFormTypeOptions([
                    'class' => Profession::class,
                    'choice_label' => 'name',
                    'required' => false,
                ]),
            ChoiceField::new('userDetails.consultType', $this->translator->trans('users.consult_type'))
                ->setChoices(ConsultTypeEnum::choices()),
            AssociationField::new('specialties', $this->translator->trans('users.specialties')),
            AssociationField::new('professions', $this->translator->trans('users.other_professions'))
                ->setFormTypeOption('by_reference', false)
                ->setQueryBuilder(function (QueryBuilder $qb) {
                    $instance = $this->getContext()?->getEntity()?->getInstance();
                    if ($instance instanceof User) {
                        $baseProfession = $instance->getUserDetails()?->getBaseProfession();
                        if ($baseProfession) {
                            $alias = $qb->getRootAliases()[0];
                            $qb->andWhere(sprintf('%s.id != :baseId', $alias))
                                ->setParameter('baseId', $baseProfession->getId());
                        }
                    }
                    return $qb;
                }),
            TextareaField::new('userDetails.about', $this->translator->trans('users.about'))
                ->setMaxLength(65535),
        ];
    }

    public function createIndexQueryBuilder(SearchDto $searchDto, EntityDto $entityDto, FieldCollection $fields, FilterCollection $filters): QueryBuilder
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

        $qb->andWhere(sprintf('%s.type_account = :type', $alias))
            ->setParameter('type', 'professional');

        $qb->leftJoin($alias . '.userDetails', 'ud')->addSelect('ud');
        $qb->leftJoin('ud.baseProfession', 'bp')->addSelect('bp');
        $term = trim((string) $searchDto->getQuery());
        if ($term !== '') {
            $lower = mb_strtolower($term);

            $statusMatches = [];

            $keywords = [
                'active' => ['active', 'activa', 'activo'],
                'pending_completion' => ['incompleto', 'incomplete', 'pendiente'],
                'pending_approval' => ['revision', 'revisión', 'approval'],
                'rejected' => ['rejected', 'rechazado', 'rechazada']
            ];

            foreach ($keywords as $status => $words) {
                foreach ($words as $word) {
                    if (str_contains($word, $lower) || str_contains($lower, $word)) {
                        $statusMatches[] = $status;
                        break;
                    }
                }
            }
            $statusMatches = array_unique($statusMatches);

            $orConditions = [
                'LOWER(' . $alias . '.first_name) LIKE :term',
                'LOWER(' . $alias . '.last_name) LIKE :term',
                'LOWER(bp.name) LIKE :term',
                'LOWER(CONCAT(' . $alias . '.first_name, \' \', ' . $alias . '.last_name)) LIKE :term'
            ];

            if (!empty($statusMatches)) {
                $statusParamName = 'status_matches';
                $orConditions[] = $alias . '.status IN (:' . $statusParamName . ')';
            }

            $qb->andWhere('(' . implode(' OR ', $orConditions) . ')')
                ->setParameter('term', '%' . $lower . '%');

            if (!empty($statusMatches)) {
                $qb->setParameter('status_matches', $statusMatches);
            }
        }

        $idsQb = clone $qb;
        $idsQb->resetDQLParts(['select', 'orderBy']);
        $idsQb->select($alias . '.id');
        $ids = array_map('current', $idsQb->getQuery()->getScalarResult());

        $this->patientsAttendedMap = [];
        $this->consultationsCompletedMap = [];

        if (!empty($ids)) {
            $dql = '
              SELECT 
                p.id AS professional_id, 
                COUNT(DISTINCT pat.id) AS patients_count, 
                COUNT(c.id) AS consultations_count
              FROM App\Entity\Consultation c
              JOIN c.booking b
              JOIN b.professionalUser p
              JOIN b.patientUser pat
              WHERE p.id IN (:ids) AND c.consultationStatus = :cStatus
              GROUP BY p.id
            ';

            $results = $this->em->createQuery($dql)
                ->setParameter('ids', $ids)
                ->setParameter('cStatus', ConsultationStatusEnum::COMPLETED)
                ->getScalarResult();

            foreach ($results as $row) {
                $pid = (int) $row['professional_id'];
                $this->patientsAttendedMap[$pid] = (int) $row['patients_count'];
                $this->consultationsCompletedMap[$pid] = (int) $row['consultations_count'];
            }
        }

        return $qb;
    }

    public function persistEntity(EntityManagerInterface $entityManager, $entityInstance): void
    {
        if ($entityInstance instanceof User) {
            $entityInstance->setTypeAccount('professional');
        }
        parent::persistEntity($entityManager, $entityInstance);
    }

    public function updateEntity(EntityManagerInterface $entityManager, $entityInstance): void
    {
        $statusChanged = false;
        $newStatus = null;
        $oldStatus = null;

        if ($entityInstance instanceof User) {
            $entityInstance->setTypeAccount('professional');

            $uow = $entityManager->getUnitOfWork();
            $originalData = $uow->getOriginalEntityData($entityInstance);
            $oldStatus = $originalData['status'] ?? null;
            $newStatus = $entityInstance->getStatus();

            $this->logger->info('Admin updating user profile', [
                'uid' => $entityInstance->getUid(),
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'status_changed' => ($oldStatus !== $newStatus),
                'active_enum' => UserStatusEnum::ACTIVE->value,
                'rejected_enum' => UserStatusEnum::REJECTED->value
            ]);

            if ($oldStatus !== $newStatus) {
                $statusChanged = true;
            }
        }

        parent::updateEntity($entityManager, $entityInstance);

        if ($entityInstance instanceof User && $statusChanged) {
            $notificationTitle = '';
            $notificationBody = '';
            $action = '';

            if ($newStatus === UserStatusEnum::ACTIVE->value) {
                try {
                    $this->userMailer->sendProfileApproved($entityInstance);
                } catch (\Throwable $e) {
                    $this->logger->error('Error sending approval email (updateEntity)', ['error' => $e->getMessage(), 'uid' => $entityInstance->getUid()]);
                }

                $notificationTitle = $this->translator->trans('notifications.profile_approved.title', [], 'messages');
                $notificationBody = $this->translator->trans('notifications.profile_approved.body', [], 'messages');
                $action = 'profile_approved';

                if ($notificationTitle === 'notifications.profile_approved.title') {
                    $notificationTitle = 'Perfil Aprobado';
                    $notificationBody = 'Tu perfil profesional ha sido aprobado. ¡Bienvenido!';
                }
            } elseif ($newStatus === UserStatusEnum::REJECTED->value) {
                try {
                    $this->userMailer->sendProfileRejected($entityInstance);
                } catch (\Throwable $e) {
                    $this->logger->error('Error sending rejection email (updateEntity)', ['error' => $e->getMessage(), 'uid' => $entityInstance->getUid()]);
                }

                $notificationTitle = $this->translator->trans('notifications.profile_rejected.title', [], 'messages');
                $notificationBody = $this->translator->trans('notifications.profile_rejected.body', [], 'messages');
                $action = 'profile_rejected';

                if ($notificationTitle === 'notifications.profile_rejected.title') {
                    $notificationTitle = 'Perfil Rechazado';
                    $notificationBody = 'Tu perfil ha sido rechazado. Revisa tu correo para más detalles.';
                }
            }

            if ($notificationTitle) {
                try {
                    $this->notificationManager->notifyUser(
                        $entityInstance,
                        \App\Enum\NotificationTypeEnum::SYSTEM,
                        $notificationTitle,
                        $notificationBody,
                        ['action' => $action]
                    );
                } catch (\Throwable $e) {
                    $this->logger->error('Error sending profile notification (updateEntity)', ['error' => $e->getMessage(), 'uid' => $entityInstance->getUid()]);
                }
            }
        }

        if ($entityInstance instanceof User) {
            if ($this->userService->isProfileComplete($entityInstance)) {
                if ($entityInstance->getStatus() === UserStatusEnum::PENDING_COMPLETION->value) {
                    $entityInstance->setStatus(UserStatusEnum::PENDING_APPROVAL->value);
                    $entityManager->flush();
                }
            }
        }
    }
}
