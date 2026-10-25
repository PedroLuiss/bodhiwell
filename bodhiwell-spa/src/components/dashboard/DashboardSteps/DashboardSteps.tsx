import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';

import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import PersonIcon from '@mui/icons-material/Person';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SearchIcon from '@mui/icons-material/Search';
import SpaRoundedIcon from '@mui/icons-material/SpaRounded';

import { useDashboardSteps, DashboardStep } from '../../../hooks/useDashboardSteps';
import styles from './DashboardSteps.module.scss';

interface DashboardStepsProps {
    type?: 'patient' | 'professional';
}

export const DashboardSteps: React.FC<DashboardStepsProps> = ({ type = 'professional' }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { steps, loading } = useDashboardSteps();

    if (loading) return null;
    if (steps.length === 0) return null;
    if (steps.every(s => s.status === 'completed')) return null;

    const handleAction = (step: DashboardStep) => {
        if (step.actionPath && step.status !== 'pending') {
            navigate(step.actionPath);
        }
    };

    const getStepIcon = (id: string, status: string) => {
        if (status === 'completed') return <CheckRoundedIcon sx={{ fontSize: 22 }} />;
        switch (id) {
            case 'complete_profile': return <PersonIcon sx={{ fontSize: 22 }} />;
            case 'admin_validation': return <VerifiedUserIcon sx={{ fontSize: 22 }} />;
            case 'add_availability': return <EventAvailableIcon sx={{ fontSize: 22 }} />;
            case 'search_professionals': return <SearchIcon sx={{ fontSize: 22 }} />;
            default: return <SpaRoundedIcon sx={{ fontSize: 22 }} />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return t('dashboard.steps.status.completed', 'Completado');
            case 'current': return t('dashboard.steps.status.inProgress', 'En espera');
            default: return t('dashboard.steps.status.pending', 'Próximamente');
        }
    };

    return (
        <section className={styles.journey}>
            <div className={styles.journey__head}>
                <span className={styles.journey__mark}>✦</span>
                <div className={styles.journey__text}>
                    <h2>{t('dashboard.steps.title')}</h2>
                    <p>{t('dashboard.steps.subtitle')}</p>
                </div>
            </div>

            <div className={classNames(styles.steps, {
                [styles['steps--patient']]: type === 'patient'
            })}>
                {steps.map((step) => {
                    const isCompleted = step.status === 'current' || step.status === 'completed';
                    return (
                        <article
                            key={step.id}
                            className={classNames(styles.step, {
                                [styles['step--highlight']]: isCompleted,
                                [styles['step--disabled']]: !isCompleted
                            })}
                            onClick={() => handleAction(step)}
                        >
                            <div className={styles.step__top}>
                                <div className={styles.step__ico}>
                                    {getStepIcon(step.id, step.status)}
                                </div>
                                <span className={classNames(styles.badge, {
                                    [styles['badge--done']]: isCompleted,
                                    [styles['badge--progress']]: step.status === 'current',
                                    [styles['badge--off']]: step.status === 'pending'
                                })}>
                                    {getStatusLabel(step.status)}
                                </span>
                            </div>

                            <h3 className={styles.step__title}>{step.label}</h3>

                            <button
                                className={classNames(styles['step__btn'], {
                                    [styles['step__btn--primary']]: isCompleted,
                                    [styles['step__btn--disabled']]: !isCompleted
                                })}
                                disabled={!isCompleted && step.status === 'pending'}
                            >
                                {isCompleted 
                                    ? t('dashboard.steps.action.view', 'Revisar') 
                                    : (step.actionLabel || t('dashboard.steps.action.complete', 'Comenzar'))
                                }
                                <span className={styles.step__arrow}>→</span>
                            </button>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};