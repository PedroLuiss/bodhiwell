import { Trans } from 'react-i18next';
import styles from "./ContactPage.module.scss";
import { Link } from 'react-router-dom';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { useContactPage } from "./hooks/useContactPage";
import { ContactForm } from "../../components/ContactPage";

export const ContactPage = () => {
    const {
        formData, errors, isLoading, isSent, error, t,
        handleChange, handleSubmitContact, isFormInvalid
    } = useContactPage();

    return (
        <section className={styles.contact}>
            <div className={styles['contact__wrapper']}>

                <div className={styles['contact__info']}>
                    <span className={styles['contact__eyebrow']}>
                        {t('contactPage.info.eyebrow', 'Contacto')}
                    </span>
                    <h1 className={styles['contact__title']}>
                        {t('contactPage.info.title', 'Conecta con nosotros')}
                    </h1>
                    <p className={styles['contact__description']}>
                        {t('contactPage.info.text', 'Tu opinión es importante. Usa el formulario para enviarnos tus dudas o sugerencias y te responderemos a la brevedad.')}
                    </p>

                    <div className={styles['contact__separator']}></div>

                    <p className={styles['contact__footer-text']}>
                        <Trans i18nKey="contactPage.info.subtext">
                            También puedes visitar nuestra sección de <Link to="/faqs" className={styles['contact__link']}>Preguntas Frecuentes</Link> para obtener respuestas inmediatas.
                        </Trans>
                    </p>
                </div>

        <div className={styles['contact__card']}>
          {isSent ? (
            <div className={styles['success']}>
              <div className={styles['success__icon']}><MarkEmailReadIcon /></div>
              <h2 className={styles['success__title']}>{t('contactPage.successTitle', '¡Mensaje enviado!')}</h2>
              <p className={styles['success__text']}>{t('contactPage.successText', 'Gracias por escribirnos. Nos pondremos en contacto contigo muy pronto.')}</p>
            </div>
          ) : (
            <ContactForm 
              formData={formData}
              errors={errors}
              isLoading={isLoading}
              isFormInvalid={isFormInvalid}
              error={error}
              t={t}
              handleChange={handleChange}
              handleSubmit={handleSubmitContact}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactPage;