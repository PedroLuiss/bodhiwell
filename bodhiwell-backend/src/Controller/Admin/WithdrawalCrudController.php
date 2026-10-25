<?php

namespace App\Controller\Admin;

use App\Entity\Withdrawal;
use App\Enum\WithdrawalStatusEnum;
use App\Enum\WithdrawalMethodEnum;
use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Filters;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\MoneyField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateField;
use EasyCorp\Bundle\EasyAdminBundle\Filter\ChoiceFilter;
use App\Filter\DayDateFilter;
use App\Admin\Filter\FullNameFilter;
use App\Repository\UserRepository;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Context\AdminContext;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Bundle\SecurityBundle\Security;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;
use Psr\Log\LoggerInterface;
use App\Services\WalletService;
use EasyCorp\Bundle\EasyAdminBundle\Factory\EntityFactory;
use EasyCorp\Bundle\EasyAdminBundle\Factory\FilterFactory;
use EasyCorp\Bundle\EasyAdminBundle\Collection\FieldCollection;
use EasyCorp\Bundle\EasyAdminBundle\Dto\SearchDto;
use Symfony\Component\HttpFoundation\StreamedResponse;
use EasyCorp\Bundle\EasyAdminBundle\Dto\EntityDto;
use EasyCorp\Bundle\EasyAdminBundle\Collection\FilterCollection;
use Doctrine\ORM\QueryBuilder;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RequestStack;
use App\Utils\DeviceDetectionService;

#[IsGranted('ROLE_ADMIN')]
class WithdrawalCrudController extends AbstractCrudController
{
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

        if (!in_array('professional', $qb->getAllAliases())) {
            $qb->leftJoin($alias . '.professional', 'professional');
        }

        $term = trim((string) $searchDto->getQuery());
        if ($term !== '') {
            $lower = mb_strtolower($term);

            $statusMatches = [];
            $statusKeywords = [
                'pending' => ['pending', 'pendiente'],
                'approved' => ['approved', 'aprobado', 'aprobada'],
                'rejected' => ['rejected', 'rechazado', 'rechazada'],
                'in_process' => ['in_process', 'proceso', 'procesando'],
            ];

            foreach ($statusKeywords as $status => $words) {
                foreach ($words as $word) {
                    if (str_contains($word, $lower) || str_contains($lower, $word)) {
                        $statusMatches[] = $status;
                        break;
                    }
                }
            }

            $orConditions = [
                'LOWER(professional.first_name) LIKE :term',
                'LOWER(professional.last_name) LIKE :term',
                'LOWER(CONCAT(professional.first_name, \' \', professional.last_name)) LIKE :term',
                'LOWER(' . $alias . '.reason) LIKE :term',
            ];

            $cleanAmount = preg_replace('/[^\d,.]/', '', $lower);

            $cleanAmount = str_replace(',', '.', $cleanAmount);

            if (is_numeric($cleanAmount)) {
                $val = (float) $cleanAmount;
                $orConditions[] = $alias . '.amount = :amount_val';
                $qb->setParameter('amount_val', $val);

                $orConditions[] = $alias . '.amount LIKE :amount_like_decimal';
                $qb->setParameter('amount_like_decimal', '%' . $cleanAmount . '%');

                $intVal = (int) $val;
                $orConditions[] = $alias . '.amount LIKE :amount_like_int';
                $qb->setParameter('amount_like_int', '%' . $intVal . '%');
            }

            $months = ['ene' => 1, 'feb' => 2, 'mar' => 3, 'abr' => 4, 'may' => 5, 'jun' => 6, 'jul' => 7, 'ago' => 8, 'sep' => 9, 'oct' => 10, 'nov' => 11, 'dic' => 12];
            $searchDay = null;
            $searchMonth = null;
            $searchYear = null;

            foreach ($months as $k => $v) {
                if (str_contains($lower, $k)) {
                    $searchMonth = $v;
                    if (preg_match('/(\d{1,2})\s*' . $k . '/', $lower, $matches)) {
                        $searchDay = (int) $matches[1];
                    } elseif (preg_match('/' . $k . '\s*(\d{1,2})/', $lower, $matches)) {
                        $searchDay = (int) $matches[1];
                    }
                    break;
                }
            }
            if (preg_match('/(20\d{2})/', $lower, $matches)) {
                $searchYear = (int) $matches[1];
            }

            if ($searchMonth || $searchYear) {
                $dateLike = '%';

                if ($searchYear) {
                    $dateLike = $searchYear . '-';
                } else {
                    $dateLike .= '%-';
                }

                if ($searchMonth) {
                    $dateLike .= sprintf('%02d', $searchMonth) . '-';
                } else {
                    $dateLike .= '%-';
                }

                if ($searchDay) {
                    $dateLike .= sprintf('%02d', $searchDay) . '%';
                } else {
                    $dateLike .= '%';
                }

                $orConditions[] = $alias . '.createdAt LIKE :date_like';
                $qb->setParameter('date_like', $dateLike);
            } else {
                $orConditions[] = $alias . '.createdAt LIKE :term';
            }

            if (!empty($statusMatches)) {
                $orConditions[] = $alias . '.status IN (:status_matches)';
                $qb->setParameter('status_matches', array_unique($statusMatches));
            }

            $qb->andWhere('(' . implode(' OR ', $orConditions) . ')')
                ->setParameter('term', '%' . $lower . '%');
        }

