import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useBooking } from '../../../hooks/useBookings';
import { usePaymentBooking } from '../../../hooks/usePaymentBooking';
import { usePaymentStatus } from '../../../hooks/usePaymentStatus';
import { useAuthContext } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';

import { paymentService } from '../../../services/paymentService';
import { localStorageHelper } from '../../../utils/localStorageHelper';

export const useBookingDetailsPage = () => {
  const { t } = useTranslation();
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  const { user } = useAuthContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const isInIframe = useMemo(() => window.self !== window.top, []);

  const { 
    bookingDetail, 
    detailLoading, 
    detailError, 
    fetchBookingDetail, 
    updateBooking, 
    updateLoading 
  } = useBooking();

  const { 
    status: paymentStatus, 
    startPolling: startPaymentCheck, 
    stopPolling 
  } = usePaymentStatus();

  const { 
    initiatePayment, 
    loading: loadingPayment, 
    paymentUrl, 
    clearPaymentUrl 
  } = usePaymentBooking();

  const shouldCheckPayment = useMemo(() => {
    const queryParams = new URLSearchParams(location.search);
    return queryParams.get('isPayment') === '1';
  }, [location.search]);

  const handleInitiatePayment = useCallback(() => {
    if (uid) initiatePayment(uid);
  }, [uid, initiatePayment]);

  const handleAction = useCallback(async (actionType: string) => {
    switch (actionType) {
      case 'WAITING_PAYMENT':
        if (user?.type_account === 'patient') {
          handleInitiatePayment();
        }
        break;
      case 'COMPLETED':
        navigate(`/my-consultation/${bookingDetail?.consultation?.uid}/details-consultation`);
        break;
      case 'CONFIRMED':
        if (user?.type_account === 'professional' && bookingDetail?.uid) {
          navigate(`/reservations/${bookingDetail.uid}/create-report`);
        }
        break;
      case 'PROCESSING':
      case 'PENDING_PROVIDER':
        if (uid) {
          setIsStatusUpdating(true);
          try {
            await paymentService.getPaymentStatus(uid);
            await fetchBookingDetail(uid);
            showNotification(t('appAdmin.BookingDetailsPage.statusUpdated'), 'success');
          } catch (error: any) {
            showNotification(error.message || t('appAdmin.BookingDetailsPage.statusUpdateError'), 'error');
          } finally {
            setIsStatusUpdating(false);
          }
        }
        break;
      default:
        break;
    }
  }, [user, bookingDetail, uid, navigate, fetchBookingDetail, handleInitiatePayment, showNotification, t]);

  useEffect(() => {
    if (uid) fetchBookingDetail(uid);
    else navigate('/');
  }, [uid, fetchBookingDetail, navigate]);

  useEffect(() => {
    if (shouldCheckPayment && uid) {
      if (isInIframe) {
        window.parent.postMessage({ type: 'PAYMENT_COMPLETE', url: window.location.href }, '*');
      } else {
        setIsModalOpen(true);
        startPaymentCheck(uid);
      }
    }
  }, [shouldCheckPayment, uid, startPaymentCheck, isInIframe]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    stopPolling();
    if (uid) {
      fetchBookingDetail(uid);
      navigate(`/professionals/booking-details/${uid}`, { replace: true });
    }
  }, [uid, stopPolling, fetchBookingDetail, navigate]);

  const handleRetryPayment = useCallback(() => {
    setIsModalOpen(false);
    stopPolling();
    handleInitiatePayment();
  }, [setIsModalOpen, stopPolling, handleInitiatePayment]);

  if (detailError) {
    localStorageHelper.setItem('redirectAfterLogin', location.pathname + location.search);
  }

  const handlePaymentIframeClose = useCallback(() => {
    clearPaymentUrl();
    if (uid) {
      setIsModalOpen(true);
      startPaymentCheck(uid);
    }
  }, [clearPaymentUrl, uid, startPaymentCheck]);

  return {
    t,
    uid,
    bookingDetail,
    loading: detailLoading,
    error: detailError,
    isActionLoading: loadingPayment || isStatusUpdating,
    updateLoading,
    paymentStatus,
    isModalOpen,
    paymentUrl,
    handleAction,
    handleCloseModal,
    handleRetryPayment,
    updateBooking,
    handlePaymentIframeClose,
    isInIframe,
    shouldCheckPayment
  };
};