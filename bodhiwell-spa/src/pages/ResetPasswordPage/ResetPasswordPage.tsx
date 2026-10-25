import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from '../../layouts/AuthLayout/AuthLayout.module.scss';
import { AuthLayout } from '../../layouts/AuthLayout/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { validateResetToken } from '../../services/authService';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Loading from '../../components/ui/Loading/Loading';
import { TooltipUi } from '../../components/ui/TooltipUi/TooltipUi';
import { Box, LinearProgress, Typography } from '@mui/material';
import { calculatePasswordStrength, getPasswordStrengthColor, getPasswordStrengthLabel } from '../../utils';

const ResetPasswordPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const { resetPasswords, setResetPasswords, handleResetPassword, loading } = useAuth();
    
    const [isValidating, setIsValidating] = useState(true);
    
    const [visibilityPassword, setVisibilityPassword] = useState(false);
    const [visibilityConfirmPassword, setVisibilityConfirmPassword] = useState(false);
    
    const [realTimeErrors, setRealTimeErrors] = useState({ password: '', confirmPassword: '' });
    const [showTooltips, setShowTooltips] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0); 

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                await validateResetToken(token);
                window.history.replaceState({}, '', '/reset-password');
                setIsValidating(false);
            } catch (error) {
                navigate('/login');
            }
        };
        verifyToken();
    }, [token, navigate]);


    useEffect(() => {
        const errors = { password: '', confirmPassword: '' };
        const pass = resetPasswords.password;

        if (pass && pass.length < 6) {
            errors.password = t('landing.ResetPasswordPage.minChars', 'Mínimo 6 caracteres');
        } else if (pass && !/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
            errors.password = t('landing.ResetPasswordPage.specialCharRequired', 'Debe incluir al menos un carácter especial');
        } else if (pass && !/[0-9]/.test(pass)) {
            errors.password = t('landing.ResetPasswordPage.numberRequired', 'Debe incluir al menos un número');
        }

        if (resetPasswords.confirmPassword && pass !== resetPasswords.confirmPassword) {
            errors.confirmPassword = t('landing.ResetPasswordPage.passwordsDoNotMatch', 'Las contraseñas no coinciden');
        }

        setRealTimeErrors(errors);
        setPasswordStrength(calculatePasswordStrength(pass));
        setShowTooltips(pass.length > 0 || resetPasswords.confirmPassword.length > 0);
        
    }, [resetPasswords, t]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (realTimeErrors.password || realTimeErrors.confirmPassword || passwordStrength < 50) return;

        const success = await handleResetPassword(token || "");
        if (success) navigate('/login');
    };

    if (isValidating) return <Loading fullscreen text={t('landing.ResetPasswordPage.validating', 'Validando enlace de seguridad...')} />;

    return (
        <AuthLayout>
            <h2 style={{ marginBottom: '1rem' }}>{t('landing.ResetPasswordPage.newPasswordTitle', 'Nueva contraseña')}</h2>
            <p style={{ marginBottom: '2rem', color: '#666', textAlign: 'center' }}>
                {t('landing.ResetPasswordPage.newPasswordSubtitle', 'Crea una contraseña segura con números y caracteres especiales.')}
            </p>

            <form className={styles['form-auth']} onSubmit={onSubmit}>
                
                <div className={styles['form-auth__field']}>
                    <TooltipUi
                        title={realTimeErrors.password || ""}
                        open={!!realTimeErrors.password && showTooltips}
                        disableFocusListener
                        disableHoverListener
                        disableTouchListener
                    >
                        <input
                            type={visibilityPassword ? 'text' : 'password'}
                            className={`${styles['form-auth__input']} ${realTimeErrors.password ? styles['form-auth__input--error'] : ''}`}
                            placeholder={t('landing.ResetPasswordPage.passwordPlaceholder', 'Contraseña')}
                            value={resetPasswords.password}
                            onChange={(e) => setResetPasswords({ ...resetPasswords, password: e.target.value })}
                            disabled={loading}
                        />
                    </TooltipUi>
                    <button
                        type="button"
                        onClick={() => setVisibilityPassword(!visibilityPassword)}
                        className={styles['form-auth__password-toggle']}
                    >
                        {visibilityPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </button>
                </div>

                {resetPasswords.password.length > 0 && (
                    <Box sx={{ mb: 2, mt: -1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ color: '#888' }}>
                                {t('landing.ResetPasswordPage.strength', 'Seguridad de la contraseña')}:
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: getPasswordStrengthColor(passwordStrength) }}>
                                {getPasswordStrengthLabel(passwordStrength, t)}
                            </Typography>
                        </Box>
                        <LinearProgress 
                            variant="determinate" 
                            value={passwordStrength} 
                            sx={{
                                height: 6,
                                borderRadius: 5,
                                backgroundColor: '#edf2f7',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: getPasswordStrengthColor(passwordStrength),
                                    borderRadius: 5,
                                }
                            }}
                        />
                    </Box>
                )}

                <div className={styles['form-auth__field']}>
                    <TooltipUi
                        title={realTimeErrors.confirmPassword || ""}
                        open={!!realTimeErrors.confirmPassword && showTooltips}
                        disableFocusListener
                        disableHoverListener
                        disableTouchListener
                    >
                        <input
                            type={visibilityConfirmPassword ? 'text' : 'password'}
                            className={`${styles['form-auth__input']} ${realTimeErrors.confirmPassword ? styles['form-auth__input--error'] : ''}`}
                            placeholder={t('landing.ResetPasswordPage.confirmPasswordPlaceholder', 'Confirmar contraseña')}
                            value={resetPasswords.confirmPassword}
                            onChange={(e) => setResetPasswords({ ...resetPasswords, confirmPassword: e.target.value })}
                            disabled={loading}
                        />
                    </TooltipUi>
                    <button
                        type="button"
                        onClick={() => setVisibilityConfirmPassword(!visibilityConfirmPassword)}
                        className={styles['form-auth__password-toggle']}
                    >
                        {visibilityConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </button>
                </div>

                <button 
                    type="submit" 
                    className={styles['form-auth__button']} 
                    disabled={loading || !!realTimeErrors.password || !!realTimeErrors.confirmPassword || passwordStrength < 40}
                >
                    {loading ? t('landing.ResetPasswordPage.loadingBtn') : t('landing.ResetPasswordPage.updateButton', 'Actualizar contraseña')}
                </button>
            </form>
        </AuthLayout>
    );
};

export default ResetPasswordPage;