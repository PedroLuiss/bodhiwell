import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useProfile from "./useProfile";
import { useNotification } from '../context/NotificationContext';
import { useAuthContext } from '../context/AuthContext';

export const useSelectionTypeAccount = () => {
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const { updateProfile, loading, error: errorProfile } = useProfile();
    const navigate = useNavigate();
    const { user } = useAuthContext();
    const [error, setError] = useState<string | null>(null);

    const handleUpdateProfile = async (type: 'professional' | 'patient') => {
        setError(null);
        try {
            const payload = {
                type_account: type,
                details: {
                    policies: true,
                },
            };
            const result = await updateProfile(payload);

            if (result && (result.code === 200 || result.code === 201)) {
                // if (type === "professional") {
                //     navigate('/dashboard');
                // } else {
                //     navigate('/home');
                // }

                navigate('/verify-email', { state: { email: user?.email } });
            } else {
                showNotification(errorProfile ?? t('landing.SelectionTypeAccount.updateError'), 'error');
            }
        } catch (err: any) {
            setError(err.message || t('landing.SelectionTypeAccount.genericError'));
            showNotification(err.message || t('landing.SelectionTypeAccount.genericError'), 'error');
        }
    };

    return {
        handleUpdateProfile,
        loading,
        error,
        t
    };
};

export default useSelectionTypeAccount;
