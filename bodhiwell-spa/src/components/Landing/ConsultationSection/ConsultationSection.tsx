import styles from './ConsultationSection.module.scss';

import onlineImage from '../../../assets/images/Landing/online-consultation.jpg';
import inPersonImage from '../../../assets/images/Landing/in-person-consultation.jpg';

export const ConsultationSection = () => {
  return (
    <section className={styles['flexibility-section']}>
      <div className={styles['flexibility-section__container']}>
        <div className={styles['flexibility-section__header']}>
          <p className={styles['flexibility-section__eyebrow']}>FLEXIBILIDAD</p>
          <h2 className={styles['flexibility-section__heading']}>
            CONSULTAS PRESENCIALES Y ONLINE.
          </h2>
          <p className={styles['flexibility-section__description']}>
            Porque el cuidado también necesita flexibilidad. La red de profesionales ofrece atención presencial u online según el área, la especialidad y tu necesidad. Queremos que puedas acceder estés donde estés.
          </p>
        </div>

        <div className={styles['flexibility-section__images-wrapper']}>
          <img 
            src={onlineImage} 
            alt="Consulta online" 
            className={styles['flexibility-section__image']} 
          />
          <img 
            src={inPersonImage} 
            alt="Consulta presencial" 
            className={styles['flexibility-section__image']} 
          />
        </div>
      </div>
    </section>
  );
};
