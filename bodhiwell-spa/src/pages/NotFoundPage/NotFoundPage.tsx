import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from './NotFoundPage.module.scss';

import SearchOffIcon from '@mui/icons-material/SearchOff';
import HomeIcon from '@mui/icons-material/Home';

const NotFoundPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const goHome = () => {
        const user = localStorage.getItem('user');
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/');
        }
    };

    return (
        <div className={styles['not-found']}>
            <div className={styles['not-found__container']}>
                <div className={styles['not-found__icon']}>
                    <SearchOffIcon />
                </div>
                <h1 className={styles['not-found__title']}>404</h1>
                <h2 className={styles['not-found__subtitle']}>
                    {t('notFound.title', 'Página no encontrada')}
                </h2>
                <p className={styles['not-found__message']}>
                    {t('notFound.message', 'Lo sentimos, la página que buscas no existe o fue movida a otra ubicación.')}
                </p>
                <div className={styles['not-found__action']}>
                    <button 
                        className={styles['not-found__button']}
                        onClick={goHome}
                    >
                        <HomeIcon fontSize="small" />
                        <span>{t('notFound.actionButton', 'Volver al Inicio')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;