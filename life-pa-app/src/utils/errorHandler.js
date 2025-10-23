/**
 * Error Handling Utilities
 * Centralized error handling, logging, and user-friendly error messages
 */

/**
 * Custom error classes for different error types
 */
export class NetworkError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

export class AuthenticationError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'AuthenticationError';
    this.originalError = originalError;
  }
}

export class ValidationError extends Error {
  constructor(message, field = null, originalError = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.originalError = originalError;
  }
}

export class ServiceError extends Error {
  constructor(message, service = null, originalError = null) {
    super(message);
    this.name = 'ServiceError';
    this.service = service;
    this.originalError = originalError;
  }
}

/**
 * Convert Firebase auth errors to user-friendly messages
 * @param {Error} error - Firebase auth error
 * @returns {string} - User-friendly error message
 */
export const handleFirebaseAuthError = (error) => {
  if (!error || !error.code) return 'An authentication error occurred';
  
  const errorMessages = {
    'auth/email-already-in-use': 'This email is already registered',
    'auth/invalid-email': 'Invalid email address',
    'auth/operation-not-allowed': 'Operation not allowed',
    'auth/weak-password': 'Password is too weak (minimum 6 characters)',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-credential': 'Invalid email or password',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later',
    'auth/network-request-failed': 'Network error. Please check your connection',
    'auth/popup-closed-by-user': 'Sign-in popup was closed',
    'auth/cancelled-popup-request': 'Another popup is already open',
  };
  
  return errorMessages[error.code] || error.message || 'Authentication failed';
};

/**
 * Convert Firestore errors to user-friendly messages
 * @param {Error} error - Firestore error
 * @returns {string} - User-friendly error message
 */
export const handleFirestoreError = (error) => {
  if (!error) return 'A database error occurred';
  
  const message = error.message?.toLowerCase() || '';
  
  if (message.includes('permission') || message.includes('denied')) {
    return 'You don\'t have permission to perform this action';
  }
  
  if (message.includes('not found') || message.includes('does not exist')) {
    return 'The requested data was not found';
  }
  
  if (message.includes('network')) {
    return 'Network error. Please check your connection';
  }
  
  if (message.includes('quota') || message.includes('limit')) {
    return 'Service limit reached. Please try again later';
  }
  
  return error.message || 'A database error occurred';
};

/**
 * Convert API errors to user-friendly messages
 * @param {Error} error - API error
 * @param {string} serviceName - Name of the service (e.g., 'Gemini', 'OpenAI')
 * @returns {string} - User-friendly error message
 */
export const handleAPIError = (error, serviceName = 'AI service') => {
  if (!error) return `An error occurred with ${serviceName}`;
  
  const message = error.message?.toLowerCase() || '';
  
  if (message.includes('api key') || message.includes('invalid key')) {
    return `Invalid API key for ${serviceName}. Please check your settings`;
  }
  
  if (message.includes('quota') || message.includes('429')) {
    return `${serviceName} rate limit exceeded. Please try again later`;
  }
  
  if (message.includes('500') || message.includes('503') || message.includes('server error')) {
    return `${serviceName} is temporarily unavailable. Please try again later`;
  }
  
  if (message.includes('timeout')) {
    return `${serviceName} request timed out. Please try again`;
  }
  
  if (message.includes('network')) {
    return 'Network error. Please check your connection';
  }
  
  return error.message || `Failed to get response from ${serviceName}`;
};

/**
 * Handle async operation with comprehensive error handling
 * @param {Function} operation - Async function to execute
 * @param {object} options - Error handling options
 * @returns {Promise<object>} - { success: boolean, data?: any, error?: string }
 */
export const handleAsyncOperation = async (operation, options = {}) => {
  const {
    errorHandler = null,
    serviceName = 'Service',
    defaultError = 'Operation failed',
    logErrors = true,
  } = options;
  
  try {
    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    if (logErrors) {
      console.error(`${serviceName} error:`, error);
    }
    
    let errorMessage = defaultError;
    
    if (errorHandler) {
      errorMessage = errorHandler(error);
    } else if (error instanceof ValidationError) {
      errorMessage = error.message;
    } else if (error instanceof AuthenticationError) {
      errorMessage = handleFirebaseAuthError(error.originalError || error);
    } else if (error instanceof NetworkError) {
      errorMessage = 'Network error. Please check your connection';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
};

/**
 * Wrap a function with error handling
 * @param {Function} fn - Function to wrap
 * @param {object} options - Error handling options
 * @returns {Function} - Wrapped function
 */
export const withErrorHandling = (fn, options = {}) => {
  return async (...args) => {
    return handleAsyncOperation(() => fn(...args), options);
  };
};

/**
 * Log error to console (in production, send to error tracking service)
 * @param {Error} error - Error to log
 * @param {object} context - Additional context
 */
export const logError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    name: error.name,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context,
  };
  
  // In development, log to console
  if (__DEV__) {
    console.error('Error logged:', errorInfo);
  }
  
  // In production, send to error tracking service (e.g., Sentry)
  // Example:
  // if (!__DEV__) {
  //   Sentry.captureException(error, { extra: context });
  // }
};

/**
 * Create a user-friendly error message from any error
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default message if error can't be parsed
 * @returns {string} - User-friendly error message
 */
export const getUserFriendlyError = (error, defaultMessage = 'An error occurred') => {
  if (!error) return defaultMessage;
  
  // Check error type
  if (error instanceof ValidationError) {
    return error.message;
  }
  
  if (error instanceof AuthenticationError) {
    return handleFirebaseAuthError(error.originalError || error);
  }
  
  if (error instanceof NetworkError) {
    return 'Network error. Please check your internet connection';
  }
  
  // Check error message for common patterns
  const message = error.message?.toLowerCase() || '';
  
  if (message.includes('auth')) {
    return handleFirebaseAuthError(error);
  }
  
  if (message.includes('permission') || message.includes('firestore')) {
    return handleFirestoreError(error);
  }
  
  if (message.includes('network') || message.includes('connection')) {
    return 'Network error. Please check your connection';
  }
  
  if (message.includes('timeout')) {
    return 'Operation timed out. Please try again';
  }
  
  // Return the error message or default
  return error.message || defaultMessage;
};

/**
 * Safe async function wrapper - catches errors and returns result
 * @param {Function} fn - Async function to execute
 * @param {any} fallbackValue - Value to return on error
 * @returns {Promise<any>} - Result or fallback value
 */
export const safeAsync = async (fn, fallbackValue = null) => {
  try {
    return await fn();
  } catch (error) {
    console.error('Safe async error:', error);
    return fallbackValue;
  }
};

/**
 * Try multiple operations in sequence until one succeeds
 * @param {Array<Function>} operations - Array of async functions to try
 * @returns {Promise<any>} - Result of first successful operation
 * @throws {Error} - If all operations fail
 */
export const trySequential = async (operations) => {
  const errors = [];
  
  for (const operation of operations) {
    try {
      return await operation();
    } catch (error) {
      errors.push(error);
    }
  }
  
  // All operations failed
  const combinedError = new Error(
    `All operations failed: ${errors.map(e => e.message).join('; ')}`
  );
  combinedError.errors = errors;
  throw combinedError;
};

export default {
  NetworkError,
  AuthenticationError,
  ValidationError,
  ServiceError,
  handleFirebaseAuthError,
  handleFirestoreError,
  handleAPIError,
  handleAsyncOperation,
  withErrorHandling,
  logError,
  getUserFriendlyError,
  safeAsync,
  trySequential,
};

