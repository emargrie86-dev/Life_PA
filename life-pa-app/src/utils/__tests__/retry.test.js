/**
 * Retry Utility Tests
 */

import { retryNetworkRequest } from '../retry';

// Mock timers
jest.useFakeTimers();

describe('Retry Utility', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Successful Requests', () => {
    test('should return result on first try if successful', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      
      const result = await retryNetworkRequest(mockFn);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('should not retry on successful request', async () => {
      const mockFn = jest.fn().mockResolvedValue({ data: 'test' });
      
      await retryNetworkRequest(mockFn, { maxRetries: 5 });
      
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Failed Requests with Retry', () => {
    test('should retry on failure and eventually succeed', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');
      
      const promise = retryNetworkRequest(mockFn, { maxRetries: 3, baseDelay: 100 });
      
      // Fast-forward through all timers
      jest.runAllTimers();
      
      const result = await promise;
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    test('should throw error after max retries', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Persistent error'));
      
      const promise = retryNetworkRequest(mockFn, { maxRetries: 2, baseDelay: 100 });
      
      jest.runAllTimers();
      
      await expect(promise).rejects.toThrow('Persistent error');
      expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('Exponential Backoff', () => {
    test('should use exponential backoff delays', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Error'));
      const delays = [];
      
      const promise = retryNetworkRequest(mockFn, {
        maxRetries: 3,
        baseDelay: 100,
        onRetry: (attempt, maxRetries, delayMs) => {
          delays.push(delayMs);
        },
      });
      
      jest.runAllTimers();
      
      await promise.catch(() => {});
      
      // Delays should increase exponentially
      expect(delays.length).toBe(3);
      expect(delays[0]).toBeLessThan(delays[1]);
      expect(delays[1]).toBeLessThan(delays[2]);
    });

    test('should respect maxDelay cap', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Error'));
      const delays = [];
      
      const promise = retryNetworkRequest(mockFn, {
        maxRetries: 5,
        baseDelay: 1000,
        maxDelay: 3000,
        onRetry: (attempt, maxRetries, delayMs) => {
          delays.push(delayMs);
        },
      });
      
      jest.runAllTimers();
      
      await promise.catch(() => {});
      
      // No delay should exceed maxDelay
      delays.forEach(delay => {
        expect(delay).toBeLessThanOrEqual(3000);
      });
    });
  });

  describe('Retry Callback', () => {
    test('should call onRetry callback with correct parameters', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Network error'));
      const onRetry = jest.fn();
      
      const promise = retryNetworkRequest(mockFn, {
        maxRetries: 2,
        baseDelay: 100,
        onRetry,
      });
      
      jest.runAllTimers();
      
      await promise.catch(() => {});
      
      expect(onRetry).toHaveBeenCalledTimes(2);
      
      // First retry call
      expect(onRetry).toHaveBeenNthCalledWith(
        1,
        1, // attempt
        2, // maxRetries
        expect.any(Number), // delay
        expect.any(Error) // error
      );
    });
  });

  describe('Edge Cases', () => {
    test('should handle maxRetries of 0', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Error'));
      
      const promise = retryNetworkRequest(mockFn, { maxRetries: 0 });
      
      await expect(promise).rejects.toThrow('Error');
      expect(mockFn).toHaveBeenCalledTimes(1); // Only initial attempt
    });

    test('should handle function that throws synchronously', async () => {
      const mockFn = jest.fn(() => {
        throw new Error('Sync error');
      });
      
      const promise = retryNetworkRequest(mockFn, { maxRetries: 2, baseDelay: 100 });
      
      jest.runAllTimers();
      
      await expect(promise).rejects.toThrow('Sync error');
    });

    test('should handle undefined error messages', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error());
      
      const promise = retryNetworkRequest(mockFn, { maxRetries: 1, baseDelay: 100 });
      
      jest.runAllTimers();
      
      await expect(promise).rejects.toThrow();
    });

    test('should handle null/undefined parameters', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      
      const result = await retryNetworkRequest(mockFn, {
        maxRetries: undefined,
        baseDelay: undefined,
      });
      
      expect(result).toBe('success');
    });
  });

  describe('Default Configuration', () => {
    test('should use default maxRetries', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Error'));
      
      const promise = retryNetworkRequest(mockFn);
      
      jest.runAllTimers();
      
      await promise.catch(() => {});
      
      // Default is 3 retries + initial = 4 calls
      expect(mockFn).toHaveBeenCalledTimes(4);
    });

    test('should use default baseDelay', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValue('success');
      
      const onRetry = jest.fn();
      
      const promise = retryNetworkRequest(mockFn, { onRetry });
      
      jest.runAllTimers();
      
      await promise;
      
      expect(onRetry).toHaveBeenCalledWith(
        1,
        3,
        expect.any(Number),
        expect.any(Error)
      );
    });
  });
});

