import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './TermsConditionsPage.module.scss';
import GavelIcon from '@mui/icons-material/Gavel';
import DescriptionIcon from '@mui/icons-material/Description';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BlockIcon from '@mui/icons-material/Block';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PaymentIcon from '@mui/icons-material/Payment';
import UpdateIcon from '@mui/icons-material/Update';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CopyrightIcon from '@mui/icons-material/Copyright';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import PublicIcon from '@mui/icons-material/Public';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

const TermsConditionsPage: React.FC = () => {
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
    { id: 'acceptance', label: t('landing.TermsConditionsPage.navItems.acceptance') },
    { id: 'description', label: t('landing.TermsConditionsPage.navItems.description') },
    { id: 'registration', label: t('landing.TermsConditionsPage.navItems.registration') },
    { id: 'usage', label: t('landing.TermsConditionsPage.navItems.usage') },
    { id: 'professionals', label: t('landing.TermsConditionsPage.navItems.professionals') },
    { id: 'payments', label: t('landing.TermsConditionsPage.navItems.payments') },
    { id: 'modifications', label: t('landing.TermsConditionsPage.navItems.modifications') },
    { id: 'liability', label: t('landing.TermsConditionsPage.navItems.liability') },
    { id: 'intellectual', label: t('landing.TermsConditionsPage.navItems.intellectual') },
    { id: 'suspension', label: t('landing.TermsConditionsPage.navItems.suspension') },
    { id: 'law', label: t('landing.TermsConditionsPage.navItems.law') },
  ];

  return (
    <div className={styles.terms}>
      
      <div className={styles['terms__header']}>
        <div className="container">
          <h1 className={styles['terms__title']}>{t('landing.TermsConditionsPage.title')}</h1>
          <p className={styles['terms__subtitle']}>
            {t('landing.TermsConditionsPage.subtitle')}
          </p>
          <span className={styles['terms__last-update']}>
            {t('landing.TermsConditionsPage.lastUpdate')}: {new Date().toLocaleDateString(t('landing.TermsConditionsPage.locale') === 'en' ? 'en-US' : 'es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      <div className={`${styles['terms__container']} container`}>
        <div className="row">
          
          <aside className="col-lg-3 d-none d-lg-block">
            <nav className={styles['terms__nav']}>
              <h5 className={styles['terms__nav-title']}>{t('landing.TermsConditionsPage.navTitle')}</h5>
              <ul className={styles['terms__nav-list']}>
                {navItems.map((item) => (
                  <li key={item.id} className={styles['terms__nav-item']}>
                    <button 
                      onClick={() => scrollToSection(item.id)}
                      className={`${styles['terms__nav-link']} ${activeSection === item.id ? styles['terms__nav-link--active'] : ''}`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <main className="col-lg-9 col-12">
            <div className={styles['terms__content']}>
              
              <section id="acceptance" className={styles['terms__section']}>
                <div className={styles['terms__section-header']}>
                  <GavelIcon className={styles['terms__icon']} />
                  <h2>{t('landing.TermsConditionsPage.sections.acceptance.title')}</h2>
                </div>
                <p>
                  {t('landing.TermsConditionsPage.sections.acceptance.text')}
                </p>
              </section>

              <section id="description" className={styles['terms__section']}>
                <div className={styles['terms__section-header']}>
                  <DescriptionIcon className={styles['terms__icon']} />
                  <h2>{t('landing.TermsConditionsPage.sections.description.title')}</h2>
                </div>
                <p
                  dangerouslySetInnerHTML={{ __html: t('landing.TermsConditionsPage.sections.description.text1') }}
                />
                <p>
                  {t('landing.TermsConditionsPage.sections.description.text2')}
                </p>
              </section>

              <section id="registration" className={styles['terms__section']}>
                <div className={styles['terms__section-header']}>
                  <VerifiedUserIcon className={styles['terms__icon']} />
                  <h2>{t('landing.TermsConditionsPage.sections.registration.title')}</h2>
                </div>
                <p>
                  {t('landing.TermsConditionsPage.sections.registration.text')}
                </p>
              </section>

              <section id="usage" className={styles['terms__section']}>
                <div className={styles['terms__section-header']}>
                  <BlockIcon className={styles['terms__icon']} />
                  <h2>{t('landing.TermsConditionsPage.sections.usage.title')}</h2>
                </div>
                <p>{t('landing.TermsConditionsPage.sections.usage.intro')}</p>
                <ul className={styles['terms__list']}>
                  {(t('landing.TermsConditionsPage.sections.usage.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <div className={styles['terms__alert-box']}>
                  <p>{t('landing.TermsConditionsPage.sections.usage.alert')}</p>
                </div>
              </section>

              <section id="professionals" className={styles['terms__section']}>
                <div className={styles['terms__section-header']}>
                  <MedicalServicesIcon className={styles['terms__icon']} />
                  <h2>{t('landing.TermsConditionsPage.sections.professionals.title')}</h2>
                </div>
                <p>
                  {t('landing.TermsConditionsPage.sections.professionals.text')}
                </p>
              </section>

              <section id="payments" className={styles['terms__section']}>
                <div className={styles['terms__section-header']}>
                  <PaymentIcon className={styles['terms__icon']} />
                  <h2>{t('landing.TermsConditionsPage.sections.payments.title')}</h2>
                </div>
                <p
                  dangerouslySetInnerHTML={{ __html: t('landing.TermsConditionsPage.sections.payments.text') }}
                />
              </section>

              <section id="modifications" className={styles['terms__section']}>
                <div className={styles['terms__section-header']}>
                  <UpdateIcon className={styles['terms__icon']} />
                  <h2>{t('landing.TermsConditionsPage.sections.modifications.title')}</h2>
                </div>
                <p>
                  {t('landing.TermsConditionsPage.sections.modifications.text')}
                </p>
              </section>

              <section id="liability" className={styles['terms__section']}>
                <div className={styles['terms__section-header']}>
                  <ReportProblemIcon className={styles['terms__icon']} />
                  <h2>{t('landing.TermsConditionsPage.sections.liability.title')}</h2>
                </div>
                <p>{t('landing.TermsConditionsPage.sections.liability.intro')}</p>
                <ul className={styles['terms__list']}>
                  {(t('landing.TermsConditionsPage.sections.liability.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              <section id="intellectual" className={styles['terms__section']}>
                <div className={styles['terms__section-header']}>
                  <CopyrightIcon className={styles['terms__icon']} />
                  <h2>{t('landing.TermsConditionsPage.sections.intellectual.title')}</h2>
                </div>
                <p>
                  {t('landing.TermsConditionsPage.sections.intellectual.text')}
                </p>
              </section>

              <section id="suspension" className={styles['terms__section']}>
                <div className={styles['terms__section-header']}>
                  <PersonOffIcon className={styles['terms__icon']} />
                  <h2>{t('landing.TermsConditionsPage.sections.suspension.title')}</h2>
                </div>
                <p>
                  {t('landing.TermsConditionsPage.sections.suspension.text')}
                </p>
              </section>

              <section id="law" className={styles['terms__section']}>
                <div className={styles['terms__section-header']}>
                  <PublicIcon className={styles['terms__icon']} />
                  <h2>{t('landing.TermsConditionsPage.sections.law.title')}</h2>
                </div>
                <p
                  dangerouslySetInnerHTML={{ __html: t('landing.TermsConditionsPage.sections.law.text') }}
                />
              </section>

              <hr className={styles['terms__divider']} />

              <section className={`${styles['terms__section']} ${styles['terms__section--final']}`}>
                <div className={styles['terms__final-message']}>
                  <RocketLaunchIcon sx={{ fontSize: 40, color: '#7a9e7e', marginBottom: '1rem' }} />
                  <h3>{t('landing.TermsConditionsPage.sections.final.title')}</h3>
                  <p>
                    {t('landing.TermsConditionsPage.sections.final.text')}
                  </p>
                </div>
              </section>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default TermsConditionsPage;