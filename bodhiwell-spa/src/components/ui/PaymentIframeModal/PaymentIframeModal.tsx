import React, { useState, useEffect, useRef } from 'react';
import { Modal, Backdrop, Fade, IconButton, Box, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import styles from './PaymentIframeModal.module.scss';

interface PaymentIframeModalProps {
  open: boolean;
  onClose: () => void;
  url: string | null;
}

const PaymentIframeModal: React.FC<PaymentIframeModalProps> = ({ open, onClose, url }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const loadCount = useRef(0);

  useEffect(() => {
    if (open) {
      loadCount.current = 0;
      setLoading(true);
    }
  }, [open]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data !== 'object' || event.data === null) return;

      if (event.data.type === 'PAYMENT_COMPLETE' && event.data.url) {
        const returnedUrl = event.data.url as string;
        if (returnedUrl.includes('/booking-details/') && returnedUrl.includes('isPayment=1')) {
          window.location.href = returnedUrl;
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onClose]);

  if (!url) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        className: styles['payment-modal__backdrop'],
      }}
    >
      <Fade in={open}>
        <Box className={styles['payment-modal__content']}>
          <header className={styles['payment-modal__header']}>
            <h3 className={styles['payment-modal__title']}>
              {t('appAdmin.PaymentIframeModal.title', 'Procesar Pago')}
            </h3>
            <IconButton
              className={styles['payment-modal__close-button']}
              onClick={onClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </header>

          <div className={styles['payment-modal__body']}>
            {loading && (
              <div className={styles['payment-modal__loader']}>
                <CircularProgress color="primary" />
              </div>
            )}
            <iframe
              src={url}
              className={styles['payment-modal__iframe']}
              onLoad={(e) => {
                setLoading(false);
                loadCount.current += 1;

                try {
                  const iframe = e.target as HTMLIFrameElement;
                  const currentUrl = iframe.contentWindow?.location.href;

                  if (currentUrl && currentUrl !== 'about:blank') {
                    if (currentUrl.includes('/booking-details/') && currentUrl.includes('isPayment=1')) {
                      window.location.href = currentUrl;
                      return;
                    }

                    const urlObj = new URL(currentUrl);
                    if (urlObj.origin === window.location.origin) {
                      if (currentUrl !== url || loadCount.current > 1) {
                        onClose();
                        return;
                      } else {
                        onClose();
                        return;
                      }
                    }
                  }
                } catch (err) {
                  console.debug("Iframe navigating across origins, waiting for interceptablere-entry...");
                }
              }}
              title="Payment Gateway"
              allow="payment"
            />
          </div>
        </Box>
      </Fade>
    </Modal>
  );
};

export default PaymentIframeModal;
