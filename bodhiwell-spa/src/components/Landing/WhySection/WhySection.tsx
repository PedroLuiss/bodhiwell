import styles from './WhySection.module.scss';
import { useTranslation } from 'react-i18next';

export const WhySection = () => {
  const { t } = useTranslation();

  return (
    <section className={styles['why-section']}>
      <div className={styles['why-section__container']}>
        <div className={styles['why-section__content']}>
          <h2 className={styles['why-section__title']}>
            {/* Para quienes sienten<br/>que tiene que haber<br/>otra forma */}
            {t('landing.whySection.title')}
          </h2>
          <p className={`${styles['why-section__text']} WhySection_why-section__text-default-v1`}>
            {/* Un espacio para repensar cómo cuidarnos. Este es un espacio para quienes buscan un nuevo camino en su salud. Si sentís que la medicina convencional no fue suficiente, si querés tomar un rol más activo, si valorás el respeto entre saberes y el acompañamiento humano... acá podés empezar algo distinto.<br/><br/> */}
            {t('landing.whySection.text')}
            <br />
            <br />
            {/* Creemos en sumar, no excluir. En tejer nuevas formas de acompañarnos. Este lugar crece con cada persona que decide acercarse. */}
            {t('landing.whySection.text2')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhySection;
