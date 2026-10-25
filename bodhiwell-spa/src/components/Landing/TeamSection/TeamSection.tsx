import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from './TeamSection.module.scss';

export const TeamSection: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section className={styles['team-section']} id="equipo">
            <div className={styles['team-section__card']}>
                <p className={styles['team-section__eyebrow']}>
                    {t('landing.team.eyebrow', 'SINERGIA')}
                </p>

                <h2 className={styles['team-section__title']} data-no-animate>
                    <span className={styles['team-section__title-line']}>
                        {t('landing.team.title1', '¿Te gustaría ser parte')}
                    </span>
                    <span className={styles['team-section__title-line']}>
                        {t('landing.team.title2', 'del equipo?')}
                    </span>
                </h2>

                <p className={styles['team-section__copy']}>
                    {t('landing.team.description', 'Sumate a una comunidad que integra saberes y acompaña desde lo humano. Desde la medicina convencional hasta la complementaria y ancestral, trabajamos juntos para brindar una atención más consciente y colaborativa.')}
                </p>

                <div className={styles['team-section__action']}>
                    <Link to="/contact" className={styles['team-section__btn']}>
                        {t('landing.team.cta', 'Quiero ser parte del equipo')}
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default TeamSection;