import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import Badge from '@mui/material/Badge';
import { MainMenuItem } from '../../types/dashboard';
import styles from '../../layouts/dashboard-layouts/style/Sidebar.module.scss';
import { MenuItemWarningIcon } from './MenuItemWarningIcon/MenuItemWarningIcon';
import { usePushContext } from '../../context/PushNotificationContext';
import { getBadgeNotificationStyles } from './constant';

type MenuItemProps = {
    item: MainMenuItem;
    isSidebarOpen: boolean;
    onClick: () => void;
    isDisabled?: boolean; 
    showWarning?: boolean;
}

export const MenuItem = ({ item, isSidebarOpen, onClick, isDisabled = false, showWarning = false }: MenuItemProps) => {
    const { t } = useTranslation();
    const { unreadCount } = usePushContext();

    const isNotificationItem = item.path === '/notifications';

    return (
        <NavLink
            to={item.path!}
            className={({ isActive }) => classNames(
                styles['sidebar__menu-item'],
                {
                    [styles['sidebar__menu-item--active']]: isActive,
                    [styles['sidebar__menu-item--disabled']]: isDisabled, 
                }
            )}
            onClick={(e) => isDisabled ? e.preventDefault() : onClick()}
            style={{ position: 'relative' }}
        >
            <div className={styles['sidebar__item-left']}>
                <div className={styles['sidebar__icon']}>
                    {item.icon}
                </div>
                {isSidebarOpen && <span className={styles['sidebar__label']}>{t(item.labelKey)}</span>}
            </div>

            {isNotificationItem && unreadCount > 0 && (
                <Badge 
                    badgeContent={unreadCount} 
                    color="error"
                    max={99}
                    sx={getBadgeNotificationStyles(isSidebarOpen)}
                />
            )}

            {showWarning && <MenuItemWarningIcon className={styles['sidebar__alert-dot']} position="top" />}
        </NavLink>
    );
};