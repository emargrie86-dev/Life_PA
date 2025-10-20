// Cohere Service
// Configuration and helpers for Cohere AI integration

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const COHERE_API_KEY = 'COHERE_API_KEY';

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
 * Get stored Cohere API key
 * @returns {Promise<string|null>}
 */
export const getStoredCohereKey = async () => {
  try {
    const storage = getStorage();
    const apiKey = await storage.getItem(COHERE_API_KEY);
    return apiKey;
  } catch (error) {
    console.error('Error getting stored Cohere API key:', error);
    return null;
  }
};

/**
 * Store Cohere API key
 * @param {string} apiKey - Cohere API key
 * @returns {Promise<void>}
 */
export const storeCohereKey = async (apiKey) => {
  try {
    const storage = getStorage();
    await storage.setItem(COHERE_API_KEY, apiKey);
  } catch (error) {
    console.error('Error storing Cohere API key:', error);
    throw new Error('Failed to store Cohere API key');
  }
};

/**
 * Remove stored Cohere API key
 * @returns {Promise<void>}
 */
export const removeCohereKey = async () => {
  try {
    const storage = getStorage();
    await storage.removeItem(COHERE_API_KEY);
  } catch (error) {
    console.error('Error removing Cohere API key:', error);
    throw new Error('Failed to remove Cohere API key');
  }
};

/**
 * Initialize Cohere client on app start
 * @returns {Promise<boolean>}
 */
export const initializeCohereClientOnStart = async () => {
  try {
    const apiKey = await getStoredCohereKey();
    return apiKey !== null;
  } catch (error) {
    console.error('Error initializing Cohere client:', error);
    return false;
  }
};

/**
 * Send message to Cohere
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Object>} - AI response with text and optional tool_calls
 */
export const sendCohereChatMessage = async (messages, options = {}) => {
  const apiKey = await getStoredCohereKey();
  
  if (!apiKey) {
    throw new Error('Cohere API key not found. Please set your API key first.');
  }

  try {
    console.log('Sending request to Cohere...');
    
    // Build conversation history and get the last user message
    const chatHistory = [];
    let userMessage = '';
    
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (i === messages.length - 1 && msg.role === 'user') {
        // Last message should be the current user message
        userMessage = msg.content;
      } else {
        // Add previous messages to chat history
        chatHistory.push({
          role: msg.role === 'user' ? 'USER' : 'CHATBOT',
          message: msg.content
        });
      }
    }

    // If no user message found, use the last message
    if (!userMessage && messages.length > 0) {
      userMessage = messages[messages.length - 1].content;
    }

    // Build request body
    const requestBody = {
      message: userMessage,
      chat_history: chatHistory.length > 0 ? chatHistory : undefined,
      model: 'command-r-08-2024', // Current live model
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 500,
    };

    // Add tools if provided
    if (options.tools && options.tools.length > 0) {
      requestBody.tools = options.tools;
      console.log('Including tools in request:', options.tools.length, 'tools');
    }

    // Use Cohere's chat endpoint
    const response = await fetch(
      'https://api.cohere.ai/v1/chat',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Cohere API error response:', errorData);
      
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your Cohere API key.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few moments.');
      } else {
        throw new Error(errorData.message || 'Failed to get response from AI.');
      }
    }

    const data = await response.json();
    console.log('Cohere response received:', JSON.stringify(data, null, 2));
    
    if (!data || !data.text) {
      throw new Error('No response from Cohere');
    }

    // Log tool calls if present
    if (data.tool_calls) {
      console.log('Cohere tool_calls detected:', JSON.stringify(data.tool_calls, null, 2));
    } else {
      console.log('No tool_calls in Cohere response');
    }

    // Return response object with text and tool calls
    return {
      text: data.text.trim(),
      tool_calls: data.tool_calls || null,
    };
  } catch (error) {
    console.error('Cohere API error:', error);
    throw error;
  }
};

/**
 * Validate Cohere API key
 * @param {string} apiKey - API key to validate
 * @returns {Promise<boolean>}
 */
export const validateCohereKey = async (apiKey) => {
  if (!apiKey || apiKey.trim() === '') {
    return false;
  }

  try {
    const response = await fetch(
      'https://api.cohere.ai/v1/chat',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Hello',
          model: 'command-r-08-2024',
          max_tokens: 10,
        }),
      }
    );

    // If we get 401, key is invalid
    if (response.status === 401) {
      return false;
    }

    // For any other status (including 200), assume key is valid
    return true;
  } catch (error) {
    console.error('Cohere API key validation error:', error);
    // If it's a network error, assume key is valid (can't verify)
    return true;
  }
};

