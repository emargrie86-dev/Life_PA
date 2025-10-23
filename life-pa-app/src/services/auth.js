// Authentication Service
// Helper functions for authentication operations
// Now with improved validation and error handling

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from './firebase';
import { isValidEmail, validatePassword } from '../utils/validation';
import { handleFirebaseAuthError } from '../utils/errorHandler';

/**
 * Sign up a new user with email and password
 * @param {string} email 
 * @param {string} password 
 * @param {string} displayName 
 * @returns {Promise<UserCredential>}
 */
export const signUpWithEmail = async (email, password, displayName = '') => {
  // Validate inputs before making Firebase call
  if (!isValidEmail(email)) {
    throw new Error('Please enter a valid email address');
  }
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.message);
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name if provided
    if (displayName && displayName.trim()) {
      await updateProfile(userCredential.user, { displayName: displayName.trim() });
    }
    
    return userCredential;
  } catch (error) {
    const friendlyError = handleFirebaseAuthError(error);
    throw new Error(friendlyError);
  }
};

/**
 * Sign in existing user with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<UserCredential>}
 */
export const signInWithEmail = async (email, password) => {
  // Validate inputs before making Firebase call
  if (!email || !email.trim()) {
    throw new Error('Email is required');
  }
  
  if (!password || !password.trim()) {
    throw new Error('Password is required');
  }
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    const friendlyError = handleFirebaseAuthError(error);
    throw new Error(friendlyError);
  }
};

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    const friendlyError = handleFirebaseAuthError(error);
    throw new Error(friendlyError);
  }
};

/**
 * Subscribe to authentication state changes
 * @param {function} callback - Function to call when auth state changes
 * @returns {function} - Unsubscribe function
 */
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current authenticated user
 * @returns {User|null}
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Legacy error handler - now using centralized error handler
// Kept for backward compatibility
const handleAuthError = (error) => {
  const friendlyMessage = handleFirebaseAuthError(error);
  return new Error(friendlyMessage);
};

