/**
 * TypeScript declarations for environment variables
 * Provides IDE autocomplete and type safety for @env imports
 */

declare module '@env' {
  // Firebase Configuration
  export const FIREBASE_API_KEY: string;
  export const FIREBASE_AUTH_DOMAIN: string;
  export const FIREBASE_PROJECT_ID: string;
  export const FIREBASE_STORAGE_BUCKET: string;
  export const FIREBASE_MESSAGING_SENDER_ID: string;
  export const FIREBASE_APP_ID: string;
  export const FIREBASE_MEASUREMENT_ID: string;
  
  // AI Services
  export const GEMINI_API_KEY: string;
}

