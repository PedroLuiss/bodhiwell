import React from 'react';
import { Modal, Backdrop, Fade, CircularProgress } from '@mui/material';
import styles from './PaymentStatusModal.module.scss';
import { PaymentStatus } from '../../../types/Booking/booking';
import { usePaymentStatusModal } from './hooks/usePaymentStatusModal';

interface PaymentStatusModalProps {
  open: boolean;
  status: PaymentStatus | null;
  onClose: () => void;
  onRetry: () => void;
}

const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({
  open,
  status,
  onClose,
  onRetry
}) => {
  const {
    t,
    config,
    isProcessing,
    showRetryButton,
    showViewDetailsButton,
    handleGoToProfessionals
  } = usePaymentStatusModal(status);

  if (!status || !open) return null;

  const { Icon, color, title, message } = config;

  return (
    <Modal
      open={open}
      onClose={isProcessing ? undefined : onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        className: styles['payment-modal__backdrop'],
      }}
    >
      <Fade in={open}>
        <div className={styles['payment-modal__content']}>
          <div
            className={styles['payment-modal__icon-wrapper']}
            style={{ backgroundColor: color, boxShadow: `0 0 0 8px ${color}33` }}
          >
            {isProcessing ? (
              <CircularProgress size={40} sx={{ color: 'white' }} />
            ) : (
              Icon && <Icon className={styles['payment-modal__icon']} />
            )}
          </div>

          <h2 className={styles['payment-modal__title']}>{title}</h2>
          <p className={styles['payment-modal__subtitle']}>{message}</p>

          {!isProcessing && (
            <div className={styles['payment-modal__actions']}>
              {showRetryButton && (
                <button
                  className={`${styles['payment-modal__button']} ${styles['payment-modal__button--primary']}`}
                  onClick={onRetry}
                >
                  {t('appAdmin.PaymentStatusModal.retryPayment')}
                </button>
              )}

              {showViewDetailsButton && (
                <button
                  className={`${styles['payment-modal__button']} ${styles['payment-modal__button--primary']}`}
                  onClick={onClose}
                >
                  {t('appAdmin.PaymentStatusModal.viewBookingDetails')}
                </button>
              )}

              <button
                className={styles['payment-modal__button']}
                onClick={handleGoToProfessionals}
              >
                {t('appAdmin.PaymentStatusModal.continueExploring')}
              </button>
            </div>
          )}
        </div>
      </Fade>
    </Modal>
  );
};

export default PaymentStatusModal;