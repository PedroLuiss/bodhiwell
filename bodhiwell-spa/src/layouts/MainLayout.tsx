import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from "./MainLayout.module.scss";
import { Footer, Header } from "../components/Landing";
import { CookiesConsentModal } from "../components/ui/CookiesConsentModal/CookiesConsentModal";

const MainLayout: React.FC<{ children: React.ReactNode, mode?: 'light' | 'dark' | undefined }> = ({ children, mode = "light" }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className={styles['main-layout']}>
      <Header />
      <main className={styles['main-layout__content']}>
        {children}
      </main>
      <Footer />

      <CookiesConsentModal />
    </div>
  );
};

export default MainLayout;