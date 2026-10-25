import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import { useGetReservations } from '../../../hooks/useGetReservations';
import { useIsMobile } from '../../../hooks/use-mobile';
import { useAuthContext } from '../../../context/AuthContext';

import { IConsultation } from '../../../types';

export const useReservationsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const { data: reservations, loading, error } = useGetReservations();
  const isMobile = useIsMobile();

  const [openAlert, setOpenAlert] = useState(false);
  const [pendingReservation, setPendingReservation] = useState<IConsultation | null>(null);

  const canGenerateReport = useCallback((dateString: string): boolean => {
    const reservationDate = new Date(dateString.replace(" ", "T"));
    const now = new Date();
    if (isNaN(reservationDate.getTime())) return false;
    return reservationDate.getTime() <= now.getTime();
  }, []);

  useEffect(() => {
    if (!loading && reservations && user?.type_account !== 'patient') {
      const pending = reservations.find(item => 
        !item.isConsulted && 
        item.status === 'CONFIRMED' && 
        canGenerateReport(item.date_start)
      );

      if (pending) {
        setPendingReservation(pending);
        setOpenAlert(true);
      }
    }
  }, [loading, reservations, user, canGenerateReport]);

  const handleCloseAlert = () => setOpenAlert(false);

  const pageTitle = useMemo(() => 
    isMobile ? t('appAdmin.reservationsPage.titleMobile') : t('appAdmin.reservationsPage.title')
  , [isMobile, t]);

  const pageIcon = useMemo(() => 
    isMobile ? undefined : CalendarTodayIcon
  , [isMobile]);

  return {
    reservations,
    loading,
    error,
    pageTitle,
    pageIcon,
    openAlert,
    pendingReservation,
    handleCloseAlert,
    t
  };
};