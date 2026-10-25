import React from 'react';

import { ReservationsTable } from '../../components/ReservationsTable/ReservationsTable';
import { PageContentLayout } from '../../components/ui/layout/PageContentLayout/PageContentLayout';
import Loading from '../../components/ui/Loading/Loading';
import { PendingReportToast } from '../../components/ui/PendingReportToast/PendingReportToast';

import { useReservationsPage } from './hooks/useReservationsPage';

export const ReservationsPage: React.FC = () => {
  const {
    reservations,
    loading,
    error,
    pageTitle,
    pageIcon,
    openAlert,
    pendingReservation,
    handleCloseAlert,
    t
  } = useReservationsPage();

  if (loading) {
    return <Loading fullscreen text={t('appAdmin.reservationsPage.loading')} />;
  }

  if (error) {
    return (
      <PageContentLayout title={pageTitle} icon={pageIcon}>
        <div className="alert alert-danger" role="alert">
          {t('appAdmin.reservationsPage.error')}: {error}
        </div>
      </PageContentLayout>
    );
  }

  return (
    <PageContentLayout title={pageTitle} icon={pageIcon}>
      
      <ReservationsTable data={reservations || []} />

      <PendingReportToast 
        open={openAlert}
        onClose={handleCloseAlert}
        reservation={pendingReservation}
      />
      
    </PageContentLayout>
  );
};