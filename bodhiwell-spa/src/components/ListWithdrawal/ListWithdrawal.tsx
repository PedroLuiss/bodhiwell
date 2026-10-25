import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import styles from './ListWithdrawal.module.scss';
import { TableUi } from '../ui/Table/TableUi';
import { ColumnDefinitionTableUi } from '../ui/Table/types';
import Loading from '../ui/Loading/Loading';
import { Withdrawal } from '../../types/Withdrawal/withdrawal.type';
import { useWithdrawals } from '../../hooks/useWithdrawals';
import { useNotification } from '../../context/NotificationContext';
import { formatAmount } from '../../utils';
import PendingIcon from '@mui/icons-material/Pending';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import { AdvancedFilters } from '../ui/AdvancedFilters/AdvancedFilters';
import { useDataFilter } from '../../hooks/useDataFilter';

export const ListWithdrawal = () => {
  const { t } = useTranslation();
  const { withdrawals, loading, error } = useWithdrawals();
  const { showNotification } = useNotification();

  const {
      searchTerm, setSearchTerm,
      startDate, setStartDate,
      endDate, setEndDate,
      period, handlePeriodChange,
      filteredData
  } = useDataFilter<Withdrawal>({
      data: withdrawals,
      searchKeys: ['status'], 
      dateKey: 'cutOffDate'
  });

  useEffect(() => {
    if (error) {
      showNotification(error, 'error');
    }
  }, [error, showNotification]);

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': t('appAdmin.ListWithdrawal.status.pending'),
      'processed': t('appAdmin.ListWithdrawal.status.processed'),
      'rejected': t('appAdmin.ListWithdrawal.status.rejected')
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status: string): React.ReactNode | null => {
    const statusMap: Record<string, React.ReactNode> = {
      'pending': <PendingIcon />,
      'processed': <CheckIcon />,
      'rejected': <CloseIcon />
    };
    return statusMap[status] || null;
  };

  const columns: ColumnDefinitionTableUi<Withdrawal>[] = [
    {
      header: t('appAdmin.ListWithdrawal.amount'),
      accessor: 'amount',
      sortable: true,
      render: (item) => formatAmount(item.amount, { decimals: 2 }),
    },
    {
      header: t('appAdmin.ListWithdrawal.cutOffDate'),
      accessor: 'cutOffDate',
      sortable: true,
      render: (item) => dayjs(item.cutOffDate).format('DD/MM/YYYY'),
    },
    {
      header: t('appAdmin.ListWithdrawal.statusText'),
      accessor: 'status',
      sortable: true,
      render: (item) => (
        <span className={`${styles.status} ${styles[`status--${item.status}`]}`}>
          {getStatusIcon(item.status)}
          {getStatusLabel(item.status)}
        </span>
      ),
    },
  ];

  if (loading) {
    return <Loading fullscreen text={t('appAdmin.ListWithdrawal.loading')} />;
  }

  return (
      <div>
        <AdvancedFilters 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
            period={period}
            onPeriodChange={handlePeriodChange}
        />

        <TableUi 
          columns={columns} 
          data={filteredData} 
          textempty={t('appAdmin.ListWithdrawal.textempty')} 
        />
      </div>
  );
};