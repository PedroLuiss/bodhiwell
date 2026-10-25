import styles from "./EditProfileProfessional.module.scss";

import { useEditProfileProfessional } from "./hooks/useEditProfileProfessional";
import ProfessionalInfoSection from '../EditProfessionalInfo/EditProfessionalInfo';
import { BookingPanel } from '../../EditProfessional/BookingPanel';
import Loading from '../../ui/Loading/Loading';
import { UserStatusToast } from '../../ui/UserStatusToast/UserStatusToast';

const EditProfileProfessional = () => {
    const {
        t,
        user,
        loading,
        profileData,
        professions,
        availability,
        availabilityLoading,
        professionalUid,
        onSubmit
    } = useEditProfileProfessional();

    return (
        <div className={styles['professional-detail']}>
            <UserStatusToast />
            {loading || availabilityLoading ? <Loading fullscreen text={t('appAdmin.EditProfileProfessional.loading')} /> : null}
            <div className={styles['professional-detail__layout']}>
                <div className={styles['professional-detail__content']}>
                    {user && profileData && (
                        <ProfessionalInfoSection
                            user={{
                                profile: profileData
                            }}
                            professions={professions}
                            onSubmit={onSubmit}
                            allowInternalToggle
                        />
                    )}
                </div>
                <div className={styles['professional-detail__sidebar']}>
                    <BookingPanel
                        professionalUid={professionalUid ?? ""}
                        availability={availability ?? []}
                        setIsBookingModalOpen={() => { }}
                        isApproved={profileData?.status === 'active'}
                    />
                </div>
            </div>
        </div>
    );
}

export default EditProfileProfessional;