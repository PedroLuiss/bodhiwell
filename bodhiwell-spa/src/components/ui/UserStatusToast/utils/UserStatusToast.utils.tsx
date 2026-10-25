import React from 'react';
import styles from '../UserStatusToast.module.scss';

export const parseMessageWithLinks = (message: string, navigate: (path: string) => void): React.ReactNode => {
  const parts = message.split(/(\[.*?\])/);
  
  return parts.map((part, index) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      const linkText = part.slice(1, -1);
      
      let path = '';
      if (linkText === 'Perfil Público' || linkText === 'Public Profile') {
        path = '/profile';
      } else if (linkText === 'Datos Personales' || linkText === 'Personal Info') {
        path = '/personal-info';
      }
      
      return (
        <button
          key={index}
          className={styles['status-banner__inline-link']}
          onClick={() => navigate(path)}
        >
          {linkText}
        </button>
      );
    }
    return <span key={index}>{part}</span>;
  });
};