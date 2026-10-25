

export const calculatePasswordStrength = (pass: string): number => {
    let strength = 0;
    if (pass.length >= 6) strength += 20;
    if (pass.length >= 10) strength += 10;
    if (/[A-Z]/.test(pass)) strength += 20;
    if (/[0-9]/.test(pass)) strength += 20;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) strength += 30;
    return strength;
};

export const getPasswordStrengthColor = (strength: number): string => {
    if (strength <= 30) return '#e74c3c'; 
    if (strength <= 60) return '#f39c12'; 
    if (strength <= 80) return '#3498db'; 
    return '#7A9E7E'; 
};

export const getPasswordStrengthLabel = (strength: number, t: any): string => {
    if (strength === 0) return "";
    if (strength <= 30) return t('landing.ResetPasswordPage.strengthVeryWeak', 'Muy débil');
    if (strength <= 60) return t('landing.ResetPasswordPage.strengthMedium', 'Media');
    if (strength <= 80) return t('landing.ResetPasswordPage.strengthStrong', 'Fuerte');
    return t('landing.ResetPasswordPage.strengthVeryStrong', 'Muy segura');
};