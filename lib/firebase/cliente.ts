/**
 * SDK de cliente de Firebase (navegador).
 *
 * Uso permitido: login del admin (Firebase Auth) y lecturas puntuales del
 * navegador (ej. la búsqueda con `array-contains`). El catálogo público NO se
 * lee desde aquí: eso va en el servidor con el Admin SDK e ISR (sección 4).
 *
 * Estas claves son públicas por diseño; van dentro del bundle. Lo que protege
 * los datos son las Security Rules.
 */
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const configFirebase = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Singleton: Next puede volver a evaluar este módulo en cada recarga en dev.
export const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(configFirebase);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
