import React from 'react';
import { Link } from 'react-router-dom';
import styles from './login.module.scss';

import { AuthLayout } from '../../layouts/AuthLayout/AuthLayout';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IconButton, InputAdornment } from '@mui/material';

import { TextFieldUi } from '../../components/ui/TextFieldUi/TextFieldUi';
import { useLogin } from './hooks/useLogin';
import { FORGOT_PASSWORD_ROUTE } from './constants/Login.constante';

const Login: React.FC = () => {
    const {
        t,
        form,
        errors,
        loading,
        visibilityPassword,
        rememberMe,
        setRememberMe,
        handleChange,
        handleEmailLogin,
        handleGoogleLogin,
        togglePasswordVisibility,
    } = useLogin();

    return (
        <AuthLayout>
            <section className={styles['auth-card']}>
                <div className={styles['auth-card__tabs']}>
                    <div className={`${styles['auth-card__tab']} ${styles['auth-card__tab--active']}`}>
                        {t('auth.tabs.login', 'Iniciar sesión')}
                    </div>
                    <Link to="/register" className={styles['auth-card__tab']}>
                        {t('auth.tabs.register', 'Crear tu cuenta')}
                    </Link>
                </div>

                <form className={styles['auth-card__form']} onSubmit={handleEmailLogin}>
                    <div className={styles['auth-card__fields']}>
                        <div className={`
                            ${styles['auth-card__field-group']} 
                            ${form.email ? styles['auth-card__field-group--filled'] : ''}
                            ${errors.email ? styles['auth-card__field-group--error'] : ''}
                        `}>
                            <TextFieldUi
                                placeholder={t('landing.login.emailPlaceholder')}
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                error={!!errors.email}
                                disabled={loading}
                                fullWidth
                                variant="standard" 
                            />
                        </div>

                        <div className={`
                            ${styles['auth-card__field-group']} 
                            ${form.password ? styles['auth-card__field-group--filled'] : ''}
                            ${errors.password ? styles['auth-card__field-group--error'] : ''}
                        `}>
                            <TextFieldUi
                                placeholder={t('landing.login.passwordPlaceholder')}
                                name="password"
                                type={visibilityPassword ? 'text' : 'password'}
                                value={form.password}
                                onChange={handleChange}
                                error={!!errors.password}
                                disabled={loading}
                                fullWidth
                                variant="standard"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={togglePasswordVisibility} size="small" className={styles['auth-card__eye']}>
                                                {visibilityPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>
                    </div>

                    <div className={styles['auth-card__helper-links']}>
                        <label className={styles['auth-card__remember']}>
                            <input 
                                type="checkbox" 
                                checked={rememberMe} 
                                onChange={(e) => setRememberMe(e.target.checked)} 
                                style={{ display: 'none' }}
                            />
                            <div className={`
                                ${styles['auth-card__checkbox-box']} 
                                ${rememberMe ? styles['auth-card__checkbox-box--active'] : ''}
                            `} />
                            {t('landing.login.rememberMe', 'Recordarme')}
                        </label>
                        <Link to={FORGOT_PASSWORD_ROUTE} className={styles['auth-card__forgot']}>
                            {t('landing.login.forgotPassword', 'Olvidé mi contraseña')}
                        </Link>
                    </div>

                    <button className={styles['auth-card__btn-primary']} type="submit" disabled={loading}>
                        {loading ? t('landing.login.loading') : t('landing.login.login', 'Ingresar')}
                    </button>
                </form>

                <div className={styles['auth-card__divider']}>
                    {t('landing.login.orContinueWith', 'O continuar con')}
                </div>

                <button className={styles['auth-card__btn-google']} onClick={handleGoogleLogin} type="button">
                    <span className={styles['auth-card__gmark']}>G</span> {t('landing.login.google', 'Google')}
                </button>

                <Link to="/" className={styles['auth-card__link-home']}>
                    {t('auth.goHome', 'Ir al inicio')}
                </Link>

                <p className={styles['auth-card__legal']}>
                    {t('auth.legalNote', 'Al continuar, aceptas nuestros')}
                    <br />
                    <Link to="/terms-conditions">{t('auth.terms', 'Términos de servicio')}</Link> {t('auth.and', 'y')} <Link to="/privacy-policy">{t('auth.privacy', 'Política de privacidad')}</Link>
                </p>
            </section>
        </AuthLayout>
    );
};

export default Login;