import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './DashboardProfessional.module.scss';
import { useTranslation } from 'react-i18next';
import { DashboardSteps } from '../dashboard/DashboardSteps/DashboardSteps';
import { useGetReservations } from '../../hooks/useGetReservations';
import { useDashboardSteps } from '../../hooks/useDashboardSteps';
import { PendingReportToast } from '../ui/PendingReportToast/PendingReportToast';
import { UserStatusToast } from '../ui/UserStatusToast/UserStatusToast';
import { IConsultation } from '../../types';

import PaidIcon from '@mui/icons-material/Paid';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PieChartIcon from '@mui/icons-material/PieChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuthContext } from '../../context/AuthContext';
import Loading from "../ui/Loading/Loading";
import { formatAmount } from '../../utils';
import classNames from 'classnames';

export const DashboardProfessional: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { data, loading, error } = useDashboard();
  const { user } = useAuthContext();
  const isEnglish = i18n.language.startsWith('en');

  const { data: reservations, loading: loadingReservations } = useGetReservations();
  const { loading: loadingSteps } = useDashboardSteps();
  const [openAlert, setOpenAlert] = useState(false);
  const [pendingReservation, setPendingReservation] = useState<IConsultation | null>(null);

  const canGenerateReport = (dateString: string): boolean => {
    const reservationDate = new Date(dateString.replace(" ", "T"));
    const now = new Date();
    if (isNaN(reservationDate.getTime())) return false;
    return reservationDate.getTime() <= now.getTime();
  };

  useEffect(() => {
    if (!loadingReservations && reservations) {
      const pending = reservations.find(item =>
        !item.isConsulted &&
        item.status === 'CONFIRMED' &&
        canGenerateReport(item.date_start)
      );

      if (pending) {
        setPendingReservation(pending);
        setOpenAlert(true);
      }
    }
  }, [loadingReservations, reservations]);

  const isLoadingOverall = loading || loadingReservations || loadingSteps;
  if (isLoadingOverall) return <Loading fullscreen text={t('appAdmin.DashboardPatient.loading')} />;
  if (error) return <p>{t('appAdmin.DashboardPatient.error')}</p>;

  return (
    <div className={styles.dashboard}>

      <UserStatusToast />

      <DashboardSteps />

      <div className={styles['section-head']}>
        <h3>{t('appAdmin.DashboardPatient.dashboardTitle', 'Panel de Control')}</h3>
        <p>{t('appAdmin.DashboardPatient.welcome', 'Bienvenid@')} {user?.first_name} {user?.last_name}.</p>
      </div>

      <section className={styles['metrics']}>
        <article className={`${styles['metric']} ${styles['metric--income']}`}>
          <div className={styles['metric__icon-box']}>
            <PaidIcon sx={{ fontSize: 24 }} />
          </div>
          <div className={styles['metric__content']}>
            <span className={styles['metric__label']}>{t('appAdmin.DashboardPatient.monthlyIncome')}</span>
            <div className={styles['metric__value']}>
              {formatAmount(data?.income.value, { symbol: "$", decimals: 2, currency: data?.income.currency || "UYU" })}
            </div>
            <span className={styles['metric__note']}>
              {isEnglish ? data?.income.comparisonEn : data?.income.comparison}
            </span>
          </div>
        </article>

        <article className={`${styles['metric']} ${styles['metric--appointments']}`}>
          <div className={styles['metric__icon-box']}>
            <CalendarMonthIcon sx={{ fontSize: 24 }} />
          </div>
          <div className={styles['metric__content']}>
            <span className={styles['metric__label']}>{t('appAdmin.DashboardPatient.totalAppointments')}</span>
            <div className={styles['metric__value']}>{data?.appointments.total}</div>
            <span className={styles['metric__note']}>
              {data?.appointments.pendingToday} {t('appAdmin.DashboardPatient.pendingToday')}
            </span>
          </div>
        </article>
      </section>

      <div className={styles['dashboard__grid']}>

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
                    <h4 className={styles['appointment-item__patient']}>{apt.patientName}</h4>
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
                    {t('appAdmin.DashboardPatient.noUpcomingAppointmentsSubtitle', 'Por el momento no tienes citas programadas. Cuando un paciente realice una reserva, aparecerá aquí.')}
                </p>
              </div>
            )}
          </div>
        </section>

        <aside className={styles['dashboard__sidebar']}>

          <section className={styles['widget-card']}>
            <header className={styles['widget-card__header']}>
              <div className={`${styles['widget-card__icon-box']} ${styles['widget-card__icon-box--green']}`}>
                <PieChartIcon sx={{ fontSize: 22 }} />
              </div>
              <div className={styles['widget-card__title-group']}>
                <span className={styles['widget-card__eyebrow']}>{t('appAdmin.DashboardPatient.statistics')}</span>
                <h3 className={styles['widget-card__title']}>{t('appAdmin.DashboardPatient.occupancyRate')}</h3>
              </div>
            </header>

            <div className={styles['occupancy']}>
              <div 
                className={styles['occupancy__chart']}
                style={{ '--occupancy-rate': `${data?.occupation.rate ?? 0}%` } as React.CSSProperties}
              >
                <div className={styles['occupancy__center']}>
                  <span className={styles['occupancy__value']}>{data?.occupation.rate}%</span>
                </div>
              </div>
              <div className={styles['occupancy__legend']}>
                <div className={styles['legend-item']}>
                  <span className={classNames(styles['legend-item__dot'], styles['legend-item__dot--occupied'])}></span>
                  <span className={styles['legend-item__text']}>{data?.occupation.details.occupied} {t('appAdmin.DashboardPatient.busy')}</span>
                </div>
                <div className={styles['legend-item']}>
                  <span className={classNames(styles['legend-item__dot'], styles['legend-item__dot--free'])}></span>
                  <span className={styles['legend-item__text']}>{data?.occupation.details.free} {t('appAdmin.DashboardPatient.available')}</span>
                </div>
              </div>
            </div>
          </section>

          <section className={classNames(styles['widget-card'], styles['widget-card--dark'])}>
            <header className={styles['widget-card__header']}>
              <div className={styles['widget-card__icon-box']}>
                <AccountBalanceWalletIcon sx={{ fontSize: 22 }} />
              </div>
              <div className={styles['widget-card__title-group']}>
                <span className={styles['widget-card__eyebrow']}>{t('appAdmin.DashboardPatient.finances')}</span>
                <h3 className={styles['widget-card__title']}>{t('appAdmin.DashboardPatient.myWallet')}</h3>
              </div>
            </header>

            <div className={styles['wallet-preview']}>
              <span className={styles['wallet-preview__label']}>{t('appAdmin.DashboardPatient.AvailableBalance')}</span>
              <h2 className={styles['wallet-preview__balance']}>
                {formatAmount(data?.wallet.balance, { symbol: "$", decimals: 2, currency: data?.wallet.currency || "UYU" })}
              </h2>
              <Link to="/wallet" className={styles['wallet-preview__btn']}>
                {t('appAdmin.DashboardPatient.manageFunds')} ↗
              </Link>
            </div>
          </section>

        </aside>
      </div>

      <PendingReportToast open={openAlert} onClose={() => setOpenAlert(false)} reservation={pendingReservation} />
    </div>
  );
};