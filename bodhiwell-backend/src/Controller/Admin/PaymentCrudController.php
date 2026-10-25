<?php

namespace App\Controller\Admin;

use App\Entity\Payment;
use App\Enum\PaymentStatusEnum;
use Doctrine\ORM\EntityManagerInterface;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Filters;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\MoneyField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use App\Admin\Filter\PaymentDateFilter;
use App\Admin\Filter\PaymentMoneyFilter;
use App\Admin\Filter\FullNameFilter;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Contracts\Translation\TranslatorInterface;
use EasyCorp\Bundle\EasyAdminBundle\Dto\SearchDto;
use EasyCorp\Bundle\EasyAdminBundle\Dto\EntityDto;
use EasyCorp\Bundle\EasyAdminBundle\Collection\FieldCollection;
use EasyCorp\Bundle\EasyAdminBundle\Collection\FilterCollection;
use Doctrine\ORM\QueryBuilder;
use App\Repository\UserRepository;
use EasyCorp\Bundle\EasyAdminBundle\Context\AdminContext;
use Symfony\Component\HttpFoundation\StreamedResponse;
use EasyCorp\Bundle\EasyAdminBundle\Factory\FilterFactory;
use EasyCorp\Bundle\EasyAdminBundle\Factory\EntityFactory;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;

use Symfony\Component\HttpFoundation\RequestStack;

use App\Utils\DeviceDetectionService;

#[IsGranted('ROLE_ADMIN')]
class PaymentCrudController extends AbstractCrudController
{
    public function __construct(
        private TranslatorInterface $translator,
        private EntityFactory $entityFactory,
        private AdminUrlGenerator $adminUrlGenerator,
        private RequestStack $requestStack,
        private DeviceDetectionService $deviceDetectionService
    ) {}

    public static function getEntityFqcn(): string
    {
        return Payment::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular($this->translator->trans('payment.label_singular'))
            ->setEntityLabelInPlural($this->translator->trans('payment.label_plural'))
            ->setDefaultSort(['createdAt' => 'DESC'])
            ->setSearchFields(['uid', 'booking.patientUser.email', 'booking.patientUser.firstName', 'booking.patientUser.lastName', 'plexoPaymentId'])
            ->setPaginatorPageSize($this->deviceDetectionService->getPaginatorPageSize());
    }

    public function configureFilters(Filters $filters): Filters
    {
        return $filters
            ->add(PaymentDateFilter::new('createdAt', 'Fecha'))
            ->add(FullNameFilter::new('patientUser', 'Usuario'))
            ->add(PaymentMoneyFilter::new('amount', 'Monto'));
    }

