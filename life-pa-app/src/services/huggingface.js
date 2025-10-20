// Hugging Face Service
// Configuration and helpers for Hugging Face Inference API integration

import { HfInference } from '@huggingface/inference';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const HUGGINGFACE_API_KEY = 'HUGGINGFACE_API_KEY';

let hfClient = null;

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
      removeItem: async (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('localStorage error:', error);
          throw error;
        }
      }
    };
  } else {
    return AsyncStorage;
  }
};

/**
 * Initialize Hugging Face client with API key
 * @param {string} apiKey - Hugging Face API key
 */
export const initializeHuggingFace = (apiKey) => {
  if (!apiKey) {
    console.error('Hugging Face API key is required');
    throw new Error('Hugging Face API key is required');
  }
  
  console.log('Initializing Hugging Face client with API key length:', apiKey.length);
  try {
    hfClient = new HfInference(apiKey);
    console.log('Hugging Face client created successfully');
    return hfClient;
  } catch (error) {
    console.error('Error creating Hugging Face client:', error);
    throw error;
  }
};

/**
 * Get stored Hugging Face API key
 * @returns {Promise<string|null>}
 */
export const getStoredHFKey = async () => {
  try {
    console.log('Getting stored Hugging Face API key...');
    const storage = getStorage();
    const apiKey = await storage.getItem(HUGGINGFACE_API_KEY);
    console.log('Retrieved Hugging Face API key:', apiKey ? 'Key exists' : 'No key found');
    return apiKey;
  } catch (error) {
    console.error('Error getting stored Hugging Face API key:', error);
    return null;
  }
};

/**
 * Store Hugging Face API key
 * @param {string} apiKey - Hugging Face API key
 * @returns {Promise<void>}
 */
export const storeHFKey = async (apiKey) => {
  try {
    console.log('Storing Hugging Face API key...');
    const storage = getStorage();
    await storage.setItem(HUGGINGFACE_API_KEY, apiKey);
    console.log('Hugging Face API key stored successfully');
    // Reinitialize client with new key
    initializeHuggingFace(apiKey);
    console.log('Hugging Face client reinitialized');
  } catch (error) {
    console.error('Error storing Hugging Face API key:', error);
    throw new Error('Failed to store Hugging Face API key');
  }
};

/**
 * Remove stored Hugging Face API key
 * @returns {Promise<void>}
 */
export const removeHFKey = async () => {
  try {
    const storage = getStorage();
    await storage.removeItem(HUGGINGFACE_API_KEY);
    hfClient = null;
  } catch (error) {
    console.error('Error removing Hugging Face API key:', error);
    throw new Error('Failed to remove Hugging Face API key');
  }
};

/**
 * Initialize Hugging Face client on app start
 * @returns {Promise<boolean>}
 */
export const initializeHFClientOnStart = async () => {
  try {
    console.log('Initializing Hugging Face client on start...');
    const apiKey = await getStoredHFKey();
    console.log('Found stored Hugging Face API key:', apiKey ? 'Yes' : 'No');
    if (apiKey) {
      initializeHuggingFace(apiKey);
      console.log('Hugging Face client initialized successfully');
      return true;
    }
    console.log('No Hugging Face API key found, client not initialized');
    return false;
  } catch (error) {
    console.error('Error initializing Hugging Face client:', error);
    return false;
  }
};

/**
 * Get current Hugging Face client instance
 * @returns {HfInference|null}
 */
export const getHFClient = () => {
  return hfClient;
};

/**
 * Send message to Hugging Face model using direct API
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Additional options for the request
 * @returns {Promise<string>} - AI response content
 */
export const sendHFChatMessage = async (messages, options = {}) => {
  const apiKey = await getStoredHFKey();
  
  if (!apiKey) {
    throw new Error('Hugging Face API key not found. Please set your API key first.');
  }

  try {
    // Use gpt2 - the most reliable and consistently available free model on HuggingFace
    // GPT-2 has been available for years and works well for basic conversations
    const model = 'gpt2';
    
    console.log('Sending request to Hugging Face model:', model);
    
    // Format the conversation for GPT-2
    // Build a simple conversational prompt
    let conversationText = '';
    
    messages.forEach((msg, index) => {
      if (msg.role === 'user') {
        conversationText += `Human: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        conversationText += `Assistant: ${msg.content}\n`;
      }
    });
    
    // Add the final "Assistant:" to prompt the model to respond
    conversationText += 'Assistant:';

    // Use direct fetch to HF API
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: conversationText,
          parameters: {
            max_length: options.max_tokens || 100,
            temperature: options.temperature || 0.9,
            top_p: 0.95,
            do_sample: true,
            return_full_text: false,
          },
          options: {
            wait_for_model: true,
            use_cache: false,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('HF API error response:', errorData);
      
      if (response.status === 503) {
        throw new Error('Model is loading. Please try again in 20-30 seconds.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few moments.');
      } else if (response.status === 401) {
        throw new Error('Invalid API key. Please check your Hugging Face API key.');
      } else {
        throw new Error(errorData.error || 'Failed to get response from AI.');
      }
    }

    const data = await response.json();
    console.log('HuggingFace response data:', data);
    
    // Handle Mistral/standard text generation response format
    let content = '';
    
    // Standard format: array with objects containing generated_text
    if (Array.isArray(data) && data.length > 0) {
      if (data[0]?.generated_text) {
        content = data[0].generated_text.trim();
      } else if (typeof data[0] === 'string') {
        content = data[0].trim();
      }
    } else if (data?.generated_text) {
      content = data.generated_text.trim();
    } else if (typeof data === 'string') {
      content = data.trim();
    }
    
    if (!content) {
      console.error('Unexpected response format:', data);
      throw new Error('No response from Hugging Face. Please try again.');
    }
    
    console.log('Received response from Hugging Face:', content.substring(0, 50) + '...');
    
    return content;
  } catch (error) {
    console.error('Hugging Face API error:', error);
    throw error;
  }
};

/**
 * Validate Hugging Face API key using direct API
 * @param {string} apiKey - API key to validate
 * @returns {Promise<boolean>}
 */
export const validateHFKey = async (apiKey) => {
  if (!apiKey || apiKey.trim() === '') {
    return false;
  }

  try {
    // Use the same model as in sendHFChatMessage for validation
    const response = await fetch(
      'https://api-inference.huggingface.co/models/gpt2',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'Hello',
          parameters: {
            max_length: 10,
          },
          options: {
            wait_for_model: true,
            use_cache: false,
          },
        }),
      }
    );

    // If we get 401 or 403, key is invalid or has insufficient permissions
    if (response.status === 401 || response.status === 403) {
      return false;
    }

    // For any other status (including 503 model loading), assume key is valid
    return true;
  } catch (error) {
    console.error('Hugging Face API key validation error:', error);
    // If it's a network error, assume key is valid (can't verify)
    return true;
  }
};

