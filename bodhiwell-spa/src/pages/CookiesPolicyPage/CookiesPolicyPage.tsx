import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './CookiesPolicyPage.module.scss';
import CookieIcon from '@mui/icons-material/Cookie';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TuneIcon from '@mui/icons-material/Tune';
import CampaignIcon from '@mui/icons-material/Campaign';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import BlockIcon from '@mui/icons-material/Block';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import UpdateIcon from '@mui/icons-material/Update';
import EmailIcon from '@mui/icons-material/Email';

const CookiesPolicyPage: React.FC = () => {
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
    { id: 'intro', label: t('landing.CookiesPolicyPage.navItems.intro') },
    { id: 'purpose', label: t('landing.CookiesPolicyPage.navItems.purpose') },
    { id: 'types', label: t('landing.CookiesPolicyPage.navItems.types') },
    { id: 'third-party', label: t('landing.CookiesPolicyPage.navItems.thirdParty') },
    { id: 'management', label: t('landing.CookiesPolicyPage.navItems.management') },
    { id: 'data', label: t('landing.CookiesPolicyPage.navItems.data') },
    { id: 'retention', label: t('landing.CookiesPolicyPage.navItems.retention') },
    { id: 'updates', label: t('landing.CookiesPolicyPage.navItems.updates') },
    { id: 'contact', label: t('landing.CookiesPolicyPage.navItems.contact') },
  ];

  return (
    <div className={styles.cookies}>
      
      <div className={styles['cookies__header']}>
        <div className="container">
          <h1 className={styles['cookies__title']}>{t('landing.CookiesPolicyPage.title')}</h1>
          <p className={styles['cookies__subtitle']}>
            {t('landing.CookiesPolicyPage.subtitle')}
          </p>
          <span className={styles['cookies__last-update']}>
            {t('landing.CookiesPolicyPage.lastUpdate')}: {new Date().toLocaleDateString(t('landing.CookiesPolicyPage.locale') === 'en' ? 'en-US' : 'es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      <div className={`${styles['cookies__container']} container`}>
        <div className="row">
          
          <aside className="col-lg-3 d-none d-lg-block">
            <nav className={styles['cookies__nav']}>
              <h5 className={styles['cookies__nav-title']}>{t('landing.CookiesPolicyPage.navTitle')}</h5>
              <ul className={styles['cookies__nav-list']}>
                {navItems.map((item) => (
                  <li key={item.id} className={styles['cookies__nav-item']}>
                    <button 
                      onClick={() => scrollToSection(item.id)}
                      className={`${styles['cookies__nav-link']} ${activeSection === item.id ? styles['cookies__nav-link--active'] : ''}`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <main className="col-lg-9 col-12">
            <div className={styles['cookies__content']}>
              
              <section id="intro" className={styles['cookies__section']}>
                <div className={styles['cookies__section-header']}>
                  <CookieIcon className={styles['cookies__icon']} />
                  <h2>{t('landing.CookiesPolicyPage.sections.intro.title')}</h2>
                </div>
                <p>
                  {t('landing.CookiesPolicyPage.sections.intro.text1')}
                </p>
                <p>
                  {t('landing.CookiesPolicyPage.sections.intro.text2')}
                </p>
              </section>

              <section id="purpose" className={styles['cookies__section']}>
                <div className={styles['cookies__section-header']}>
                  <InfoIcon className={styles['cookies__icon']} />
                  <h2>{t('landing.CookiesPolicyPage.sections.purpose.title')}</h2>
                </div>
                <p>{t('landing.CookiesPolicyPage.sections.purpose.intro')}</p>
                <div className={styles['cookies__grid-cards']}>
                  <div className={styles['cookies__card']}>
                    <SettingsIcon className={styles['cookies__card-icon']} />
                    <p>{t('landing.CookiesPolicyPage.sections.purpose.cards.functionality')}</p>
                  </div>
                  <div className={styles['cookies__card']}>
                    <TuneIcon className={styles['cookies__card-icon']} />
                    <p>{t('landing.CookiesPolicyPage.sections.purpose.cards.preferences')}</p>
                  </div>
                  <div className={styles['cookies__card']}>
                    <SecurityIcon className={styles['cookies__card-icon']} />
                    <p>{t('landing.CookiesPolicyPage.sections.purpose.cards.security')}</p>
                  </div>
                  <div className={styles['cookies__card']}>
                    <AnalyticsIcon className={styles['cookies__card-icon']} />
                    <p>{t('landing.CookiesPolicyPage.sections.purpose.cards.analytics')}</p>
                  </div>
                </div>
              </section>

              <section id="types" className={styles['cookies__section']}>
                <div className={styles['cookies__section-header']}>
                  <DataUsageIcon className={styles['cookies__icon']} />
                  <h2>{t('landing.CookiesPolicyPage.sections.types.title')}</h2>
                </div>
                
                <div className={styles['cookies__detail-box']}>
                  <h3><SecurityIcon fontSize="small"/> {t('landing.CookiesPolicyPage.sections.types.necessary.title')}</h3>
                  <p>{t('landing.CookiesPolicyPage.sections.types.necessary.text')}</p>
                </div>

                <div className={styles['cookies__detail-box']}>
                  <h3><AnalyticsIcon fontSize="small"/> {t('landing.CookiesPolicyPage.sections.types.performance.title')}</h3>
                  <p>{t('landing.CookiesPolicyPage.sections.types.performance.text')}</p>
                </div>

                <div className={styles['cookies__detail-box']}>
                  <h3><TuneIcon fontSize="small"/> {t('landing.CookiesPolicyPage.sections.types.functionality.title')}</h3>
                  <p>{t('landing.CookiesPolicyPage.sections.types.functionality.text')}</p>
                </div>

                <div className={styles['cookies__detail-box']}>
                  <h3><CampaignIcon fontSize="small"/> {t('landing.CookiesPolicyPage.sections.types.marketing.title')}</h3>
                  <p>{t('landing.CookiesPolicyPage.sections.types.marketing.text')}</p>
                </div>
              </section>

              <section id="third-party" className={styles['cookies__section']}>
                <div className={styles['cookies__section-header']}>
                  <GroupWorkIcon className={styles['cookies__icon']} />
                  <h2>{t('landing.CookiesPolicyPage.sections.thirdParty.title')}</h2>
                </div>
                <p>{t('landing.CookiesPolicyPage.sections.thirdParty.intro')}</p>
                <ul className={styles['cookies__list']}>
                  {(t('landing.CookiesPolicyPage.sections.thirdParty.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <p className={styles['cookies__note']}>{t('landing.CookiesPolicyPage.sections.thirdParty.note')}</p>
              </section>

              <section id="management" className={styles['cookies__section']}>
                <div className={styles['cookies__section-header']}>
                  <BlockIcon className={styles['cookies__icon']} />
                  <h2>{t('landing.CookiesPolicyPage.sections.management.title')}</h2>
                </div>
                <p>{t('landing.CookiesPolicyPage.sections.management.intro')}</p>
                <ul className={styles['cookies__list']}>
                  {(t('landing.CookiesPolicyPage.sections.management.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                    <li key={index} dangerouslySetInnerHTML={{ __html: item }}></li>
                  ))}
                </ul>
                <div className={styles['cookies__warning-box']}>
                  <strong>{t('landing.CookiesPolicyPage.sections.management.warning.title')}:</strong> {t('landing.CookiesPolicyPage.sections.management.warning.text')}
                </div>
              </section>

              <section id="data" className={styles['cookies__section']}>
                <div className={styles['cookies__section-header']}>
                  <DataUsageIcon className={styles['cookies__icon']} />
                  <h2>{t('landing.CookiesPolicyPage.sections.data.title')}</h2>
                </div>
                <p>{t('landing.CookiesPolicyPage.sections.data.intro')}</p>
                <ul className={styles['cookies__list']}>
                  {(t('landing.CookiesPolicyPage.sections.data.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <p><strong>{t('landing.CookiesPolicyPage.sections.data.note')}</strong></p>
              </section>

              <section id="retention" className={styles['cookies__section']}>
                <div className={styles['cookies__section-header']}>
                  <AccessTimeIcon className={styles['cookies__icon']} />
                  <h2>{t('landing.CookiesPolicyPage.sections.retention.title')}</h2>
                </div>
                <ul className={styles['cookies__list']}>
                  {(t('landing.CookiesPolicyPage.sections.retention.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                    <li key={index} dangerouslySetInnerHTML={{ __html: item }}></li>
                  ))}
                </ul>
              </section>

              <section id="updates" className={styles['cookies__section']}>
                <div className={styles['cookies__section-header']}>
                  <UpdateIcon className={styles['cookies__icon']} />
                  <h2>{t('landing.CookiesPolicyPage.sections.updates.title')}</h2>
                </div>
                <p>
                  {t('landing.CookiesPolicyPage.sections.updates.text')}
                </p>
              </section>

              <hr className={styles['cookies__divider']} />

              <section id="contact" className={`${styles['cookies__section']} ${styles['cookies__section--contact']}`}>
                <div className={styles['cookies__contact-box']}>
                  <EmailIcon className={styles['cookies__icon']} />
                  <h2>{t('landing.CookiesPolicyPage.sections.contact.title')}</h2>
                  <p>
                    {t('landing.CookiesPolicyPage.sections.contact.text')}
                  </p>
                  <a href="mailto:legal@bodhiwell.com" className={styles['cookies__email-link']}>{t('landing.CookiesPolicyPage.sections.contact.email')}</a>
                </div>
              </section>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CookiesPolicyPage;