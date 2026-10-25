import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './FaqsPage.module.scss';

import { useFaqs } from './hooks/useFaqs';
import FaqHero from '../../components/Landing/FAQsPage/FaqHero/FaqHero';
import FaqLayout from '../../components/Landing/FAQsPage/FaqLayout/FaqLayout';
import FaqNext from '../../components/Landing/FAQsPage/FaqNext/FaqNext';
import Loading from '../../components/ui/Loading/Loading';

const FaqsPage: React.FC = () => {
    const { t } = useTranslation();
    const { data: faqGroups, loading, error } = useFaqs();

    if (loading) {
        return (
            <div className={styles['faq-page']}>
                <div className={styles['faq-page__container']}>
                    <FaqHero />
                    <Loading fullscreen text={t('faqs.loading', 'Cargando preguntas frecuentes...')} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles['faq-page']}>
                <div className={styles['faq-page__container']}>
                    <FaqHero />
                    <div className={styles['faq-page__error']}>{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles['faq-page']}>
            <div className={styles['faq-page__container']}>
                <FaqHero />
                <FaqLayout faqGroups={faqGroups} />
                <FaqNext />
            </div>
        </div>
    );
};


export default FaqsPage;