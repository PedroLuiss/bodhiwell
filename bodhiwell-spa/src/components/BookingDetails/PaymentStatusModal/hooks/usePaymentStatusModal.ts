import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PaymentStatus } from '../../../../types/Booking/booking';
import { STATUS_MAP } from '../constants/PaymentStatus.constants';

export const usePaymentStatusModal = (status: PaymentStatus | null) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const normalizedStatus = status?.toLowerCase() || 'default';

  const config = useMemo(() => {
    const baseConfig = STATUS_MAP[normalizedStatus] || STATUS_MAP.default;
    return {
      ...baseConfig,
      title: t(baseConfig.titleKey),
      message: t(baseConfig.messageKey)
    };
  }, [normalizedStatus, t]);

  const isProcessing = normalizedStatus === 'initiating';
  
  const showRetryButton = ['rejected', 'failed', 'canceled', 'pending'].includes(normalizedStatus);
  
  const showViewDetailsButton = ['captured', 'approved', 'paid'].includes(normalizedStatus);

  const handleGoToProfessionals = useCallback(() => {
    navigate('/professionals');
  }, [navigate]);

  return {
    t,
    config,
    isProcessing,
    showRetryButton,
    showViewDetailsButton,
    handleGoToProfessionals
  };
};