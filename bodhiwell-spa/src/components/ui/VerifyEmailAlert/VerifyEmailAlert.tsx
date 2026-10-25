import React from 'react';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import CloseIcon from '@mui/icons-material/Close';
import styles from './VerifyEmailAlert.module.scss';
import { useVerifyEmailAlert } from './hooks/useVerifyEmailAlert';
import { ButtonUi } from '../ButtonUi/ButtonUi';

export const VerifyEmailAlert: React.FC = () => {
    const {
        t,
        user,
        isVisible,
        isResending,
        handleVerifyClick,
        handleDismiss
    } = useVerifyEmailAlert();

    if (!isVisible) return null;

    return (
        <section className={styles['email-alert']}>
            <div className={styles['email-alert__card']}>
                
                <header className={styles['email-alert__header']}>
                    <div className={styles['email-alert__icon-box']}>
                        <MarkEmailReadIcon sx={{ fontSize: 22 }} />
                    </div>
                    
                    <div className={styles['email-alert__title-group']}>
                        <span className={styles['email-alert__eyebrow']}>
                            {t('VerifyEmailAlert.eyebrow', 'Seguridad')}
                        </span>
                        <h3 className={styles['email-alert__title']}>
                            {t('VerifyEmailAlert.title', 'Verifica tu cuenta')}
                        </h3>
                    </div>

                    <button
                        onClick={handleDismiss}
                        className={styles['email-alert__close-btn']}
                        aria-label="Cerrar"
                    >
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </button>
                </header>

                <div className={styles['email-alert__body']}>
                    <p className={styles['email-alert__text']}>
                        {t('VerifyEmailAlert.text', 'Tu seguridad es nuestra prioridad. Por favor, verifica tu correo para acceder a todas las funciones.')}
                    </p>
                    <div className={styles['email-alert__info-box']}>
                        <span>{t('VerifyEmailAlert.emailTarget')}</span>
                        <strong>{user?.email}</strong>
                    </div>
                </div>

                <div className={styles['email-alert__actions']}>
                    <ButtonUi
                        variant="contained"
                        onClick={handleVerifyClick}
                        disabled={isResending}
                        size="small"
                        fullWidth
                    >
                        {isResending
                            ? t('VerifyEmailAlert.sending', 'Enviando...')
                            : t('VerifyEmailAlert.verifyButton', 'Verificar ahora')
                        }
                    </ButtonUi>
                </div>
            </div>
        </section>
    );
};