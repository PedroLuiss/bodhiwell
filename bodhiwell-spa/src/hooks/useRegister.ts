import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../context/AuthContext';
import { useEffect } from 'react';

const ACCOUNT_SELECTION_ROUTE = '/selection-type-account';

export const useRegister = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useAuthContext();
    const { professionalCheck } = location.state || {};

    const [visibilityPassword, setVisibilityPassword] = useState(false);
    const [visibilityConfirmPassword, setVisibilityConfirmPassword] = useState(false);
    const [isProfessional, setIsProfessional] = useState(professionalCheck ?? false);
    const [showErrorTooltip, setShowErrorTooltip] = useState(false);

    const {
        formRegister: form,
        setFormRegister,
        errorsRegister: errors,
        loading,
        handleChangeRegister,
        handleRegister,
        handleLoginWithGoogle: loginWithGoogle,
    } = useAuth();

    useEffect(() => {
        const isGoogle = sessionStorage.getItem('google_login_pending');
        if (isAuthenticated && user && isGoogle) {
            sessionStorage.removeItem('google_login_pending');
            if (user.type_account) {
                navigate('/dashboard');
            } else {
                navigate(ACCOUNT_SELECTION_ROUTE);
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const registerResult = await handleRegister();

        if (!registerResult) {
            return;
        }

        if (!registerResult && Object.keys(errors).length > 0) {
            setShowErrorTooltip(true);

            setTimeout(() => {
                setShowErrorTooltip(false);
            }, 3000);
        }

        // if (registerResult === true) {
        //     const redirectUrl = localStorageHelper.getItem<string>(REDIRECT_AFTER_LOGIN);
        //     if (redirectUrl) {
        //         localStorageHelper.removeItem(REDIRECT_AFTER_LOGIN);
        //         navigate(redirectUrl);
        //     } else {
        //         navigate(PROFILE_ROUTE);
        //     }
        // }
        if (registerResult === true) {
            navigate('/verify-email', { state: { email: form.email } });
        }
    };

    const handleLoginWithGoogle = async () => {
        sessionStorage.setItem('google_login_pending', 'true');
        const result = await loginWithGoogle();
        
        if (result && 'user' in result && result.user) {
            sessionStorage.removeItem('google_login_pending');
            if (result.user.type_account) {
                navigate('/dashboard');
            } else {
                navigate(ACCOUNT_SELECTION_ROUTE);
            }
        }
    };

    const isTooltipOpen = (fieldName: keyof typeof errors) => {
        return !!errors[fieldName] && showErrorTooltip;
    };

    const toggleProfessional = (checked: boolean) => {
        setIsProfessional(checked);
        setFormRegister(prev => ({
            ...prev,
            type_account: checked ? 'professional' : 'patient'
        }));
    };

    return {
        t,
        form,
        errors,
        loading,
        visibilityPassword,
        setVisibilityPassword,
        visibilityConfirmPassword,
        setVisibilityConfirmPassword,
        isProfessional,
        toggleProfessional,
        handleChangeRegister,
        handleSubmit,
        handleLoginWithGoogle,
        isTooltipOpen
    };
};

export default useRegister;
