// OpenAI Service
// Configuration and helpers for OpenAI GPT integration

import OpenAI from 'openai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const OPENAI_API_KEY = 'OPENAI_API_KEY';

let openaiClient = null;

// Helper function to get storage based on platform
const getStorage = () => {
  console.log('Platform detected:', Platform.OS);
  
  if (Platform.OS === 'web') {
    // For web, use localStorage as fallback
    console.log('Using localStorage for web platform');
    return {
      getItem: async (key) => {
        try {
          console.log('localStorage.getItem called with key:', key);
          const result = localStorage.getItem(key);
          console.log('localStorage.getItem result:', result ? 'Found value' : 'No value');
          return result;
        } catch (error) {
          console.error('localStorage.getItem error:', error);
          return null;
        }
      },
      setItem: async (key, value) => {
        try {
          console.log('localStorage.setItem called with key:', key, 'value length:', value.length);
          localStorage.setItem(key, value);
          console.log('localStorage.setItem success');
          // Verify it was stored
          const verify = localStorage.getItem(key);
          console.log('localStorage verification:', verify ? 'Success' : 'Failed');
        } catch (error) {
          console.error('localStorage.setItem error:', error);
          throw error;
        }
      },
      removeItem: async (key) => {
        try {
          console.log('localStorage.removeItem called with key:', key);
          localStorage.removeItem(key);
          console.log('localStorage.removeItem success');
        } catch (error) {
          console.error('localStorage.removeItem error:', error);
          throw error;
        }
      }
    };
  } else {
    // For mobile, use AsyncStorage
    console.log('Using AsyncStorage for mobile platform');
    return AsyncStorage;
  }
};

/**
 * Initialize OpenAI client with API key
 * @param {string} apiKey - OpenAI API key
 */
export const initializeOpenAI = (apiKey) => {
  if (!apiKey) {
    console.error('OpenAI API key is required');
    throw new Error('OpenAI API key is required');
  }
  
  console.log('Initializing OpenAI client with API key length:', apiKey.length);
  try {
    openaiClient = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Required for React Native/Expo
    });
    console.log('OpenAI client created successfully');
    return openaiClient;
  } catch (error) {
    console.error('Error creating OpenAI client:', error);
    throw error;
  }
};

/**
 * Get stored OpenAI API key from AsyncStorage
 * @returns {Promise<string|null>}
 */
export const getStoredAPIKey = async () => {
  try {
    console.log('Getting stored API key...');
    const storage = getStorage();
    const apiKey = await storage.getItem(OPENAI_API_KEY);
    console.log('Retrieved API key:', apiKey ? 'Key exists' : 'No key found');
    return apiKey;
  } catch (error) {
    console.error('Error getting stored API key:', error);
    return null;
  }
};

/**
 * Store OpenAI API key in AsyncStorage
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<void>}
 */
export const storeAPIKey = async (apiKey) => {
  try {
    console.log('Storing API key...');
    const storage = getStorage();
    await storage.setItem(OPENAI_API_KEY, apiKey);
    console.log('API key stored successfully');
    // Reinitialize client with new key
    initializeOpenAI(apiKey);
    console.log('OpenAI client reinitialized');
  } catch (error) {
    console.error('Error storing API key:', error);
    throw new Error('Failed to store API key');
  }
};

/**
 * Remove stored API key
 * @returns {Promise<void>}
 */
export const removeAPIKey = async () => {
  try {
    const storage = getStorage();
    await storage.removeItem(OPENAI_API_KEY);
    openaiClient = null;
  } catch (error) {
    console.error('Error removing API key:', error);
    throw new Error('Failed to remove API key');
  }
};

/**
 * Initialize OpenAI client on app start
 * @returns {Promise<boolean>} - Returns true if client initialized successfully
 */
export const initializeClientOnStart = async () => {
  try {
    console.log('Initializing OpenAI client on start...');
    const apiKey = await getStoredAPIKey();
    console.log('Found stored API key:', apiKey ? 'Yes' : 'No');
    if (apiKey) {
      initializeOpenAI(apiKey);
      console.log('OpenAI client initialized successfully');
      return true;
    }
    console.log('No API key found, client not initialized');
    return false;
  } catch (error) {
    console.error('Error initializing OpenAI client:', error);
    return false;
  }
};

/**
 * Get current OpenAI client instance
 * @returns {OpenAI|null}
 */
export const getOpenAIClient = () => {
  return openaiClient;
};

/**
 * Send message to OpenAI GPT
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Additional options for the request
 * @returns {Promise<string>} - AI response content
 */
export const sendChatMessage = async (messages, options = {}) => {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized. Please set your API key first.');
  }

  try {
    const defaultOptions = {
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
      ...options
    };

    const response = await openaiClient.chat.completions.create(defaultOptions);
    
    if (!response.choices || response.choices.length === 0) {
      throw new Error('No response from OpenAI');
    }

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    return content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Handle specific OpenAI errors
    if (error.status === 401) {
      throw new Error('Invalid API key. Please check your OpenAI API key.');
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (error.status === 500) {
      throw new Error('OpenAI server error. Please try again later.');
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      throw new Error(error.message || 'Failed to get response from AI assistant.');
    }
  }
};

/**
 * Validate OpenAI API key
 * @param {string} apiKey - API key to validate
 * @returns {Promise<boolean>}
 */
export const validateAPIKey = async (apiKey) => {
  if (!apiKey || apiKey.trim() === '') {
    return false;
  }

  try {
    const tempClient = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });

    // Make a simple test request to validate the key
    await tempClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5,
    });

    return true;
  } catch (error) {
    console.error('API key validation error:', error);
    return false;
  }
};
