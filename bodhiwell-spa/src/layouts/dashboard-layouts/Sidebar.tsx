import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import styles from './style/Sidebar.module.scss';

import { MenuItem } from '../../components/Sidebar/MenuItem';
import { useSidebar } from './hooks/useSidebar';
import { ROUTES_TO_BLOCK } from '../../config/navs/mainMenuItems';

const Sidebar = React.forwardRef<HTMLElement>((_props, ref) => {
  const {
    t,
    user,
    isSidebarOpen,
    toggleSidebar,
    isMobile,
    submenuData,
    menuItems,
    menuGroups,
    statusLoading,
    completionLoading,
    userStatusData,
    shouldBlockMenuItems,
    isProfileComplete,
    isPersonalInfoComplete,
    handleItemClick,
    handleLogout
  } = useSidebar();

  if (isMobile && submenuData.items) {
    return null;
  }

  return (
    <aside
      ref={ref}
      className={classNames(styles['sidebar'], { 
        [styles['sidebar-closed']]: !isSidebarOpen 
      })}
    >
      <Link to="/" className={styles['sidebar__brand']}>
        <div className={styles['sidebar__brand-mark']} />
        <span className={styles['sidebar__brand-text']}>
            {user?.type_account === 'professional' 
              ? t('appAdmin.Sidebar.brand', 'Panel Profesional') 
              : t('appAdmin.Sidebar.brandPatient', 'Panel Paciente')}
        </span>
      </Link>

      <div className={styles['sidebar__menu']}>
        {menuGroups.map((group) => {
          const itemsInGroup = menuItems.filter(item => item.group === group.id);
          if (itemsInGroup.length === 0) return null;

          return (
            <React.Fragment key={group.id}>
              {group.label && isSidebarOpen && (
                <div className={styles['sidebar__group-title']}>{group.label}</div>
              )}

              {itemsInGroup.map((item) => {
                const isDisabled = shouldBlockMenuItems && ROUTES_TO_BLOCK.includes(item.labelKey);
                
                let showWarning = false;
                if (user?.type_account === 'professional' && userStatusData?.status !== 'active') {
                  if (item.labelKey === 'appAdmin.dashboard.profile') {
                    showWarning = !isProfileComplete;
                  } else if (item.labelKey === 'appAdmin.dashboard.profileMenu.personalInfo') {
                    showWarning = !isPersonalInfoComplete;
                  }
                }

                return (
                  <MenuItem
                    key={item.labelKey}
                    item={item}
                    isSidebarOpen={isSidebarOpen}
                    onClick={handleItemClick}
                    isDisabled={isDisabled || statusLoading || completionLoading} 
                    showWarning={showWarning}
                  />
                );
              })}

              {group.id !== 'other' && <div className={styles['sidebar__divider']} />}
            </React.Fragment>
          );
        })}
      </div>

      <div className={styles['sidebar__footer']}>
        {isSidebarOpen && (
          <div className={styles['sidebar__user-info']}>
             {user?.first_name} {user?.last_name} • {user?.type_account === 'professional' ? t('appAdmin.Sidebar.userType.professional', 'Profesional') : t('appAdmin.Sidebar.userType.patient', 'paciente')}
          </div>
        )}
        <button className={styles['sidebar__logout']} onClick={handleLogout}>
          <span className={styles['sidebar__logout-icon']}>↪ </span>
          {isSidebarOpen && <span>{t("appAdmin.dashboard.logout")}</span>}
        </button>
      </div>

      <div className={styles['sidebar__toggle-container']} onClick={toggleSidebar}>
        <div className={classNames(
          styles['sidebar__toggle-btn'], 
          isSidebarOpen ? styles['is-open'] : styles['is-closed']
        )}>
          <ArrowBackIosNewIcon sx={{ fontSize: 12 }} />
        </div>
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;