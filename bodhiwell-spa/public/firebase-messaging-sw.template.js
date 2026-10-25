/* eslint-disable no-undef, no-restricted-globals, no-template-curly-in-string */
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
    // Identificador único de tu proyecto para autenticar peticiones a Firebase.
    // Se reemplaza con REACT_APP_FIREBASE_API_KEY
    apiKey: "${FIREBASE_API_KEY}", 

    // Dominio para la autenticación de usuarios (ej: tu-app.firebaseapp.com).
    // Se reemplaza con REACT_APP_FIREBASE_AUTH_DOMAIN
    authDomain: "${FIREBASE_AUTH_DOMAIN}",

    // ID único global de tu proyecto en Google Cloud.
    // Se reemplaza con REACT_APP_FIREBASE_PROJECT_ID
    projectId: "${FIREBASE_PROJECT_ID}",

    // URL del bucket donde se almacenan archivos (si usas Firebase Storage).
    // Se reemplaza con REACT_APP_FIREBASE_STORAGE_BUCKET
    storageBucket: "${FIREBASE_STORAGE_BUCKET}",

    // ID numérico del remitente para Cloud Messaging (necesario para identificar quién envía push).
    // Se reemplaza con REACT_APP_FIREBASE_MESSAGING_SENDER_ID
    messagingSenderId: "${FIREBASE_MESSAGING_SENDER_ID}",

    // ID único de la aplicación web dentro del proyecto Firebase.
    // Se reemplaza con REACT_APP_FIREBASE_APP_ID
    appId: "${FIREBASE_APP_ID}",

    // ID para Google Analytics (opcional, pero buena práctica tenerlo).
    // Se reemplaza con REACT_APP_FIREBASE_MEASUREMENT_ID
    measurementId: "${FIREBASE_MEASUREMENT_ID}"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
//   console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/Logo-bodhiwell.png', 
    data: payload.data 
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

const getUrlByType = (data) => {
    const baseUrl = self.location.origin; 
    
    if (!data || !data.type) return baseUrl;

    const type = data.type.toUpperCase();

    switch (type) {
        case 'PAYMENT':
            return `${baseUrl}/payment-list`;
            
        case 'SYSTEM':
            return `${baseUrl}/dashboard`;

        case 'BOOKING':
            if (data.booking_uid) {
                return `${baseUrl}/professionals/booking-details/${data.booking_uid}`;
            }
            return `${baseUrl}/reservations`;

        case 'REMINDER':
            if (data.booking_uid) {
                return `${baseUrl}/professionals/booking-details/${data.booking_uid}`;
            }
            return `${baseUrl}/dashboard`;

        default:
            return `${baseUrl}/notifications`;
    }
};

self.addEventListener('notificationclick', (event) => {
    // console.log('[firebase-messaging-sw.js] Notification clicked', event);
    
    event.notification.close();

    const payloadData = event.notification.data;
    
    const urlToOpen = getUrlByType(payloadData);

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});