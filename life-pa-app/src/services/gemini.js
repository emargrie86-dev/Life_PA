// Gemini Service
// Configuration and helpers for Google Gemini AI integration
// Now with retry logic and improved error handling

import { GoogleGenerativeAI } from '@google/generative-ai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { retryNetworkRequest } from '../utils/retry';
import { handleAPIError } from '../utils/errorHandler';

const GEMINI_API_KEY = 'GEMINI_API_KEY';

let genAI = null;

/**
 * Get secure storage based on platform
 * - Mobile: Uses expo-secure-store (encrypted)
 * - Web: Uses localStorage (not encrypted - security warning provided)
 */
const getStorage = () => {
  if (Platform.OS === 'web') {
    // Web: localStorage (not secure, but only option available)
    return {
      getItem: async (key) => {
        try {
          const result = localStorage.getItem(key);
          return result;
        } catch (error) {
          console.error('localStorage.getItem error:', error);
          return null;
        }
      },
      setItem: async (key, value) => {
        try {
          localStorage.setItem(key, value);
          console.warn('⚠️ API key stored in browser localStorage (not encrypted). For better security, use the mobile app.');
        } catch (error) {
          console.error('localStorage.setItem error:', error);
          throw error;
        }
      },
      removeItem: async (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('localStorage.removeItem error:', error);
          throw error;
        }
      }
    };
  } else {
    // Mobile: Use SecureStore (encrypted storage)
    return {
      getItem: async (key) => {
        try {
          const result = await SecureStore.getItemAsync(key);
          return result;
        } catch (error) {
          console.error('SecureStore.getItem error:', error);
          return null;
        }
      },
      setItem: async (key, value) => {
        try {
          await SecureStore.setItemAsync(key, value);
          console.log('✅ API key securely stored using device encryption');
        } catch (error) {
          console.error('SecureStore.setItem error:', error);
          throw error;
        }
      },
      removeItem: async (key) => {
        try {
          await SecureStore.deleteItemAsync(key);
        } catch (error) {
          console.error('SecureStore.removeItem error:', error);
          throw error;
        }
      }
    };
  }
};

/**
 * Initialize Gemini client with API key
 * @param {string} apiKey - Gemini API key
 */
export const initializeGemini = (apiKey) => {
  if (!apiKey) {
    console.error('Gemini API key is required');
    throw new Error('Gemini API key is required');
  }
  
  console.log('Initializing Gemini client with API key length:', apiKey.length);
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('Gemini client created successfully');
    return genAI;
  } catch (error) {
    console.error('Error creating Gemini client:', error);
    throw error;
  }
};

/**
 * Get stored Gemini API key from secure storage
 * @returns {Promise<string|null>}
 */
export const getStoredAPIKey = async () => {
  try {
    const storage = getStorage();
    const apiKey = await storage.getItem(GEMINI_API_KEY);
    return apiKey;
  } catch (error) {
    console.error('Error getting stored API key:', error);
    return null;
  }
};

/**
 * Store Gemini API key in secure storage
 * @param {string} apiKey - Gemini API key
 * @returns {Promise<void>}
 */
export const storeAPIKey = async (apiKey) => {
  try {
    const storage = getStorage();
    await storage.setItem(GEMINI_API_KEY, apiKey);
    // Reinitialize client with new key
    initializeGemini(apiKey);
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
    await storage.removeItem(GEMINI_API_KEY);
    genAI = null;
  } catch (error) {
    console.error('Error removing API key:', error);
    throw new Error('Failed to remove API key');
  }
};

/**
 * Initialize Gemini client on app start
 * @returns {Promise<boolean>} - Returns true if client initialized successfully
 */
