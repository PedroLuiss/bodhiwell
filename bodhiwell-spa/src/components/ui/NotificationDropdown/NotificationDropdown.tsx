import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BookingIcon from '@mui/icons-material/EventAvailable';
import ReminderIcon from '@mui/icons-material/Alarm';
import NewsletterIcon from '@mui/icons-material/MarkEmailUnread';
import CampaignIcon from '@mui/icons-material/Campaign';

import styles from './NotificationDropdown.module.scss';
import CircularProgress from '@mui/material/CircularProgress';
import { useNotifications } from '../../../hooks/useNotifications';
import { NotificationItem } from '../../../types';
import { usePushContext } from '../../../context/PushNotificationContext';

interface NotificationDropdownProps {
    customButtonClass?: string;
    children?: React.ReactNode;
    onClick?: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ customButtonClass, children, onClick }) => {
    const { t } = useTranslation();
    const { unreadCount, refreshTrigger } = usePushContext();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const {
        recentNotifications,
        recentLoading,
        recentError,
        fetchRecentNotifications,
        markAllNotificationsAsRead,
        markNotificationAsRead,
        markAsReadLoading
    } = useNotifications();

    useEffect(() => {
        fetchRecentNotifications();
    }, [fetchRecentNotifications, unreadCount, refreshTrigger]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'BOOKING': return <BookingIcon fontSize="small" />;
            case 'REMINDER': return <ReminderIcon fontSize="small" />;
            case 'PAYMENT': return <NewsletterIcon fontSize="small" />;
            case 'SYSTEM': return <CampaignIcon fontSize="small" />;
            default: return <NotificationsIcon fontSize="small" />;
        }
    };

    const handleViewAll = () => {
        setIsOpen(false);
        navigate('/notifications');
    };

    const handleNavigationByType = (notification: NotificationItem) => {
        const type = notification.type.toUpperCase();
        const data = notification.data || {};

        switch (type) {
            case 'PAYMENT':
                navigate('/payment-list');
                break;

            case 'SYSTEM':
                navigate('/dashboard');
                break;

            case 'BOOKING':
                if (data.booking_uid) {
                    navigate(`/professionals/booking-details/${data.booking_uid}`);
                } else {
                    navigate('/reservations');
                }
                break;

            case 'REMINDER':
                if (data.booking_uid) {
                    navigate(`/professionals/booking-details/${data.booking_uid}`);
                } else {
                    navigate('/dashboard');
                }
                break;

            default:
                navigate('/notifications');
                break;
        }
    };

    const handleNotificationClick = (notification: NotificationItem) => {
        setIsOpen(false);

        if (notification.unread) {
            markNotificationAsRead(notification.uid);
        }

        handleNavigationByType(notification);
    };

    return (
        <div className={styles["notification__container"]} ref={menuRef}>
            <button
                onClick={() => {
                    if (onClick) {
                        onClick();
                        return;
                    }
                    setIsOpen((prev) => !prev);
                }}
                className={classNames(styles["notification__button"], customButtonClass)}
            >
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
                {children}
            </button>

            <div
                className={classNames(styles["notification__dropdown"], {
                    [styles["notification__dropdown--open"]]: isOpen,
                })}
            >
                <div className={styles["notification__header"]}>
                    <h4>{t("Notifications.title")}</h4>
                    {unreadCount > 0 && (
                        <button
                            className={styles["notification__mark-all-read"]}
                            onClick={markAllNotificationsAsRead}
                            disabled={markAsReadLoading}
                        >
                            {markAsReadLoading ? t('landing.NotificationDropdown.marking') : t('landing.NotificationDropdown.markAllAsRead')}
                        </button>
                    )}
                </div>

                <div className={styles["notification__list"]}>
                    {recentLoading ? (
                        <div className={styles["notification__empty"]}>
                            <CircularProgress size={20} />
                            <span>{t('landing.NotificationDropdown.loading')}</span>
                        </div>
                    ) : recentError ? (
                        <div className={styles["notification__empty"]}>
                            <NotificationsIcon />
                            <span>{t('landing.NotificationDropdown.errorLoading')}</span>
                        </div>
                    ) : recentNotifications.length > 0 ? (
                        recentNotifications.map(notification => (
                            <div
                                key={notification.uid}
                                className={classNames(styles["notification__item"], {
                                    [styles["notification__item--unread"]]: notification.unread
                                })}
                                onClick={() => handleNotificationClick(notification)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className={styles["notification__icon"]}>
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className={styles["notification__content"]}>
                                    <div className={styles["notification__title"]}>
                                        {notification.title}
                                    </div>
                                    <div className={styles["notification__message"]}>
                                        {notification.message}
                                    </div>
                                    <div className={styles["notification__time"]}>
                                        {notification.time}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles["notification__empty"]}>
                            <NotificationsIcon />
                            <span>{t("Notifications.empty")}</span>
                        </div>
                    )}
                </div>

                <div className={styles["notification__footer"]}>
                    <button
                        className={styles["notification__view-all"]}
                        onClick={handleViewAll}
                    >
                        {t("Notifications.viewAll")}
                    </button>
                </div>
            </div>
        </div>
    );
};