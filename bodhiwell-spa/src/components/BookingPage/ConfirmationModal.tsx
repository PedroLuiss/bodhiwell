import { Modal, Backdrop, CircularProgress } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';

import styles from './ConfirmationModal.module.scss';
import { usePaymentBooking } from '../../hooks/usePaymentBooking';
import PaymentIframeModal from '../ui/PaymentIframeModal/PaymentIframeModal';

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  bookingUid: string;
}

export const ConfirmationModal = ({ open, onClose, bookingUid }: ConfirmationModalProps) => {
  const { t } = useTranslation();
  const {
    initiatePayment,
    loading: paymentLoading,
    error: paymentError,
    paymentUrl,
    clearPaymentUrl
  } = usePaymentBooking();

  const handlePayNowClick = () => {
    initiatePayment(bookingUid);
  };

  const handleClosePaymentModal = () => {
    clearPaymentUrl();
    onClose();
  };

  return (
    <>
      <Modal
        open={open && !paymentUrl}
        onClose={onClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          className: styles['confirmation-modal__backdrop'],
        }}
      >
        <div className={styles['confirmation-modal__content']}>
          <div className={styles['confirmation-modal__icon-wrapper']}>
            <CheckIcon className={styles['confirmation-modal__icon']} />
          </div>
          <h2 className={styles['confirmation-modal__title']}>
            {t('landing.ConfirmationModal.title')}
          </h2>
          <p className={styles['confirmation-modal__subtitle']}>
            {t('landing.ConfirmationModal.subtitle')}
          </p>

          <button
            className={`${styles['confirmation-modal__button']} ${styles['confirmation-modal__button--primary']}`}
            onClick={handlePayNowClick}
            disabled={paymentLoading}
          >
            {paymentLoading ? <CircularProgress size={24} color="inherit" /> : t('landing.ConfirmationModal.payNow')}
          </button>

          {paymentError && (
            <p className={styles['confirmation-modal__error']}>{paymentError}</p>
          )}
        </div>
      </Modal>

      <PaymentIframeModal
        open={!!paymentUrl}
        onClose={handleClosePaymentModal}
        url={paymentUrl}
      />
    </>
  );
};
