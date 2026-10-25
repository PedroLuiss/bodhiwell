import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSidebarContext } from '../../../context/SidebarContext';
import { useIsMobile } from '../../../hooks/use-mobile';
import { useAuthContext } from '../../../context/AuthContext';
import { useUserStatus } from '../../../context/UserStatusContext';
import { useProfileCompletion } from '../../../context/ProfileCompletionContext';
import { localStorageHelper, REDIRECT_AFTER_LOGIN } from '../../../utils/localStorageHelper';
import { BLOCKED_STATUSES, getMenuItemKeys } from '../../../config/navs/mainMenuItems';

export const useSidebar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const isMobile = useIsMobile();
  
  const { 
    isSidebarOpen, 
    toggleSidebar, 
    closeSidebar, 
    submenuData, 
    setSubmenu 
  } = useSidebarContext();

  const { userStatusData, loading: statusLoading } = useUserStatus();
  const { 
    isProfileComplete, 
    isPersonalInfoComplete, 
    loading: completionLoading 
  } = useProfileCompletion();

  const menuItems = useMemo(() => getMenuItemKeys(user), [user]);

  const shouldBlockMenuItems = useMemo(() => {
    return (
      userStatusData?.type_account === 'professional' &&
      !!userStatusData &&
      BLOCKED_STATUSES.includes(userStatusData.status)
    );
  }, [userStatusData]);

  const handleItemClick = useCallback(() => {
    setSubmenu({ items: null, title: null });
    if (isMobile) {
      closeSidebar();
    }
  }, [closeSidebar, setSubmenu, isMobile]);

  const handleLogout = useCallback(() => {
    localStorageHelper.removeItem(REDIRECT_AFTER_LOGIN);
    logout();
    navigate('/');
  }, [logout, navigate]);

  const menuGroups = useMemo(() => [
    { id: 'registro', label: t('appAdmin.Sidebar.groups.registration', 'Registro') },
    { id: 'admin', label: t('appAdmin.Sidebar.groups.admin', 'Administración') },
    { id: 'other', label: null }
  ], [t]);

  return {
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
  };
};