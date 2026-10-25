
import { ProfessionalInfo } from '../../components/ProfessionalDetail/ProfessionalInfo';
import { BookingPanel } from '../../components/ProfessionalDetail/BookingPanel';
import { BookingModal } from '../../components/ProfessionalDetail/BookingModal';
import { ConfirmationModal } from '../../components/BookingPage/ConfirmationModal';

// Styles
import styles from './professional-detail.module.scss';
import Loading from '../../components/ui/Loading/Loading';
import { useProfessionalPage } from './hooks/useProfessionalPage';

const ProfessionalDetailPage = () => {
    const {
        professional,
        availability,
        loading,
        error,
        uid,
        isBookingModalOpen,
        isConfirmationModalOpen,
        currentBookingUid,
        t,
        systemSettings,
        setIsBookingModalOpen,
        setIsConfirmationModalOpen,
        handleGoBack,
        handleConfirmBooking,
        handleBookingModalClose
    } = useProfessionalPage();

    if (loading) {
        return <Loading fullscreen text={t('landing.professionalsDetail.loading')} />;
    }

    if (error || !professional) {
        return (
            <div className="container text-center p-5">
                <p>{t('landing.professionalsDetail.error')}</p>
            </div>
        );
    }

    return (
        <div className={styles['professional-detail'] + " container"}>
          
            <div className={styles['professional-detail__content']}>
                <div className={styles['professional-detail__content__info']}>
                    <ProfessionalInfo
                        professional={professional}
                        aboutSettings={systemSettings?.about}
                        professionalInfoSettings={systemSettings?.professional_info}
                    />
                </div>
                <div className={styles['professional-detail__content__booking']}>
                    <BookingPanel
                        professionalUid={uid || ''}
                        availability={availability ?? []}
                        setIsBookingModalOpen={setIsBookingModalOpen}
                        modality={professional.profile.details?.consult_type ?? undefined}
                        consultTime={professional.profile.details?.consult_time ?? undefined}
                        consultPrice={professional.profile.details?.consult_price || 0}
                    />
                </div>
            </div>
            <BookingModal
                open={isBookingModalOpen}
                onClose={handleBookingModalClose}
                onConfirmBooking={handleConfirmBooking}
                consultPrice={professional?.profile?.details?.consult_price ?? undefined}
                modality={professional.profile.details?.consult_type ?? undefined}
            />

            {currentBookingUid && (
                <ConfirmationModal
                    open={isConfirmationModalOpen}
                    onClose={() => setIsConfirmationModalOpen(false)}
                    // onViewDetails={handleViewDetails} 
                    bookingUid={currentBookingUid}
                />
            )}
        </div>
    );
};

export default ProfessionalDetailPage;