import { useState } from 'react';

import {
  login as loginService,
  register as registerService,
  loginWithGoogle,
  getGoogleRedirectResult,
  loginWithFirebase,
  LoginFirebaseResponse,
  LoginFirebaseError,
  resetPassword,
  forgotPassword,
  validateResetToken
} from '../services/authService';

import { useAuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from './use-mobile';
import { useEffect } from 'react';

export function useAuth() {
  const { showNotification } = useNotification();
  const [form, setForm] = useState({ email: '', password: '' });

  const [formRegister, setFormRegister] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    type_account: 'patient',
    terms_accepted: false,
    newsletter_active: false
  });
  const [errors, setErrors] = useState({ email: '', password: '', general: '' });
  const [errorsRegister, setErrorsRegister] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    general: '',
    type_account: '',
    terms_accepted: ''
  });
  const [loading, setLoading] = useState(false);

  const [forgotEmail, setForgotEmail] = useState('');
  const [resetPasswords, setResetPasswords] = useState({ password: '', confirmPassword: '' });

  const { login: setAuthContext } = useAuthContext();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getGoogleRedirectResult();
        if (result && result.error === false) {
          setLoading(true);
          const firebaseResult = await loginWithFirebase(result.accessToken);
          setLoading(false);
          if ('token' in firebaseResult && 'user' in firebaseResult) {
            setAuthContext(firebaseResult.token ?? "", firebaseResult.user ?? {});
          }
        }
      } catch (err: any) {
        setLoading(false);
        console.error("Error handling redirect login:", err);
      }
    };
    handleRedirect();
  }, [setAuthContext]);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!form.email) {
      newErrors.email = t('landing.validation.emailRequired');
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(form.email)) {
      newErrors.email = t('landing.validation.emailInvalid');
    } else if (form.email.length < 6) {
      newErrors.email = t('landing.validation.minChars');
    }

    if (!form.password) {
      newErrors.password = t('landing.validation.passwordRequired');
    } else if (form.password.length < 6) {
      newErrors.password = t('landing.validation.minChars');
    }

    return newErrors;
  };

  const validateRegister = () => {
    const newErrors: {
      first_name?: string;
      last_name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      main_profession?: string;
      terms_accepted?: string;
    } = {};

    if (!formRegister.first_name) {
      newErrors.first_name = t('landing.validation.firstNameRequired');
    }

    if (!formRegister.last_name) {
      newErrors.last_name = t('landing.validation.lastNameRequired');
    }

    if (!formRegister.email) {
      newErrors.email = t('landing.validation.emailRequired');
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(formRegister.email)) {
      newErrors.email = t('landing.validation.emailInvalid');
    } else if (formRegister.email.length < 6) {
      newErrors.email = t('landing.validation.minChars');
    }

    if (!formRegister.password) {
      newErrors.password = t('landing.validation.passwordRequired');
    } else if (formRegister.password.length < 6) {
      newErrors.password = t('landing.validation.minChars');
    }

    if (!formRegister.confirmPassword) {
      newErrors.confirmPassword = t('landing.validation.confirmPasswordRequired');
    } else if (formRegister.confirmPassword !== formRegister.password) {
      newErrors.confirmPassword = t('landing.validation.passwordsDoNotMatch');
    }

    if (!formRegister.terms_accepted) {
      newErrors.terms_accepted = t('landing.validation.termsRequired', 'Debes aceptar los términos y condiciones');
    }

    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = e.target.name || e.target.id;
    setForm({ ...form, [field]: e.target.value });
    setErrors({ ...errors, [field]: '', general: '' });
  };

  const handleChangeRegister = (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = e.target.name || e.target.id;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormRegister({ ...formRegister, [field]: value });
    setErrorsRegister({ ...errorsRegister, [field]: '', general: '' });
  };

  const handleLogin = async () => {
    const validation = validate();
    setErrors((prev) => ({ ...prev, ...validation, general: '' }));

    if (Object.keys(validation).length > 0) return false;

    setLoading(true);
    const result = await loginService(form);
    setLoading(false);

    if (result && 'token' in result && result.token && result.user) {
      setAuthContext(
        result.token as string,
        result.user as any
      );

      return true;
    } else {
      const errorMessage = ('error' in result ? result.error : null) || ('message' in result ? result.message : null) || t('validation.loginError');
      showNotification(errorMessage, 'error');
      setErrors((prev) => ({ ...prev, general: errorMessage }));
      return false;
    }
  };

  const handleRegister = async () => {
    const validation = validateRegister();
    setErrorsRegister((prev) => ({ ...prev, ...validation, general: '' }));

    if (Object.keys(validation).length > 0) return false;

    setLoading(true);
    const { email, first_name, last_name, password, type_account, newsletter_active } = formRegister
    const result = await registerService({
      email,
      first_name,
      type_account,
      last_name,
      password,
      newsletter_active
    });
    setLoading(false);

    if (result && 'token' in result && result.token && result.user) {
      setAuthContext(result.token as string, result.user as any);
      return true;
    } else {
      showNotification(result.message ?? t('validation.registerError'), 'error');
      setErrorsRegister((prev) => ({
        ...prev,
        email: result.message === "Este correo ya está registrado" ? result.message : prev.email,
        general: result.message !== "Este correo ya está registrado" ? (result.message || t('validation.unknownError')) : '',
      }));
      return false;
    }
  };

  const handleLoginWithGoogle = async (): Promise<LoginFirebaseResponse | LoginFirebaseError | null> => {
    setLoading(true);
    try {
      const user = await loginWithGoogle();

      if (!user || user.error === true) {
        console.error("No se pudo obtener el token de acceso de Google:", user);
        setErrors((prev) => ({ ...prev, general: t('validation.unknownError') }));
        setLoading(false);
        return null;
      }

      const result = await loginWithFirebase(user.accessToken);
      setLoading(false);

      if ('token' in result && 'user' in result) {
        setAuthContext(result.token ?? "", result.user ?? {});
        return result;
      } else {
        setErrors((prev) => ({ ...prev, general: result.message || t('validation.unknownError') }));
        return result;
      }
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      setErrors((prev) => ({ ...prev, general: t('validation.unknownError') }));
      setLoading(false);
      return null;
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      showNotification(t('landing.ForgotPasswordPage.emailRequired'), 'error');
      return false;
    }
    setLoading(true);
    try {
      await forgotPassword(forgotEmail);
      showNotification(t('landing.ForgotPasswordPage.emailSentSuccess'), 'success');
      setLoading(false);
      return true;
    } catch (err: any) {
      showNotification(err.message || t('landing.ForgotPasswordPage.unknownError'), 'error');
      setLoading(false);
      return false;
    }
  };

  const handleResetPassword = async (token: string) => {
    if (resetPasswords.password.length < 6) {
      showNotification(t('landing.ResetPasswordPage.minChars'), 'error');
      return false;
    }
    if (resetPasswords.password !== resetPasswords.confirmPassword) {
      showNotification(t('landing.ResetPasswordPage.passwordsDoNotMatch'), 'error');
      return false;
    }

    setLoading(true);
    try {
      await resetPassword(token, resetPasswords.password);
      showNotification(t('landing.ResetPasswordPage.resetSuccess'), 'success');
      setLoading(false);
      return true;
    } catch (err: any) {
      showNotification(err.message || t('landing.ResetPasswordPage.unknownError'), 'error');
      setLoading(false);
      return false;
    }
  };

  return {
    form,
    formRegister,
    setForm,
    setFormRegister,
    errors,
    errorsRegister,
    loading,
    handleChange,
    handleChangeRegister,
    handleLogin,
    handleRegister,
    handleLoginWithGoogle,

    forgotEmail,
    setForgotEmail,
    resetPasswords,
    setResetPasswords,
    handleForgotPassword,
    handleResetPassword,
    validateResetToken
  };
}

