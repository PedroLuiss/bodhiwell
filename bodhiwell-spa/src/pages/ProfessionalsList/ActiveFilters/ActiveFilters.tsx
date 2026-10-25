import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ActiveFilters.module.scss';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { useSearchFiltersContext } from '../../../context/SearchFiltersContext';

const ActiveFilters = () => {
  const { t } = useTranslation();
  const { filters, clearFilters: onClear, handleRemoveFilter: onRemoveFilter } = useSearchFiltersContext();
  
  if (!filters.q && !filters.dimension && filters.specialties.length === 0) {
      return null;
  }

  const dimensionName = filters.dimension?.name;

  return (
    <div className={styles['active-filters']}>
      <div className={styles['active-filters__header']}>
        <h3 className={styles['active-filters__title']}>{t('landing.ActiveFilters.activeFilters')}</h3>
        <button onClick={onClear} className={styles['active-filters__clear-btn']}>
          {t('landing.ActiveFilters.clearAll')}
        </button>
      </div>

      <div className={styles['active-filters__list']}>
        
        {filters.q && (
          <div className={styles['active-filters__chip']}>
            <SearchIcon fontSize="small" className={styles['active-filters__icon']} />
            <span>"{filters.q}"</span>
            <button onClick={() => onRemoveFilter('q')} className={styles['active-filters__remove-btn']}>
                <CloseIcon fontSize="small" />
            </button>
          </div>
        )}

        {filters.dimension && (
          <div className={`${styles['active-filters__chip']} ${styles['active-filters__chip--category']}`}>
            <CategoryIcon fontSize="small" className={styles['active-filters__icon']} />
            <span>Dimensión: {dimensionName}</span>
            <button onClick={() => onRemoveFilter('dimension')} className={styles['active-filters__remove-btn']}>
                <CloseIcon fontSize="small" />
            </button>
          </div>
        )}

        {filters.specialties.map(spec => {
            return (
                <div key={spec.uid} className={`${styles['active-filters__chip']} ${styles['active-filters__chip--tag']}`}>
                    <LocalOfferIcon fontSize="small" className={styles['active-filters__icon']} />
                    <span>{spec.name}</span>
                    <button onClick={() => onRemoveFilter('specialty', spec.uid)} className={styles['active-filters__remove-btn']}>
                        <CloseIcon fontSize="small" />
                    </button>
                </div>
            );
        })}

      </div>
    </div>
  );
};

export default ActiveFilters;
