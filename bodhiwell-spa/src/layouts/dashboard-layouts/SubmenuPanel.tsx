import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { useIsMobile } from '../../hooks/use-mobile';
import { useSidebarContext } from '../../context/SidebarContext';
import styles from './style/SubmenuPanel.module.scss';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import React from 'react';

export const SubmenuPanel = React.forwardRef<HTMLElement>((props, ref) => {
    const { submenuData, setSubmenu, isSidebarOpen, closeSidebar } = useSidebarContext();
    const isMobile = useIsMobile();
    const { t } = useTranslation();

    if (!submenuData.items) {
        return null;
    }

    const handleBackClick = () => {
        setSubmenu({ items: null, title: null });
    };

    return (
        <aside
            ref={ref}
            className={classNames(
                styles['submenu-panel'],
                {
                    [styles['submenu-panel-mobile-view']]: isMobile,
                    [styles['submenu-panel-sidebar-open']]: !isMobile && isSidebarOpen,
                    [styles['submenu-panel-sidebar-closed']]: !isMobile && !isSidebarOpen,
                }
            )}
        >
            {isMobile && (
                <div className={styles['submenu-panel__header']}>
                    <button onClick={handleBackClick} className={styles['submenu-panel__back-button']}>
                        <ArrowBackIosIcon fontSize="small" />
                    </button>
                    <h2 className={styles['submenu-panel__title']}>{submenuData.title}</h2>
                </div>
            )}

            <nav className={styles['submenu-panel__menu']}>
                {submenuData.items.map((item) => (
                    <NavLink
                        to={item.path}
                        key={item.label}
                        className={({ isActive }) =>
                            classNames(
                                styles['submenu-panel__menu-item'],
                                { [styles['submenu-panel__menu-item-active']]: isActive }
                            )
                        }
                        onClick={closeSidebar}
                    >
                        <div className={styles['submenu-panel__icon']}>{item.icon}</div>
                        <span className={styles['submenu-panel__label']}>{t(item.labelKey)}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
});