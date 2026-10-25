import { useState, useEffect, useRef, KeyboardEvent, ClipboardEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../../context/NotificationContext';
import { useAuthContext } from '../../../context/AuthContext';
import { useVerifyEmailActions } from '../../../hooks/useVerifyEmailActions';

export const useVerifyEmailForm = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { showNotification } = useNotification();
    const { user, setUser } = useAuthContext();
    
    const { verifyCode, resendEmail, isVerifying, isResending } = useVerifyEmailActions();

    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [timer, setTimer] = useState(59);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const email = location.state?.email || 'tu correo';

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        const data = e.clipboardData.getData("text").trim();
        if (!/^\d+$/.test(data)) return;

        const pasteData = data.substring(0, 6).split("");
        const newOtp = [...otp];

        pasteData.forEach((char, index) => {
            if (index < 6) newOtp[index] = char;
        });

        setOtp(newOtp);

        const lastIndex = Math.min(pasteData.length, 5);
        inputRefs.current[lastIndex]?.focus();
    };

    const handleVerify = async () => {
        const code = otp.join("");
        if (code.length < 6) return;

        const result = await verifyCode(email, code);
        if (result.success) {
            if (user) {
                setUser({ ...user, is_email_verified: true });
            }
            showNotification(result.message || t('verifyEmail.success'), 'success');
            navigate('/dashboard');
        } else {
            showNotification(result.message || t('verifyEmail.error'), 'error');
        }
    };

    const handleResend = async () => {
        const result = await resendEmail(email);
        if (result.success) {
            setTimer(59);
            showNotification(result.message || t('verifyEmail.codeResent'), 'success');
        } else {
            showNotification(result.message || t('verifyEmail.errorResending'), 'error');
        }
    };

    return {
        t, otp, timer, isVerifying, isResending, inputRefs,
        handleOtpChange, handleKeyDown, handlePaste, handleVerify, handleResend,
        navigate
    };
};