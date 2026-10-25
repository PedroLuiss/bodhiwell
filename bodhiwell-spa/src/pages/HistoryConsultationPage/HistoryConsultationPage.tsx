import styles from './HistoryConsultationPage.module.scss';
import { useNavigate, useParams} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ConsultationsListProfessional } from '../../components/ConsultationsListProfessional/ConsultationsListProfessional';
import { PageContentLayout } from '../../components/ui/layout/PageContentLayout/PageContentLayout';
import HistoryIcon from '@mui/icons-material/History';

export const HistoryConsultationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { uid } = useParams<{ uid: string }>();

  if (!uid) {
    return (
      <div className={styles['history-page']}>
        <div className={styles['history-page__empty-card']}>
           <h2>{t('appAdmin.HistoryConsultationPage.errorTitle')}</h2>
           <p>{t('appAdmin.HistoryConsultationPage.patientIdNotProvided')}</p>
           <button onClick={() => navigate(-1)} className={styles['back-btn']}>Volver</button>
        </div>
      </div>
    );
  }

  return (
    <PageContentLayout title={t('appAdmin.HistoryConsultationPage.title')} icon={HistoryIcon}>
      <ConsultationsListProfessional patientId={uid} />
    </PageContentLayout>
  );
};