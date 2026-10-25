import { useTranslation } from 'react-i18next';
import styles from './FaqLayout.module.scss';
import { FaqLayoutProps } from './types';


const FaqLayout = ({ faqGroups }: FaqLayoutProps) => {
    const { t } = useTranslation();

    return (
        <div className={styles['faq-layout']}>
            <aside className={styles['faq-nav']}>
                <p className={styles['faq-nav__title']}>{t('faqs.nav.title', 'Categorías')}</p>
                {faqGroups.map(group => (
                    <a key={group.id} href={`#${group.id}`} className={styles['faq-nav__link']}>
                        {group.title}
                    </a>
                ))}
            </aside>

            <div className={styles['faq-groups']}>
                {faqGroups.map(group => (
                    <section key={group.id} id={group.id} className={styles['faq-group']}>
                        <h2 className={styles['faq-group__title']}>{group.title}</h2>
                        <p className={styles['faq-group__intro']}>{group.intro}</p>

                        <div className={styles['faq-list']}>
                            {group.items.map((item, idx) => (
                                <details key={idx} className={styles['faq-item']}>
                                    <summary className={styles['faq-item__header']}>
                                        <span className={styles['faq-item__question']}>{item.q}</span>
                                        <span className={styles['faq-item__icon']}>+</span>
                                    </summary>
                                    <div className={styles['faq-item__answer']}>
                                        <p>{item.a}</p>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
};

export default FaqLayout;
