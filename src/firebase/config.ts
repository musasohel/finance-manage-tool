import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  Firestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey || metaEnv.VITE_FIREBASE_API_KEY || "",
  authDomain: firebaseConfigJson.authDomain || metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: firebaseConfigJson.projectId || metaEnv.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: firebaseConfigJson.storageBucket || metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: firebaseConfigJson.messagingSenderId || metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: firebaseConfigJson.appId || metaEnv.VITE_FIREBASE_APP_ID || "",
};

const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const databaseId = firebaseConfigJson.firestoreDatabaseId || "(default)";

export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with persistent local cache for offline resilience and smooth reconnection
export const db: Firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
}, databaseId);

export default app;
