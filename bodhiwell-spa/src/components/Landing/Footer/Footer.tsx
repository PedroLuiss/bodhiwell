import { Link } from 'react-router-dom';
import styles from './Footer.module.scss';
import logo from '../../../assets/images/Logo-bodhiwell.png';
import { useFooter } from './hooks/useFooter';
import { useHeader } from '../../../hooks/useHeader';

export const Footer = () => {
  const { t, config, socialLinks, handleHomeClick } = useFooter();
  const { handleScrollToSection } = useHeader();

  return (
    <footer className={styles['footer']} id="contacto">
      <div className={styles['footer__wrap']}>
        
        <div className={styles['footer__top']}>
          <div className={styles['footer__brand']}>
            <img src={logo} alt="Bodhiwell" />
            <p>
              {t("landing.footer.description", "Bodhiwell integra salud, conciencia y comunidad para acompañar una nueva forma de comprender y buscar el bienestar humano.")}
            </p>
          </div>

          <div className={styles['footer__aside']}>
            <div className={styles['footer__nav-section']}>
              <h3>{t("landing.footer.quickLinksTitle", "Enlaces rápidos")}</h3>
              <Link to="/" onClick={handleScrollToSection('about')}>{t("landing.footer.quickLinks.about", "Acerca de")}</Link>
              <Link to="/" onClick={handleScrollToSection('how-it-works')}>{t("landing.header.howItWorks", "¿Cómo funciona?")}</Link>
              <Link to="/professionals">{t("landing.header.community", "Comunidad")}</Link>
              <a href={process.env.REACT_APP_BLOG_URL} target="_blank" rel="noopener noreferrer">
                {t("landing.footer.quickLinks.blog", "Blog")}
              </a>
              <Link to="/contact">{t("landing.header.contact", "Contacto")}</Link>
            </div>

            <div className={styles['footer__nav-section']}>
              <h3>{t("landing.footer.followUsTitle", "Seguinos")}</h3>
              {socialLinks.map(({ id, label, url }) => (
                <a key={id} href={url} target="_blank" rel="noopener noreferrer">
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className={styles['footer__bottom']}>
          <div>
            <Link to="/terms-conditions" className={styles['footer__legal-link']}>
              {t("landing.footer.termsAndConditions", "Términos y condiciones")}
            </Link>
          </div>
          
          <div className={styles['footer__contact']}>
            {config.email}
          </div>

          <div className={styles['footer__copy']}>
            © {config.currentYear} Bodhiwell. {t("landing.footer.copyright", "Todos los derechos reservados")}
          </div>
        </div>

      </div>
    </footer>
  );
};