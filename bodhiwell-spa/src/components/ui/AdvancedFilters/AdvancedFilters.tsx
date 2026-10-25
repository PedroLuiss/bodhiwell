import { useTranslation } from 'react-i18next';
import { MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import { Dayjs } from 'dayjs';
import styles from './AdvancedFilters.module.scss';

import { TextFieldUi } from '../TextFieldUi/TextFieldUi'; 
import { SelectUi } from '../SelectUi/SelectUi';       
import { DateInputUi } from '../DateInputUi/DateInputUi';

interface AdvancedFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  startDate: Dayjs | null;
  onStartDateChange: (date: Dayjs | null) => void;
  endDate: Dayjs | null;
  onEndDateChange: (date: Dayjs | null) => void;
  period: string;
  onPeriodChange: (period: string) => void;
}

export const AdvancedFilters = ({
  searchTerm,
  onSearchChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  period,
  onPeriodChange
}: AdvancedFiltersProps) => {
  const { t } = useTranslation();

  return (
    <section className={styles['advanced-filters']}>
      <div className={styles['advanced-filters__grid']}>
        
        <div className={styles['advanced-filters__item']}>
          <TextFieldUi
            label={t('appAdmin.AdvancedFilters.search', 'Palabra clave')}
            placeholder={t('appAdmin.AdvancedFilters.searchPlaceholder', 'Nombre, correo...')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#82B194', fontSize: 20 }} /> 
                </InputAdornment>
              ),
            }}
            fullWidth
          />
        </div>

        <div className={styles['advanced-filters__item']}>
          <SelectUi
            label={t('appAdmin.AdvancedFilters.period', 'Periodo')}
            value={period}
            onChange={(e) => onPeriodChange(e.target.value as string)}
          >
            <MenuItem value="all">{t('appAdmin.AdvancedFilters.periods.all', 'Todos los registros')}</MenuItem>
            <MenuItem value="week">{t('appAdmin.AdvancedFilters.periods.lastWeek', 'Última semana')}</MenuItem>
            <MenuItem value="month">{t('appAdmin.AdvancedFilters.periods.lastMonth', 'Último mes')}</MenuItem>
            <MenuItem value="3months">{t('appAdmin.AdvancedFilters.periods.last3Months', 'Últimos 3 meses')}</MenuItem>
            <MenuItem value="year">{t('appAdmin.AdvancedFilters.periods.lastYear', 'Último año')}</MenuItem>
          </SelectUi>
        </div>

        <div className={`${styles['advanced-filters__item']} ${styles['advanced-filters__item--dates']}`}>
          <div className={styles['advanced-filters__date-group']}>
            <DateInputUi
              label={t('appAdmin.AdvancedFilters.startDate', 'Desde')}
              value={startDate}
              onChange={onStartDateChange}
              placeholder="DD/MM/AAAA"
            />
            <DateInputUi
              label={t('appAdmin.AdvancedFilters.endDate', 'Hasta')}
              value={endDate}
              onChange={onEndDateChange}
              placeholder="DD/MM/AAAA"
            />
          </div>
        </div>

      </div>
    </section>
  );
};