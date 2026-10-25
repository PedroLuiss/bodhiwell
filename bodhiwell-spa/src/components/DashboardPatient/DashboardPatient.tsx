import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./DashboardPatient.module.scss";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useAuthContext } from '../../context/AuthContext';
import HomeIcon from '@mui/icons-material/Home';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import { usePatientDashboard } from '../../hooks/usePatientDashboard';
import { Link } from 'react-router-dom';
import Loading from "../ui/Loading/Loading";
import { DashboardSteps } from '../dashboard/DashboardSteps/DashboardSteps';

export const DashboardPatient: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const { data, loading, error } = usePatientDashboard();

  if (loading) {
    return <Loading fullscreen text={t('appAdmin.DashboardPatient.loading')} />;
  }

  if (error) {
    return <div>{t('appAdmin.DashboardPatient.error')} {error}</div>;
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles['dashboard__header']}>
        <h1 className={styles['dashboard__title']}> <HomeIcon /> {t('appAdmin.DashboardPatient.dashboardTitle')}</h1>
        <p className={styles['dashboard__subtitle']}>
          {t('appAdmin.DashboardPatient.welcome')} {user?.first_name} {user?.last_name}.
        </p>
      </header>

      <DashboardSteps type="patient" />

      <div className={styles['dashboard__mainGrid']}>
        <section className={styles['widget-card']}>
          <header className={styles['widget-card__header']}>
            <div className={styles['widget-card__icon-box']}>
              <AccessTimeFilledIcon sx={{ fontSize: 22 }} />
            </div>
            <div className={styles['widget-card__title-group']}>
              <span className={styles['widget-card__eyebrow']}>{t('appAdmin.DashboardPatient.schedule')}</span>
              <h3 className={styles['widget-card__title']}>
                {t('appAdmin.DashboardPatient.upcomingAppointments')}
              </h3>
            </div>
          </header>

          <div className={styles['agenda-list']}>
            {data?.upcomingBookings && data.upcomingBookings.length > 0 ? (
              data.upcomingBookings.map((apt) => (
                <article key={apt.uid} className={styles['appointment-item']}>
                  <div className={styles['appointment-item__time-box']}>
                    <span className={styles['appointment-item__date']}>{apt.reservationTime.split(' ')[0]}</span>
                    <span className={styles['appointment-item__hour']}>{apt.reservationTime.split(' ')[1]}</span>
                  </div>

                  <div className={styles['appointment-item__info']}>
                    <h4 className={styles['appointment-item__professional']}>{apt.professionalName}</h4>
                    <p className={styles['appointment-item__reason']}>{apt.reason}</p>
                  </div>

                  <div className={styles['appointment-item__action']}>
                    <Link
                      to={`/professionals/booking-details/${apt.uid}`}
                      className={styles['appointment-item__link']}
                      title={t('appAdmin.DashboardPatient.details')}
                    >
                      <VisibilityIcon sx={{ fontSize: 18 }} />
                    </Link>
                  </div>
                </article>
              ))
            ) : (
                <div className={styles['agenda-list--empty']}>
                    <div className={styles['agenda-list--empty__icon-box']}>
                        <CalendarMonthIcon sx={{ fontSize: 32 }} />
                    </div>
                    <h4 className={styles['agenda-list--empty__title']}>
                        {t('appAdmin.DashboardPatient.noUpcomingAppointmentsTitle', 'Sin citas próximas')}
                    </h4>
                    <p className={styles['agenda-list--empty__text']}>
                        {t('appAdmin.DashboardPatient.noUpcomingAppointmentsSubtitlePatient', 'Por el momento no tienes citas programadas. Explora nuestros profesionales y comienza tu camino hacia el bienestar.')}
                    </p>
                </div>
            )}
          </div>
        </section>

        <aside className={styles['dashboard__sidebar']}>
          <div className={`${styles['kpiCard']} ${styles['kpiCard--grey']}`}>
            <div className={styles['kpiCard__iconContainer']}>
              <CalendarMonthIcon fontSize="large" />
            </div>
            <div className={styles['kpiCard__content']}>
              <span className={styles['kpiCard__label']}>{t('appAdmin.DashboardPatient.totalAppointments')}</span>
              <h3 className={styles['kpiCard__value']}>{data?.appointments.total}</h3>
              <span className={styles['kpiCard__subtext']}> {t('appAdmin.DashboardPatient.pendingToday')} {data?.appointments.pendingToday}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};