import { useState, useCallback, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { NotificationItem } from '../types';
import { usePushContext } from '../context/PushNotificationContext';

export function useNotifications() {
  
  const { refreshTrigger, unreadCount, fetchUnreadCount } = usePushContext(); 


  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentError, setRecentError] = useState<string | null>(null);

  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>([]);
  const [paginationInfo, setPaginationInfo] = useState({ total: 0, page: 1, totalPages: 1 });
  const [allLoading, setAllLoading] = useState(false);
  const [allError, setAllError] = useState<string | null>(null);
  
  const [lastFetchParams, setLastFetchParams] = useState<any>(null);

  const [markAsReadLoading, setMarkAsReadLoading] = useState(false);


  const fetchRecentNotifications = useCallback(async (silent = false) => {
    if (!silent) setRecentLoading(true);
    setRecentError(null);
    try {
      const data = await notificationService.getRecentNotifications();
      setRecentNotifications(data);
    } catch (err: any) {
      setRecentError(err?.message || 'Error al cargar notificaciones recientes');
    } finally {
      if (!silent) setRecentLoading(false);
    }
  }, []);

  useEffect(() => {
      if (refreshTrigger > 0) {
          fetchRecentNotifications(true);
      }
  }, [refreshTrigger, fetchRecentNotifications]);



  const fetchAllNotifications = useCallback(async (params: { page?: number; limit?: number; filterType?: string; searchTerm?: string }, silent = false) => {
    setLastFetchParams(params); 
    if (!silent) setAllLoading(true);
    setAllError(null);
    try {
      const response = await notificationService.getAllNotifications({ ...params });
      setAllNotifications(response.notifications);
      setPaginationInfo({
        total: response.total,
        page: response.page,
        totalPages: response.totalPages,
      });
    } catch (err: any) {
      setAllError(err?.message || 'Error al cargar todas las notificaciones');
    } finally {
      if (!silent) setAllLoading(false);
    }
  }, []);

  useEffect(() => {
      if (lastFetchParams && refreshTrigger > 0) {
          fetchAllNotifications(lastFetchParams, true);
      }
  }, [refreshTrigger, lastFetchParams, fetchAllNotifications]);


  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    setMarkAsReadLoading(true);
    try {
      await notificationService.markAsRead(notificationId); 
      
      setRecentNotifications(prev => prev.map(n => String(n.id) === String(notificationId) || n.uid === notificationId ? { ...n, unread: false } : n));
      setAllNotifications(prev => prev.map(n => String(n.id) === String(notificationId) || n.uid === notificationId ? { ...n, unread: false } : n));
      
      await fetchUnreadCount();

    } catch (err: any) {
      console.error('Error al marcar como leído', err);
    } finally {
        setMarkAsReadLoading(false);
    }
  }, [fetchUnreadCount]);

  const markAllNotificationsAsRead = useCallback(async () => {
    setMarkAsReadLoading(true);
    try {
        await notificationService.markAllAsRead();
        
        setRecentNotifications(prev => prev.map(n => ({...n, unread: false})));
        setAllNotifications(prev => prev.map(n => ({...n, unread: false})));
        
        await fetchUnreadCount();

    } catch (err: any) {
        console.error('Error al marcar todo como leído', err);
    } finally {
        setMarkAsReadLoading(false);
    }
  }, [fetchUnreadCount]);


  return {
    recentNotifications,
    recentLoading,
    recentError,
    fetchRecentNotifications,
    unreadCount: unreadCount || 0, 

    allNotifications,
    paginationInfo,
    allLoading,
    allError,
    fetchAllNotifications,

    markNotificationAsRead,
    markAllNotificationsAsRead,
    markAsReadLoading,
  };
}