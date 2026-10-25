import React from 'react';
import { Link } from 'react-router-dom';
import CookieIcon from '@mui/icons-material/Cookie';
import CloseIcon from '@mui/icons-material/Close';

import styles from './CookiesConsentModal.module.scss';
import { useCookiesConsent } from './hooks/useCookiesConsent';

export const CookiesConsentModal: React.FC = () => {
  const { t, isVisible, handleAccept, handleDecline } = useCookiesConsent();

  if (!isVisible) return null;

  return (
    <div className={styles['cookie-modal']}>
      <div className={styles['cookie-modal__content']}>
        <header className={styles['cookie-modal__header']}>
          <div className={styles['cookie-modal__icon-wrapper']}>
            <CookieIcon className={styles['cookie-modal__icon']} />
          </div>
          <h3 className={styles['cookie-modal__title']}>
            {t('landing.CookiesConsentModal.title')}
          </h3>
          <button
            onClick={handleDecline}
            className={styles['cookie-modal__close-btn']}
            aria-label={t('landing.CookiesConsentModal.closeAriaLabel')}
          >
            <CloseIcon fontSize="small" />
          </button>
        </header>

        <p className={styles['cookie-modal__text']}>
          {t('landing.CookiesConsentModal.text')}
        </p>

        <footer className={styles['cookie-modal__actions']}>
          <Link to="/cookies-policy" className={styles['cookie-modal__link']}>
            {t('landing.CookiesConsentModal.cookiesPolicyLink')}
          </Link>

          <div className={styles['cookie-modal__buttons']}>
            <button
              onClick={handleDecline}
              className={`${styles['cookie-modal__button']} ${styles['cookie-modal__button--secondary']}`}
            >
              {t('landing.CookiesConsentModal.rejectButton')}
            </button>
            <button
              onClick={handleAccept}
              className={`${styles['cookie-modal__button']} ${styles['cookie-modal__button--primary']}`}
            >
              {t('landing.CookiesConsentModal.acceptButton')}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CookiesConsentModal;