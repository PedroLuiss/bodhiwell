import React, { useImperativeHandle, forwardRef } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import 'dayjs/locale/en';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { isPastDate, isPastTimeBlock } from '../../../utils';
import { ExtendedAvailabilityTableProps } from './types';
import { useAvailabiilityTable } from './hooks/useAvailabilityTable';
import styles from './AvailabilityTable.module.scss';
import AvailabilityDayCard from './AvailabilityDayCard/AvailabilityDayCard';
import AvailabilityChip from './AvailabilityChip/AvailabilityChip';


const AvailabilityTable = React.memo(forwardRef<{ handleSave: () => Promise<boolean>, loading: boolean }, ExtendedAvailabilityTableProps>((props, ref) => {
  const {
    notAvailable,
    blocksByDate,
    reservationsByDate,
    activeDate,
  } = props;

  const {
    t,
    i18n,
    tempBlocks,
    setTempBlocks,
    errorsByDate,
    loading,
    futureSelectedDates,
    clearErrorForDate,
    removeDate,
    handleAddBlockToDay,
    handleRemoveBlockFromDay,
    handleSave,
    handleBadgeClick,
    handleCardClick,
    handleClearAll
  } = useAvailabiilityTable(props);

  useImperativeHandle(ref, () => ({
    handleSave,
    loading
  }));

  return (
    <aside className={styles['selection-panel']}>
      <div className={styles['panel-head']}>
        <div className={styles['panel-title']}>
          <span className={styles['icon']}>
            <svg viewBox="0 0 24 24"><rect x="4" y="5.5" width="16" height="14" rx="2"></rect><path d="M8 3.5v4"></path><path d="M16 3.5v4"></path><path d="M4 9.5h16"></path></svg>
          </span>
          <h2>{t('appAdmin.AvailabilityTable.selectedDaysTitle')}</h2>
        </div>
        {futureSelectedDates.length > 0 && (
          <button className={styles['panel-link']} onClick={handleClearAll}>
            {t('appAdmin.AvailabilityTable.clearButton')}
          </button>
        )}
      </div>

      <div className={styles['chips']}>
        {futureSelectedDates.length === 0 && (
          <span style={{ fontSize: '13px', color: '#65716B' }}>
            {t('appAdmin.AvailabilityTable.selectDaysMessage')}
          </span>
        )}
        {futureSelectedDates.map(date => (
          <AvailabilityChip
            key={date}
            date={date}
            isActive={activeDate === date}
            isDateInPast={isPastDate(date)}
            language={i18n.language}
            onClick={handleBadgeClick}
            onRemove={removeDate}
          />
        ))}
      </div>

      <div className={styles['days-scroll']}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {futureSelectedDates.map(date => {
            const blocksForDate = blocksByDate[date] || [];
            const isCardFullyLocked = isPastDate(date) || (
              dayjs(date).isSame(dayjs(), 'day') &&
              blocksForDate.length > 0 &&
              blocksForDate.every(block => isPastTimeBlock(date, block))
            );

            return (
              <AvailabilityDayCard
                key={date}
                date={date}
                isActive={activeDate === date}
                isCardFullyLocked={isCardFullyLocked}
                dateError={errorsByDate[date]}
                notAvailable={notAvailable[date]}
                blocksForDate={blocksForDate}
                dayReservations={reservationsByDate?.[date] || []}
                tempBlock={tempBlocks[date]}
                language={i18n.language}
                t={t}
                onClick={handleCardClick}
                onClearError={clearErrorForDate}
                onSetTempBlock={(d, b) => setTempBlocks(prev => ({ ...prev, [d]: b }))}
                onAddBlock={handleAddBlockToDay}
                onRemoveBlock={handleRemoveBlockFromDay}
              />
            );
          })}
        </LocalizationProvider>
      </div>
    </aside>
  );
}));

export default AvailabilityTable;