export const initializeClientOnStart = async () => {
  try {
    const apiKey = await getStoredAPIKey();
    if (apiKey) {
      initializeGemini(apiKey);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error initializing Gemini client:', error);
    return false;
  }
};

/**
 * Get current Gemini client instance
 * @returns {GoogleGenerativeAI|null}
 */
export const getGeminiClient = () => {
  return genAI;
};

/**
 * Send message to Gemini
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Additional options for the request
 * @returns {Promise<string|Object>} - AI response content or object with text and tool_calls
 */
/**
 * Convert Cohere-style tools to Gemini function declarations
 */
const convertToolsToGeminiFunctions = (tools) => {
  if (!tools || tools.length === 0) return [];
  
  return tools.map(tool => {
    const properties = {};
    const required = [];
    
    // Convert parameter_definitions to Gemini's parameters format
    if (tool.parameter_definitions) {
      Object.keys(tool.parameter_definitions).forEach(paramName => {
        const param = tool.parameter_definitions[paramName];
        
        // Map type names (Cohere uses different names than JSON Schema)
        let type = param.type || 'STRING';
        if (type.toLowerCase() === 'string') type = 'STRING';
        if (type.toLowerCase() === 'number') type = 'NUMBER';
        if (type.toLowerCase() === 'boolean') type = 'BOOLEAN';
        if (type.toLowerCase() === 'object') type = 'OBJECT';
        if (type.toLowerCase() === 'array') type = 'ARRAY';
        
        properties[paramName] = {
          type: type,
          description: param.description || '',
        };
        if (param.required) {
          required.push(paramName);
        }
      });
    }
    
    return {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: 'OBJECT',
        properties: properties,
        required: required,
      },
    };
  });
};

/**
 * Convert Gemini function calls to Cohere-compatible format
 */
const convertGeminiFunctionCallsToCohere = (functionCalls) => {
  if (!functionCalls || functionCalls.length === 0) return null;
  
  return functionCalls.map(fc => ({
    name: fc.name,
    parameters: fc.args,
  }));
};

