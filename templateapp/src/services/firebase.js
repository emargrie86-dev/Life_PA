// Firebase Configuration and Initialization
// Firebase project: template-app-cec6c

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLiCZZCNZl9iKG0IUA6X_WVVYUxczNlbM",
  authDomain: "template-app-cec6c.firebaseapp.com",
  projectId: "template-app-cec6c",
  storageBucket: "template-app-cec6c.firebasestorage.app",
  messagingSenderId: "788374389689",
  appId: "1:788374389689:web:c1073d984db88a887cec68",
  measurementId: "G-MFG0320KE3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

