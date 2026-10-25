import React from 'react';
import styles from '../../pages/ContactPage/ContactPage.module.scss';
import { ContactFormProps } from './types';

export const ContactForm: React.FC<ContactFormProps> = ({
  formData, errors, isLoading, isFormInvalid, error, t, handleChange, handleSubmit
}) => {
  return (
    <form className={styles['form']} onSubmit={handleSubmit} noValidate>
      <p className={styles['form__copy']}>
        {t('landing.newsletterSubscription.description', 'Novedades, talento y conocimiento. Suscríbete para conocer a nuestros profesionales destacados y recibir contenido de valor directamente en tu bandeja de entrada.')}
      </p>

      <div className={styles['form__field-group']}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={t("landing.newsletterSubscription.name", "Tu nombre")}
          className={`${styles['form__input']} ${errors.name ? styles['form__input--error'] : ''}`}
          disabled={isLoading}
          required
        />
        {errors.name && <span className={styles['form__error-text']}>{errors.name}</span>}
      </div>
      
      <div className={styles['form__field-group']}>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder={t("landing.newsletterSubscription.email", "tunombre@email.com")}
          className={`${styles['form__input']} ${errors.email ? styles['form__input--error'] : ''}`}
          disabled={isLoading}
          required
        />
        {errors.email && <span className={styles['form__error-text']}>{errors.email}</span>}
      </div>

      <div className={styles['form__field-group']}>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder={t("landing.newsletterSubscription.interest", "Ej. medicina integrativa, bienestar, comunidad")}
          className={`${styles['form__input']} ${styles['form__input--textarea']} ${errors.message ? styles['form__input--error'] : ''}`}
          disabled={isLoading}
          required
          rows={4}
        />
        {errors.message && <span className={styles['form__error-text']}>{errors.message}</span>}
      </div>

      <button
        type="submit"
        className={styles['form__button']}
        disabled={isLoading}
      >
        {isLoading
          ? t("landing.newsletterSubscription.buttonLoading", "Enviando...")
          : t("landing.newsletterSubscription.buttonText", "Quiero empezar")
        }
      </button>

      {error && (
        <p className={styles['form__message--error']}>
          {error}
        </p>
      )}
    </form>
  );
};
