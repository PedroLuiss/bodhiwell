import { useTranslation } from 'react-i18next';
import { Tooltip } from '@mui/material';
import styles from './MenuItemWarningIcon.module.scss';

export const MenuItemWarningIcon = ({ className, position }: { className?: string, position?: 'top' | 'bottom' | 'left' | 'right' }) => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t('MenuItemWarningIcon.title', 'Completa tu información para terminar la configuración.')} placement={position || 'top'}>
      <span className={`${styles['menu-item-warning']} ${className}`}>
        !
      </span>
    </Tooltip>
  );
};