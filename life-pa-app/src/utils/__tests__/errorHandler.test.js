/**
 * Error Handler Utility Tests
 */

import {
  handleFirebaseAuthError,
  handleAPIError,
  getUserFriendlyError,
} from '../errorHandler';

describe('Error Handler Utility', () => {
  describe('handleFirebaseAuthError', () => {
    test('should handle email-already-in-use error', () => {
      const error = { code: 'auth/email-already-in-use' };
      const message = handleFirebaseAuthError(error);
      expect(message).toContain('already in use');
    });

    test('should handle invalid-email error', () => {
      const error = { code: 'auth/invalid-email' };
      const message = handleFirebaseAuthError(error);
      expect(message).toContain('Invalid email');
    });

    test('should handle weak-password error', () => {
      const error = { code: 'auth/weak-password' };
      const message = handleFirebaseAuthError(error);
      expect(message).toContain('at least 6 characters');
    });

    test('should handle user-not-found error', () => {
      const error = { code: 'auth/user-not-found' };
      const message = handleFirebaseAuthError(error);
      expect(message).toContain('No account found');
    });

    test('should handle wrong-password error', () => {
      const error = { code: 'auth/wrong-password' };
      const message = handleFirebaseAuthError(error);
      expect(message).toContain('Incorrect password');
    });

    test('should handle too-many-requests error', () => {
      const error = { code: 'auth/too-many-requests' };
      const message = handleFirebaseAuthError(error);
      expect(message).toContain('Too many');
    });

    test('should handle network-request-failed error', () => {
      const error = { code: 'auth/network-request-failed' };
      const message = handleFirebaseAuthError(error);
      expect(message).toContain('Network error');
    });

    test('should return generic message for unknown error code', () => {
      const error = { code: 'auth/unknown-error' };
      const message = handleFirebaseAuthError(error);
      expect(message).toContain('Authentication error');
    });

    test('should handle errors without code property', () => {
      const error = { message: 'Some error message' };
      const message = handleFirebaseAuthError(error);
      expect(message).toContain('Authentication error');
    });

    test('should handle null/undefined errors', () => {
      expect(handleFirebaseAuthError(null)).toBeTruthy();
      expect(handleFirebaseAuthError(undefined)).toBeTruthy();
    });
  });

  describe('handleAPIError', () => {
    test('should handle rate limit errors', () => {
      const error = { status: 429 };
      const message = handleAPIError(error, 'Gemini');
      expect(message).toContain('rate limit');
    });

    test('should handle unauthorized errors', () => {
      const error = { status: 401 };
      const message = handleAPIError(error, 'OpenAI');
      expect(message).toContain('API key');
    });

    test('should handle forbidden errors', () => {
      const error = { status: 403 };
      const message = handleAPIError(error, 'API');
      expect(message).toContain('access');
    });

    test('should handle server errors', () => {
      const error = { status: 500 };
      const message = handleAPIError(error, 'Service');
      expect(message).toContain('server error');
    });

    test('should handle network errors', () => {
      const error = { message: 'Network request failed' };
      const message = handleAPIError(error, 'API');
      expect(message).toContain('Network');
    });

    test('should handle timeout errors', () => {
      const error = { message: 'timeout of 30000ms exceeded' };
      const message = handleAPIError(error, 'API');
      expect(message).toContain('Request timed out');
    });

    test('should use service name in error message', () => {
      const error = { status: 500 };
      const message = handleAPIError(error, 'CustomService');
      expect(message).toContain('CustomService');
    });

    test('should handle errors with error.message property', () => {
      const error = { error: { message: 'Custom error message' } };
      const message = handleAPIError(error, 'API');
      expect(message).toContain('Custom error message');
    });

    test('should handle string errors', () => {
      const error = 'String error message';
      const message = handleAPIError(error, 'API');
      expect(message).toBeTruthy();
    });

    test('should provide default service name if not provided', () => {
      const error = { status: 500 };
      const message = handleAPIError(error);
      expect(message).toBeTruthy();
    });
  });

  describe('getUserFriendlyError', () => {
    test('should use fallback message if error has no useful info', () => {
      const error = {};
      const message = getUserFriendlyError(error, 'Default message');
      expect(message).toBe('Default message');
    });

    test('should extract error.message if available', () => {
      const error = { message: 'Specific error occurred' };
      const message = getUserFriendlyError(error, 'Fallback');
      expect(message).toContain('Specific error occurred');
    });

    test('should extract error.error.message if available', () => {
      const error = { error: { message: 'Nested error message' } };
      const message = getUserFriendlyError(error, 'Fallback');
      expect(message).toContain('Nested error message');
    });

    test('should handle Error instances', () => {
      const error = new Error('Standard error');
      const message = getUserFriendlyError(error, 'Fallback');
      expect(message).toContain('Standard error');
    });

    test('should handle null/undefined errors with fallback', () => {
      expect(getUserFriendlyError(null, 'Fallback')).toBe('Fallback');
      expect(getUserFriendlyError(undefined, 'Fallback')).toBe('Fallback');
    });

    test('should provide default fallback if not specified', () => {
      const error = {};
      const message = getUserFriendlyError(error);
      expect(message).toBeTruthy();
      expect(message).toBe('An error occurred');
    });

    test('should handle string errors', () => {
      const error = 'Simple string error';
      const message = getUserFriendlyError(error, 'Fallback');
      expect(message).toBe('Simple string error');
    });
  });

  describe('Edge Cases', () => {
    test('should handle circular reference in error object', () => {
      const error = { message: 'Error' };
      error.circular = error; // Create circular reference
      
      expect(() => handleFirebaseAuthError(error)).not.toThrow();
      expect(() => handleAPIError(error, 'API')).not.toThrow();
      expect(() => getUserFriendlyError(error, 'Fallback')).not.toThrow();
    });

    test('should handle non-object errors', () => {
      expect(handleFirebaseAuthError(123)).toBeTruthy();
      expect(handleAPIError(true, 'API')).toBeTruthy();
      expect(getUserFriendlyError([], 'Fallback')).toBeTruthy();
    });

    test('should handle errors with empty string messages', () => {
      const error = { message: '' };
      const message = getUserFriendlyError(error, 'Fallback');
      expect(message).toBe('Fallback');
    });

    test('should handle errors with whitespace-only messages', () => {
      const error = { message: '   ' };
      const message = getUserFriendlyError(error, 'Fallback');
      expect(message).toBe('Fallback');
    });
  });

  describe('Integration', () => {
    test('should work with real Firebase error format', () => {
      const error = {
        code: 'auth/invalid-email',
        message: 'The email address is badly formatted.',
      };
      const message = handleFirebaseAuthError(error);
      expect(message).toContain('Invalid email');
    });

    test('should work with real API error format', () => {
      const error = {
        status: 429,
        statusText: 'Too Many Requests',
        data: {
          error: {
            message: 'Rate limit exceeded',
          },
        },
      };
      const message = handleAPIError(error, 'Gemini');
      expect(message).toContain('rate limit');
    });
  });
});

