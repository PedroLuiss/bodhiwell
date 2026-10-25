import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { messaging } from '../services/firebaseConfig';
import { useAuthContext } from './AuthContext';
import { notificationService } from '../services/notificationService';

const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY;

interface PushContextType {
  lastNotification: MessagePayload | null;
  refreshTrigger: number;
  triggerRefresh: () => void;
  fcmToken: string | null;
  unreadCount: number; 
  fetchUnreadCount: () => Promise<void>; 
}

const PushContext = createContext<PushContextType | undefined>(undefined);

export const PushNotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const [lastNotification, setLastNotification] = useState<MessagePayload | null>(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error actualizando contador de notificaciones:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    } else {
      setUnreadCount(0);
    }
  }, [user, fetchUnreadCount]);

  const requestPermissionAndToken = useCallback(async () => {
    if (!messaging) return;
    
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (token) {
          // console.log('FCM Token:', token);
          setFcmToken(token);
          
          if (user?.uid) { 
              await notificationService.registerDeviceToken(token);
          }
        }
      } else {
        console.warn('Permiso de notificaciones denegado');
      }
    } catch (error) {
      console.error('Error al obtener token FCM:', error);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (!user || !messaging) return;

    requestPermissionAndToken();

    const unsubscribe = onMessage(messaging, (payload) => {
      // console.log('Mensaje recibido en foreground:', payload);
      setLastNotification(payload);
      
      setRefreshTrigger(prev => prev + 1);
      
      fetchUnreadCount();
    });

    return () => {
      unsubscribe();
    };
  }, [user, fetchUnreadCount, requestPermissionAndToken]); 

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return (
    <PushContext.Provider value={{ 
        lastNotification, 
        refreshTrigger, 
        triggerRefresh, 
        fcmToken,
        unreadCount,      
        fetchUnreadCount  
    }}>
      {children}
    </PushContext.Provider>
  );
};

export const usePushContext = () => {
  const context = useContext(PushContext);
  if (!context) throw new Error('usePushContext must be used within a PushNotificationProvider');
  return context;
};