        return $qb;
    }
    public function __construct(
        private TranslatorInterface $translator,
        private EntityManagerInterface $em,
        private Security $security,
        private LoggerInterface $logger,
        private WalletService $walletService,
        private EntityFactory $entityFactory,
        private AdminUrlGenerator $adminUrlGenerator,
        private RequestStack $requestStack,
        private DeviceDetectionService $deviceDetectionService
    ) {}

    public static function getEntityFqcn(): string
    {
        return Withdrawal::class;
    }

    public function createEntity(string $entityFqcn)
    {
        $entity = parent::createEntity($entityFqcn);
        if ($entity instanceof Withdrawal) {
        }
        return $entity;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setPageTitle(Crud::PAGE_INDEX, $this->translator->trans('withdrawal.label_plural'))
            ->setPageTitle(Crud::PAGE_NEW, $this->translator->trans('withdrawal.new'))
            ->setPageTitle(Crud::PAGE_EDIT, $this->translator->trans('withdrawal.edit'))
            ->setEntityLabelInSingular($this->translator->trans('withdrawal.label_singular'))
            ->setEntityLabelInPlural($this->translator->trans('withdrawal.label_plural'))
            ->setDefaultSort(['id' => 'DESC'])
            ->setSearchFields([
                'professional.firstName',
                'professional.lastName',
                'status',
                'amount',
            ])
            ->setPaginatorPageSize($this->deviceDetectionService->getPaginatorPageSize())
            ->overrideTemplate('crud/detail', 'admin/withdrawal/detail.html.twig');
    }

    public function configureFields(string $pageName): iterable
    {
        $statusChoices = [];
        foreach (WithdrawalStatusEnum::cases() as $case) {
            $labelKey = 'withdrawal.status.' . strtolower($case->value);
            $statusChoices[$this->translator->trans($labelKey)] = $case;
        }

        $disableStatus = false;
        $context = $this->getContext();

        if ($pageName === Crud::PAGE_EDIT && $context instanceof AdminContext) {
            $entityDto = $context->getEntity();
            $currentEntity = $entityDto ? $entityDto->getInstance() : null;

            if ($currentEntity instanceof Withdrawal) {
                $st = $currentEntity->getStatus();
                if ($st === WithdrawalStatusEnum::APPROVED || $st === WithdrawalStatusEnum::REJECTED) {
                    $disableStatus = true;
                }
            }
        }

        if ($pageName === Crud::PAGE_NEW) {
            return [
                AssociationField::new('professional', $this->translator->trans('withdrawal.fields.professional'))
                    ->setFormTypeOption('choice_label', fn($u) => method_exists($u, 'getFullName') ? $u->getFullName() : (string) $u)
                    ->setFormTypeOption('query_builder', function (UserRepository $ur) {
                        return $ur->createQueryBuilder('u')
                            ->join('u.professionalWallet', 'pw')
                            ->andWhere('u.type_account = :type')
                            ->andWhere('pw.availableBalance > 0')
                            ->setParameter('type', 'professional')
                            ->orderBy('u.first_name', 'ASC');
                    })
                    ->setHelp('Solo aparecen profesionales con saldo disponible.'),
                TextField::new('dni', 'DNI')
                    ->setFormTypeOption('attr', ['maxlength' => 20]),
                TextField::new('reason', 'Motivo'),
                ChoiceField::new('withdrawalMethod', 'Método de Retiro')
                    ->setChoices(array_reduce(
                        WithdrawalMethodEnum::cases(),
                        fn(array $choices, WithdrawalMethodEnum $enum) => $choices + [$enum->label() => $enum],
                        []
                    )),
            ];
        }

        $statusField = ChoiceField::new('status', $this->translator->trans('withdrawal.fields.status'))
            ->setChoices($statusChoices)
            ->setFormTypeOptions([
                'choice_value' => function (?WithdrawalStatusEnum $choice) {
                    return $choice?->value;
                },
                'choice_loader' => null,
                'disabled' => $disableStatus,
            ])
            ->formatValue(function ($value, $entity) {
                if ($value instanceof WithdrawalStatusEnum) {
                    $val = $value->value;
                } else {
                    $val = $value;
                }

                $label = strtoupper($this->translator->trans('withdrawal.status.' . strtolower($val)));

                $colorMap = [
                    WithdrawalStatusEnum::PENDING->value => 'warning',
                    WithdrawalStatusEnum::APPROVED->value => 'success',
                    WithdrawalStatusEnum::REJECTED->value => 'danger',
                    WithdrawalStatusEnum::IN_PROCESS->value => 'info',
                ];
                $color = $colorMap[$val] ?? 'secondary';

                return sprintf('<span class="badge badge-%s">%s</span>', $color, $label);
            })
            ->setTemplatePath('admin/field/raw.html.twig');

        return [
            IdField::new('id')->onlyOnDetail(),
            AssociationField::new('professional', $this->translator->trans('withdrawal.fields.professional'))
                ->setFormTypeOption('choice_label', fn($u) => method_exists($u, 'getFullName') ? $u->getFullName() : (string) $u)
                ->setFormTypeOption('query_builder', function (UserRepository $ur) {
                    return $ur->createQueryBuilder('u')
                        ->andWhere('u.type_account = :type')
                        ->setParameter('type', 'professional')
                        ->orderBy('u.first_name', 'ASC');
                })
                ->formatValue(function ($value, $entity) {
                    if (!$value)
                        return '';
                    $name = method_exists($value, 'getFullName') ? $value->getFullName() : (string) $value;

                    $url = $this->adminUrlGenerator
                        ->setController(\App\Controller\Admin\UserProfessionalCrudController::class)
                        ->setAction(Action::DETAIL)
                        ->setEntityId($value->getId())
                        ->generateUrl();

                    return sprintf('<a href="%s">%s</a>', $url, $name);
                })
                ->setTemplatePath('admin/field/raw.html.twig'),
            TextField::new('reason', 'Motivo'),
            MoneyField::new('amount', $this->translator->trans('withdrawal.fields.amount'))
                ->setCurrency('UYU')
                ->setNumDecimals(2)
                ->setStoredAsCents(false)
                ->setFormTypeOption('attr', ['min' => 0.01, 'step' => '0.01'])
                ->setTextAlign('left'),
            DateField::new('createdAt', 'Fecha'),
            $statusField,
        ];
    }

    public function configureFilters(Filters $filters): Filters
    {
        return $filters
            ->add(ChoiceFilter::new('status', $this->translator->trans('withdrawal.fields.status'))->setChoices([
                $this->translator->trans('withdrawal.status.pending') => WithdrawalStatusEnum::PENDING,
                $this->translator->trans('withdrawal.status.approved') => WithdrawalStatusEnum::APPROVED,
                $this->translator->trans('withdrawal.status.rejected') => WithdrawalStatusEnum::REJECTED,
                $this->translator->trans('withdrawal.status.in_process') => WithdrawalStatusEnum::IN_PROCESS,
            ]))
            ->add(DayDateFilter::new('createdAt', 'Fecha'))
            ->add(FullNameFilter::new('professional', $this->translator->trans('withdrawal.fields.professional')));
    }

    public function configureActions(Actions $actions): Actions
    {
        $exportAction = Action::new('export', 'Exportar CSV')
            ->linkToCrudAction('export')
            ->createAsGlobalAction()
            ->setCssClass('btn btn-success')
            ->setIcon('fa fa-download');

        $markProcessed = Action::new('markProcessed', 'Marcar como pagado')
            ->linkToCrudAction('confirmApprove')
            ->setCssClass('text-success')
            ->setIcon('fa fa-check-circle')
            ->displayIf(static function (?Withdrawal $withdrawal) {
                return $withdrawal !== null && $withdrawal->getStatus() === WithdrawalStatusEnum::PENDING;
            });

        $markRejected = Action::new('markRejected', 'Rechazar transacción')
            ->linkToCrudAction('confirmReject')
            ->setCssClass('text-danger')
            ->setIcon('fa fa-ban')
            ->displayIf(static function (?Withdrawal $withdrawal) {
                return $withdrawal !== null && $withdrawal->getStatus() === WithdrawalStatusEnum::PENDING;
            });

        return $actions
            ->add(Crud::PAGE_INDEX, $exportAction)
            ->add(Crud::PAGE_INDEX, Action::DETAIL)
            ->add(Crud::PAGE_DETAIL, $markProcessed)
            ->add(Crud::PAGE_DETAIL, $markRejected)
            ->setPermission('markProcessed', 'ROLE_ADMIN')
            ->setPermission('markRejected', 'ROLE_ADMIN')
            ->disable(Action::EDIT, Action::DELETE);
    }

    public function detail(AdminContext $context)
    {
        $entityDto = $context->getEntity();
        $withdrawal = $entityDto->getInstance();

        $accountNumber = 'N/A';
        $fundsOrigin = [];
        $totalCalculated = 0;

        if ($withdrawal instanceof Withdrawal && $withdrawal->getProfessional()) {
            $userDetails = $withdrawal->getProfessional()->getUserDetails();
            if ($userDetails) {
                $accountNumber = $userDetails->getAccountNumber();
            }

            $professional = $withdrawal->getProfessional();
            $endDate = $withdrawal->getCreatedAt();

            $qb = $this->em->getRepository(Withdrawal::class)->createQueryBuilder('w');
            $qb->select('MAX(w.createdAt)')
                ->where('w.professional = :prof')
                ->andWhere('w.status = :status')
                ->andWhere('w.createdAt < :currentDate')
                ->setParameter('prof', $professional)
                ->setParameter('status', WithdrawalStatusEnum::APPROVED)
                ->setParameter('currentDate', $endDate);

            $lastDateStr = $qb->getQuery()->getSingleScalarResult();
            $startDate = $lastDateStr ? new \DateTimeImmutable($lastDateStr) : null;

            $lqb = $this->em->getRepository(\App\Entity\WalletLedger::class)->createQueryBuilder('wl');
            $lqb->join('wl.wallet', 'w')
                ->where('w.professional = :prof')
                ->andWhere('wl.concept = :concept')
                ->andWhere('wl.createdAt <= :end')
                ->setParameter('prof', $professional)
                ->setParameter('concept', \App\Enum\WalletLedgerConceptEnum::FUNDS_RELEASE)
                ->setParameter('end', $endDate);

            if ($startDate) {
                $lqb->andWhere('wl.createdAt > :start')
                    ->setParameter('start', $startDate);
            }

            $fundsOrigin = $lqb->getQuery()->getResult();

            foreach ($fundsOrigin as $ledger) {
                $totalCalculated += $ledger->getAmount();
            }
        }

        $responseParameters = parent::detail($context);

        if ($responseParameters instanceof \EasyCorp\Bundle\EasyAdminBundle\Config\KeyValueStore) {
            $responseParameters->set('accountNumber', $accountNumber);
            $responseParameters->set('holderName', $userDetails ? $userDetails->getHolderName() : 'N/A');
            $responseParameters->set('bankName', $userDetails ? $userDetails->getBankName() : 'N/A');
            $responseParameters->set('fundsOrigin', $fundsOrigin);
            $responseParameters->set('totalCalculated', $totalCalculated);
        }

        return $responseParameters;
    }

    public function export(AdminContext $context): StreamedResponse
    {
        $entityDto = $this->entityFactory->create(self::getEntityFqcn());

        $crudDto = $context->getCrud();
        if (null === $crudDto) {
            $crudDto = $this->configureCrud(Crud::new())->getAsDto();
        }

        $searchDto = $context->getSearch();
        if (null === $searchDto) {
            $request = $context->getRequest();
            $searchDto = new SearchDto(
                $request,
                $crudDto->getSearchFields(),
                $request->query->get('query'),
                $crudDto->getDefaultSort(),
                $request->query->all('sort'),
                $request->query->all('filters')
            );
        }

        $fields = FieldCollection::new($this->configureFields(Crud::PAGE_INDEX));

        $filterConfigDto = $this->configureFilters(Filters::new())->getAsDto();
        $filters = $this->container->get(FilterFactory::class)->create($filterConfigDto, $fields, $entityDto);

        $qb = $this->createIndexQueryBuilder($searchDto, $entityDto, $fields, $filters);
        $withdrawals = $qb->getQuery()->getResult();

        $response = new StreamedResponse(function () use ($withdrawals) {
            $handle = fopen('php://output', 'w+');

            fputs($handle, "\xEF\xBB\xBF");

            fputcsv($handle, ['Id', 'Fecha', 'Profesional', 'Monto', 'Método', 'Estado', 'Motivo'], ';');

            foreach ($withdrawals as $withdrawal) {
                /** @var Withdrawal $withdrawal */
                $professional = $withdrawal->getProfessional();
                $profName = $professional ? sprintf('%s %s', $professional->getFirstName(), $professional->getLastName()) : 'N/A';

                fputcsv($handle, [
                    $withdrawal->getId(),
                    $withdrawal->getCreatedAt()->format('Y-m-d H:i:s'),
                    $profName,
                    number_format($withdrawal->getAmount(), 2, ',', ''),
                    $withdrawal->getWithdrawalMethod()?->value,
                    $withdrawal->getStatus()->value,
                    $withdrawal->getReason()
                ], ';');
            }

            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
        $response->headers->set('Content-Disposition', 'attachment; filename="retiros.csv"');

        return $response;
    }

    private function validateWithdrawalForSave(Withdrawal $w): ?string
    {
        if (null === $w->getProfessional()) {
            return 'withdrawal.messages.invalid_professional';
        }
        if ((float) $w->getAmount() <= 0) {
            return 'withdrawal.messages.invalid_amount';
        }
        return null;
    }

    public function persistEntity(EntityManagerInterface $em, $entityInstance): void
    {
        if ($entityInstance instanceof Withdrawal) {
            if (!$this->security->isGranted('ROLE_ADMIN')) {
                $this->addFlash('danger', $this->translator->trans('withdrawal.messages.access_denied'));
                return;
            }

            $professional = $entityInstance->getProfessional();
            if (!$professional) {
                $this->addFlash('danger', 'Profesional no seleccionado.');
                return;
            }

            $wallet = $em->getRepository(\App\Entity\ProfessionalWallet::class)->findOneBy(['professional' => $professional]);
            if (!$wallet) {
                $this->addFlash('danger', 'Billetera no encontrada para el profesional.');
                return;
            }

            try {
                $this->walletService->createAutomaticWithdrawal(
                    $wallet,
                    $entityInstance->getReason() ?: 'Corte manual desde panel',
                    $entityInstance->getWithdrawalMethod()
                );

                $this->addFlash('success', 'Retiro generado exitosamente por el monto total disponible.');
            } catch (\Exception $e) {
                $this->logger->error('Error manual withdrawal: ' . $e->getMessage());
                $this->addFlash('danger', 'Error al generar retiro: ' . $e->getMessage());
            }

            return;
        }

        parent::persistEntity($em, $entityInstance);
    }

    public function updateEntity(EntityManagerInterface $em, $entityInstance): void
    {
        if ($entityInstance instanceof Withdrawal) {
            if (!$this->security->isGranted('ROLE_ADMIN')) {
                $this->addFlash('danger', $this->translator->trans('withdrawal.messages.access_denied'));
                return;
            }

            if ($errorKey = $this->validateWithdrawalForSave($entityInstance)) {
                $this->addFlash('danger', $this->translator->trans($errorKey));
                return;
            }
        }

        parent::updateEntity($em, $entityInstance);
    }

    public function confirmApprove(AdminContext $context): Response
    {
        $id = $context->getRequest()->query->get('entityId');
        $withdrawal = $id ? $this->em->getRepository(Withdrawal::class)->find($id) : null;

        if (!$withdrawal instanceof Withdrawal) {
            throw $this->createNotFoundException();
        }

        $url = $this->adminUrlGenerator
            ->setController(self::class)
            ->setAction('markProcessed')
            ->setEntityId($id)
            ->generateUrl();

        return $this->render('admin/withdrawal/confirm_action.html.twig', [
            'withdrawal' => $withdrawal,
            'actionLabel' => 'Confirmar Pago',
            'actionType' => 'approve',
            'actionUrl' => $url,
            'page_title' => 'Confirmar Pago de Retiro',
        ]);
    }

    public function confirmReject(AdminContext $context): Response
    {
        $id = $context->getRequest()->query->get('entityId');
        $withdrawal = $id ? $this->em->getRepository(Withdrawal::class)->find($id) : null;

        if (!$withdrawal instanceof Withdrawal) {
            throw $this->createNotFoundException();
        }

        $url = $this->adminUrlGenerator
            ->setController(self::class)
            ->setAction('markRejected')
            ->setEntityId($id)
            ->generateUrl();

        return $this->render('admin/withdrawal/confirm_action.html.twig', [
            'withdrawal' => $withdrawal,
            'actionLabel' => 'Rechazar Transacción',
            'actionType' => 'reject',
            'actionUrl' => $url,
            'page_title' => 'Confirmar Rechazo de Retiro',
        ]);
    }

    public function markProcessed(AdminContext $context): RedirectResponse
    {
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            $this->addFlash('danger', $this->translator->trans('withdrawal.messages.access_denied'));
            return $this->redirect($this->adminUrlGenerator->setController(self::class)->setAction(Crud::PAGE_INDEX)->generateUrl());
        }

        $request = $context->getRequest();
        $id = $request->query->get('entityId');
        $withdrawal = $id ? $this->em->getRepository(Withdrawal::class)->find($id) : null;

        if (!$withdrawal instanceof Withdrawal) {
            $this->addFlash('danger', $this->translator->trans('withdrawal.messages.invalid_entity'));
            return $this->redirect($this->adminUrlGenerator->setController(self::class)->setAction(Crud::PAGE_INDEX)->generateUrl());
        }

        if ($request->isMethod('POST')) {
            $token = $request->request->get('token');
            if (!$this->isCsrfTokenValid('withdrawal_action', $token)) {
                $this->addFlash('danger', 'Token CSRF inválido.');
                return $this->redirect($this->adminUrlGenerator->setController(self::class)->setAction('detail')->setEntityId($id)->generateUrl());
            }

            $note = $request->request->get('note');
            if ($note) {
                $withdrawal->setAdminNote($note);
            }
        } else {
            return $this->redirect($this->adminUrlGenerator->setController(self::class)->setAction('confirmApprove')->setEntityId($id)->generateUrl());
        }

        if ($withdrawal->getStatus() !== WithdrawalStatusEnum::PENDING) {
            $this->addFlash('warning', $this->translator->trans('withdrawal.messages.cannot_process_non_pending'));
            return $this->redirect($this->adminUrlGenerator->setController(self::class)->setAction(Crud::PAGE_INDEX)->generateUrl());
        }

        $withdrawal->setStatus(WithdrawalStatusEnum::APPROVED);

        try {
            $this->em->persist($withdrawal);
            $this->em->flush();

            $this->walletService->processWithdrawal($withdrawal);

            $this->addFlash('success', $this->translator->trans('withdrawal.messages.processed_success'));
            return $this->redirect($this->adminUrlGenerator->setController(self::class)->setAction(Crud::PAGE_DETAIL)->setEntityId($withdrawal->getId())->generateUrl());
        } catch (\Throwable $e) {
            $this->logger->error('Failed to mark withdrawal processed', [
                'withdrawalId' => $withdrawal->getId(),
                'error' => $e->getMessage(),
            ]);
            $this->addFlash('danger', $this->translator->trans('withdrawal.messages.processed_failed'));
            return $this->redirect($this->adminUrlGenerator->setController(self::class)->setAction(Crud::PAGE_INDEX)->generateUrl());
        }
    }

    public function markRejected(AdminContext $context): RedirectResponse
    {
        if (!$this->security->isGranted('ROLE_ADMIN')) {
            $this->addFlash('danger', $this->translator->trans('withdrawal.messages.access_denied'));
            return $this->redirect($this->adminUrlGenerator->setController(self::class)->setAction(Crud::PAGE_INDEX)->generateUrl());
        }

        $request = $context->getRequest();
        $id = $request->query->get('entityId');
        $withdrawal = $id ? $this->em->getRepository(Withdrawal::class)->find($id) : null;

        if (!$withdrawal instanceof Withdrawal) {
            $this->addFlash('danger', $this->translator->trans('withdrawal.messages.invalid_entity'));
            return $this->redirect($this->adminUrlGenerator->setController(self::class)->setAction(Crud::PAGE_INDEX)->generateUrl());
        }

        if ($request->isMethod('POST')) {
            $token = $request->request->get('token');
            if (!$this->isCsrfTokenValid('withdrawal_action', $token)) {
                $this->addFlash('danger', 'Token CSRF inválido.');
                return $this->redirect($this->adminUrlGenerator->setController(self::class)->setAction('detail')->setEntityId($id)->generateUrl());
            }

            $note = $request->request->get('note');
            if ($note) {
                $withdrawal->setAdminNote($note);
            }
        } else {
            return $this->redirect($this->adminUrlGenerator->setController(self::class)->setAction('confirmReject')->setEntityId($id)->generateUrl());
        }

        if ($withdrawal->getStatus() !== WithdrawalStatusEnum::PENDING) {
            $this->addFlash('warning', $this->translator->trans('withdrawal.messages.cannot_reject_non_pending'));
            return $this->redirect($this->adminUrlGenerator->setController(self::class)->setAction(Crud::PAGE_INDEX)->generateUrl());
        }

        $withdrawal->setStatus(WithdrawalStatusEnum::REJECTED);

        try {
            $this->em->persist($withdrawal);
            $this->em->flush();

            $this->walletService->rejectWithdrawal($withdrawal);

            $this->addFlash('danger', $this->translator->trans('withdrawal.messages.rejected_success'));
            return $this->redirect($this->adminUrlGenerator->setController(self::class)->setAction(Crud::PAGE_DETAIL)->setEntityId($withdrawal->getId())->generateUrl());
        } catch (\Throwable $e) {
            $this->logger->error('Failed to mark withdrawal rejected', [
                'withdrawalId' => $withdrawal->getId(),
                'error' => $e->getMessage(),
            ]);
            $this->addFlash('danger', $this->translator->trans('withdrawal.messages.rejected_failed'));
            return $this->redirect($this->adminUrlGenerator->setController(self::class)->setAction(Crud::PAGE_INDEX)->generateUrl());
        }
    }
}
