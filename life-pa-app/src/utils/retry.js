/**
 * Retry Logic Utilities
 * Implements exponential backoff and retry patterns for network requests
 */

/**
 * Delay helper function
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay with jitter
 * @param {number} attempt - Current attempt number (0-based)
 * @param {number} baseDelay - Base delay in milliseconds
 * @param {number} maxDelay - Maximum delay in milliseconds
 * @returns {number} - Delay in milliseconds
 */
const calculateBackoff = (attempt, baseDelay = 1000, maxDelay = 10000) => {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  
  // Add jitter (random factor between 0.5 and 1.5)
  const jitter = 0.5 + Math.random();
  
  // Cap at maxDelay
  return Math.min(exponentialDelay * jitter, maxDelay);
};

/**
 * Determine if an error is retryable
 * @param {Error} error - Error to check
 * @returns {boolean}
 */
const isRetryableError = (error) => {
  if (!error) return false;
  
  const message = error.message?.toLowerCase() || '';
  
  // Non-retryable errors (client errors)
  const nonRetryablePatterns = [
    'invalid api key',
    'authentication failed',
    'unauthorized',
    'forbidden',
    'not found',
    'validation',
    'invalid credential',
    'bad request',
  ];
  
  for (const pattern of nonRetryablePatterns) {
    if (message.includes(pattern)) {
      return false;
    }
  }
  
  // Retryable errors (network/server errors)
  const retryablePatterns = [
    'network',
    'timeout',
    'connection',
    'econnrefused',
    'enotfound',
    'etimedout',
    '429', // Rate limit
    '500', // Server error
    '502', // Bad gateway
    '503', // Service unavailable
    '504', // Gateway timeout
  ];
  
  for (const pattern of retryablePatterns) {
    if (message.includes(pattern)) {
      return true;
    }
  }
  
  // Check error code
  if (error.code) {
    const retryableCodes = [
      'NETWORK_ERROR',
      'TIMEOUT',
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
    ];
    if (retryableCodes.includes(error.code)) {
      return true;
    }
  }
  
  // Default: retry on generic errors
  return true;
};

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {object} options - Retry options
 * @returns {Promise} - Result of the function
 */
export const retryWithBackoff = async (fn, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    onRetry = null,
    shouldRetry = isRetryableError,
  } = options;
  
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Execute the function
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      if (attempt < maxRetries && shouldRetry(error)) {
        const delayMs = calculateBackoff(attempt, baseDelay, maxDelay);
        
        // Call onRetry callback if provided
        if (onRetry) {
          onRetry(attempt + 1, maxRetries, delayMs, error);
        } else {
          console.log(
            `Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(delayMs)}ms`,
            `Error: ${error.message}`
          );
        }
        
        // Wait before retrying
        await delay(delayMs);
      } else {
        // Don't retry, throw the error
        throw error;
      }
    }
  }
  
  // All retries exhausted
  throw lastError;
};

/**
 * Retry with simple linear delay
 * @param {Function} fn - Async function to retry
 * @param {object} options - Retry options
 * @returns {Promise} - Result of the function
 */
export const retryWithDelay = async (fn, options = {}) => {
  const {
    maxRetries = 3,
    delayMs = 1000,
    onRetry = null,
  } = options;
  
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        if (onRetry) {
          onRetry(attempt + 1, maxRetries, delayMs, error);
        }
        
        await delay(delayMs);
      }
    }
  }
  
  throw lastError;
};

/**
 * Retry with timeout
 * @param {Function} fn - Async function to retry
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {object} retryOptions - Retry options
 * @returns {Promise} - Result of the function
 */
export const retryWithTimeout = async (fn, timeoutMs, retryOptions = {}) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  
  const retryPromise = retryWithBackoff(fn, retryOptions);
  
  return Promise.race([retryPromise, timeoutPromise]);
};

/**
 * Batch retry multiple operations
 * @param {Array<Function>} operations - Array of async functions
 * @param {object} options - Retry options
 * @returns {Promise<Array>} - Array of results
 */
export const batchRetry = async (operations, options = {}) => {
  const { sequential = false, ...retryOptions } = options;
  
  if (sequential) {
    // Execute operations one by one
    const results = [];
    for (const operation of operations) {
      const result = await retryWithBackoff(operation, retryOptions);
      results.push(result);
    }
    return results;
  } else {
    // Execute operations in parallel
    const promises = operations.map(op => retryWithBackoff(op, retryOptions));
    return Promise.all(promises);
  }
};

/**
 * Retry helper specifically for network requests
 * @param {Function} requestFn - Async function that makes a network request
 * @param {object} options - Retry options
 * @returns {Promise} - Result of the request
 */
export const retryNetworkRequest = async (requestFn, options = {}) => {
  return retryWithBackoff(requestFn, {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    shouldRetry: (error) => {
      // Network-specific retry logic
      if (!error) return false;
      
      const message = error.message?.toLowerCase() || '';
      
      // Never retry authentication errors
      if (message.includes('auth') || message.includes('unauthorized')) {
        return false;
      }
      
      // Retry network errors
      return isRetryableError(error);
    },
    ...options,
  });
};

/**
 * Create a retryable version of a function
 * @param {Function} fn - Function to make retryable
 * @param {object} options - Default retry options
 * @returns {Function} - Retryable version of the function
 */
export const makeRetryable = (fn, options = {}) => {
  return async (...args) => {
    return retryWithBackoff(() => fn(...args), options);
  };
};

export default {
  retryWithBackoff,
  retryWithDelay,
  retryWithTimeout,
  batchRetry,
  retryNetworkRequest,
  makeRetryable,
  isRetryableError,
};

