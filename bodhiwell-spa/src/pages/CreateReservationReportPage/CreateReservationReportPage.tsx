import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './CreateReservationReportPage.module.scss';
import CreateReservationReportForm from '../../components/CreateReservationReportForm/CreateReservationReportForm';
import { IReservationReportData } from '../../types';
import { useCreateReservationReport } from '../../hooks/useCreateReservationReport';
import { useBooking } from '../../hooks/useBookings';
import { useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { PageContentLayout } from '../../components/ui/layout/PageContentLayout/PageContentLayout';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import dayjs from 'dayjs';

export const CreateReservationReportPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { uid } = useParams<{ uid: string }>();

  const { showNotification } = useNotification();
  const { createReport, loading, success } = useCreateReservationReport();
  const { fetchBookingDetail, bookingDetail, detailLoading } = useBooking();

  const handleSubmit = (data: IReservationReportData) => {
    if (uid) {
      createReport(data, uid);
    } else {
      showNotification(t('appAdmin.CreateReservationReportPage.reservationIdentificationError'), "error", 4000);
    }
  };

  useEffect(() => {
    if (uid) fetchBookingDetail(uid);
  }, [uid, fetchBookingDetail]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/my-consultation');
      }, 1500); 

      return () => clearTimeout(timer);
    }
  }, [success, navigate]);


  if (!uid) {
    return <div>{t('appAdmin.CreateReservationReportPage.reservationIdNotFoundError')}</div>
  }

  return (
    <PageContentLayout title={t('appAdmin.CreateReservationReportPage.title')}>
      <div className={styles['report-page-container']}>
        <CreateReservationReportForm onSubmit={handleSubmit} loading={loading} />

        {bookingDetail && (
           <section className={styles['reservation-info']}>
             <div className={styles['reservation-info__header']}>
               <h3 className={styles['reservation-info__title']}>
                 <AssignmentRoundedIcon fontSize="small" />
                 {t('appAdmin.ReservationReportDetails.consultationDetails')}
               </h3>
             </div>

             <div className={styles['reservation-info__grid']}>
               <div className={styles['reservation-info__item']}>
                 <span className={styles['reservation-info__label']}>{t('appAdmin.ReservationReportDetails.consultant')}</span>
                 <div className={styles['reservation-info__value']}>
                   <PersonOutlineRoundedIcon />
                   {bookingDetail.patient}
                 <button 
                   className={styles['reservation-info__view-profile']}
                   onClick={() => bookingDetail.patient_uid && navigate(`/${bookingDetail.patient_uid}/patient-profile`)}
                 >
                   {t('appAdmin.BookingDetailsContent.viewProfile')} ↗
                 </button>
                 </div>
               </div>

               <div className={styles['reservation-info__item']}>
                 <span className={styles['reservation-info__label']}>{t('appAdmin.ReservationReportDetails.reservationDate')}</span>
                 <div className={styles['reservation-info__value']}>
                   <CalendarTodayRoundedIcon />
                   {dayjs(bookingDetail.date_start).format('DD/MM/YYYY - HH:mm')}
                 </div>
               </div>

               <div className={styles['reservation-info__item']}>
                 <span className={styles['reservation-info__label']}>{t('appAdmin.BookingDetailsContent.modality')}</span>
                 <div className={styles['reservation-info__value']}>
                   {bookingDetail.type === 'virtual' ? <VideocamRoundedIcon /> : <HomeRoundedIcon />}
                   {bookingDetail.type === 'virtual' ? 'Virtual' : 'Presencial'}
                 </div>
               </div>
             </div>

             {bookingDetail.reserve_reason && (
               <div className={styles['reservation-info__reason-box']}>
                 <span className={styles['reservation-info__label']} style={{ marginBottom: '8px', display: 'block' }}>
                    {t('appAdmin.BookingDetailsContent.consultationReason')}
                 </span>
                 <p>{bookingDetail.reserve_reason}</p>
               </div>
             )}
           </section>
        )}
      </div>
    </PageContentLayout>
  );
};
