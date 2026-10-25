import styles from "./NewsletterSubscription.module.scss";
import { useNewsletterForm } from "./hooks/useNewsletterForm";
import newsletterBg from "../../../assets/images/homeRegister/img_contact.jpg";

export const NewsletterSubscription = () => {
  const {
    formData,
    errors,
    isLoading,
    error,
    t,
    handleChange,
    handleSubmit,
    isFormInvalid
  } = useNewsletterForm();

  return (
    <section className={styles['newsletter']} id="contact">
      <div className={styles['newsletter__media']}>
        <img 
          src={newsletterBg} 
          alt="Persona sonriendo al aire libre" 
          className={styles['newsletter__image']} 
        />
        
        <div className={styles['newsletter__form-wrap']}>
          <form 
            className={styles['newsletter-form']} 
            onSubmit={handleSubmit}
            noValidate
          >
            <p className={styles['newsletter-form__copy']}>
              {t('landing.newsletterSubscription.description', 'Novedades, talento y conocimiento. Suscríbete para conocer a nuestros profesionales destacados y recibir contenido de valor directamente en tu bandeja de entrada.')}
            </p>

            <div className={styles['newsletter-form__field-group']}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t("landing.newsletterSubscription.name", "Tu nombre")}
                className={`${styles['newsletter-form__input']} ${errors.name ? styles['newsletter-form__input--error'] : ''}`}
                disabled={isLoading}
                required
              />
              {errors.name && <span className={styles['newsletter-form__error-text']}>{errors.name}</span>}
            </div>

            <div className={styles['newsletter-form__field-group']}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("landing.newsletterSubscription.email", "tunombre@email.com")}
                className={`${styles['newsletter-form__input']} ${errors.email ? styles['newsletter-form__input--error'] : ''}`}
                disabled={isLoading}
                required
              />
              {errors.email && <span className={styles['newsletter-form__error-text']}>{errors.email}</span>}
            </div>

            <div className={styles['newsletter-form__field-group']}>
              <input
                type="text"
                name="interests"
                onChange={handleChange}
                value={formData.interests || ''} 
                placeholder={t("landing.newsletterSubscription.interest", "Ej. medicina integrativa, bienestar, comunidad")}
                className={`${styles['newsletter-form__input']} ${errors.interests ? styles['newsletter-form__input--error'] : ''}`}
                disabled={isLoading}
                required
              />
              {errors.interests && <span className={styles['newsletter-form__error-text']}>{errors.interests}</span>}
            </div>

            <button
              type="submit"
              className={styles['newsletter-form__button']}
              disabled={isLoading}
            >
              {isLoading
                ? t("landing.newsletterSubscription.buttonLoading", "Enviando...")
                : t("landing.newsletterSubscription.buttonText", "Quiero empezar")
              }
            </button>

            {error && (
              <p className={styles['newsletter-form__message--error']}>
                🚨 ¡Error! No pudimos completar tu suscripción.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSubscription;