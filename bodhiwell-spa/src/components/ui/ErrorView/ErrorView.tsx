import React from 'react';
import styles from './ErrorView.module.scss';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';

interface ErrorViewProps {
  title?: string;
  message: string;        
  onRetry?: () => void;   
  fullscreen?: boolean;   
  className?: string;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  title = null,
  message,
  onRetry,
  fullscreen = false,
  className
}) => {
  const { t } = useTranslation();
  
  const containerClasses = [
    styles.errorContainer,
    fullscreen ? styles.fullscreen : styles.inline,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className={styles.iconWrapper}>
        <ErrorOutlineIcon />
      </div>
      
      <h3 className={styles.title}>{title ? title : t("appAdmin.common.errorTitle")}</h3>
      
      <p className={styles.message}>
        {t(message)}
      </p>

      {onRetry && (
        <button onClick={onRetry} className={styles.retryButton}>
          <RefreshIcon sx={{ fontSize: 16, marginRight: '8px' }} />
          {t("appAdmin.common.retry")}
        </button>
      )}
    </div>
  );
};