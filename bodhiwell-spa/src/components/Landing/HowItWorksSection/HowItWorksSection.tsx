import styles from './HowItWorksSection.module.scss';
import { stepsData } from '../../../config/Landing/HowItWorksSection';
export const HowItWorksSection = () => {
  return (
    <section className={styles['how-it-works-section']}>
      <div className={styles['how-it-works-section__container']}>
        <div className={styles['how-it-works-section__header']}>
          <p className={styles['how-it-works-section__eyebrow']}>SIMPLEZA</p>
          <h2 className={styles['how-it-works-section__heading']}>¿CÓMO FUNCIONA?</h2>
          <p className={styles['how-it-works-section__description']}>
            En Bodhiwell queremos que conectarte con profesionales sea simple, seguro y claro.
          </p>
        </div>

        <ul className={styles['how-it-works-section__steps-list']}>
          {stepsData.map((step, index) => (
            <li key={index} className={styles['how-it-works-section__step']}>
              <div className={styles['how-it-works-section__step-icon-wrapper']}>
                {step.icon}
              </div>
              <div className={styles['how-it-works-section__step-content']}>
                <h3 className={styles['how-it-works-section__step-title']}>{step.title}</h3>
                <p className={styles['how-it-works-section__step-description']}>{step.description}</p>
              </div>
            </li>
          ))}
        </ul>
        
        <p className={styles['how-it-works-section__info-note']}>
          👉 Tu cuenta registra tu historial de consultas para que cualquier profesional que te atienda pueda acompañarte mejor.
        </p>

        <div className={styles['how-it-works-section__actions']}>
          <button className={`${styles['how-it-works-section__button']} ${styles['how-it-works-section__button--primary']}`}>
            Registrarme ahora
          </button>
          <button className={`${styles['how-it-works-section__button']} ${styles['how-it-works-section__button--secondary']}`}>
            Ver cómo funciona en detalle
          </button>
        </div>

      </div>
    </section>
  );
};
