import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cookieUtils } from '../utils';
import { COOKIE_CONSENT_KEY, COOKIE_EXPIRATION_DAYS, SHOW_DELAY_MS } from '../constants';

export const useCookiesConsent = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsentedCookie = cookieUtils.get(COOKIE_CONSENT_KEY);
    if (hasConsentedCookie) return;

    const hasConsentedLocalStorage = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (hasConsentedLocalStorage) {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      return;
    }

    const timer = setTimeout(() => setIsVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = useCallback(() => {
    cookieUtils.set(COOKIE_CONSENT_KEY, 'true', COOKIE_EXPIRATION_DAYS);
    setIsVisible(false);
  }, []);

  const handleDecline = useCallback(() => {
    cookieUtils.set(COOKIE_CONSENT_KEY, 'false', COOKIE_EXPIRATION_DAYS);
    setIsVisible(false);
  }, []);

  return {
    t,
    isVisible,
    handleAccept,
    handleDecline
  };
};