import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from './AccessDeniedPage.module.scss';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { ButtonUi } from '../../components/ui/ButtonUi/ButtonUi';

export const AccessDeniedPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className={styles['access-denied']}>
            <main className={styles['access-denied__card']}>
                {/* CAJA DE ICONO ESTILO BODHIWELL */}
                <div className={styles['access-denied__icon-box']}>
                    <LockPersonIcon sx={{ fontSize: 40 }} />
                </div>

                <header className={styles['access-denied__header']}>
                    <span className={styles['access-denied__eyebrow']}>
                        {t('accessDenied.eyebrow', 'Acceso restringido')}
                    </span>
                    <h1 className={styles['access-denied__title']}>
                        {t('accessDenied.title', 'Área exclusiva')}
                    </h1>
                </header>

                <p className={styles['access-denied__message']}>
                    {t('accessDenied.message', 'Para acceder a esta sección, primero debes completar tu perfil de profesional. Esto es necesario para asegurar una experiencia confiable para todos nuestros usuarios.')}
                </p>

                <div className={styles['access-denied__actions']}>
                    <ButtonUi 
                        variant="contained" 
                        onClick={() => navigate('/profile')}
                        startIcon={<ArrowForwardIcon />}
                        className={styles['access-denied__btn']}
                    >
                        {t('accessDenied.action.completeProfile', 'Completar Perfil')}
                    </ButtonUi>
                    
                    <ButtonUi 
                        variant="outlined" 
                        onClick={() => navigate('/dashboard')}
                        startIcon={<HomeOutlinedIcon />}
                        className={styles['access-denied__btn']}
                    >
                        {t('accessDenied.action.goToDashboard', 'Ir al Inicio')}
                    </ButtonUi>
                </div>
            </main>
        </div>
    );
};

export default AccessDeniedPage;