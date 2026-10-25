
import styles from './JoinAsProfessional.module.scss';

export const JoinAsProfessionalSection = () => {
  return (
    <section className={styles['join-as-professional']}>
      <div className={styles['join-as-professional__container']}>
        <div className={styles['join-as-professional__group']}>
          <p className={styles['join-as-professional__eyebrow']}>SINERGIA</p>
          <h2 className={styles['join-as-professional__heading']}>
            ¿QUERÉS FORMAR PARTE COMO PROFESIONAL?
          </h2>
          <p className={styles['join-as-professional__text']}>
            Sumate a una comunidad que integra saberes y acompaña desde lo humano.
            Desde la medicina convencional hasta la complementaria y ancestral,
            trabajamos juntos para brindar una atención más consciente y colaborativa.
          </p>
          <button className={styles['join-as-professional__button']}>
            Ver cómo funciona en detalle
          </button>
        </div>

        <div className={styles['join-as-professional__group-botom']}>
          <h2 className={styles['join-as-professional__group-botom__heading']}>
            EMPEZÁ HOY A CUIDAR TU SALUD DE UNA FORMA DISTINTA
          </h2>
          <p className={styles['join-as-professional__group-botom__text']}>
            Explorá profesionales, descubrí contenidos o simplemente empezá por
            una primera conversación. Este es un lugar en construcción constante,
            como cada proceso de bienestar.
          </p>
        </div>
      </div>
    </section>
  );
};
