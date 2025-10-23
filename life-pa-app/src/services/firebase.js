// Firebase Configuration and Initialization
// Firebase project: life-pa-d1d6c (AI Life Personal Assistant)

import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, browserLocalPersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { Platform } from 'react-native';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID
} from '@env';

// Firebase configuration - now using environment variables for security
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY || "AIzaSyCi5purybWWGJNKtIsKnrEDLgh0kn9gf-A",
  authDomain: FIREBASE_AUTH_DOMAIN || "life-pa-d1d6c.firebaseapp.com",
  projectId: FIREBASE_PROJECT_ID || "life-pa-d1d6c",
  storageBucket: FIREBASE_STORAGE_BUCKET || "life-pa-d1d6c.firebasestorage.app",
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID || "709387836577",
  appId: FIREBASE_APP_ID || "1:709387836577:web:aca0560b2a8c99d54b24e0",
  measurementId: FIREBASE_MEASUREMENT_ID || "G-JC2M2FWDRN"
};

// Validate critical configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('⚠️ Firebase configuration missing! Please check your .env file.');
  console.error('See ENV_SETUP.md for setup instructions.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with platform-specific persistence
// Web: Uses browser localStorage
// Mobile: Uses AsyncStorage for persistent login
let auth;
if (Platform.OS === 'web') {
  // For web, use the default getAuth with browser persistence
  auth = getAuth(app);
} else {
  // For mobile (iOS/Android), use AsyncStorage
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export { auth };

// Initialize Firestore and Storage
export const db = getFirestore(app);
export const storage = getStorage(app); // For receipt/document image storage

// Initialize Analytics only if supported
let analytics = null;
(async () => {
  if (await isSupported()) {
    analytics = getAnalytics(app);
  }
})();
export { analytics };

export default app;

