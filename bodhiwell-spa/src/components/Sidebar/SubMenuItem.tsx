import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { MainMenuItem } from '../../types/dashboard';
import styles from '../../layouts/dashboard-layouts/style/Sidebar.module.scss';

type SubMenuItemProps = {
    item: MainMenuItem;
    isSidebarOpen: boolean;
    isActive: boolean;
    onClick: () => void;
    isDisabled?: boolean; 
}

export const SubMenuItem = React.memo(({ item, isSidebarOpen, isActive, onClick, isDisabled = false }: SubMenuItemProps) => {
    const { t } = useTranslation();

    const handleClick = () => {
        if (isDisabled) {
            return;
        }
        onClick();
    };

    return (
        <div
            className={classNames(
                styles['sidebar__menu-item'], 
                { 
                    [styles['sidebar__menu-item-active']]: isActive,
                    [styles['sidebar__menu-item--disabled']]: isDisabled 
                }
            )}
            onClick={handleClick}
            title={isDisabled ? t('sidebar.completeProfileTooltip', 'Completa tu perfil para acceder a esta sección') : t(item.labelKey)}
        >
            <div className={styles['sidebar__icon']}>{item.icon}</div>
            {isSidebarOpen && <span className={styles['sidebar__label']}>{t(item.labelKey)}</span>}
        </div>
    );
});