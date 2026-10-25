import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

export const useFooter = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const config = {
    email: process.env.REACT_APP_EMAIL || 'andres@bodhiwell.com',
    phone: process.env.REACT_APP_PHONE || '+598 99 295 684',
    currentYear: new Date().getFullYear(),
  };

  const socialLinks = [
    { id: 'ig', icon: InstagramIcon, label: t("landing.footer.followUs.instagram"), url: process.env.REACT_APP_INSTAGRAM_URL || '#' },
    { id: 'tw', icon: TwitterIcon, label: t("landing.footer.followUs.linkedin"), url: process.env.REACT_APP_LINKEDIN_URL || '#' },
    { id: 'fb', icon: FacebookIcon, label: t("landing.footer.followUs.facebook"), url: process.env.REACT_APP_FACEBOOK_URL || '#' },
  ];

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === '/' || location.pathname === '/home') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return { t, config, socialLinks, handleHomeClick };
};