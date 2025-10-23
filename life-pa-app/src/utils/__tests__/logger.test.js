/**
 * Logger Utility Tests
 */

import Logger, { AuthLogger, ChatLogger, DocumentLogger } from '../logger';

// Mock console methods
global.console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

// Mock __DEV__
global.__DEV__ = true;

describe('Logger Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.__DEV__ = true;
  });

  describe('Basic Logging', () => {
    test('should log error messages', () => {
      Logger.error('Test error message');
      expect(console.error).toHaveBeenCalled();
      const callArgs = console.error.mock.calls[0];
      expect(callArgs[0]).toContain('[ERROR]');
      expect(callArgs[1]).toBe('Test error message');
    });

    test('should log warn messages in dev', () => {
      Logger.warn('Test warning');
      expect(console.warn).toHaveBeenCalled();
      const callArgs = console.warn.mock.calls[0];
      expect(callArgs[0]).toContain('[WARN]');
    });

    test('should log info messages in dev', () => {
      Logger.info('Test info');
      expect(console.log).toHaveBeenCalled();
      const callArgs = console.log.mock.calls[0];
      expect(callArgs[0]).toContain('[INFO]');
    });

    test('should log debug messages in dev', () => {
      Logger.debug('Test debug');
      expect(console.log).toHaveBeenCalled();
      const callArgs = console.log.mock.calls[0];
      expect(callArgs[0]).toContain('[DEBUG]');
    });
  });

  describe('Production Mode', () => {
    beforeEach(() => {
      global.__DEV__ = false;
      jest.clearAllMocks();
    });

    test('should still log errors in production', () => {
      Logger.error('Production error');
      expect(console.error).toHaveBeenCalled();
    });

    test('should suppress debug logs in production', () => {
      Logger.debug('Should not appear');
      expect(console.log).not.toHaveBeenCalled();
    });

    test('should suppress info logs in production', () => {
      Logger.info('Should not appear');
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('Tagged Loggers', () => {
    test('AuthLogger should include AUTH tag', () => {
      AuthLogger.info('Auth event');
      expect(console.log).toHaveBeenCalled();
      const callArgs = console.log.mock.calls[0];
      expect(callArgs[0]).toContain('[AUTH]');
    });

    test('ChatLogger should include CHAT tag', () => {
      ChatLogger.debug('Chat message');
      expect(console.log).toHaveBeenCalled();
      const callArgs = console.log.mock.calls[0];
      expect(callArgs[0]).toContain('[CHAT]');
    });

    test('DocumentLogger should include DOCUMENT tag', () => {
      DocumentLogger.error('Document error');
      expect(console.error).toHaveBeenCalled();
      const callArgs = console.error.mock.calls[0];
      expect(callArgs[0]).toContain('[DOCUMENT]');
    });
  });

  describe('Performance Logging', () => {
    test('should log performance metrics', () => {
      Logger.performance('testOperation', 150);
      expect(console.log).toHaveBeenCalled();
      const callArgs = console.log.mock.calls[0];
      expect(callArgs[0]).toContain('[PERF]');
      expect(callArgs[1]).toContain('testOperation');
      expect(callArgs[1]).toContain('150ms');
    });

    test('startPerformance should return end function', () => {
      const end = Logger.startPerformance('testOp');
      expect(typeof end).toBe('function');
    });

    test('performance logger should calculate duration', (done) => {
      const end = Logger.startPerformance('asyncOp');
      
      setTimeout(() => {
        end();
        expect(console.log).toHaveBeenCalled();
        const callArgs = console.log.mock.calls[0];
        expect(callArgs[1]).toContain('asyncOp');
        done();
      }, 50);
    });
  });

  describe('Log Formatting', () => {
    test('should include timestamp in log messages', () => {
      Logger.info('Test message');
      const callArgs = console.log.mock.calls[0];
      // Check for time format HH:MM:SS
      expect(callArgs[0]).toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
    });

    test('should handle multiple arguments', () => {
      Logger.debug('Message', { data: 'test' }, 123);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'),
        'Message',
        { data: 'test' },
        123
      );
    });
  });

  describe('Edge Cases', () => {
    test('should handle null values', () => {
      expect(() => Logger.info(null)).not.toThrow();
    });

    test('should handle undefined values', () => {
      expect(() => Logger.debug(undefined)).not.toThrow();
    });

    test('should handle empty strings', () => {
      expect(() => Logger.warn('')).not.toThrow();
    });

    test('should handle objects', () => {
      const obj = { key: 'value', nested: { data: 123 } };
      expect(() => Logger.error('Error:', obj)).not.toThrow();
    });

    test('should handle errors', () => {
      const error = new Error('Test error');
      expect(() => Logger.error('Caught error:', error)).not.toThrow();
    });
  });
});

