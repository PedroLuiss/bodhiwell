import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../../context/NotificationContext";
import { useContact } from "../../../hooks/useContact"; 

export const useContactPage = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  
  const { sendMessage, loading: isLoading, error: apiError } = useContact();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isSent) {
      timeoutId = setTimeout(() => {
        setIsSent(false);
        setFormData({ name: "", email: "", message: "" });
        setErrors({ name: "", email: "", message: "" });
      }, 10000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isSent]);


  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {
      name: "",
      email: "",
      message: ""
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = t('contactPage.errors.nameRequired', 'El nombre es requerido');
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contactPage.errors.emailRequired', 'El correo es requerido');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('contactPage.errors.emailInvalid', 'El correo no es válido');
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contactPage.errors.messageRequired', 'El mensaje es requerido');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmitContact = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) return;

    const payload = {
      fullName: formData.name,
      email: formData.email,
      message: formData.message
    };

    const result = await sendMessage(payload);

    if (result) {
      setIsSent(true);
      showNotification(result.message || t('contactPage.successMessage', '¡Mensaje enviado con éxito!'), 'success');
      // No reseteamos formData aquí, dejamos que el useEffect lo haga después de los 10s 
      // o lo reseteamos inmediatamente si el usuario lo prefiere. 
      // El usuario pidió mostrar de nuevo el formulario.
    } else {
      showNotification(apiError || t('contactPage.errorMessage', 'Error al enviar mensaje'), 'error');
    }
  };

  const isFormInvalid = !formData.name || !formData.email || !formData.message;

  return {
    formData,
    errors,
    isLoading,
    isSent,
    error: apiError,
    t,
    handleChange,
    handleSubmitContact,
    isFormInvalid
  };
};