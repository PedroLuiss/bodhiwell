import React from 'react';
import styles from './RedPagosAlert.module.scss';
import { IBookingDetail } from '../../../types/Booking/booking';
import { useRedPagosAlert } from './hooks/useRedPagosAlert';

import StorefrontIcon from '@mui/icons-material/Storefront';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { IconButton } from '@mui/material';

interface RedPagosAlertProps {
  bookingDetail: IBookingDetail;
}

const RedPagosAlert: React.FC<RedPagosAlertProps> = ({ bookingDetail }) => {
  const { 
    paymentInfo, 
    isLoading, 
    isCopied, 
    handleViewCodeClick, 
    handleCopyCode, 
    t 
  } = useRedPagosAlert(bookingDetail);

  if (isLoading || !paymentInfo) {
    return null;
  }

  return (
    <section className={styles['redpagos-box']}>
      <header className={styles['redpagos-box__header']}>
        <div className={styles['redpagos-box__icon-box']}>
          <StorefrontIcon sx={{ fontSize: 24 }} />
        </div>
        <div className={styles['redpagos-box__title-group']}>
          <span className={styles['redpagos-box__eyebrow']}>{t('appAdmin.RedPagosAlert.eyebrow', 'Pago pendiente')}</span>
          <h3 className={styles['redpagos-box__title']}>
            {t('appAdmin.RedPagosAlert.title', 'Completar en RedPagos')}
          </h3>
        </div>
      </header>

      <div className={styles['redpagos-box__body']}>
        <p className={styles['redpagos-box__message']}>
          {t('appAdmin.RedPagosAlert.message', 'Acércate a un local de RedPagos y dicta el siguiente código:')}
        </p>

        <div className={styles['redpagos-box__code-card']}>
          <div className={styles['redpagos-box__code-info']}>
            <span className={styles['redpagos-box__code-label']}>Código de pago</span>
            <span className={styles['redpagos-box__code-value']}>{paymentInfo.paymentCode}</span>
          </div>
          <IconButton 
            onClick={handleCopyCode}
            className={styles['redpagos-box__copy-btn']}
            title={t('appAdmin.RedPagosAlert.copyButtonTitle')}
          >
            {isCopied ? <CheckIcon sx={{ color: '#82B194' }} /> : <ContentCopyIcon sx={{ fontSize: 20 }} />}
          </IconButton>
        </div>
      </div>

      <footer className={styles['redpagos-box__footer']}>
        <button className={styles['redpagos-box__action-btn']} onClick={handleViewCodeClick}>
          <QrCode2Icon sx={{ fontSize: 18 }} />
          <span>{t('appAdmin.RedPagosAlert.actionButton', 'Ver Código de Barras')}</span>
        </button>
      </footer>
    </section>
  );
};

export default RedPagosAlert;