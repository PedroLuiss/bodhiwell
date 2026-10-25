import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ManifestoSection.module.scss';

import manifestoImage from '../../../assets/images/Landing/manifiesto.jpg';

export const ManifestoSection: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section className={styles['manifesto']} id="comunidad">
            <div className={styles['manifesto__content']}>
                
                <div className={styles['manifesto__media']}>
                    <img 
                        src={manifestoImage} 
                        alt={t('landing.manifesto.imageAlt', 'Persona contemplando el horizonte')} 
                        className={styles['manifesto__bg']} 
                    />
                    <div className={styles['manifesto__overlay']} />
                </div>

                <div className={styles['manifesto__copy']}>
                    <h2 className={styles['manifesto__title']}>
                        {t('landing.manifesto.title', 'Para quienes sienten que tiene que haber otra forma')}
                    </h2>
                    
                    <p className={styles['manifesto__text']}>
                        {t('landing.manifesto.para1', 'Un espacio para repensar cómo cuidarnos. Este es un espacio para quienes buscan un nuevo camino en su salud. Si sentís que la medicina convencional no fue suficiente, si querés tomar un rol más activo, si valorás el respeto entre saberes y el acompañamiento humano... acá podés empezar algo distinto.')}
                    </p>
                    
                    <p className={styles['manifesto__text']}>
                        {t('landing.manifesto.para2', 'Creemos en sumar, no excluir. En tejer nuevas formas de acompañarnos. Este lugar crece con cada persona que decide acercarse.')}
                    </p>
                </div>

            </div>
        </section>
    );
};