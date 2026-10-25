import React from "react";
import styles from "./PageContentLayout.module.scss";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface PageContentLayoutProps {
  title?: string;
  subtitle?: string; 
  children: React.ReactNode;
  showBackButton?: boolean;
  icon?: React.ElementType;
  actions?: React.ReactNode;
}

export const PageContentLayout = ({
  title,
  subtitle,
  children,
  showBackButton = false,
  icon: Icon,
  actions
}: PageContentLayoutProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles["page-layout"]}>
      {(showBackButton || actions) && (
        <div className={styles["page-layout__top-bar"]}>
          {showBackButton && (
            <button
              onClick={handleGoBack}
              className={styles["page-layout__back-btn"]}
              type="button"
            >
              <ArrowBackIcon sx={{ fontSize: 16 }} />
              <span>{t('appAdmin.PageContentLayout.back', 'Volver')}</span>
            </button>
          )}

          <div className={styles["page-layout__spacer"]} />

          {actions && (
            <div className={styles["page-layout__actions"]}>
              {actions}
            </div>
          )}
        </div>
      )}

      <section className={styles["page-layout__card"]}>
        {(title || subtitle) && (
          <header className={styles["page-layout__header"]}>
            <span className={styles["page-layout__mark"]}>✦</span>

            <div className={styles["page-layout__title-group"]}>
              {title && <h2 className={styles["page-layout__title"]}> {title}</h2>}
              {subtitle && <p className={styles["page-layout__subtitle"]}>{subtitle}</p>}
            </div>
          </header>
        )}

        <div className={styles["page-layout__content"]}>
          {children}
        </div>
      </section>
    </div>
  );
};