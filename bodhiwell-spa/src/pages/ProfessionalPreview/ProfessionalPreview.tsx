import React from 'react';
import { ProfessionalInfo } from '../../components/ProfessionalDetail/ProfessionalInfo';
import { BookingPanel } from '../../components/ProfessionalDetail/BookingPanel';
import styles from './ProfessionalPreview.module.scss';
import { useProfessionalPreview } from './hooks/useProfessionalPreview';
import Loading from '../../components/ui/Loading/Loading';

const ProfessionalPreview: React.FC = () => {
    const { previewData, systemSettings, loading, availability, availabilityLoading } = useProfessionalPreview();

    if (loading || availabilityLoading || !previewData) {
        return <Loading fullscreen />;
    }

    return (
        <div className={styles['preview-container'] + " container"}>
            

            <div className={styles['preview-content']}>
                <div className={styles['preview-content__info']}>
                    <ProfessionalInfo 
                        professional={previewData} 
                        aboutSettings={systemSettings?.about}
                        professionalInfoSettings={systemSettings?.professional_info} 
                    />
                </div>
                <div className={styles['preview-content__booking']}>
                    <BookingPanel
                        professionalUid={previewData.profile.uid}
                        availability={availability ?? []}
                        setIsBookingModalOpen={() => {}}
                        modality={previewData.profile.details?.consult_type || (previewData.profile.details as any)?.modality}
                        consultTime={previewData.profile.details?.consult_time}
                        consultPrice={previewData.profile.details?.consult_price || 0}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProfessionalPreview;