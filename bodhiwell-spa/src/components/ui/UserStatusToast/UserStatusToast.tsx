import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './UserStatusToast.module.scss';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';

import { useUserStatusToast } from './hooks';
import { parseMessageWithLinks } from './utils';

export const UserStatusToast: React.FC = () => {
  const { t } = useTranslation();
  const { config, isVisible, navigate, handleActionClick, handleClose } = useUserStatusToast();

  if (!isVisible || !config) return null;

  const bannerClass = `${styles['status-banner']} ${styles[`status-banner--${config.severity}`]}`;

  return (
    <div className={bannerClass}>
      <div className={styles['status-banner__icon-box']}>
        {config.icon || '✓'}
      </div>
      
      <div className={styles['status-banner__content']}>
        <strong className={styles['status-banner__title']}>
            {t(config.titleKey)}
        </strong>
        <div className={styles['status-banner__message']}>
          {parseMessageWithLinks(t(config.messageKey), navigate)}
        </div>
      </div>

      <div className={styles['status-banner__actions']}>
        {config.action && (
          <button className={styles['status-banner__btn-action']} onClick={handleActionClick}>
            <span>{t(config.action.textKey)}</span>
            <ArrowForwardIcon sx={{ fontSize: 16 }} />
          </button>
        )}

        {/* <button 
          className={styles['status-banner__btn-close']} 
          onClick={handleClose} 
          aria-label="Cerrar"
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </button> */}
      </div>
    </div>
  );
};