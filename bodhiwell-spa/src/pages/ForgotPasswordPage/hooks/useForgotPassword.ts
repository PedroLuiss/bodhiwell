import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';

export const useForgotPassword = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { forgotEmail, setForgotEmail, handleForgotPassword, loading } = useAuth();
    
    const [emailError, setEmailError] = useState<string | null>(null);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            return t('landing.ForgotPasswordPage.errors.required', 'El correo es obligatorio');
        }
        if (!emailRegex.test(email)) {
            return t('landing.ForgotPasswordPage.errors.invalid', 'Ingresa un correo electrónico válido');
        }
        return null;
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);
        const value = e.target.value;
        setForgotEmail(value);
        
        if (emailError) {
            setEmailError(null);
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const errorMsg = validateEmail(forgotEmail);
        if (errorMsg) {
            setEmailError(errorMsg);
            return;
        }

        const success = await handleForgotPassword();
        
        if (success) {
            navigate('/login');
        }
    };

    return {
        t,
        forgotEmail,
        loading,
        emailError,
        onSubmit,
        handleEmailChange
    };
};