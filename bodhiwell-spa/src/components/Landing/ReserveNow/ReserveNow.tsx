import React from 'react';
import styles from './ReserveNow.module.scss';
import cta1 from '../../../assets/images/Landing/consult_presencial.jpg';
import cta2 from '../../../assets/images/Landing/consult_online.jpg';
import { useTranslation } from 'react-i18next';

export const ReserveNow: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section className={styles['consultas']} id="consultas">
            <div className={styles['consultas__wrap']}>
                
                <header className={styles['consultas__head']}>
                    <p className={styles['consultas__eyebrow']}>
                        {t("landing.reserveNow.flexibility", "MODALIDAD DE ATENCIÓN")}
                    </p>

                    <h2 className={styles['consultas__title']}>
                        {t("landing.reserveNow.title", "Consultas presenciales y online")}
                    </h2>

                    <p className={styles['consultas__text']}>
                        {t("landing.reserveNow.text", "El cuidado también necesita flexibilidad. Nuestra red de profesionales ofrece consultas presenciales u online según el área, la especialidad y tu necesidad. Para que puedas acceder al acompañamiento que buscás, estés donde estés.")}
                    </p>
                </header>

                <div className={styles['consultas__images']}>
                    <figure className={styles['consultas__image-container']}>
                        <img 
                            src={cta1} 
                            alt={t("landing.reserveNow.presentialAlt", "Consulta presencial")} 
                            className={styles['consultas__img']}
                        />
                    </figure>

                    <figure className={styles['consultas__image-container']}>
                        <img 
                            src={cta2} 
                            alt={t("landing.reserveNow.onlineAlt", "Consulta online")} 
                            className={styles['consultas__img']}
                        />
                    </figure>
                </div>

            </div>
        </section>
    );
};

export default ReserveNow;