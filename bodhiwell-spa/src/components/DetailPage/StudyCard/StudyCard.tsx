import React from 'react';
import styles from './StudyCard.module.scss';
import { useStudyCard } from './hooks/useStudyCard';
import { StudyCardProps } from './types';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';

export const StudyCard: React.FC<StudyCardProps> = ({ study, onViewCertificate }) => {
    const {
        t,
        formattedDateRange,
        getBadgeClass,
        handleCertificateClick
    } = useStudyCard(study, onViewCertificate, styles);

    return (
        <article className={styles['study-card']}>
            <div className={styles['study-card__body']}>
                <h4 className={styles['study-card__title']}>{study.name}</h4>
                <p className={styles['study-card__institute']}>{study.institute}</p>
                <div className={styles['study-card__date-wrapper']}>
                    <span className={styles['study-card__date-dot']}></span>
                    <span className={styles['study-card__date']}>{formattedDateRange}</span>
                </div>

                {study.type && (
                    <div className={styles['study-card__type-wrapper']}>
                        <SchoolRoundedIcon className={styles['study-card__type-icon']} />
                        <span className={styles['study-card__type-label']}>
                            {study.type.label || study.type.code}
                        </span>
                    </div>
                )}
            </div>

            <div className={styles['study-card__footer']}>
                {study.specialty && (
                    <span className={getBadgeClass(study.specialty.dimension?.name.toLowerCase())}>
                        {study.specialty.name}
                    </span>
                )}

                {study.url_certificate && (
                    <button
                        type="button"
                        className={styles['study-card__action']}
                        onClick={handleCertificateClick}
                    >
                        {t('landing.TabsComponent.viewCertificate', 'Ver Certificado')}
                        <span className={styles['study-card__arrow']}>→</span>
                    </button>
                )}
            </div>
        </article>
    );
};