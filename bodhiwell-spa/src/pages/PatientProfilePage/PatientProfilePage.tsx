import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { usePatientProfile } from '../../hooks/usePatientProfile';

import PatientProfileDetails from '../../components/PatientProfileDetails/PatientProfileDetails';
import Loading from '../../components/ui/Loading/Loading';

import styles from './PatientProfilePage.module.scss';
import { PageContentLayout } from '../../components/ui/layout/PageContentLayout/PageContentLayout';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

export const PatientProfilePage = () => {
    const { t } = useTranslation();
    const { uid } = useParams<{ uid: string }>();

    const { patient, loading, error } = usePatientProfile(uid);

    const renderContent = () => {
        if (loading) {
            return <Loading fullscreen text={t('appAdmin.PatientProfilePage.loadingProfile')} />;
        }

        if (error) {
            return <div className={styles['error-message']}>{error}</div>;
        }

        if (patient) {
            return <PatientProfileDetails patient={patient} />;
        }

        return <div className={styles['error-message']}>{t('appAdmin.PatientProfilePage.patientNotFound')}</div>;
    };

    return (
        <PageContentLayout title={t('appAdmin.PatientProfilePage.title')} icon={AssignmentIndIcon} >
            <div className={styles['page-container']}>
                {renderContent()}
            </div>
        </PageContentLayout>
    );
};
