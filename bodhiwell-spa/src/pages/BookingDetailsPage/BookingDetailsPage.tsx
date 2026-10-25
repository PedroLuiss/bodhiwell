import React from 'react';
import styles from './BookingDetailsPage.module.scss';

import Loading from '../../components/ui/Loading/Loading';
import BookingDetailsContent from '../../components/BookingDetails/BookingDetailsContent';
import PaymentStatusModal from '../../components/BookingDetails/PaymentStatusModal';
import { PageContentLayout } from '../../components/ui/layout/PageContentLayout/PageContentLayout';
import PaymentIframeModal from '../../components/ui/PaymentIframeModal/PaymentIframeModal';

import { useBookingDetailsPage } from './hooks/useBookingDetailsPage';

const BookingDetailsPage: React.FC = () => {
    const {
        t,
        bookingDetail,
        loading,
        error,
        isActionLoading,
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
    } = useBookingDetailsPage();

    if (error) return null;

    if (isInIframe && shouldCheckPayment) return null;

    return (
        <PageContentLayout>
            <div className={styles['booking-details-container']}>
                {loading ? (
                    <Loading fullscreen text={t('appAdmin.BookingDetailsPage.loadingBookingDetails')} />
                ) : (
                    bookingDetail && (
                        <BookingDetailsContent
                            bookingDetail={bookingDetail}
                            onAction={handleAction}
                            isActionLoading={isActionLoading}
                            onUpdateBooking={updateBooking}
                            isUpdateLoading={updateLoading}
                        />
                    )
                )}

                <PaymentStatusModal
                    open={isModalOpen}
                    status={paymentStatus}
                    onClose={handleCloseModal}
                    onRetry={handleRetryPayment}
                />

                <PaymentIframeModal 
                    open={!!paymentUrl}
                    onClose={handlePaymentIframeClose}
                    url={paymentUrl}
                />
            </div>
        </PageContentLayout>
    );
};

export default BookingDetailsPage;