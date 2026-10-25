import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./ReservationReportDetails.module.scss";
import { IReservationReport } from "../../types/Reservations/ReservationReport.type";
import TruncatedHtmlContent from "../ui/TruncatedHtmlContent/TruncatedHtmlContent";
import { formatDate } from "../../utils/formatDate";
import PrintIcon from "@mui/icons-material/Print";
import { Link } from "react-router-dom";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ButtonUi } from "../ui/ButtonUi/ButtonUi";

interface ReservationReportDetailsProps {
  report: IReservationReport;
}

const ReservationReportDetails: React.FC<ReservationReportDetailsProps> = ({
  report,
}) => {
  const { t } = useTranslation();
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles['report']}>
      <header className={styles['report__header']}>
        <div className={styles['report__actions']}>
            <ButtonUi
                variant="outlined"
                onClick={handlePrint}
                startIcon={<PrintIcon />}
                className={styles['report__print-btn']}
            >
                {t('appAdmin.ReservationReportDetails.printConsultation')}
            </ButtonUi>
        </div>
      </header>

      <main className={styles['report__card']}>
        <div className={styles['report__grid']}>
          <div className={styles['report__item']}>
            <label className={styles['report__label']}>{t('appAdmin.ReservationReportDetails.consultant')}</label>
            <p className={styles['report__value']}>{report.patient_name}</p>
          </div>
          
          <div className={styles['report__item']}>
            <label className={styles['report__label']}>{t('appAdmin.ReservationReportDetails.professional')}</label>
            <p className={styles['report__value']}>{report.professional_name}</p>
          </div>

          <div className={styles['report__item']}>
            <label className={styles['report__label']}>{t('appAdmin.ReservationReportDetails.reservationDate')}</label>
            <div className={styles['report__date-wrapper']}>
              <p className={styles['report__value']}>{formatDate(report.reservation_date)}</p>
              <Link 
                to={`/professionals/booking-details/${report.uid_booking}`} 
                className={styles['report__link']}
              >
                <VisibilityIcon sx={{ fontSize: 14 }} />
                {t('appAdmin.ReservationReportDetails.viewReservation')}
              </Link>
            </div>
          </div>

          <div className={`${styles['report__item']} ${styles['report__item--full']}`}>
            <label className={styles['report__label']}>{t('appAdmin.ReservationReportDetails.consultationReason')}</label>
            <p className={styles['report__value']}>{report.reason}</p>
          </div>
        </div>

        <div className={styles['report__divider']} />

        <section className={styles['report__section']}>
          <label className={styles['report__label']}>{t('appAdmin.ReservationReportDetails.observations')}</label>
          <div className={styles['report__observations-box']}>
            <TruncatedHtmlContent
              htmlContent={report.observations}
              maxLength={2000}
            />
          </div>
        </section>

        {report.additionalNotes && (
          <section className={styles['report__section']}>
            <label className={styles['report__label']}>{t('appAdmin.ReservationReportDetails.additionalNotes')}</label>
            <div className={styles['report__notes-box']}>
              <p>{report.additionalNotes}</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ReservationReportDetails;