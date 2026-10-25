import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from './StepsProcessSection.module.scss';
import { steps } from '../../../config/Landing/StepsProcessSection';

export const StepsProcessSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className={styles['how-it-works']} id="how-it-works">
      <div className={styles['how-it-works__grid']}>
        
        <div className={styles['how-it-works__intro']}>
          <span className={styles['how-it-works__eyebrow']}>
            {t('landing.stepsProcessSection.eyebrow', 'PROCESO')}
          </span>
          <h2 className={styles['how-it-works__title']}>
            {t('landing.stepsProcessSection.title', '¿Cómo funciona?')}
          </h2>
          <p className={styles['how-it-works__description']}>
            {t('landing.stepsProcessSection.subtitle', 'En Bodhiwell queremos que conectarte con profesionales sea')} <strong>{t('landing.stepsProcessSection.subtitleBold', 'simple, seguro y claro.')}</strong>
          </p>
        </div>

        <div className={styles['how-it-works__steps']}>
          {steps.map((step) => (
            <div key={step.number} className={styles['how-it-works__step']}>
              <div className={styles['how-it-works__step-number']}>{t(step.number)}</div>
              <div className={styles['how-it-works__step-content']}>
                <h3 className={styles['how-it-works__step-title']}>{t(step.title)}</h3>
                <p className={styles['how-it-works__step-text']}>{t(step.text)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className={styles['how-it-works__footer-copy']}>
        {t('landing.stepsProcessSection.footerCopy', 'Tu cuenta registra tu historial de consultas para que cualquier profesional que te atienda pueda acompañarte mejor.')}
      </p>

      <div className={styles['how-it-works__actions']}>
        <Link to="/register" className={styles['how-it-works__btn-outline']}>
          {t('landing.stepsProcessSection.ctaRegister', 'Registrarme ahora')}
        </Link>
        <Link to="/faqs" className={styles['how-it-works__btn-primary']}>
          {t('landing.stepsProcessSection.ctaLearnMore', 'Conocer más')}
        </Link>
      </div>
    </section>
  );
};