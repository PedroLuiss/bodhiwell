import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNewsletterSubscription } from "../../../../hooks/useNewsletterSubscription";

export const useNewsletterForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    interests: ""
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    interests: ""
  });

  const { subscribe, isLoading, error: apiError } = useNewsletterSubscription();
  const { t } = useTranslation();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {
      name: "",
      email: "",
      interests: ""
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

    if (!formData.interests.trim()) {
      newErrors.interests = t('landing.newsletterSubscription.errors.interestsRequired', 'Tus intereses son requeridos');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!validate()) return;

    try {
      const wasSuccessful = await subscribe(formData);
      if (wasSuccessful) {
        setFormData({ name: "", email: "", interests: "" });
        setErrors({ name: "", email: "", interests: "" });
      }
    } catch (err) {
      console.error("Subscription failed:", err);
    }
  };

  const isFormInvalid = !formData.name || !formData.email || !formData.interests;

  return {
    formData,
    errors,
    isLoading,
    error: apiError,
    t,
    handleChange,
    handleSubmit,
    isFormInvalid,
  };
};