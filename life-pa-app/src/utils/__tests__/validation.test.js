/**
 * Validation Utility Tests
 */

import {
  isValidEmail,
  validatePassword,
  validateEventParams,
  validateReminderParams,
} from '../validation';

describe('Validation Utility', () => {
  describe('isValidEmail', () => {
    test('should validate correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@domain.co.uk')).toBe(true);
      expect(isValidEmail('name+tag@example.com')).toBe(true);
    });

    test('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    test('should handle edge cases', () => {
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
      expect(isValidEmail(' ')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    test('should accept valid passwords', () => {
      const result = validatePassword('Password123!');
      expect(result.valid).toBe(true);
      expect(result.message).toBe('Password is valid');
    });

    test('should reject passwords that are too short', () => {
      const result = validatePassword('Pass1!');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('at least 8 characters');
    });

    test('should reject passwords without uppercase', () => {
      const result = validatePassword('password123!');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('uppercase letter');
    });

    test('should reject passwords without lowercase', () => {
      const result = validatePassword('PASSWORD123!');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('lowercase letter');
    });

    test('should reject passwords without numbers', () => {
      const result = validatePassword('Password!');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('number');
    });

    test('should reject passwords without special characters', () => {
      const result = validatePassword('Password123');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('special character');
    });

    test('should handle edge cases', () => {
      expect(validatePassword('').valid).toBe(false);
      expect(validatePassword(null).valid).toBe(false);
      expect(validatePassword(undefined).valid).toBe(false);
    });
  });

  describe('validateEventParams', () => {
    const validEvent = {
      title: 'Team Meeting',
      date: '2025-10-24',
      time: '10:00',
      description: 'Weekly team sync',
      category: 'work',
    };

    test('should accept valid event parameters', () => {
      expect(() => validateEventParams(validEvent)).not.toThrow();
    });

    test('should reject event without title', () => {
      const invalidEvent = { ...validEvent, title: '' };
      expect(() => validateEventParams(invalidEvent)).toThrow('Title is required');
    });

    test('should reject event without date', () => {
      const invalidEvent = { ...validEvent, date: '' };
      expect(() => validateEventParams(invalidEvent)).toThrow('Date is required');
    });

    test('should reject event without time', () => {
      const invalidEvent = { ...validEvent, time: '' };
      expect(() => validateEventParams(invalidEvent)).toThrow('Time is required');
    });

    test('should accept event without description', () => {
      const eventNoDesc = { ...validEvent, description: '' };
      expect(() => validateEventParams(eventNoDesc)).not.toThrow();
    });

    test('should accept event without category', () => {
      const eventNoCat = { ...validEvent, category: '' };
      expect(() => validateEventParams(eventNoCat)).not.toThrow();
    });

    test('should handle null values', () => {
      expect(() => validateEventParams(null)).toThrow();
      expect(() => validateEventParams(undefined)).toThrow();
    });
  });

  describe('validateReminderParams', () => {
    const validReminder = {
      title: 'Call dentist',
      date: '2025-10-25',
      time: '14:00',
      description: 'Schedule appointment',
    };

    test('should accept valid reminder parameters', () => {
      expect(() => validateReminderParams(validReminder)).not.toThrow();
    });

    test('should reject reminder without title', () => {
      const invalidReminder = { ...validReminder, title: '' };
      expect(() => validateReminderParams(invalidReminder)).toThrow('Title is required');
    });

    test('should reject reminder without date', () => {
      const invalidReminder = { ...validReminder, date: '' };
      expect(() => validateReminderParams(invalidReminder)).toThrow('Date is required');
    });

    test('should reject reminder without time', () => {
      const invalidReminder = { ...validReminder, time: '' };
      expect(() => validateReminderParams(invalidReminder)).toThrow('Time is required');
    });

    test('should accept reminder without description', () => {
      const reminderNoDesc = { ...validReminder, description: '' };
      expect(() => validateReminderParams(reminderNoDesc)).not.toThrow();
    });

    test('should handle null values', () => {
      expect(() => validateReminderParams(null)).toThrow();
      expect(() => validateReminderParams(undefined)).toThrow();
    });
  });

  describe('Whitespace Handling', () => {
    test('should trim whitespace in email validation', () => {
      expect(isValidEmail(' user@example.com ')).toBe(true);
    });

    test('should handle whitespace-only strings', () => {
      const result = validatePassword('   ');
      expect(result.valid).toBe(false);
    });

    test('should reject whitespace-only titles', () => {
      const event = {
        title: '   ',
        date: '2025-10-24',
        time: '10:00',
      };
      expect(() => validateEventParams(event)).toThrow('Title is required');
    });
  });
});

