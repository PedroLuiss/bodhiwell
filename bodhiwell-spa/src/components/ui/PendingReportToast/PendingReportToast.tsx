import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Slide } from '@mui/material';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { IConsultation } from '../../../types'; 
import { ButtonUi } from '../ButtonUi/ButtonUi';
import styles from './PendingReportToast.module.scss';

interface PendingReportToastProps {
  open: boolean;
  onClose: () => void;
  reservation: IConsultation | null;
}

function SlideTransition(props: any) {
  return <Slide {...props} direction="up" />;
}

export const PendingReportToast: React.FC<PendingReportToastProps> = ({
  open,
  onClose,
  reservation
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!reservation) return null;

  const handleViewDetails = () => {
    navigate(`/professionals/booking-details/${reservation.uid}`);
    onClose();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={20000} 
      onClose={onClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{ zIndex: 9999 }}
    >
      <div className={styles['report-toast']}>
        <button className={styles['report-toast__close']} onClick={onClose}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </button>

        <header className={styles['report-toast__header']}>
          <div className={styles['report-toast__icon-box']}>
            <NotificationImportantIcon sx={{ fontSize: 24 }} />
          </div>
          
          <div className={styles['report-toast__title-group']}>
            <span className={styles['report-toast__eyebrow']}>{t('appAdmin.reservationsPage.alertEyebrow', 'Acción requerida')}</span>
            <h3 className={styles['report-toast__title']}>
              {t('appAdmin.reservationsPage.alertTitle', '¡Informe pendiente!')}
            </h3>
          </div>
        </header>

        <div className={styles['report-toast__body']}>
          <p className={styles['report-toast__message']}>
            {t('appAdmin.reservationsPage.alertMessage', 'Completalo ahora para acreditar tu pago.')}
          </p>

          <div className={styles['report-toast__reservation-box']}>
            <span className={styles['report-toast__patient']}>{reservation.patient}</span>
            <span className={styles['report-toast__date']}>{reservation.date_start}</span>
          </div>
        </div>

        <footer className={styles['report-toast__footer']}>
          <ButtonUi 
            variant="contained" 
            size="small"
            fullWidth
            onClick={handleViewDetails}
            startIcon={<ArrowForwardIcon />}
          >
            {t('appAdmin.reservationsTable.viewReservationButton', 'Gestionar reserva')}
          </ButtonUi>
        </footer>
      </div>
    </Snackbar>
  );
};