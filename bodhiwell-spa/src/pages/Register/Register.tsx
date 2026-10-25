import React from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../layouts/AuthLayout/AuthLayout';
import { TextFieldUi } from '../../components/ui/TextFieldUi/TextFieldUi';
import { IconButton, InputAdornment } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import useRegister from '../../hooks/useRegister';
import styles from './register.module.scss';

const Register: React.FC = () => {
    const {
        t, form, errors, loading,
        visibilityPassword, setVisibilityPassword,
        visibilityConfirmPassword, setVisibilityConfirmPassword,
        isProfessional, toggleProfessional,
        handleChangeRegister, handleSubmit, handleLoginWithGoogle,
    } = useRegister();

    return (
        <AuthLayout>
            <section className={styles['auth-card']}>
                <div className={styles['auth-card__tabs']}>
                    <Link to="/login" className={styles['auth-card__tab']}>
                        {t('auth.tabs.login', 'Iniciar sesión')}
                    </Link>
                    <div className={`${styles['auth-card__tab']} ${styles['auth-card__tab--active']}`}>
                        {t('auth.tabs.register', 'Crear tu cuenta')}
                    </div>
                </div>

                <form className={styles['auth-card__form']} onSubmit={handleSubmit} noValidate>
                    <div className={styles['auth-card__fields']}>
                        <div className={`
                            ${styles['auth-card__field-group']} 
                            ${form.first_name ? styles['auth-card__field-group--filled'] : ''}
                            ${errors.first_name ? styles['auth-card__field-group--error'] : ''}
                        `}>
                            <TextFieldUi
                                placeholder={t('landing.register.namePlaceholder')}
                                name="first_name"
                                value={form.first_name}
                                onChange={handleChangeRegister}
                                error={!!errors.first_name}
                                disabled={loading}
                                variant="standard"
                                fullWidth
                                required
                            />
                        </div>

                        <div className={`
                            ${styles['auth-card__field-group']} 
                            ${form.last_name ? styles['auth-card__field-group--filled'] : ''}
                            ${errors.last_name ? styles['auth-card__field-group--error'] : ''}
                        `}>
                            <TextFieldUi
                                placeholder={t('landing.register.lastNamePlaceholder')}
                                name="last_name"
                                value={form.last_name}
                                onChange={handleChangeRegister}
                                error={!!errors.last_name}
                                disabled={loading}
                                variant="standard"
                                fullWidth
                                required
                            />
                        </div>

                        <div className={`
                            ${styles['auth-card__field-group']} 
                            ${form.email ? styles['auth-card__field-group--filled'] : ''}
                            ${errors.email ? styles['auth-card__field-group--error'] : ''}
                        `}>
                            <TextFieldUi
                                placeholder={t('landing.register.emailPlaceholder')}
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChangeRegister}
                                error={!!errors.email}
                                disabled={loading}
                                variant="standard"
                                fullWidth
                                required
                            />
                        </div>

                        <div className={`
                            ${styles['auth-card__field-group']} 
                            ${form.password ? styles['auth-card__field-group--filled'] : ''}
                            ${errors.password ? styles['auth-card__field-group--error'] : ''}
                        `}>
                            <TextFieldUi
                                placeholder={t('landing.register.passwordPlaceholder')}
                                name="password"
                                type={visibilityPassword ? 'text' : 'password'}
                                value={form.password}
                                onChange={handleChangeRegister}
                                error={!!errors.password}
                                disabled={loading}
                                variant="standard"
                                fullWidth
                                required
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setVisibilityPassword(!visibilityPassword)} size="small" className={styles['auth-card__eye']}>
                                                {visibilityPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>

                        <div className={`
                            ${styles['auth-card__field-group']} 
                            ${form.confirmPassword ? styles['auth-card__field-group--filled'] : ''}
                            ${errors.confirmPassword ? styles['auth-card__field-group--error'] : ''}
                        `}>
                            <TextFieldUi
                                placeholder={t('landing.register.confirmPasswordPlaceholder')}
                                name="confirmPassword"
                                type={visibilityConfirmPassword ? 'text' : 'password'}
                                value={form.confirmPassword}
                                onChange={handleChangeRegister}
                                error={!!errors.confirmPassword}
                                disabled={loading}
                                variant="standard"
                                fullWidth
                                required
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setVisibilityConfirmPassword(!visibilityConfirmPassword)} size="small" className={styles['auth-card__eye']}>
                                                {visibilityConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>

                        <div className={styles['auth-card__switch-field']} onClick={() => toggleProfessional(!isProfessional)}>
                            <span className={`${styles['auth-card__switch']} ${isProfessional ? styles['auth-card__switch--active'] : ''}`} />
                            {t('landing.register.professional', 'Registrarme como profesional')}
                        </div>
                    </div>

                    <div className={styles['auth-card__checks']}>
                        <label className={`${styles['auth-card__check']} ${errors.terms_accepted ? styles['auth-card__check--error'] : ''}`}>
                            <input 
                                type="checkbox" 
                                name="terms_accepted"
                                checked={form.terms_accepted} 
                                onChange={handleChangeRegister} 
                                required
                            />
                            <div className={styles['auth-card__box']} />
                            <span>
                                {t('landing.register.acceptTermsStart', 'He leído y acepto los')} <Link to="/terms">{t('landing.register.terms', 'Términos y condiciones')}</Link> {t('landing.register.and', 'y la')} <Link to="/privacy">{t('landing.register.privacy', 'Política de privacidad')}</Link>.
                            </span>
                        </label>

                        <label className={styles['auth-card__check']}>
                            <input 
                                type="checkbox" 
                                name="newsletter_active"
                                checked={form.newsletter_active} 
                                onChange={handleChangeRegister} 
                            />
                            <div className={styles['auth-card__box']} />
                            <span>{t('landing.register.inspirationalWellnessContent', 'Quiero recibir contenido que inspire y fortalezca mi bienestar.')}</span>
                        </label>
                    </div>

                    <button className={styles['auth-card__btn-primary']} type="submit" disabled={loading}>
                        {loading ? t('landing.register.loading') : t('landing.register.register', 'Crear tu cuenta')}
                    </button>
                </form>

                <div className={styles['auth-card__divider']}>
                    {t('landing.register.orContinueWith', 'O continuar con')}
                </div>

                <button className={styles['auth-card__btn-google']} onClick={handleLoginWithGoogle} type="button">
                    <span className={styles['auth-card__gmark']}>G</span> {t('landing.login.google', 'Google')}
                </button>

                <Link to="/" className={styles['auth-card__link-home']}>
                    {t('auth.goHome', 'Ir al inicio')}
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

export default Register;