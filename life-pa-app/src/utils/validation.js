/**
 * Input Validation Utilities
 * Provides comprehensive validation for forms, API parameters, and user inputs
 */

/**
 * Validation error class for better error handling
 */
export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - { valid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  
  // Optional: Add more password requirements
  // if (!/[A-Z]/.test(password)) {
  //   return { valid: false, message: 'Password must contain an uppercase letter' };
  // }
  
  return { valid: true, message: 'Password is valid' };
};

/**
 * Validate date string in YYYY-MM-DD format
 * @param {string} dateString - Date string to validate
 * @returns {boolean}
 */
export const isValidDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return false;
  
  // Check format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  
  // Check if it's a valid date
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Validate time string in HH:MM format (24-hour)
 * @param {string} timeString - Time string to validate
 * @returns {boolean}
 */
export const isValidTime = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return false;
  
  // Check format HH:MM (24-hour)
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(timeString);
};

/**
 * Validate event parameters for creating/updating events
 * @param {object} params - Event parameters
 * @throws {ValidationError}
 */
export const validateEventParams = (params) => {
  const errors = [];
  
  // Title validation
  if (!params.title || typeof params.title !== 'string') {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (params.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Title cannot be empty' });
  } else if (params.title.length > 200) {
    errors.push({ field: 'title', message: 'Title must be less than 200 characters' });
  }
  
  // Date validation
  if (!params.date) {
    errors.push({ field: 'date', message: 'Date is required' });
  } else if (!isValidDate(params.date)) {
    errors.push({ field: 'date', message: 'Date must be in YYYY-MM-DD format' });
  }
  
  // Time validation
  if (!params.time) {
    errors.push({ field: 'time', message: 'Time is required' });
  } else if (!isValidTime(params.time)) {
    errors.push({ field: 'time', message: 'Time must be in HH:MM format (24-hour)' });
  }
  
  // Description validation (optional, but if provided must be valid)
  if (params.description && typeof params.description !== 'string') {
    errors.push({ field: 'description', message: 'Description must be a string' });
  } else if (params.description && params.description.length > 1000) {
    errors.push({ field: 'description', message: 'Description must be less than 1000 characters' });
  }
  
  // Category validation (optional)
  if (params.category) {
    const validCategories = ['work', 'personal', 'health', 'finance', 'social', 'travel', 'education', 'entertainment', 'other'];
    if (!validCategories.includes(params.category.toLowerCase())) {
      errors.push({ field: 'category', message: `Category must be one of: ${validCategories.join(', ')}` });
    }
  }
  
  if (errors.length > 0) {
    const errorMessage = errors.map(e => e.message).join('; ');
    const error = new ValidationError(errorMessage);
    error.errors = errors;
    throw error;
  }
  
  return true;
};

/**
 * Validate reminder parameters
 * @param {object} params - Reminder parameters
 * @throws {ValidationError}
 */
export const validateReminderParams = (params) => {
  const errors = [];
  
  // Title validation
  if (!params.title || typeof params.title !== 'string') {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (params.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Title cannot be empty' });
  } else if (params.title.length > 200) {
    errors.push({ field: 'title', message: 'Title must be less than 200 characters' });
  }
  
  // Date validation
  if (!params.date) {
    errors.push({ field: 'date', message: 'Date is required' });
  } else if (!isValidDate(params.date)) {
    errors.push({ field: 'date', message: 'Date must be in YYYY-MM-DD format' });
  }
  
  // Time validation
  if (!params.time) {
    errors.push({ field: 'time', message: 'Time is required' });
  } else if (!isValidTime(params.time)) {
    errors.push({ field: 'time', message: 'Time must be in HH:MM format (24-hour)' });
  }
  
  // Notes validation (optional)
  if (params.notes && typeof params.notes !== 'string') {
    errors.push({ field: 'notes', message: 'Notes must be a string' });
  } else if (params.notes && params.notes.length > 1000) {
    errors.push({ field: 'notes', message: 'Notes must be less than 1000 characters' });
  }
  
  if (errors.length > 0) {
    const errorMessage = errors.map(e => e.message).join('; ');
    const error = new ValidationError(errorMessage);
    error.errors = errors;
    throw error;
  }
  
  return true;
};

/**
 * Sanitize string input (remove potentially dangerous characters)
 * @param {string} input - String to sanitize
 * @returns {string}
 */
export const sanitizeString = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove HTML tags and dangerous characters
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

/**
 * Validate document upload parameters
 * @param {object} params - Document parameters
 * @throws {ValidationError}
 */
export const validateDocumentParams = (params) => {
  const errors = [];
  
  if (!params.imageUri) {
    errors.push({ field: 'imageUri', message: 'Image URI is required' });
  }
  
  if (!params.userId) {
    errors.push({ field: 'userId', message: 'User ID is required' });
  }
  
  // Optional fields validation
  if (params.merchantName && params.merchantName.length > 200) {
    errors.push({ field: 'merchantName', message: 'Merchant name must be less than 200 characters' });
  }
  
  if (params.totalAmount !== undefined && (isNaN(params.totalAmount) || params.totalAmount < 0)) {
    errors.push({ field: 'totalAmount', message: 'Total amount must be a positive number' });
  }
  
  if (errors.length > 0) {
    const errorMessage = errors.map(e => e.message).join('; ');
    const error = new ValidationError(errorMessage);
    error.errors = errors;
    throw error;
  }
  
  return true;
};

/**
 * Validate API key format
 * @param {string} apiKey - API key to validate
 * @returns {boolean}
 */
export const isValidAPIKey = (apiKey) => {
  if (!apiKey || typeof apiKey !== 'string') return false;
  
  // Basic validation: at least 20 characters, alphanumeric with some special chars
  if (apiKey.length < 20) return false;
  
  // Check it's not obviously fake
  const invalidPatterns = [
    'test', 'demo', 'example', 'your_api_key', 'YOUR_KEY',
    '1234567890', 'abcdefghij', 'ABCDEFGHIJ'
  ];
  
  const lowerKey = apiKey.toLowerCase();
  for (const pattern of invalidPatterns) {
    if (lowerKey.includes(pattern)) return false;
  }
  
  return true;
};

/**
 * Validate numeric input
 * @param {any} value - Value to validate
 * @param {object} options - { min, max, integer }
 * @returns {boolean}
 */
export const isValidNumber = (value, options = {}) => {
  const num = Number(value);
  
  if (isNaN(num)) return false;
  
  if (options.min !== undefined && num < options.min) return false;
  if (options.max !== undefined && num > options.max) return false;
  if (options.integer && !Number.isInteger(num)) return false;
  
  return true;
};

/**
 * Validate required fields in an object
 * @param {object} obj - Object to validate
 * @param {Array<string>} requiredFields - Array of required field names
 * @throws {ValidationError}
 */
export const validateRequiredFields = (obj, requiredFields) => {
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missingFields.join(', ')}`,
      missingFields[0]
    );
  }
  
  return true;
};

