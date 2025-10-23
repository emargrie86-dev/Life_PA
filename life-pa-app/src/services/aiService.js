// Unified AI Service
// Now exclusively uses Google Gemini 2.5 Flash

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Import Gemini service
import * as GeminiService from './gemini';

// Helper function to get storage based on platform
const getStorage = () => {
  if (Platform.OS === 'web') {
    return {
      getItem: async (key) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.error('localStorage error:', error);
          return null;
        }
      },
      setItem: async (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error('localStorage error:', error);
          throw error;
        }
      },
    };
  } else {
    return AsyncStorage;
  }
};

/**
 * Initialize AI client on app start
 * @returns {Promise<boolean>}
 */
export const initializeAIClients = async () => {
  try {
    console.log('Initializing Gemini AI client...');
    
    const geminiInitialized = await GeminiService.initializeClientOnStart();

    console.log('Gemini initialized:', geminiInitialized);

    return geminiInitialized;
  } catch (error) {
    console.error('Error initializing AI client:', error);
    return false;
  }
};

/**
 * Check if AI provider is initialized
 * @returns {Promise<boolean>}
 */
export const isProviderInitialized = async () => {
  try {
    return GeminiService.getGeminiClient() !== null;
  } catch (error) {
    console.error('Error checking provider initialization:', error);
    return false;
  }
};

/**
 * Send chat message using Gemini
 * @param {Array} messages - Array of message objects
 * @param {Object} options - Additional options
 * @returns {Promise<string|Object>} - Response text or object with text and tool_calls
 */
export const sendChatMessage = async (messages, options = {}) => {
  try {
    console.log('Sending message using Gemini...');

    const client = GeminiService.getGeminiClient();
    if (!client) {
      throw new Error('Gemini not initialized. Please set your Gemini API key in Settings.');
    }
    
    return await GeminiService.sendChatMessage(messages, options);
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

/**
 * Get API key for Gemini
 * @returns {Promise<string|null>}
 */
export const getCurrentProviderAPIKey = async () => {
  try {
    return await GeminiService.getStoredAPIKey();
  } catch (error) {
    console.error('Error getting provider API key:', error);
    return null;
  }
};

/**
 * Store API key for Gemini
 * @param {string} apiKey - API key
 * @returns {Promise<void>}
 */
export const storeProviderAPIKey = async (apiKey) => {
  try {
    await GeminiService.storeAPIKey(apiKey);
  } catch (error) {
    console.error('Error storing provider API key:', error);
    throw error;
  }
};

/**
 * Validate API key for Gemini
 * @param {string} apiKey - API key to validate
 * @returns {Promise<boolean>}
 */
export const validateProviderAPIKey = async (apiKey) => {
  try {
    return await GeminiService.validateAPIKey(apiKey);
  } catch (error) {
    console.error('Error validating provider API key:', error);
    return false;
  }
};

/**
 * Remove API key for Gemini
 * @returns {Promise<void>}
 */
export const removeProviderAPIKey = async () => {
  try {
    await GeminiService.removeAPIKey();
  } catch (error) {
    console.error('Error removing provider API key:', error);
    throw error;
  }
};

/**
 * Get provider display name
 * @returns {string}
 */
export const getProviderDisplayName = () => {
  return 'Google Gemini 2.5 Flash';
};

/**
 * Get provider API key URL
 * @returns {string}
 */
export const getProviderKeyURL = () => {
  return 'https://aistudio.google.com/app/apikey';
};

// Export for backwards compatibility (if anything imports these)
export const AI_PROVIDERS = {
  GEMINI: 'gemini',
};

export const getCurrentProvider = async () => {
  return AI_PROVIDERS.GEMINI;
};

export const setCurrentProvider = async (provider) => {
  // No-op since we only use Gemini now
  console.log('Using Gemini as the only AI provider');
};
