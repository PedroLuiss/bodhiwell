import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from './FaqNext.module.scss';

const FaqNext: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <section className={styles['faq-next']}>
            <div >
                <p className={styles['faq-next__eyebrow']}>{t('faqs.next.eyebrow', 'Siguiente paso')}</p>
                <h2 className={styles['faq-next__title']}>{t('faqs.next.title', '¿Cuál es tu próximo paso?')}</h2>
                <p className={styles['faq-next__copy']}>
                    {t('faqs.next.copy', 'Si ya resolviste tus dudas, podés explorar los profesionales disponibles en Bodhiwell y seguir avanzando en el acompañamiento que estás buscando.')}
                </p>
            </div>
            <div className={styles['faq-next__actions']}>
                <button
                    className={styles['faq-next__btn']}
                    onClick={() => navigate('/professionals')}
                >
                    {t('faqs.next.cta', 'Conocer profesionales')}
                </button>
            </div>
        </section>
    );
};

export default FaqNext;
