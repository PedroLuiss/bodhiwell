import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import styles from './ListPayment.module.scss';
import { TableUi } from '../ui/Table/TableUi';
import { ColumnDefinitionTableUi } from '../ui/Table/types';
import { SelectUi } from '../ui/SelectUi/SelectUi';
import { MenuItem} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Loading from '../ui/Loading/Loading';
import { Payment } from '../../types/Payment/Payment.type';
import { usePayments } from '../../hooks/usePayments';
import { useNotification } from '../../context/NotificationContext';
import { formatAmount } from '../../utils';
import { useAuthContext } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ButtonUi } from '../ui/ButtonUi/ButtonUi';
import { DateInputUi } from '../ui/DateInputUi/DateInputUi';
import FilterListIcon from '@mui/icons-material/FilterList';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import classNames from 'classnames';

export const ListPayment = () => {
  const { t } = useTranslation();
  const { payments, loading, error, fetchPayments, pagination } = usePayments();
  const { showNotification } = useNotification();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [dateFromFilter, setDateFromFilter] = useState<Dayjs | null>(null);
  const [dateToFilter, setDateToFilter] = useState<Dayjs | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const isProfessional = user?.type_account === 'professional';

  const getFilters = () => ({
    paymentStatus: statusFilter === 'all' ? '' : statusFilter,
    startDate: dateFromFilter ? dateFromFilter.toISOString() : null,
    endDate: dateToFilter ? dateToFilter.toISOString() : null,
  });

  const handleSearch = () => {
    if (!dateFromFilter && !dateToFilter && !statusFilter) {
      showNotification(t('appAdmin.ListPayment.filterError'), 'warning');
      return;
    }

    if ((dateFromFilter && !dateToFilter) || (!dateFromFilter && dateToFilter)) {
      showNotification(t('appAdmin.ListPayment.filterError1'), 'warning');
      return;
    }
    if (dateFromFilter && dateToFilter && dateToFilter.isBefore(dateFromFilter, 'day')) {
      showNotification(t('appAdmin.ListPayment.filterError2'), 'warning');
      return;
    }

    fetchPayments(getFilters());
  };

  const handleResetFilters = () => {
    setDateFromFilter(null);
    setDateToFilter(null);
    setStatusFilter('all');
    fetchPayments({ page: 1, paymentStatus: '', startDate: null, endDate: null });
  };

  const handlePageChange = (newPage: number) => {
    fetchPayments({ ...getFilters(), page: newPage });
  };

  const handleRowsPerPageChange = (newLimit: number) => {
    fetchPayments({ ...getFilters(), page: 1, limit: newLimit });
  };

  useEffect(() => {
    if (error) {
      showNotification(error, 'error');
    }
  }, [error, showNotification]);

  const columns: ColumnDefinitionTableUi<Payment>[] = [
    {
      header: t('appAdmin.ListPayment.columns.amount'),
      accessor: 'amount',
      sortable: true,
      render: (item) => <span className={styles['amount-cell']}>{formatAmount(item.amount, { decimals: 2 })}</span>,
    },
    {
      header: t('appAdmin.ListPayment.columns.date'),
      accessor: 'paymentDate',
      sortable: true,
      render: (item) => dayjs(item.paymentDate).format('DD/MM/YYYY hh:mm A'),
    },
    {
      header: t('appAdmin.ListPayment.columns.status'),
      accessor: 'status',
      sortable: true,
      render: (item) => {
        const statusKey = item.status.toLowerCase();
        return (
          <span className={classNames(styles['status-tag'], styles[`status-tag--${statusKey}`])}>
            {t(`appAdmin.ListPayment.statusOptions.${statusKey}`, item.status)}
          </span>
        );
      },
    },
    {
      header: t('appAdmin.ListPayment.columns.reservation'),
      accessor: 'actions',
      render: (item) => {
        const otherPartyName = user?.type_account === 'professional'
          ? item.reservationInfo.patientName
          : item.reservationInfo.professionalName;

        return (
          <div className={styles['reservation-info']}>
            <div className={styles['reservation-info__text']}>
              <p><strong>{dayjs(item.reservationInfo.reservationDate).format('DD/MM/YYYY')}</strong></p>
              <span>{otherPartyName}</span>
            </div>
            <Link to={`/professionals/booking-details/${item.reservationInfo.uid}`} className={styles['reservation-info__link']}>
              <VisibilityIcon sx={{ fontSize: 16 }} />
              {t('appAdmin.ListPayment.viewReservation')}
            </Link>
          </div>
        );
      },
    },
  ];
  
  const statusOptions = [
    { value: 'initiated', label: t('appAdmin.ListPayment.statusOptions.initiated') },
    { value: 'processing', label: t('appAdmin.ListPayment.statusOptions.processing') },
    { value: 'pending_provider', label: t('appAdmin.ListPayment.statusOptions.pending_provider') },
    { value: 'approved', label: t('appAdmin.ListPayment.statusOptions.approved') },
    { value: 'rejected', label: t('appAdmin.ListPayment.statusOptions.rejected') },
    { value: 'refunded', label: t('appAdmin.ListPayment.statusOptions.refunded') },

    // { value: 'pending', label: t('appAdmin.ListPayment.statusOptions.pending') },
    // { value: 'authorized', label: t('appAdmin.ListPayment.statusOptions.authorized') },
    // { value: 'captured', label: t('appAdmin.ListPayment.statusOptions.captured') },
    // { value: 'partially_captured', label: t('appAdmin.ListPayment.statusOptions.partially_captured') },
    // { value: 'partially_refunded', label: t('appAdmin.ListPayment.statusOptions.partially_refunded') },
    // { value: 'canceled', label: t('appAdmin.ListPayment.statusOptions.canceled') },
    // { value: 'failed', label: t('appAdmin.ListPayment.statusOptions.failed') },
  ];

  if (loading && payments.length === 0) {
    return <Loading fullscreen text={t('appAdmin.ListPayment.loading')} />;
  }

    return (
    <div className={styles['list-payment']}>
      
      {isProfessional && (
        <section className={styles['wallet-card']}>
          <div className={styles['wallet-card__body']}>
            <div className={styles['wallet-card__icon']}>
              <AccountBalanceWalletIcon sx={{ fontSize: 24 }} />
            </div>
            <div className={styles['wallet-card__text']}>
              <h4>{t('appAdmin.ListPayment.walletTitle')}</h4>
              <p>{t('appAdmin.ListPayment.walletSubtitle')}</p>
            </div>
          </div>
          <ButtonUi variant="contained" onClick={() => navigate('/wallet')}>
            {t('appAdmin.ListPayment.goToWallet')}
          </ButtonUi>
        </section>
      )}

      <section className={styles['filters']}>

        <div className={styles['filters__grid']}>
          <div className={styles['filters__item']}>
            <DateInputUi
              label={t('appAdmin.ListPayment.filterDateFrom')}
              value={dateFromFilter}
              onChange={setDateFromFilter}
            />
          </div>
          <div className={styles['filters__item']}>
            <DateInputUi
              label={t('appAdmin.ListPayment.filterDateTo')}
              value={dateToFilter}
              onChange={setDateToFilter}
            />
          </div>
          <div className={styles['filters__item']}>
            <SelectUi
              label={t('appAdmin.ListPayment.filterStatus')}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as string)}
              displayEmpty
            >
              <MenuItem value="all"><em>{t('appAdmin.ListPayment.filterStatusAll')}</em></MenuItem>
              {statusOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </SelectUi>
          </div>
          <div className={styles['filters__actions']}>
            <ButtonUi 
                variant="contained" 
                onClick={handleSearch} 
                disabled={loading}
                startIcon={<FilterListIcon />}
            >
              {t('appAdmin.ListPayment.filterButton')}
            </ButtonUi>
            <ButtonUi 
                variant="text" 
                onClick={handleResetFilters}
                startIcon={<RestartAltIcon />}
            >
              {t('appAdmin.ListPayment.resetButton')}
            </ButtonUi>
          </div>
        </div>
      </section>

      <div className={styles['table-card']}>
        <TableUi
          columns={columns}
          data={payments}
          textempty={t('appAdmin.ListPayment.textEmpty')}
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            rowsPerPage: pagination.limit,
            onPageChange: handlePageChange,
            onRowsPerPageChange: handleRowsPerPageChange,
          }}
        />
      </div>
    </div>
  );
};