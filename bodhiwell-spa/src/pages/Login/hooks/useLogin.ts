import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import { useAuthContext } from '../../../context/AuthContext';
import { localStorageHelper, REDIRECT_AFTER_LOGIN, REMEMBER_ME_EMAIL } from '../../../utils/localStorageHelper';
import { PROFILE_ROUTE, ACCOUNT_SELECTION_ROUTE } from '../constants';

export const useLogin = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user, isAuthenticated } = useAuthContext();
    const [visibilityPassword, setVisibilityPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        localStorageHelper.removeItem('professional_profile');
        localStorageHelper.removeItem('professional_preview_data');
        localStorageHelper.removeItem('professional_profile_backup');
    }, []);

    const { 
        form, 
        setForm,
        errors, 
        loading, 
        handleChange, 
        handleLogin, 
        handleLoginWithGoogle: loginWithGoogle 
    } = useAuth();

    useEffect(() => {
        const savedEmail = localStorageHelper.getItem<string>(REMEMBER_ME_EMAIL);
        if (savedEmail) {
            setForm((prev) => ({ ...prev, email: savedEmail }));
            setRememberMe(true);
        }
    }, [setForm]);

    useEffect(() => {
        if (isAuthenticated && user) {
            const redirectUrl = localStorageHelper.getItem<string>(REDIRECT_AFTER_LOGIN);
            if (redirectUrl) {
                localStorageHelper.removeItem(REDIRECT_AFTER_LOGIN);
                navigate(redirectUrl);
            } else if (user.type_account) {
                navigate(PROFILE_ROUTE);
            } else {
                navigate(ACCOUNT_SELECTION_ROUTE);
            }
        }
    }, [isAuthenticated, user, navigate]);

    const togglePasswordVisibility = () => {
        setVisibilityPassword((prev) => !prev);
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const isLoggedIn = await handleLogin();

        if (isLoggedIn) {
            if (rememberMe) {
                localStorageHelper.setItem(REMEMBER_ME_EMAIL, form.email);
            } else {
                localStorageHelper.removeItem(REMEMBER_ME_EMAIL);
            }

            const redirectUrl = localStorageHelper.getItem<string>(REDIRECT_AFTER_LOGIN);
            if (redirectUrl) {
                localStorageHelper.removeItem(REDIRECT_AFTER_LOGIN);
                navigate(redirectUrl);
            } else {
                navigate(PROFILE_ROUTE);
            }
        }
    };

    const handleGoogleLogin = async () => {
        const result = await loginWithGoogle();
        
        if (result && 'user' in result && result.user) {
            const redirectUrl = localStorageHelper.getItem<string>(REDIRECT_AFTER_LOGIN);
            if (redirectUrl) {
                localStorageHelper.removeItem(REDIRECT_AFTER_LOGIN);
                navigate(redirectUrl);
            } else if (result.user.type_account) {
                navigate(PROFILE_ROUTE);
            } else {
                navigate(ACCOUNT_SELECTION_ROUTE);
            }
        }
    };

    return {
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
    };
};