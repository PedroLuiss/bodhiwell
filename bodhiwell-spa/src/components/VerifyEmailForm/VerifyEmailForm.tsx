import React from 'react';
import { Link } from 'react-router-dom';
import styles from './VerifyEmailForm.module.scss';
import { useVerifyEmailForm } from './hooks/useVerifyEmailPage';

interface VerifyEmailFormProps {
    title: string;
    description: string;
}

export const VerifyEmailForm: React.FC<VerifyEmailFormProps> = ({ title, description }) => {
    const {
        t, otp, timer, isVerifying, isResending, inputRefs,
        handleOtpChange, handleKeyDown, handlePaste, handleVerify, handleResend,
    } = useVerifyEmailForm();

    const isCodeIncomplete = otp.join("").length < 6;

    return (
        <section className={styles['auth-card']}>

            <div className={styles['auth-card__tabs']}>
                <div className={`${styles['auth-card__tab']} ${styles['auth-card__tab--disabled']}`}>
                    {t('auth.tabs.register', 'Crear tu cuenta')}
                </div>
                <div className={`${styles['auth-card__tab']} ${styles['auth-card__tab--active']}`}>
                    {t('auth.tabs.verify', 'Verificar correo')}
                </div>
            </div>

            <div className={styles['auth-card__instruction']}>
                {description}
            </div>

            <div className={styles['auth-card__code-row']}>
                {otp.map((digit, index) => (
                    <React.Fragment key={index}>
                        <input
                            ref={(el) => { inputRefs.current[index] = el; }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            className={`${styles['auth-card__code-box']} ${digit ? styles['auth-card__code-box--filled'] : ''}`}
                            onChange={(e) => handleOtpChange(e.target.value, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onPaste={handlePaste}
                        />
                        {index < 5 && <span className={styles['auth-card__code-sep']}>-</span>}
                    </React.Fragment>
                ))}
            </div>

            <div className={styles['auth-card__verify-actions']}>
                <button
                    className={styles['auth-card__btn-primary']}
                    onClick={handleVerify}
                    disabled={isCodeIncomplete || isVerifying}
                >
                    {isVerifying ? t('verifyEmail.loadingButton') : t('verifyEmail.verifyButton', 'Verificar código')}
                </button>

                <button
                    className={styles['auth-card__btn-secondary']}
                    onClick={handleResend}
                    disabled={timer > 0 || isResending}
                >
                    {isResending 
                        ? t('verifyEmail.loadingButton') 
                        : timer > 0 
                            ? `${t('verifyEmail.resendButton', 'Reenviar código')} (${timer}s)` 
                            : t('verifyEmail.resendButton', 'Reenviar código')
                    }
                </button>
            </div>

            <Link to="/" className={styles['auth-card__link-home']}>
                {t('auth.goHome', 'Ir al inicio')}
            </Link>

            <p className={styles['auth-card__legal-note']}>
                {t('auth.legalNote', 'Al continuar, aceptas nuestros')}
                <br />
                <Link to="/terms-conditions">{t('auth.terms', 'Términos de servicio')}</Link> {t('auth.and', 'y')} <Link to="/privacy-policy">{t('auth.privacy', 'Política de privacidad')}</Link>
            </p>
        </section>
    );
};