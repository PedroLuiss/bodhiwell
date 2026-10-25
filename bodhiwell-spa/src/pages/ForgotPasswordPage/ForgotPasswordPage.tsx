import { Link } from 'react-router-dom';
import styles from './ForgotPassword.module.scss';
import { AuthLayout } from '../../layouts/AuthLayout/AuthLayout';
import { TextFieldUi } from '../../components/ui/TextFieldUi/TextFieldUi';
import { useForgotPassword } from './hooks/useForgotPassword';

const ForgotPasswordPage = () => {
    const { 
        t, 
        forgotEmail, 
        loading, 
        emailError, 
        onSubmit, 
        handleEmailChange 
    } = useForgotPassword();

    return (
        <AuthLayout>
            <section className={styles['auth-card']}>
               
                <h2 className={styles['auth-card__title']}>
                    {t('landing.ForgotPasswordPage.title', 'Recuperar contraseña')}
                </h2>
                
                <p className={styles['auth-card__intro']}>
                    {t('landing.ForgotPasswordPage.description', 'Introduce tu correo y te enviaremos un enlace para restablecer tu cuenta.')}
                </p>
                
                <form className={styles['auth-card__form']} onSubmit={onSubmit} noValidate>
                    <div className={styles['auth-card__fields']}>
                        <div className={`
                            ${styles['auth-card__field-group']} 
                            ${forgotEmail ? styles['auth-card__field-group--filled'] : ''}
                            ${emailError ? styles['auth-card__field-group--error'] : ''}
                        `}>
                            <TextFieldUi
                                type="email"
                                id="forgot-email"
                                name="email"
                                placeholder={t('landing.ForgotPasswordPage.emailPlaceholder')}
                                value={forgotEmail}
                                onChange={handleEmailChange}
                                disabled={loading}
                                error={!!emailError}
                                variant="standard" 
                                fullWidth
                            />
                        </div>
                        
                    </div>

                    <button 
                        className={styles['auth-card__btn-primary']}
                        type="submit" 
                        disabled={loading}
                    >
                        {loading 
                            ? t('landing.ForgotPasswordPage.loadingBtn') 
                            : t('landing.ForgotPasswordPage.sendButton', 'Enviar enlace')
                        }
                    </button>
                </form>

                <Link to="/login" className={styles['auth-card__link-home']}>
                    {t('landing.ForgotPasswordPage.backToLogin', 'Volver al inicio de sesión')}
                </Link>

                <p className={styles['auth-card__legal-note']}>
                    {t('auth.legalNote', 'Al continuar, aceptas nuestros')}
                    <br />
                    <Link to="/terms-conditions">{t('auth.terms', 'Términos de servicio')}</Link> {t('auth.and', 'y')} <Link to="/privacy-policy">{t('auth.privacy', 'Política de privacidad')}</Link>
                </p>
            </section>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;