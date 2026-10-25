import React, { useEffect, useState } from 'react';
import { MessagePayload } from 'firebase/messaging';
import styles from './NotificationToast.module.scss';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

interface NotificationToastProps {
  payload: MessagePayload | null;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ payload, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (payload?.notification) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onClose();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [payload, onClose]);

  if (!show || !payload?.notification) return null;

  return (
    <div className={`${styles['toast']} ${show ? styles['toast--show'] : ''}`}>
      <div className={styles['toast__icon']}>
        <NotificationsActiveIcon   />
      </div>
      <div className={styles['toast__content']}>
        <h4 className={styles['toast__title']}>{payload.notification.title}</h4>
        <p className={styles['toast__body']}>{payload.notification.body}</p>
      </div>
      <button className={styles['toast__close']} onClick={() => setShow(false)}>
        <CloseIcon fontSize="small" />
      </button>
    </div>
  );
};