// Firebase Configuration and Initialization
// Firebase project: life-pa-d1d6c (AI Life Personal Assistant)

import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, browserLocalPersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { Platform } from 'react-native';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCi5purybWWGJNKtIsKnrEDLgh0kn9gf-A",
  authDomain: "life-pa-d1d6c.firebaseapp.com",
  projectId: "life-pa-d1d6c",
  storageBucket: "life-pa-d1d6c.firebasestorage.app",
  messagingSenderId: "709387836577",
  appId: "1:709387836577:web:aca0560b2a8c99d54b24e0",
  measurementId: "G-JC2M2FWDRN"
};

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

