import { useState } from 'react';
import { verifyOtp, resendVerifyEmail } from '../services/authService';

export const useVerifyEmailActions = () => {
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const verifyCode = async (email: string, code: string) => {
        setIsVerifying(true);
        try {
            const result = await verifyOtp(email, code);
            return { success: true, message: result.message };
        } catch (error: any) {
            return { 
                success: false, 
                message: error.response?.data?.message || error.response?.data?.error 
            };
        } finally {
            setIsVerifying(false);
        }
    };

    const resendEmail = async (email: string) => {
        setIsResending(true);
        try {
            const result = await resendVerifyEmail(email);
            return { success: true, message: result.message };
        } catch (error: any) {
            return { 
                success: false, 
                message: error.response?.data?.message || error.response?.data?.error 
            };
        } finally {
            setIsResending(false);
        }
    };

    return { verifyCode, resendEmail, isVerifying, isResending };
};