import React from 'react';
import styles from './EmptyState.module.scss';
import SearchOffIcon from '@mui/icons-material/SearchOff'; 

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon 
}) => {
  return (
    <div className={styles['empty-state']}>
      <div className={styles['empty-state__icon']}>
        {icon || <SearchOffIcon style={{ fontSize: 60, color: '#bdc3c7' }} />}
      </div>
      <h3 className={styles['empty-state__title']}>{title}</h3>
      {description && <p className={styles['empty-state__description']}>{description}</p>}
    </div>
  );
};

export default EmptyState;