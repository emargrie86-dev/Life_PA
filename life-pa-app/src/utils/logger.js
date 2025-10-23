/**
 * Logger Utility
 * Centralized logging with environment-based levels
 * Prevents console spam in production while maintaining dev visibility
 */

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

// Current log level based on environment
const CURRENT_LEVEL = __DEV__ ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;

/**
 * Check if a log level should be displayed
 * @param {number} level - Log level to check
 * @returns {boolean}
 */
const shouldLog = (level) => {
  return level <= CURRENT_LEVEL;
};

/**
 * Format log message with timestamp and level
 * @param {string} level - Log level
 * @param {string} tag - Optional tag for categorization
 * @param {Array} args - Log arguments
 * @returns {Array} - Formatted arguments
 */
const formatLog = (level, tag, args) => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = tag ? `[${timestamp}] [${level}] [${tag}]` : `[${timestamp}] [${level}]`;
  return [prefix, ...args];
};

/**
 * Logger class with different log levels
 */
class Logger {
  /**
   * Log error message (always displayed)
   * Use for critical errors that need attention
   * @param {...any} args - Arguments to log
   */
  static error(...args) {
    if (shouldLog(LOG_LEVELS.ERROR)) {
      console.error(...formatLog('ERROR', null, args));
      
      // In production, send to error tracking service
      if (!__DEV__) {
        // Example: Sentry.captureMessage(args.join(' '), 'error');
      }
    }
  }

  /**
   * Log warning message (production + dev)
   * Use for non-critical issues
   * @param {...any} args - Arguments to log
   */
  static warn(...args) {
    if (shouldLog(LOG_LEVELS.WARN)) {
      console.warn(...formatLog('WARN', null, args));
    }
  }

  /**
   * Log info message (dev only)
   * Use for general information
   * @param {...any} args - Arguments to log
   */
  static info(...args) {
    if (shouldLog(LOG_LEVELS.INFO)) {
      console.log(...formatLog('INFO', null, args));
    }
  }

  /**
   * Log debug message (dev only)
   * Use for detailed debugging information
   * @param {...any} args - Arguments to log
   */
  static debug(...args) {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(...formatLog('DEBUG', null, args));
    }
  }

  /**
   * Create a tagged logger for a specific module
   * @param {string} tag - Tag for this logger (e.g., 'AUTH', 'OCR', 'GEMINI')
   * @returns {Object} - Logger instance with tag
   */
  static tagged(tag) {
    return {
      error: (...args) => {
        if (shouldLog(LOG_LEVELS.ERROR)) {
          console.error(...formatLog('ERROR', tag, args));
          if (!__DEV__) {
            // Send to error tracking with tag
          }
        }
      },
      warn: (...args) => {
        if (shouldLog(LOG_LEVELS.WARN)) {
          console.warn(...formatLog('WARN', tag, args));
        }
      },
      info: (...args) => {
        if (shouldLog(LOG_LEVELS.INFO)) {
          console.log(...formatLog('INFO', tag, args));
        }
      },
      debug: (...args) => {
        if (shouldLog(LOG_LEVELS.DEBUG)) {
          console.log(...formatLog('DEBUG', tag, args));
        }
      },
    };
  }

  /**
   * Log API request (dev only)
   * @param {string} method - HTTP method
   * @param {string} url - API URL
   * @param {object} data - Request data
   */
  static apiRequest(method, url, data = null) {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      const args = [`${method} ${url}`];
      if (data) args.push(data);
      console.log(...formatLog('API', 'REQUEST', args));
    }
  }

  /**
   * Log API response (dev only)
   * @param {string} method - HTTP method
   * @param {string} url - API URL
   * @param {number} status - Response status
   * @param {object} data - Response data
   */
  static apiResponse(method, url, status, data = null) {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      const args = [`${method} ${url} - ${status}`];
      if (data) args.push(data);
      console.log(...formatLog('API', 'RESPONSE', args));
    }
  }

  /**
   * Log performance metric (dev only)
   * @param {string} operation - Operation name
   * @param {number} duration - Duration in ms
   */
  static performance(operation, duration) {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(...formatLog('PERF', null, [`${operation} took ${duration}ms`]));
    }
  }

  /**
   * Create a performance logger
   * @param {string} operation - Operation name
   * @returns {Function} - End function to call when operation completes
   */
  static startPerformance(operation) {
    if (!shouldLog(LOG_LEVELS.DEBUG)) {
      return () => {}; // No-op in production
    }

    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      Logger.performance(operation, duration);
    };
  }

  /**
   * Log component lifecycle (dev only)
   * @param {string} component - Component name
   * @param {string} lifecycle - Lifecycle method
   */
  static lifecycle(component, lifecycle) {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(...formatLog('LIFECYCLE', component, [lifecycle]));
    }
  }
}

// Create module-specific loggers for common services
export const AuthLogger = Logger.tagged('AUTH');
export const GeminiLogger = Logger.tagged('GEMINI');
export const OCRLogger = Logger.tagged('OCR');
export const FirestoreLogger = Logger.tagged('FIRESTORE');
export const ChatLogger = Logger.tagged('CHAT');
export const DocumentLogger = Logger.tagged('DOCUMENT');
export const TaskLogger = Logger.tagged('TASK');

// Export default logger
export default Logger;

