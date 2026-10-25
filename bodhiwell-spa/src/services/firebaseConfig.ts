import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getMessaging, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Validar que las configuraciones esenciales existan
const isConfigured = firebaseConfig.projectId && firebaseConfig.apiKey;

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;
let messaging: Messaging | null = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
} else {
  console.warn("Faltan variables de entorno de Firebase. Los servicios de Firebase estarán desactivados.");
}

try {
  if (app && typeof window !== "undefined" && "serviceWorker" in navigator) {
    messaging = getMessaging(app);
  }
} catch (error) {
  console.error("Firebase Messaging failed to initialize", error);
}

export { app, analytics, messaging };