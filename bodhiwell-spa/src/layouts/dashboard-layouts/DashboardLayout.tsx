import { SidebarProvider, useSidebarContext } from '../../context/SidebarContext';
import Sidebar from './Sidebar';
// import Header from './Header';
import { DashboardLayoutProps } from '../../types/dashboard';
import styles from './style/DashboardLayout.module.scss';
import classNames from 'classnames';
import { SubmenuPanel } from './SubmenuPanel';
import { useEffect, useRef } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { VerifyEmailAlert } from '../../components/ui/VerifyEmailAlert/VerifyEmailAlert';

import MenuIcon from '@mui/icons-material/Menu';

const MainContent = ({ children }: DashboardLayoutProps) => {
  const { isSidebarOpen, submenuData, toggleSidebar } = useSidebarContext();
  const isSubmenuActive = submenuData.items !== null;

  return (
    <>
      <button 
        className={styles['dashboard-layout__mobile-toggle']} 
        onClick={toggleSidebar}
        aria-label="Toggle Menu"
      >
        <MenuIcon />
      </button>

      <div 
        className={classNames(styles['dashboard-layout__backdrop'], {
            [styles['is-visible']]: isSidebarOpen
        })} 
        onClick={toggleSidebar} 
      />
      
      <div
        className={classNames(
          styles['dashboard-layout__main'],
          {
            [styles['dashboard-layout__main-sidebar-closed']]: !isSidebarOpen,
            [styles['dashboard-layout__main-submenu-active']]: isSubmenuActive,
          }
        )}
      >
        {/* <Header title={pageTitle} /> */}
        <div className={styles['dashboard-layout__content']}>
          {children}
        </div>
      </div>
    </>
  );
};


const DashboardLayoutContent = ({ children, pageTitle }: DashboardLayoutProps) => {
  const { isSidebarOpen, submenuData, closeSidebar } = useSidebarContext();
  const { user, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLElement>(null);
  const submenuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isAuthenticated && !user?.type_account) {
      navigate('/selection-type-account', { replace: true });
    }
  }, [user, isAuthenticated, navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isSidebarOpen && !submenuData.items) return;
     
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen, submenuData.items, closeSidebar]);


  return (
    <div className={styles['dashboard-layout']}>
      <Sidebar ref={sidebarRef} />
      <SubmenuPanel ref={submenuRef} />
      <MainContent pageTitle={pageTitle}>
        {children}
      </MainContent>
    </div>
  );
};

const DashboardLayout = ({ children, pageTitle }: DashboardLayoutProps) => (
  <SidebarProvider>
    <DashboardLayoutContent pageTitle={pageTitle}>
      {children}
    </DashboardLayoutContent>
    <VerifyEmailAlert />
  </SidebarProvider>
);

export default DashboardLayout;