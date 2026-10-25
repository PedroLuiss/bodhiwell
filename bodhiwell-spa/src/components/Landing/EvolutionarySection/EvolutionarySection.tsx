import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './EvolutionarySection.module.scss';

export const EvolutionarySection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className={styles['evolutionary']} id="about">
      <div className={styles['evolutionary__container']}>
        
        <h2 className={styles['evolutionary__title']} data-no-animate>
          <span>{t('landing.evolutionary.title1', 'Medicina')}</span>

          <span>{t('landing.evolutionary.title2', 'evolutiva')}</span>
        </h2>

        <h3 className={styles['evolutionary__subtitle']}>
          {t('landing.evolutionary.kicker', 'Una nueva forma de comprender la salud')}
        </h3>

        <div className={styles['evolutionary__content']}>
          <p className={styles['evolutionary__text']}>
            {t('landing.evolutionary.para1', 'En un mundo donde la salud suele fragmentarse entre diagnósticos, tratamientos y especialidades, muchas personas se sienten solas, desorientadas o desconectadas de su propio proceso de bienestar.')}
          </p>
          
          <p className={styles['evolutionary__text']}>
            {t('landing.evolutionary.para2', 'Bodhiwell nace para ofrecer otra posibilidad: ser un puente entre vos y una red de profesionales que trabajan con una mirada integrativa, respetuosa y consciente.')}
          </p>
          <p className={styles['evolutionary__emphasis']}>
            {t('landing.evolutionary.emphasis', 'No se trata solo de encontrar bienestar. Se trata de evolucionar en la forma de comprender, cuidar y habitar tu salud.')}
          </p>

          <p className={styles['evolutionary__text']}>
            {t('landing.evolutionary.para3', 'Facilitamos encuentros, herramientas y orientación para que puedas recorrer ese camino con mayor claridad.')}
          </p>
        </div>

      </div>
    </section>
  );
};