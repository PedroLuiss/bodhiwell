
import styles from './AlternativeApproachSection.module.scss';
import sectionImage from '../../../assets/images/Landing/image-dama_2.png'; 

export const AlternativeApproachSection = () => {
  return (
    <section
      className={styles['path-section']}
      style={{ backgroundImage: `url(${sectionImage})` }}
    >
      <div className={styles['path-section__content']}>
        <h2 className={styles['path-section__heading']}>
          PARA QUIENES SIENTEN QUE TIENE QUE HABER OTRA FORMA
        </h2>
        <p className={styles['path-section__text']}>
          Un espacio para repensar cómo cuidarnos. Este es un espacio para
          quienes buscan un nuevo camino en su salud. Si sentís que la
          medicina convencional no fue suficiente, si querés tomar un rol más
          activo, si valorás el respeto entre saberes y el acompañamiento
          humano... acá podés empezar algo distinto.
        </p>
        <p className={styles['path-section__text']}>
          Creemos en sumar, no excluir. En tejer nuevas formas de
          acompañarnos. Este lugar crece con cada persona que decide
          acercarse.
        </p>
      </div>
    </section>
  );
};
