import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './PrivacyPolicyPage.module.scss';
import SecurityIcon from '@mui/icons-material/Security';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import GavelIcon from '@mui/icons-material/Gavel';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ShareIcon from '@mui/icons-material/Share';
import PanToolIcon from '@mui/icons-material/PanTool';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PaymentIcon from '@mui/icons-material/Payment';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import UpdateIcon from '@mui/icons-material/Update';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const PrivacyPolicyPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      let current = '';
      
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        if (window.scrollY >= (sectionTop - 150)) {
          current = section.getAttribute('id') || '';
        }
      });
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100, 
        behavior: 'smooth'
      });
    }
  };

  const navItems = [
    { id: 'commitment', label: t('landing.PrivacyPolicyPage.navItems.commitment') },
    { id: 'data-collection', label: t('landing.PrivacyPolicyPage.navItems.dataCollection') },
    { id: 'purpose', label: t('landing.PrivacyPolicyPage.navItems.purpose') },
    { id: 'security', label: t('landing.PrivacyPolicyPage.navItems.security') },
    { id: 'sharing', label: t('landing.PrivacyPolicyPage.navItems.sharing') },
    { id: 'rights', label: t('landing.PrivacyPolicyPage.navItems.rights') },
    { id: 'retention', label: t('landing.PrivacyPolicyPage.navItems.retention') },
    { id: 'payments', label: t('landing.PrivacyPolicyPage.navItems.payments') },
    { id: 'subscriptions', label: t('landing.PrivacyPolicyPage.navItems.subscriptions') },
  ];

  return (
    <div className={styles.privacy}>
      
      <div className={styles['privacy__header']}>
        <div className="container">
          <h1 className={styles['privacy__title']}>{t('landing.PrivacyPolicyPage.title')}</h1>
          <p className={styles['privacy__subtitle']}>
            {t('landing.PrivacyPolicyPage.subtitle')}
          </p>
          <span className={styles['privacy__last-update']}>
            {t('landing.PrivacyPolicyPage.lastUpdate')}: {new Date().toLocaleDateString(t('landing.PrivacyPolicyPage.locale') === 'en' ? 'en-US' : 'es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      <div className={`${styles['privacy__container']} container`}>
        <div className="row">
          
          <aside className="col-lg-3 d-none d-lg-block">
            <nav className={styles['privacy__nav']}>
              <h5 className={styles['privacy__nav-title']}>{t('landing.PrivacyPolicyPage.navTitle')}</h5>
              <ul className={styles['privacy__nav-list']}>
                {navItems.map((item) => (
                  <li key={item.id} className={styles['privacy__nav-item']}>
                    <button 
                      onClick={() => scrollToSection(item.id)}
                      className={`${styles['privacy__nav-link']} ${activeSection === item.id ? styles['privacy__nav-link--active'] : ''}`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <main className="col-lg-9 col-12">
            <div className={styles['privacy__content']}>
              
              <section id="commitment" className={styles['privacy__section']}>
                <div className={styles['privacy__section-header']}>
                  <SecurityIcon className={styles['privacy__icon']} />
                  <h2>{t('landing.PrivacyPolicyPage.sections.commitment.title')}</h2>
                </div>
                <p
                  dangerouslySetInnerHTML={{ __html: t('landing.PrivacyPolicyPage.sections.commitment.text') }}
                />
              </section>

              <section id="data-collection" className={styles['privacy__section']}>
                <div className={styles['privacy__section-header']}>
                  <FolderSharedIcon className={styles['privacy__icon']} />
                  <h2>{t('landing.PrivacyPolicyPage.sections.dataCollection.title')}</h2>
                </div>
                <p>{t('landing.PrivacyPolicyPage.sections.dataCollection.intro')}</p>
                <ul className={styles['privacy__list']}>
                  {(t('landing.PrivacyPolicyPage.sections.dataCollection.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                    <li key={index} dangerouslySetInnerHTML={{ __html: item }}></li>
                  ))}
                </ul>
              </section>

              <section id="purpose" className={styles['privacy__section']}>
                <div className={styles['privacy__section-header']}>
                  <GavelIcon className={styles['privacy__icon']} />
                  <h2>{t('landing.PrivacyPolicyPage.sections.purpose.title')}</h2>
                </div>
                <p>{t('landing.PrivacyPolicyPage.sections.purpose.intro')}</p>
                <ul className={styles['privacy__list']}>
                  {(t('landing.PrivacyPolicyPage.sections.purpose.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              <section id="security" className={styles['privacy__section']}>
                <div className={styles['privacy__section-header']}>
                  <VpnKeyIcon className={styles['privacy__icon']} />
                  <h2>{t('landing.PrivacyPolicyPage.sections.security.title')}</h2>
                </div>
                <p>{t('landing.PrivacyPolicyPage.sections.security.intro')}</p>
                <div className={styles['privacy__grid-cards']}>
                  <div className={styles['privacy__card']}>
                    <strong>{t('landing.PrivacyPolicyPage.sections.security.cards.encryption.title')}</strong>
                    <p>{t('landing.PrivacyPolicyPage.sections.security.cards.encryption.text')}</p>
                  </div>
                  <div className={styles['privacy__card']}>
                    <strong>{t('landing.PrivacyPolicyPage.sections.security.cards.access.title')}</strong>
                    <p>{t('landing.PrivacyPolicyPage.sections.security.cards.access.text')}</p>
                  </div>
                  <div className={styles['privacy__card']}>
                    <strong>{t('landing.PrivacyPolicyPage.sections.security.cards.backups.title')}</strong>
                    <p>{t('landing.PrivacyPolicyPage.sections.security.cards.backups.text')}</p>
                  </div>
                </div>
              </section>

              <section id="sharing" className={styles['privacy__section']}>
                <div className={styles['privacy__section-header']}>
                  <ShareIcon className={styles['privacy__icon']} />
                  <h2>{t('landing.PrivacyPolicyPage.sections.sharing.title')}</h2>
                </div>
                <p
                  dangerouslySetInnerHTML={{ __html: t('landing.PrivacyPolicyPage.sections.sharing.intro') }}
                />
                <ul className={styles['privacy__list']}>
                  {(t('landing.PrivacyPolicyPage.sections.sharing.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              <section id="rights" className={styles['privacy__section']}>
                <div className={styles['privacy__section-header']}>
                  <PanToolIcon className={styles['privacy__icon']} />
                  <h2>{t('landing.PrivacyPolicyPage.sections.rights.title')}</h2>
                </div>
                <p>{t('landing.PrivacyPolicyPage.sections.rights.intro')}</p>
                <ul className={styles['privacy__list']}>
                  {(t('landing.PrivacyPolicyPage.sections.rights.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <div className={styles['privacy__contact-box']}>
                  <p dangerouslySetInnerHTML={{ __html: t('landing.PrivacyPolicyPage.sections.rights.contact') }}></p>
                </div>
              </section>

              <section id="retention" className={styles['privacy__section']}>
                <div className={styles['privacy__section-header']}>
                  <AccessTimeIcon className={styles['privacy__icon']} />
                  <h2>{t('landing.PrivacyPolicyPage.sections.retention.title')}</h2>
                </div>
                <p>
                  {t('landing.PrivacyPolicyPage.sections.retention.text')}
                </p>
              </section>

              <section id="payments" className={styles['privacy__section']}>
                <div className={styles['privacy__section-header']}>
                  <PaymentIcon className={styles['privacy__icon']} />
                  <h2>{t('landing.PrivacyPolicyPage.sections.payments.title')}</h2>
                </div>
                <p>{t('landing.PrivacyPolicyPage.sections.payments.intro')}</p>
                <ul className={styles['privacy__list']}>
                  {(t('landing.PrivacyPolicyPage.sections.payments.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                    <li key={index} dangerouslySetInnerHTML={{ __html: item }}></li>
                  ))}
                </ul>
              </section>

              <section id="subscriptions" className={styles['privacy__section']}>
                <div className={styles['privacy__section-header']}>
                  <AutorenewIcon className={styles['privacy__icon']} />
                  <h2>{t('landing.PrivacyPolicyPage.sections.subscriptions.title')}</h2>
                </div>
                <p
                  dangerouslySetInnerHTML={{ __html: t('landing.PrivacyPolicyPage.sections.subscriptions.text') }}
                />
              </section>

              <hr className={styles['privacy__divider']} />

              <section className={styles['privacy__section']}>
                <div className={styles['privacy__section-header']}>
                  <UpdateIcon className={styles['privacy__icon']} />
                  <h2>{t('landing.PrivacyPolicyPage.sections.changes.title')}</h2>
                </div>
                <p>
                  {t('landing.PrivacyPolicyPage.sections.changes.text')}
                </p>
              </section>

              <section className={`${styles['privacy__section']} ${styles['privacy__section--highlight']}`}>
                <div className={styles['privacy__section-header']}>
                  <CheckCircleOutlineIcon className={styles['privacy__icon']} />
                  <h2>{t('landing.PrivacyPolicyPage.sections.acceptance.title')}</h2>
                </div>
                <p>
                  {t('landing.PrivacyPolicyPage.sections.acceptance.text')}
                </p>
              </section>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;