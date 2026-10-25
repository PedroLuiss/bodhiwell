import { useEffect, useState } from 'react';
import { getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { messaging } from '../services/firebaseConfig';
import { useAuthContext } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';

const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY;

export const usePushNotifications = () => {
  const { user } = useAuthContext();
  const [notification, setNotification] = useState<MessagePayload | null>(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  const requestPermissionAndToken = async () => {
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
  };

  useEffect(() => {
    if (!user || !messaging) return;

    requestPermissionAndToken();

    const unsubscribe = onMessage(messaging, (payload) => {
      // console.log('Mensaje recibido en foreground:', payload);
      setNotification(payload);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  return { notification, fcmToken };
};