    public function configureActions(Actions $actions): Actions
    {
        $exportAction = Action::new('export', 'Exportar CSV')
            ->linkToCrudAction('export')
            ->createAsGlobalAction()
            ->setCssClass('btn btn-success')
            ->setIcon('fa fa-download');

        return $actions
            ->add(Crud::PAGE_INDEX, Action::DETAIL)
            ->add(Crud::PAGE_INDEX, $exportAction)
            ->disable(Action::NEW, Action::EDIT, Action::DELETE, Action::BATCH_DELETE);
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
        $payments = $qb->getQuery()->getResult();

        $response = new StreamedResponse(function () use ($payments) {
            $handle = fopen('php://output', 'w+');

            fputs($handle, "\xEF\xBB\xBF");

            fputcsv($handle, ['Id', 'Fecha', 'Usuario', 'Monto', 'Moneda', 'Método', 'Estado', 'Plexo ID'], ';');

            foreach ($payments as $payment) {
                /** @var Payment $payment */
                $user = $payment->getBooking()?->getPatientUser();
                $userName = $user ? sprintf('%s %s', $user->getFirstName(), $user->getLastName()) : 'N/A';

                fputcsv($handle, [
                    $payment->getUid(),
                    $payment->getCreatedAt()->format('Y-m-d H:i:s'),
                    $userName,
                    number_format($payment->getAmount() / 100, 2, ',', ''),
                    $payment->getCurrency(),
                    $payment->getPaymentMethod(),
                    $payment->getStatus()->value,
                    $payment->getPlexoPaymentId()
                ], ';');
            }

            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
        $response->headers->set('Content-Disposition', 'attachment; filename="pagos.csv"');

        return $response;
    }

    public function configureFields(string $pageName): iterable
    {
        yield TextField::new('booking.patientUser', 'Usuario')
            ->formatValue(function ($value, $entity) {
                $user = $entity->getBooking()?->getPatientUser();
                if (!$user) return 'N/A';

                $name = sprintf('%s %s', $user->getFirstName(), $user->getLastName());

                $url = $this->adminUrlGenerator
                    ->setController(\App\Controller\Admin\UserPatientCrudController::class)
                    ->setAction(Action::DETAIL)
                    ->setEntityId($user->getId())
                    ->generateUrl();

                return sprintf('<a href="%s">%s</a>', $url, $name);
            })
            ->setTemplatePath('admin/field/raw.html.twig')
            ->onlyOnIndex();

        yield DateTimeField::new('createdAt', 'Fecha')
            ->setFormat('yyyy-MM-dd HH:mm')
            ->onlyOnIndex();

        yield MoneyField::new('amount', 'Monto')
            ->setCurrencyPropertyPath('currency')
            ->setStoredAsCents(false)
            ->setTextAlign('left')
            ->onlyOnIndex();

        yield TextField::new('paymentMethod', 'Método de Pago')
            ->formatValue(fn($value) => $value ? strtoupper(str_replace('_', ' ', $value)) : 'N/A')
            ->onlyOnIndex();

        yield ChoiceField::new('status', 'Estado')
            ->setChoices(array_combine(
                array_map(fn($s) => $s->value, PaymentStatusEnum::cases()),
                PaymentStatusEnum::cases()
            ))
            ->formatValue([$this, 'formatStatus'])
            ->setTemplatePath('admin/field/raw.html.twig')
            ->onlyOnIndex();

        if ($pageName === Crud::PAGE_DETAIL) {
            yield TextField::new('uid', 'ID Interno');
            yield DateTimeField::new('createdAt', 'Fecha Creación');
            yield MoneyField::new('amount', 'Monto')->setCurrencyPropertyPath('currency')->setStoredAsCents(false);
            yield ChoiceField::new('status', 'Estado')
                ->formatValue([$this, 'formatStatus'])
                ->setTemplatePath('admin/field/raw.html.twig');
            yield TextField::new('plexoPaymentId', 'Plexo ID');
            yield TextField::new('plexoTransactionId', 'Transaction ID');
            yield AssociationField::new('booking', 'Reserva');
            yield AssociationField::new('transactions', 'Transacciones')
                ->setTemplatePath('admin/fields/transactions.html.twig');
        }
    }

    public function formatStatus($value, $entity): string
    {
        if ($value instanceof PaymentStatusEnum) {
            $val = $value->value;
        } else {
            $val = $value;
        }

        $label = strtoupper($this->translator->trans('payment.status.' . strtolower($val)));

        $colorMap = [
            PaymentStatusEnum::INITIATED->value => 'warning',
            PaymentStatusEnum::PROCESSING->value => 'info',
            PaymentStatusEnum::PENDING_PROVIDER->value => 'warning',
            PaymentStatusEnum::APPROVED->value => 'success',
            PaymentStatusEnum::REJECTED->value => 'danger',
            PaymentStatusEnum::REFUNDED->value => 'secondary',
            PaymentStatusEnum::PENDING->value => 'warning',
            PaymentStatusEnum::AUTHORIZED->value => 'info',
            PaymentStatusEnum::CAPTURED->value => 'success',
            PaymentStatusEnum::PARTIALLY_CAPTURED->value => 'success',
            PaymentStatusEnum::PARTIALLY_REFUNDED->value => 'secondary',
        ];
        $color = $colorMap[$val] ?? 'secondary';

        return sprintf('<span class="badge badge-%s">%s</span>', $color, $label);
    }

    public function createIndexQueryBuilder(
        SearchDto $searchDto,
        EntityDto $entityDto,
        FieldCollection $fields,
        FilterCollection $filters
    ): QueryBuilder {
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

        $aliases = $qb->getAllAliases();
        $rootAlias = $qb->getRootAliases()[0];

        if (!in_array('booking', $aliases, true)) {
            $qb->leftJoin($rootAlias . '.booking', 'booking');
        }

        if (!in_array('patientUser', $aliases, true)) {
            $qb->leftJoin('booking.patientUser', 'patientUser');
        }

        $term = trim((string)$searchDto->getQuery());
        if ($term !== '') {
            $lower = mb_strtolower($term);

            $statusMatches = [];
            $statusKeywords = [
                'INITIATED'          => ['initiated', 'iniciado', 'iniciada'],
                'PROCESSING'         => ['processing', 'procesando'],
                'PENDING_PROVIDER'   => ['pending provider', 'pendiente proveedor', 'proveedor'],
                'APPROVED'           => ['approved', 'aprobado', 'aprobada'],
                'REJECTED'           => ['rejected', 'rechazado', 'rechazada'],
                'REFUNDED'           => ['refunded', 'reembolsado', 'reembolsada'],
                'AUTHORIZED'         => ['authorized', 'autorizado', 'autorizada'],
                'PARTIALLY_REFUNDED' => ['partially refunded', 'parcialmente reembolsado', 'parcialmente reembolsada'],
                'PARTIALLY_CAPTURED' => ['partially captured', 'parcialmente capturado', 'parcialmente capturada'],
                'CAPTURED'           => ['captured', 'capturado', 'capturada'],
                'PENDING'            => ['pending', 'pendiente'],
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
                'LOWER(' . $rootAlias . '.uid) LIKE :term',
                'LOWER(' . $rootAlias . '.plexoPaymentId) LIKE :term',
                'LOWER(' . $rootAlias . '.plexoTransactionId) LIKE :term',
                'LOWER(patientUser.first_name) LIKE :term',
                'LOWER(patientUser.last_name) LIKE :term',
                'LOWER(CONCAT(patientUser.first_name, \' \', patientUser.last_name)) LIKE :term',
            ];

            $cleanAmount = preg_replace('/[^\d,]/', '', $lower);
            $cleanAmount = str_replace(',', '.', $cleanAmount);
            if (is_numeric($cleanAmount)) {
                $cents = (int)round((float)$cleanAmount * 100);
                $orConditions[] = $rootAlias . '.amount = :amount_cents';
                $qb->setParameter('amount_cents', $cents);
            }

            $months = ['ene' => 1, 'feb' => 2, 'mar' => 3, 'abr' => 4, 'may' => 5, 'jun' => 6, 'jul' => 7, 'ago' => 8, 'sep' => 9, 'oct' => 10, 'nov' => 11, 'dic' => 12];
            $searchDay = null;
            $searchMonth = null;
            $searchYear = null;

            foreach ($months as $k => $v) {
                if (str_contains($lower, $k)) {
                    $searchMonth = $v;
                    if (preg_match('/(\d{1,2})\s*' . $k . '/', $lower, $matches)) {
                        $searchDay = (int)$matches[1];
                    } elseif (preg_match('/' . $k . '\s*(\d{1,2})/', $lower, $matches)) {
                        $searchDay = (int)$matches[1];
                    }
                    break;
                }
            }
            if (preg_match('/(20\d{2})/', $lower, $matches)) {
                $searchYear = (int)$matches[1];
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

                $orConditions[] = $rootAlias . '.createdAt LIKE :date_like';
                $qb->setParameter('date_like', $dateLike);
            } else {
                $orConditions[] = $rootAlias . '.createdAt LIKE :term';
            }

            if (!empty($statusMatches)) {
                $orConditions[] = $rootAlias . '.status IN (:status_matches)';
                $qb->setParameter('status_matches', array_unique($statusMatches));
            }

            $qb->andWhere('(' . implode(' OR ', $orConditions) . ')')
                ->setParameter('term', '%' . $lower . '%');
        }

        return $qb;
    }
}
