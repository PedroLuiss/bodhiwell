import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import BookingIcon from '@mui/icons-material/EventAvailable';
import ReminderIcon from '@mui/icons-material/Alarm';
import NewsletterIcon from '@mui/icons-material/MarkEmailUnread';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CampaignIcon from '@mui/icons-material/Campaign';
import SearchIcon from '@mui/icons-material/Search';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import InputAdornment from '@mui/material/InputAdornment';

import { useNotifications } from '../../hooks/useNotifications';
import { useAuthContext } from '../../context/AuthContext';

import { NotificationItem } from '../../types';
import styles from './NotificationList.module.scss';

import { TextFieldUi } from '../ui/TextFieldUi/TextFieldUi';
import { ButtonUi } from '../ui/ButtonUi/ButtonUi';
import Loading from '../ui/Loading/Loading';

interface NotificationListProps {
  itemsPerPage?: number;
}

export const NotificationList: React.FC<NotificationListProps> = ({ itemsPerPage = 10 }) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const { t } = useTranslation();

  const availableFilters = user?.type_account === 'professional'
    ? ['all', 'BOOKING', 'REMINDER', 'PAYMENT', 'SYSTEM']
    : ['all', 'SYSTEM', 'REMINDER'];

  const {
    allNotifications,
    paginationInfo,
    allLoading,
    allError,
    fetchAllNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    markAsReadLoading
  } = useNotifications();

  useEffect(() => {
    fetchAllNotifications({
      page: currentPage,
      limit: itemsPerPage,
      filterType: filterType === 'all' ? undefined : filterType,
      searchTerm: searchTerm || undefined
    });
  }, [currentPage, searchTerm, filterType, fetchAllNotifications, itemsPerPage]);

  const totalPages = paginationInfo.totalPages;
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
  const goToPage = (page: number) => setCurrentPage(page);

  const getPaginationRange = useCallback(() => {
    const delta = 1;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | null = null;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach(i => {
      if (l) {
        if (typeof i === 'number' && i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (typeof i === 'number' && i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = typeof i === 'number' ? i : null;
    });
    return rangeWithDots;
  }, [currentPage, totalPages]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BOOKING': return <BookingIcon />;
      case 'REMINDER': return <ReminderIcon />;
      case 'PAYMENT': return <NewsletterIcon />;
      case 'SYSTEM': return <CampaignIcon />;
      default: return <NotificationsIcon />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'BOOKING': return t('landing.NotificationList.types.booking');
      case 'REMINDER': return t('landing.NotificationList.types.reminder');
      case 'PAYMENT': return t('landing.NotificationList.types.payment');
      case 'SYSTEM': return t('landing.NotificationList.types.system');
      case 'all': return t('landing.NotificationList.types.all');
      default: return t('landing.NotificationList.types.general');
    }
  };

  const handleNavigationByType = (notification: NotificationItem) => {
    const type = notification.type.toUpperCase();
    const data = notification.data || {};
    switch (type) {
      case 'PAYMENT': navigate('/payment-list'); break;
      case 'SYSTEM': data.action === 'complete_profile' ? navigate('/profile') : navigate('/dashboard'); break;
      case 'BOOKING': data.booking_uid ? navigate(`/professionals/booking-details/${data.booking_uid}`) : navigate('/reservations'); break;
      case 'REMINDER': data.booking_uid ? navigate(`/professionals/booking-details/${data.booking_uid}`) : navigate('/dashboard'); break;
      default: break;
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (notification.unread) {
      markNotificationAsRead(notification.uid);
    }
    handleNavigationByType(notification);
  };

  const unreadCount = allNotifications.filter(n => n.unread).length;

  return (
    <div className={styles['notifications']}>
      <main className={styles['notifications__card']}>
        
        <header className={styles['notifications__header']}>
          <div className={styles['notifications__title-group']}>
            <span className={styles['notifications__eyebrow']}>
              {t('landing.NotificationList.eyebrow', 'CENTRO DE ACTIVIDAD')}
            </span>
            <h1 className={styles['notifications__title']}>
              {t("Notifications.title")}
              {unreadCount > 0 && <span className={styles['notifications__count-badge']}>{unreadCount}</span>}
            </h1>
          </div>

          <div className={styles['notifications__toolbar']}>
             <div className={styles['notifications__search-wrapper']}>
                <TextFieldUi 
                    placeholder={t('landing.NotificationList.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#82B194', fontSize: 20 }} />
                            </InputAdornment>
                        )
                    }}
                />
             </div>
             {unreadCount > 0 && (
                <ButtonUi 
                    variant="text" 
                    onClick={markAllNotificationsAsRead}
                    disabled={markAsReadLoading}
                    startIcon={<DoneAllIcon />}
                >
                    {t('landing.NotificationList.markAllRead')}
                </ButtonUi>
             )}
          </div>

          <nav className={styles['notifications__tabs']}>
            {availableFilters.map(type => (
              <button
                key={type}
                className={classNames(styles['tab-btn'], { 
                    [styles['tab-btn--active']]: filterType === type 
                })}
                onClick={() => { setFilterType(type); setCurrentPage(1); }}
              >
                {getNotificationTypeLabel(type)}
              </button>
            ))}
          </nav>
        </header>

        <div className={styles['notifications__content']}>
          {allLoading ? (
            <Loading fullscreen text={t("Notifications.loading")} />
          ) : allError ? (
            <div className={styles['notifications__status-box']}>
              <NotificationsIcon sx={{ fontSize: 48, color: '#C95C5C' }} />
              <h3>{t("Notifications.error")}</h3>
              <p>{allError}</p>
            </div>
          ) : allNotifications.length > 0 ? (
            <div className={styles['notifications__list']}>
              {allNotifications.map(notification => (
                <article
                  key={notification.uid}
                  className={classNames(styles['notification-item'], { 
                      [styles['notification-item--unread']]: notification.unread 
                  })}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={styles['notification-item__icon-box']}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className={styles['notification-item__body']}>
                    <div className={styles['notification-item__top']}>
                      <h3 className={styles['notification-item__title']}>{notification.title}</h3>
                      <time className={styles['notification-item__time']}>{notification.time}</time>
                    </div>
                    <p className={styles['notification-item__msg']}>{notification.message}</p>
                    <div className={styles['notification-item__footer']}>
                       <span className={styles['notification-item__type-tag']}>
                           {getNotificationTypeLabel(notification.type)}
                       </span>
                       {notification.unread && <span className={styles['notification-item__unread-dot']} />}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles['notifications__status-box']}>
              <NotificationsIcon sx={{ fontSize: 48, opacity: 0.2 }} />
              <h3>{t("Notifications.noResults")}</h3>
              <p>{t("Notifications.noResultsMessage")}</p>
            </div>
          )}
        </div>

        {totalPages > 1 && !allLoading && (
            <footer className={styles['notifications__footer']}>
                <div className={styles['pagination']}>
                    <button 
                        className={styles['pagination__nav']} 
                        onClick={goToPreviousPage} 
                        disabled={currentPage === 1}
                    >
                        <ChevronLeftIcon />
                    </button>
                    <div className={styles['pagination__numbers']}>
                        {getPaginationRange().map((pageNum, index) => {
                            if (pageNum === '...') {
                                return <span key={`dots-${index}`} className={styles['pagination__dots']}>...</span>;
                            }
                            return (
                                <button
                                    key={index}
                                    className={classNames(styles['pagination__num'], {
                                        [styles['pagination__num--active']]: pageNum === currentPage
                                    })}
                                    onClick={() => goToPage(pageNum as number)}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>
                    <button 
                        className={styles['pagination__nav']} 
                        onClick={goToNextPage} 
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRightIcon />
                    </button>
                </div>
            </footer>
        )}
      </main>
    </div>
  );
};

export default NotificationList;