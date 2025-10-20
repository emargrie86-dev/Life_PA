// Unified AI Service
// Manages multiple AI providers (OpenAI, Hugging Face, etc.)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Import provider services
import * as OpenAIService from './openai';
import * as HuggingFaceService from './huggingface';
import * as CohereService from './cohere';

const AI_PROVIDER_KEY = 'AI_PROVIDER';

// Available providers
export const AI_PROVIDERS = {
  OPENAI: 'openai',
  HUGGINGFACE: 'huggingface',
  COHERE: 'cohere',
};

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
 * Get current AI provider
 * @returns {Promise<string>}
 */
export const getCurrentProvider = async () => {
  try {
    const storage = getStorage();
    const provider = await storage.getItem(AI_PROVIDER_KEY);
    // Default to Cohere (free and reliable option)
    return provider || AI_PROVIDERS.COHERE;
  } catch (error) {
    console.error('Error getting current provider:', error);
    return AI_PROVIDERS.COHERE;
  }
};

/**
 * Set current AI provider
 * @param {string} provider - Provider name
 * @returns {Promise<void>}
 */
export const setCurrentProvider = async (provider) => {
  try {
    console.log('Setting AI provider to:', provider);
    const storage = getStorage();
    await storage.setItem(AI_PROVIDER_KEY, provider);
    console.log('AI provider set successfully');
  } catch (error) {
    console.error('Error setting provider:', error);
    throw new Error('Failed to set AI provider');
  }
};

/**
 * Initialize all AI clients on app start
 * @returns {Promise<Object>}
 */
export const initializeAIClients = async () => {
  try {
    console.log('Initializing AI clients...');
    
    const [openaiInitialized, hfInitialized, cohereInitialized] = await Promise.all([
      OpenAIService.initializeClientOnStart(),
      HuggingFaceService.initializeHFClientOnStart(),
      CohereService.initializeCohereClientOnStart(),
    ]);

    console.log('OpenAI initialized:', openaiInitialized);
    console.log('Hugging Face initialized:', hfInitialized);
    console.log('Cohere initialized:', cohereInitialized);

    return {
      openai: openaiInitialized,
      huggingface: hfInitialized,
      cohere: cohereInitialized,
    };
  } catch (error) {
    console.error('Error initializing AI clients:', error);
    return {
      openai: false,
      huggingface: false,
      cohere: false,
    };
  }
};

/**
 * Check if current provider is initialized
 * @returns {Promise<boolean>}
 */
