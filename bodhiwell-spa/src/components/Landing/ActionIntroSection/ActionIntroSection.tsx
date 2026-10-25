import React from 'react';
import styles from './ActionIntroSection.module.scss';
import { useTranslation } from 'react-i18next';

export const  ActionIntroSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className={styles['action-intro']}>
      <div className={styles['action-intro__container']}>
        <span className={styles['action-intro__eyebrow']}>{t('landing.actionIntro.eyebrow', 'Acción')}</span>
        <h2 className={styles['action-intro__title']} data-no-animate>
          <span className={styles['action-intro__title-line']}>{t('landing.actionIntro.title1', 'Empezá hoy a cuidar tu salud')}</span>
          <span className={styles['action-intro__title-line']}>{t('landing.actionIntro.title2', 'de una forma distinta')}</span>
        </h2>
        <p className={styles['action-intro__copy']}>
          {t('landing.actionIntro.copy', 'Explorá profesionales, descubrí contenidos o simplemente empezá por una primera conversación. Este es un lugar en construcción constante, como cada proceso de bienestar.')}
        </p>
      </div>
    </section>
  );
};