import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; 
import { TimePickerUi } from '../../../ui/TimePickerUi/TimePickerUi';
import { capitalizeFirstLetter } from '../../AvailabilityCalendar/utils/AvailabilityCalendar.utils';
import { isPastTimeBlock } from '../../../../utils';
import styles from '../AvailabilityTable.module.scss';

interface AvailabilityDayCardProps {
  date: string;
  isActive: boolean;
  isCardFullyLocked: boolean;
  dateError: string | null | undefined;
  notAvailable: boolean;
  blocksForDate: { from: string, to: string }[];
  dayReservations: any[];
  tempBlock: { from: string, to: string } | undefined;
  language: string;
  t: any;
  onClick: (date: string) => void;
  onClearError: (date: string) => void;
  onSetTempBlock: (date: string, block: { from: string, to: string }) => void;
  onAddBlock: (date: string) => void;
  onRemoveBlock: (date: string, idx: number) => void;
}

const AvailabilityDayCard = React.memo(({
  date,
  isActive,
  isCardFullyLocked,
  dateError,
  notAvailable,
  blocksForDate,
  dayReservations,
  tempBlock,
  language,
  t,
  onClick,
  onClearError,
  onSetTempBlock,
  onAddBlock,
  onRemoveBlock
}: AvailabilityDayCardProps) => {
  const { dayName, fullDate } = useMemo(() => ({
    dayName: capitalizeFirstLetter(dayjs(date).locale(language.startsWith('en') ? 'en' : 'es').format('dddd')),
    fullDate: dayjs(date).format('D/M/YYYY')
  }), [date, language]);

  return (
    <div 
      id={`day-card-${date}`}
      onClick={() => onClick(date)}
      className={`${styles['day-card']} ${isActive ? styles['active'] : ''} ${isCardFullyLocked ? styles['locked'] : ''} ${dateError ? styles['error'] : ''}`}
    >
      <div className={styles['day-card-top']}>
        <div className={styles['day-meta']}>
          <h2>{dayName}</h2>
          <p>{fullDate}</p>
        </div>

        {!notAvailable && (
          <>
            <div className={styles['time-col']}>
              <div className={styles['time-col-label']}>{t('appAdmin.AvailabilityTable.fromLabel')}</div>
              <TimePickerUi
                label=""
                className={styles['time-field']}
                value={dayjs(`2000-01-01T${tempBlock?.from || '09:00'}`)}
                onChange={(newValue) => {
                  onClearError(date);
                  onSetTempBlock(date, { 
                    from: newValue.format('HH:mm'), 
                    to: tempBlock?.to || '17:00' 
                  });
                }}
                disabled={isCardFullyLocked}
              />
            </div>

            <div className={styles['time-col']}>
              <div className={styles['time-col-label']}>{t('appAdmin.AvailabilityTable.toLabel')}</div>
              <TimePickerUi
                label=""
                className={styles['time-field']}
                value={dayjs(`2000-01-01T${tempBlock?.to || '17:00'}`)}
                onChange={(newValue) => {
                  onClearError(date);
                  onSetTempBlock(date, { 
                    from: tempBlock?.from || '09:00', 
                    to: newValue.format('HH:mm') 
                  });
                }}
                disabled={isCardFullyLocked}
              />
            </div>
          </>
        )}
      </div>

      <div className={styles['day-card-body']}>
        {dateError && (
          <div className={styles['error-message']}>
            <ErrorOutlineIcon sx={{ fontSize: '14px' }} />
            <span>{dateError}</span>
          </div>
        )}

        {!notAvailable && (
          <button 
            className={`${styles['btn']} ${styles['btn-secondary']} ${styles['btn-block']}`}
            onClick={() => onAddBlock(date)}
            disabled={isCardFullyLocked}
          >
            {t('appAdmin.AvailabilityTable.addAvailability')}
          </button>
        )}

        {notAvailable ? (
          <div className={styles['schedule-item']} style={{ background: 'rgba(217, 122, 76, 0.06)', color: '#d97a4c', border: '1px solid rgba(217, 122, 76, 0.1)' }}>
            <span className={styles['schedule-item-main']}>
              <ErrorOutlineIcon sx={{ fontSize: '16px' }} />
              {t('appAdmin.AvailabilityTable.notAvailableMessage')}
            </span>
          </div>
        ) : (
          <div className={styles['schedule-group']}>
            <div className={styles['schedule-group-head']}>
              <span className={styles['schedule-group-title']}>{t('appAdmin.AvailabilityTable.addedSchedules', 'Horarios agregados')}</span>
              <span className={styles['schedule-count']}>{blocksForDate.length}</span>
            </div>
            
            <div className={styles['schedule-list']}>
              {blocksForDate.length === 0 ? (
                <div className={`${styles['schedule-item']} ${styles['schedule-empty']}`}>
                  <span className={styles['schedule-item-main']}>
                    <span className={styles['schedule-item-icon']}>
                      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"></circle><path d="M12 7v5l3 2"></path></svg>
                    </span>
                    <span>{t('appAdmin.AvailabilityTable.noSchedulesMessage', 'Todavía no agregaste horarios.')}</span>
                  </span>
                </div>
              ) : (
                blocksForDate.map((b, idx) => {
                  const isThisBlockInPast = isPastTimeBlock(date, b);
                  const from12 = dayjs(`2000-01-01T${b.from}`).format('hh:mm A');
                  const to12 = dayjs(`2000-01-01T${b.to}`).format('hh:mm A');
                  return (
                    <div key={idx} className={styles['schedule-item']}>
                      <span className={styles['schedule-item-main']}>
                        <span className={styles['schedule-item-icon']}>
                          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"></circle><path d="M12 7v5l3 2"></path></svg>
                        </span>
                        <strong>{from12} - {to12}</strong>
                      </span>
                      <span 
                        className={styles['remove']}
                        onClick={(e) => { e.stopPropagation(); onRemoveBlock(date, idx); }}
                        style={{ display: (isThisBlockInPast || isCardFullyLocked) ? 'none' : 'block' }}
                      >
                        ×
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            {blocksForDate.length > 0 && (
              <div className={styles['schedule-note']}>
                {t('appAdmin.AvailabilityTable.moreSchedulesNote', 'Podés agregar más franjas horarias para este día.')}
              </div>
            )}
          </div>
        )}

        {dayReservations.length > 0 && (
          <div className={styles['schedule-group']} style={{ marginTop: '4px' }}>
            <div className={styles['schedule-group-head']}>
              <span className={styles['schedule-group-title']} style={{ color: '#82B194' }}>{t('appAdmin.AvailabilityTable.titleCarReservation', 'Citas agendadas')}</span>
              <span className={styles['schedule-count']} style={{ background: 'rgba(130, 177, 148, 0.08)', color: '#648875' }}>{dayReservations.length}</span>
            </div>
            <div className={styles['schedule-list']}>
              {dayReservations.map((res) => (
                <div key={res.uid} className={styles['schedule-item']} style={{ background: 'rgba(130, 177, 148, 0.04)', borderColor: 'rgba(130, 177, 148, 0.08)' }}>
                  <span className={styles['schedule-item-main']}>
                    <AccessTimeIcon sx={{ fontSize: '16px', color: '#65716B' }} />
                    <span style={{ fontWeight: 600 }}>{dayjs(`2000-01-01T${res.reservationTime.start}`).format('hh:mm A')}</span>
                    <span style={{ color: '#65716B', margin: '0 4px' }}>•</span>
                    <PersonIcon sx={{ fontSize: '16px', color: '#65716B' }} />
                    <span style={{ color: '#65716B' }}>{res.patientName}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default AvailabilityDayCard;
