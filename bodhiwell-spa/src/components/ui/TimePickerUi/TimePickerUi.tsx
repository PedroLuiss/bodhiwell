import React, { useState, useLayoutEffect, useRef } from 'react';
import { Popover, InputAdornment, IconButton, Button } from '@mui/material';
import { CustomTextField } from '../TextFieldUi/TextFieldUi.styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Dayjs } from 'dayjs';
import styles from './TimePickerUi.module.scss';
import { useTranslation } from 'react-i18next';

interface TimePickerUiProps {
  label: string;
  value: Dayjs;
  onChange: (newValue: Dayjs) => void;
  disabled?: boolean;
  ampm?: boolean;
  className?: string;
}

const ScrollColumn = ({ 
  items, 
  selectedValue, 
  onSelect, 
  loopCount = 40 
}: { 
  items: string[], 
  selectedValue: string, 
  onSelect: (val: string) => void,
  loopCount?: number 
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const infiniteItems = Array.from({ length: loopCount }, () => items).flat();
  
  const middleSetIndex = Math.floor(loopCount / 2);
  const selectedIndexInOriginal = items.indexOf(selectedValue);
  const initialScrollIndex = (middleSetIndex * items.length) + (selectedIndexInOriginal !== -1 ? selectedIndexInOriginal : 0);

  useLayoutEffect(() => {
    if (listRef.current && itemRefs.current[initialScrollIndex]) {
      const item = itemRefs.current[initialScrollIndex];
      if (item) {
        const list = listRef.current;
        list.style.scrollBehavior = 'auto'; 
        
        const itemTop = item.offsetTop;
        const itemHeight = item.clientHeight;
        const listHeight = list.clientHeight;
        
        list.scrollTop = itemTop - (listHeight / 2) + (itemHeight / 2);
      }
    }
  }, [initialScrollIndex, items.length]);

 const handleItemClick = (val: string, index: number) => {
    onSelect(val);
    if (listRef.current && itemRefs.current[index]) {
        listRef.current.style.scrollBehavior = 'smooth';
        
        const item = itemRefs.current[index];
        if (item) {
            const list = listRef.current;
            const itemTop = item.offsetTop;
            const itemHeight = item.clientHeight;
            const listHeight = list.clientHeight;
            
            list.scrollTop = itemTop - (listHeight / 2) + (itemHeight / 2);
        }
    }
  };

  return (
    <div className={styles['scroll-column']} ref={listRef}>
      {infiniteItems.map((item, index) => {
        const isSelected = item === selectedValue;
        return (
          <div
            key={`${item}-${index}`}
            ref={(el) => { itemRefs.current[index] = el; }}
            className={`${styles['scroll-item']} ${isSelected ? styles['scroll-item--selected'] : ''}`}
            onClick={() => handleItemClick(item, index)}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
};

export const TimePickerUi: React.FC<TimePickerUiProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  ampm = true, 
  className = '',
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  
  const [tempTime, setTempTime] = useState<Dayjs>(value);

  const hoursData = ampm 
    ? Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i).toString().padStart(2, '0')) 
    : Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  
  const minutesData = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const meridiemData = ['AM', 'PM'];

  const currentHourStr = ampm 
    ? (tempTime.hour() % 12 || 12).toString().padStart(2, '0') 
    : tempTime.hour().toString().padStart(2, '0');
  
  const currentMinuteStr = tempTime.minute().toString().padStart(2, '0');
  const currentMeridiem = tempTime.format('A');
  
  const timePart = value ? value.format(ampm ? 'hh:mm' : 'HH:mm') : '';
  const meridiemPart = ampm && value ? value.format('A') : '';

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled) {
      setTempTime(value); 
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAccept = () => {
    onChange(tempTime);
    setAnchorEl(null);
  };

  const onHourSelect = (val: string) => {
    let newHour = parseInt(val, 10);
    if (ampm) {
      const isPM = tempTime.format('A') === 'PM';
      if (isPM && newHour !== 12) newHour += 12;
      if (!isPM && newHour === 12) newHour = 0;
    }
    setTempTime(tempTime.hour(newHour));
  };

  const onMinuteSelect = (val: string) => {
    setTempTime(tempTime.minute(parseInt(val, 10)));
  };

  const onMeridiemSelect = (val: string) => {
    let h = tempTime.hour();
    if (val === 'AM' && h >= 12) h -= 12;
    if (val === 'PM' && h < 12) h += 12;
    setTempTime(tempTime.hour(h));
  };

  const open = Boolean(anchorEl);
  const id = open ? `infinite-time-picker-${label}` : undefined;

  return (
    <div className={`${styles['infinite-time-picker']} ${className}`}>
      <CustomTextField
        label={label}
        value=""
        onClick={handleClick}
        disabled={disabled}
        size="small"
        fullWidth
        InputProps={{
          readOnly: true,
          startAdornment: (
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '3px',
                fontSize: '12px',
                lineHeight: '1',
                fontFamily: "'Sora', sans-serif",
                color: disabled ? 'rgba(0,0,0,0.38)' : '#13231D',
                fontWeight: 700,
                pointerEvents: 'none',
                paddingLeft: '7px',
            }}>
                {timePart}
                {meridiemPart && (
                    <span style={{ fontSize: '12px', fontWeight: 700, lineHeight: '1' }}>
                        {meridiemPart}
                    </span>
                )}
            </div>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton edge="end" disabled={disabled} >
                <AccessTimeIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </InputAdornment>
          ),
          sx: { cursor: disabled ? 'default' : 'pointer' }
        }}
        sx={{
          '& .MuiOutlinedInput-root': { 
            cursor: disabled ? 'default' : 'pointer',
            height: className ? '100% !important' : '36px !important',
            minHeight: className ? '100% !important' : '36px !important',
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                border: className ? 'none !important' : undefined,
                borderColor: className ? 'transparent !important' : undefined
            }
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: className ? 'none !important' : undefined
          },
          '& input': { 
            cursor: disabled ? 'default' : 'pointer',
            paddingRight: '32px !important',
            height: className ? '100% !important' : '40px !important',
            boxSizing: 'border-box'
          },
          '& .MuiInputLabel-root': {
            marginBottom: '4px !important',
          },
          '& .MuiOutlinedInput-root>input': {
            padding: '0 16px !important',
            paddingLeft: '6px !important',
            fontSize: '12px !important',
          }
        }}
      />
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ className: styles['popover-paper'] }}
      >
        <div className={styles['picker-content']}>
          
          <div className={styles['picker-column']}>
             <span className={styles['column-label']}>{t('TimePickerUi.hour')}</span>
             <ScrollColumn 
                items={hoursData} 
                selectedValue={currentHourStr} 
                onSelect={onHourSelect} 
             />
          </div>

          <div className={styles['picker-separator']}>:</div>

          <div className={styles['picker-column']}>
             <span className={styles['column-label']}>{t('TimePickerUi.minute')}</span>
             <ScrollColumn 
                items={minutesData} 
                selectedValue={currentMinuteStr} 
                onSelect={onMinuteSelect} 
             />
          </div>

          {ampm && (
             <div className={`${styles['picker-column']} ${styles['picker-column--meridiem']}`}>
               <span className={styles['column-label']}>&nbsp;</span>
               <div className={styles['static-list']}>
                 {meridiemData.map(m => (
                   <div 
                     key={m} 
                     className={`${styles['scroll-item']} ${m === currentMeridiem ? styles['scroll-item--selected'] : ''}`}
                     onClick={() => onMeridiemSelect(m)}
                   >
                     {m}
                   </div>
                 ))}
               </div>
             </div>
          )}
        </div>

        <div className={styles['picker-actions']}>
            <Button onClick={handleClose} color="inherit" size="small">
                {t('TimePickerUi.cancel')}
            </Button>
            <Button onClick={handleAccept} className={styles['picker-actions__button']} size="small">
                {t('TimePickerUi.ok')}
            </Button>
        </div>
      </Popover>
    </div>
  );
};