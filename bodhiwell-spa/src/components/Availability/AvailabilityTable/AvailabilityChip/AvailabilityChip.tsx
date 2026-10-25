import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import styles from '../AvailabilityTable.module.scss';

interface AvailabilityChipProps {
  date: string;
  isActive: boolean;
  isDateInPast: boolean;
  language: string;
  onClick: (date: string) => void;
  onRemove: (date: string) => void;
}

const AvailabilityChip = React.memo(({ 
  date, 
  isActive, 
  isDateInPast, 
  language, 
  onClick, 
  onRemove 
}: AvailabilityChipProps) => {
  const formattedDate = useMemo(() => {
    return dayjs(date).locale(language.startsWith('en') ? 'en' : 'es').format('ddd DD MMM');
  }, [date, language]);

  return (
    <span 
      className={`${styles['chip']} ${isActive ? styles['active'] : ''} ${isDateInPast ? styles['locked'] : ''}`}
      onClick={() => onClick(date)}
    >
      {formattedDate}
      <span 
        className={styles['close']} 
        onClick={(e) => { 
          e.stopPropagation(); 
          if (!isDateInPast) onRemove(date); 
        }}
      >
        ×
      </span>
    </span>
  );
});

export default AvailabilityChip;