export const isProviderInitialized = async () => {
  try {
    const provider = await getCurrentProvider();
    
    if (provider === AI_PROVIDERS.OPENAI) {
      return OpenAIService.getOpenAIClient() !== null;
    } else if (provider === AI_PROVIDERS.HUGGINGFACE) {
      return HuggingFaceService.getHFClient() !== null;
    } else if (provider === AI_PROVIDERS.COHERE) {
      const apiKey = await CohereService.getStoredCohereKey();
      return apiKey !== null;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking provider initialization:', error);
    return false;
  }
};

/**
 * Send chat message using current provider
 * @param {Array} messages - Array of message objects
 * @param {Object} options - Additional options
 * @returns {Promise<string|Object>} - Response text or object with text and tool_calls
 */
export const sendChatMessage = async (messages, options = {}) => {
  try {
    const provider = await getCurrentProvider();
    console.log('Sending message using provider:', provider);

    if (provider === AI_PROVIDERS.OPENAI) {
      const client = OpenAIService.getOpenAIClient();
      if (!client) {
        throw new Error('OpenAI not initialized. Please set your OpenAI API key in Settings.');
      }
      return await OpenAIService.sendChatMessage(messages, options);
    } else if (provider === AI_PROVIDERS.HUGGINGFACE) {
      const client = HuggingFaceService.getHFClient();
      if (!client) {
        throw new Error('Hugging Face not initialized. Please set your Hugging Face API key in Settings.');
      }
      // HuggingFace returns a string
      return await HuggingFaceService.sendHFChatMessage(messages, options);
    } else if (provider === AI_PROVIDERS.COHERE) {
      const apiKey = await CohereService.getStoredCohereKey();
      if (!apiKey) {
        throw new Error('Cohere not initialized. Please set your Cohere API key in Settings.');
      }
      // Cohere can return object with text and tool_calls
      return await CohereService.sendCohereChatMessage(messages, options);
    } else {
      throw new Error('Unknown AI provider. Please select a provider in Settings.');
    }
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

/**
 * Get API key for current provider
 * @returns {Promise<string|null>}
 */
export const getCurrentProviderAPIKey = async () => {
  try {
    const provider = await getCurrentProvider();
    
    if (provider === AI_PROVIDERS.OPENAI) {
      return await OpenAIService.getStoredAPIKey();
    } else if (provider === AI_PROVIDERS.HUGGINGFACE) {
      return await HuggingFaceService.getStoredHFKey();
    } else if (provider === AI_PROVIDERS.COHERE) {
      return await CohereService.getStoredCohereKey();
    }
    
    return null;
  } catch (error) {
    console.error('Error getting provider API key:', error);
    return null;
  }
};

/**
 * Store API key for specific provider
 * @param {string} provider - Provider name
 * @param {string} apiKey - API key
 * @returns {Promise<void>}
 */
export const storeProviderAPIKey = async (provider, apiKey) => {
  try {
    if (provider === AI_PROVIDERS.OPENAI) {
      await OpenAIService.storeAPIKey(apiKey);
    } else if (provider === AI_PROVIDERS.HUGGINGFACE) {
      await HuggingFaceService.storeHFKey(apiKey);
    } else if (provider === AI_PROVIDERS.COHERE) {
      await CohereService.storeCohereKey(apiKey);
    } else {
      throw new Error('Unknown provider');
    }
  } catch (error) {
    console.error('Error storing provider API key:', error);
    throw error;
  }
};

/**
 * Validate API key for specific provider
 * @param {string} provider - Provider name
 * @param {string} apiKey - API key to validate
 * @returns {Promise<boolean>}
 */
export const validateProviderAPIKey = async (provider, apiKey) => {
  try {
    if (provider === AI_PROVIDERS.OPENAI) {
      return await OpenAIService.validateAPIKey(apiKey);
    } else if (provider === AI_PROVIDERS.HUGGINGFACE) {
      return await HuggingFaceService.validateHFKey(apiKey);
    } else if (provider === AI_PROVIDERS.COHERE) {
      return await CohereService.validateCohereKey(apiKey);
    }
    return false;
  } catch (error) {
    console.error('Error validating provider API key:', error);
    return false;
  }
};

/**
 * Remove API key for specific provider
 * @param {string} provider - Provider name
 * @returns {Promise<void>}
 */
export const removeProviderAPIKey = async (provider) => {
  try {
    if (provider === AI_PROVIDERS.OPENAI) {
      await OpenAIService.removeAPIKey();
    } else if (provider === AI_PROVIDERS.HUGGINGFACE) {
      await HuggingFaceService.removeHFKey();
    } else if (provider === AI_PROVIDERS.COHERE) {
      await CohereService.removeCohereKey();
    }
  } catch (error) {
    console.error('Error removing provider API key:', error);
    throw error;
  }
};

/**
 * Get provider display name
 * @param {string} provider - Provider name
 * @returns {string}
 */
export const getProviderDisplayName = (provider) => {
  switch (provider) {
    case AI_PROVIDERS.OPENAI:
      return 'OpenAI (GPT)';
    case AI_PROVIDERS.HUGGINGFACE:
      return 'Hugging Face (Free)';
    case AI_PROVIDERS.COHERE:
      return 'Cohere (Free)';
    default:
      return 'Unknown Provider';
  }
};

/**
 * Get provider API key URL
 * @param {string} provider - Provider name
 * @returns {string}
 */
export const getProviderKeyURL = (provider) => {
  switch (provider) {
    case AI_PROVIDERS.OPENAI:
      return 'https://platform.openai.com/api-keys';
    case AI_PROVIDERS.HUGGINGFACE:
      return 'https://huggingface.co/settings/tokens';
    case AI_PROVIDERS.COHERE:
      return 'https://dashboard.cohere.com/api-keys';
    default:
      return '';
  }
};

