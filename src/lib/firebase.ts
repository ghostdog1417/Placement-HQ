import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

function getFirebaseApp() {
  if (getApps().length) {
    return getApp();
  }

  if (!firebaseConfig.apiKey) {
    throw new Error(
      "Firebase configuration is missing. Add VITE_FIREBASE_* values to your .env file.",
    );
  }

  return initializeApp(firebaseConfig);
}

const app = getFirebaseApp();

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      try {
        getAnalytics(app);
      } catch {
        // Analytics is optional.
      }
    }
  });
}

export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => undefined);
export const db = getFirestore(app);
