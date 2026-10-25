import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './ViewReservationReportPage.module.scss';
import ReservationReportDetails from '../../components/ReservationReportDetails/ReservationReportDetails';
import Loading from '../../components/ui/Loading/Loading';
import { useReservationReportDetails } from '../../hooks/useReservationReportDetails';
import { PageContentLayout } from '../../components/ui/layout/PageContentLayout/PageContentLayout';


const ViewReservationReportPage = () => {
  const { t } = useTranslation();
  const { uid } = useParams<{ uid: string }>();
  const { report, loading, error } = useReservationReportDetails(uid);

  return (
      <PageContentLayout title={t('appAdmin.ReservationReportDetails.consultationDetails')} >
        {loading && <Loading fullscreen text={t('appAdmin.ViewReservationReportPage.loadingReport')} />}
        {error && <div className={styles['view-report-page__error']}>{error}</div>}
        {report && <ReservationReportDetails report={report} />}
      </PageContentLayout>
  );
};

export default ViewReservationReportPage;
