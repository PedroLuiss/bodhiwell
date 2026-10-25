import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './FaqHero.module.scss';
import faqHeroImg from '../../../../assets/images/faqs/faq-hero-apoyo.jpg';

const FaqHero: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section className={styles['faq-hero']}>
            <article className={styles['faq-hero__card']}>
                <p className={styles['faq-hero__eyebrow']}>
                    {t('faqs.hero.eyebrow', 'Preguntas frecuentes')}
                </p>
                <h1 className={styles['faq-hero__title']}>
                    {t('faqs.hero.title', 'Respuestas simples para orientarte mejor')}
                </h1>
                <p className={styles['faq-hero__copy']}>
                    {t('faqs.hero.copy', 'Encontrá las dudas más comunes sobre Bodhiwell y su funcionamiento en un formato claro, cercano y fácil de recorrer.')}
                </p>
                <div className={styles['faq-hero__actions']}>
                    <a href="#faq-sobre" className={styles['faq-hero__btn']}>
                        {t('faqs.hero.cta', 'Explorar preguntas')}
                    </a>
                </div>
            </article>
            <div className={styles['faq-hero__media']}>
                <img src={faqHeroImg} alt="Acompañamiento" />
            </div>
        </section>
    );
};

export default FaqHero;