export const sendChatMessage = async (messages, options = {}) => {
  if (!genAI) {
    throw new Error('Gemini client not initialized. Please set your API key first.');
  }

  // Wrap in retry logic for network resilience
  return retryNetworkRequest(async () => {
    console.log('Sending request to Gemini...');
    
    // Convert tools to Gemini format if provided
    let geminiFunctions = [];
    if (options.tools && options.tools.length > 0) {
      geminiFunctions = convertToolsToGeminiFunctions(options.tools);
      console.log('Converted tools to Gemini functions:', JSON.stringify(geminiFunctions, null, 2));
    }
    
    // Get the model - default to gemini-2.5-flash (latest flash model with function calling)
    const modelName = options.model || 'gemini-2.5-flash';
    const modelConfig = { model: modelName };
    
    // Add function declarations if tools are provided
    if (geminiFunctions.length > 0) {
      modelConfig.tools = [{ functionDeclarations: geminiFunctions }];
      
      // Add system instruction to encourage function calling
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
      
      modelConfig.systemInstruction = {
        parts: [{ 
          text: `You are an AI assistant with function calling abilities. CRITICAL: You MUST call functions directly without asking for clarification.

TODAY IS ${dayName}, ${todayStr}
TOMORROW IS ${tomorrowStr}

MANDATORY RULES:
1. NEVER ask "What is the date for tomorrow?" - YOU KNOW IT'S ${tomorrowStr}
2. NEVER ask users to provide dates in specific formats - YOU DO THE CONVERSION
3. ALWAYS call functions immediately when you have enough information
4. Time conversions YOU must do:
   - "4pm" or "4 pm" = "16:00"
   - "9am" or "9 am" = "09:00"
   - "noon" = "12:00"
   - "midnight" = "00:00"

EXAMPLE CORRECT BEHAVIOR:
User: "schedule a call with Tom tomorrow at 4pm"
You: [IMMEDIATELY call create_event with title="Call with Tom", date="${tomorrowStr}", time="16:00"]

EXAMPLE WRONG BEHAVIOR (DO NOT DO THIS):
User: "schedule a call with Tom tomorrow at 4pm"
You: "What is the date for tomorrow?" ❌ WRONG! You know tomorrow is ${tomorrowStr}!

When in doubt, CALL THE FUNCTION. Don't ask questions you can answer yourself.`
        }]
      };
    }
    
    const model = genAI.getGenerativeModel(modelConfig);

    // Build the conversation history for Gemini
    // Gemini uses a different format: array of {role: 'user'|'model', parts: [{text: '...'}]}
    const geminiHistory = [];
    let lastUserMessage = '';

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      
      // Skip system messages for history, but we'll add them as instructions
      if (msg.role === 'system') {
        continue;
      }
      
      const role = msg.role === 'assistant' || msg.role === 'chatbot' ? 'model' : 'user';
      
      // If this is the last message and it's from user, save it separately
      if (i === messages.length - 1 && msg.role === 'user') {
        lastUserMessage = msg.content;
      } else {
        geminiHistory.push({
          role: role,
          parts: [{ text: msg.content }],
        });
      }
    }

    // If no user message found at the end, use the last message
    if (!lastUserMessage && messages.length > 0) {
      lastUserMessage = messages[messages.length - 1].content;
      geminiHistory.pop(); // Remove the last one we just added
    }

    // Start a chat session with history
    const chat = model.startChat({
      history: geminiHistory,
      generationConfig: {
        maxOutputTokens: options.max_tokens || 1000,
        temperature: options.temperature || 0.7,
      },
    });

    // Send the current message
    const result = await chat.sendMessage(lastUserMessage);
    const response = await result.response;
    
    console.log('Full Gemini response:', JSON.stringify(response, null, 2));
    
    // Check for function calls in the response
    // Gemini stores function calls in candidates[0].content.parts[]
    let functionCalls = null;
    
    try {
      if (response.candidates && response.candidates.length > 0) {
        const parts = response.candidates[0].content.parts;
        if (parts && parts.length > 0) {
          // Look for functionCall in parts
          const functionCallParts = parts.filter(part => part.functionCall);
          if (functionCallParts.length > 0) {
            functionCalls = functionCallParts.map(part => part.functionCall);
            console.log('Gemini function calls detected:', JSON.stringify(functionCalls, null, 2));
          }
        }
      }
    } catch (e) {
      console.error('Error extracting function calls:', e);
    }
    
    if (functionCalls && functionCalls.length > 0) {
      // Convert to Cohere-compatible format
      const cohereToolCalls = convertGeminiFunctionCallsToCohere(functionCalls);
      
      // Get text if available, otherwise use empty string
      let text = '';
      try {
        text = response.text();
      } catch (e) {
        // If text() throws, it means the response only contains function calls
        console.log('No text in response, only function calls');
        text = '';
      }
      
      return {
        text: text || 'Executing function...',
        tool_calls: cohereToolCalls,
      };
    }
    
    // No function calls, get the text response
    const text = response.text();
    console.log('Gemini response received (no function calls):', text?.substring(0, 200));

    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    // Return just the text for standard responses
    return text.trim();
  }, {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    onRetry: (attempt, maxRetries, delayMs, error) => {
      console.log(`Retrying Gemini request (${attempt}/${maxRetries}) after ${Math.round(delayMs)}ms due to: ${error.message}`);
    },
  }).catch(error => {
    console.error('Gemini API error after retries:', error);
    
    // Use centralized error handler
    const userFriendlyError = handleAPIError(error, 'Gemini');
    throw new Error(userFriendlyError);
  });
};

/**
 * Validate Gemini API key with retry logic
 * @param {string} apiKey - API key to validate
 * @returns {Promise<boolean>}
 */
export const validateAPIKey = async (apiKey) => {
  if (!apiKey || apiKey.trim() === '') {
    return false;
  }

  try {
    // Wrap validation in retry logic (but with fewer retries for validation)
    return await retryNetworkRequest(async () => {
      const tempClient = new GoogleGenerativeAI(apiKey);
      const model = tempClient.getGenerativeModel({ model: 'gemini-2.5-flash' });

      // Make a simple test request to validate the key
      const result = await model.generateContent('Hello');
      const response = await result.response;
      const text = response.text();

      return text !== null && text !== undefined;
    }, {
      maxRetries: 2, // Only retry twice for validation
      baseDelay: 500,
      maxDelay: 2000,
    });
  } catch (error) {
    console.error('Gemini API key validation error:', error);
    return false;
  }
};

/**
 * Get chat completion (wrapper for compatibility with other services)
 * @param {Array} messages - Array of message objects
 * @param {Object} options - Additional options
 * @returns {Promise<string>} - Response text
 */
export const getChatCompletion = async (messages, options = {}) => {
  const response = await sendChatMessage(messages, options);
  
  // If response is an object (with tool_calls), return just the text
  if (typeof response === 'object' && response.text) {
    return response.text;
  }
  
  return response;
};

