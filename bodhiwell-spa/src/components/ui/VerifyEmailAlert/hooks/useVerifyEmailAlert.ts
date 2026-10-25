import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../../../context/AuthContext';
import { useNotification } from '../../../../context/NotificationContext';
import { useVerifyEmailActions } from '../../../../hooks/useVerifyEmailActions';

export const useVerifyEmailAlert = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthContext();
    const { showNotification } = useNotification();
    const { resendEmail, isResending } = useVerifyEmailActions();
    
    const [isDismissed, setIsDismissed] = useState(false);

    const isVisible = isAuthenticated && user && !user.is_email_verified && !isDismissed;

    const handleVerifyClick = useCallback(async () => {
        if (!user?.email) return;

        const result = await resendEmail(user.email);
        if (result.success) {
            navigate('/verify-email', {
                state: { email: user.email }
            });
        } else {
            showNotification(result.message || 'Error al reenviar el correo', 'error');
        }

    }, [user?.email, resendEmail, navigate]);

    const handleDismiss = useCallback(() => {
        setIsDismissed(true);
    }, []);

    return {
        t,
        user,
        isVisible,
        isResending,
        handleVerifyClick,
        handleDismiss
    };
};