import { useState, useEffect } from 'react';
import { Transaction, WalletQueryParams } from '../../../types/Wallet/wallet.type';
import { useTranslation } from 'react-i18next';
import { TableUi } from '../../ui/Table/TableUi';
import { ColumnDefinitionTableUi } from '../../ui/Table/types';
import styles from './WalletMovements.module.scss';
import { formatAmount } from '../../../utils/formattersAmount.utils';
import dayjs, { Dayjs } from 'dayjs';
import { AdvancedFilters } from '../../ui/AdvancedFilters/AdvancedFilters';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

interface WalletMovementsProps {
  transactions: Transaction[];
  onFilterChange: (filters: WalletQueryParams) => void;
}

export const WalletMovements = ({ transactions, onFilterChange }: WalletMovementsProps) => {
  const { t, i18n } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [period, setPeriod] = useState('all');

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    const today = dayjs();
    switch (newPeriod) {
      case 'week':
        setStartDate(today.subtract(1, 'week'));
        setEndDate(today);
        break;
      case 'month':
        setStartDate(today.subtract(1, 'month'));
        setEndDate(today);
        break;
      case '3months':
        setStartDate(today.subtract(3, 'month'));
        setEndDate(today);
        break;
      case 'year':
        setStartDate(today.subtract(1, 'year'));
        setEndDate(today);
        break;
      case 'all':
      default:
        setStartDate(null);
        setEndDate(null);
        break;
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filters: WalletQueryParams = {
        page: 1,
        limit: 10,
        q: searchTerm || undefined,
        from: startDate ? startDate.format('YYYY-MM-DD') : undefined,
        to: endDate ? endDate.format('YYYY-MM-DD') : undefined,
      };
      
      onFilterChange(filters);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, startDate, endDate, period, onFilterChange]); 

    const columns: ColumnDefinitionTableUi<Transaction>[] = [
      {
        header: t("appAdmin.walletMovements.type"),
        accessor: 'type',
        render: (item) => (
          <span className={classNames(styles['status-tag'], {
            [styles['status-tag--in']]: item.type === 'entrada',
            [styles['status-tag--out']]: item.type === 'salida'
          })}>
            {item.type === 'entrada' ? t("appAdmin.walletMovements.typeIn") : t("appAdmin.walletMovements.typeOut")}
          </span>
        ),
      },
      { 
        header: t("appAdmin.walletMovements.reference"), 
        accessor: 'reference', 
        render: (item) => <span className={styles['text-reference']}>{i18n.language === 'en' ? item.conceptEn : item.reference}</span>
      },
      {
        header: t("appAdmin.walletMovements.description"),
        accessor: 'description',
        render: (item) => {
            const descriptionText = (i18n.language === 'en' ? item.descriptionEn : item.description) || '';
            const TRUNCATE_LENGTH = 50;
            const truncatedDescription = descriptionText.length > TRUNCATE_LENGTH
                ? `${descriptionText.substring(0, TRUNCATE_LENGTH)}...`
                : descriptionText;

            return (
            <div className={styles['description-cell']}>
              <p className={styles['description-cell__text']} title={descriptionText}>
                {truncatedDescription}
              </p>
              {item.bookingUid && (
                <Link
                  to={`/professionals/booking-details/${item.bookingUid}`}
                  className={styles['description-cell__link']}
                >
                  {t("appAdmin.walletMovements.viewsReservation")} ↗
                </Link>
              )}
            </div>
          );
        }
      },
      { 
        header: t("appAdmin.walletMovements.date"), 
        accessor: 'date', 
        render: (item) => <span className={styles['text-date']}>{dayjs(item.date).format('DD/MM/YYYY hh:mm A')}</span> 
      },
      { 
        header: t("appAdmin.walletMovements.amount"), 
        accessor: 'amount', 
        render: (item) => (
          <span className={classNames(styles['amount'], {
            [styles['amount--positive']]: item.type === 'entrada',
            [styles['amount--negative']]: item.type === 'salida'
          })}>
            {item.type === 'entrada' ? '+ ' : '- '} 
            {formatAmount(item.amount, { decimals: 2, currency: item.currency || 'UYU' })}
          </span>
        )
      },
  ];

  return (
    <div className={styles['movements']}>
      <header className={styles['movements__header']}>
         <h2 className={styles['movements__title']}>{t("appAdmin.walletMovements.title")}</h2>
      </header>

      <AdvancedFilters 
          searchTerm={searchTerm} onSearchChange={setSearchTerm}
          startDate={startDate} onStartDateChange={(date) => { setStartDate(date); setPeriod('custom'); }}
          endDate={endDate} onEndDateChange={(date) => { setEndDate(date); setPeriod('custom'); }}
          period={period} onPeriodChange={handlePeriodChange}
      />

      <div className={styles['movements__table-card']}>
        <TableUi columns={columns} data={transactions} textempty={t("appAdmin.walletMovements.textempty")} />
      </div>
    </div>
  );
};