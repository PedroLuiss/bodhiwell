import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../../context/AuthContext';
import heroVideo from '../../../assets/videos/hero-background.mp4';
import styles from './HeroSection.module.scss';

export const HeroSection = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthContext();

    return (
        <section className={styles['hero']}>
            <video
                className={styles['hero__video']}
                autoPlay
                loop
                muted
                playsInline
            >
                <source src={heroVideo} type="video/mp4" />
            </video>
            
            <div className={styles['hero__overlay']} />

            <div className={styles['hero__content']}>
                <h1 className={styles['hero__title']} data-no-animate>
                    <span>{t("landing.heroSection.titleLine1", "Hay otra forma de")}</span>
                    <span>{t("landing.heroSection.titleLine2", "cuidar tu salud.")}</span>
                </h1>
                
                <p className={styles['hero__sub']}>
                    {t("landing.heroSection.subheading", "Más allá del diagnóstico, hay un camino hacia el bienestar")}
                </p>

                <div className={styles['hero__cta-group']}>
                    {!isAuthenticated ? (
                        <>
                            <button
                                className={styles['hero__cta']}
                                onClick={() => navigate("/register")}
                            >
                                {t("landing.heroSection.ctaButton", "Crear mi cuenta")}
                            </button>
                            <p className={styles['hero__note']} data-no-animate>
                                <span>{t("landing.heroSection.noteLine1", "Creá tu cuenta sin costo y empezá a explorar")}</span> <span>{t("landing.heroSection.noteLine2", "profesionales y recursos.")}</span>
                                
                            </p>
                        </>
                    ) : (
                        <button
                            className={styles['hero__cta']}
                            onClick={() => navigate("/dashboard")}
                        >
                            {t("landing.heroSection.goDashboard", "Ir a mi panel")}
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};