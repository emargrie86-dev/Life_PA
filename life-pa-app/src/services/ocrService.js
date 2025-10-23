/**
 * OCR Service
 * Handles text extraction from images using Tesseract.js
 * Implements proper worker lifecycle management to prevent memory leaks
 */

import { createWorker } from 'tesseract.js';

let worker = null;
let workerUsageCount = 0;
let lastUsedTime = null;

// Configuration
const MAX_USAGE_BEFORE_CLEANUP = 10; // Cleanup after 10 uses
const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const INITIALIZATION_TIMEOUT = 30000; // 30 seconds

/**
 * Initialize Tesseract worker with timeout and lifecycle management
 */
const initializeWorker = async () => {
  // Check if existing worker is still valid
  if (worker && workerUsageCount < MAX_USAGE_BEFORE_CLEANUP) {
    lastUsedTime = Date.now();
    return worker;
  }

  // Clean up old worker if it exists
  if (worker) {
    console.log('Cleaning up old OCR worker before creating new one');
    await cleanupWorker();
  }

  try {
    console.log('Initializing new OCR worker...');
    
    // Create worker with timeout
    const initPromise = createWorker('eng');
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('OCR worker initialization timeout')), INITIALIZATION_TIMEOUT)
    );
    
    worker = await Promise.race([initPromise, timeoutPromise]);
    workerUsageCount = 0;
    lastUsedTime = Date.now();
    
    console.log('✅ OCR worker initialized successfully');
    return worker;
  } catch (error) {
    console.error('Failed to initialize OCR worker:', error);
    worker = null;
    throw new Error('OCR initialization failed: ' + error.message);
  }
};

/**
 * Extract text from image URI with proper lifecycle management
 * @param {string} imageUri - Local file URI or base64 image
 * @returns {Promise<string>} Extracted text
 */
export const extractTextFromImage = async (imageUri) => {
  try {
    console.log('=== OCR SERVICE ===');
    console.log('Starting OCR extraction...');
    
    if (!imageUri) {
      throw new Error('Image URI is required');
    }
    
    // Initialize or get existing worker
    const ocrWorker = await initializeWorker();
    
    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OCR timeout after 30 seconds')), 30000);
    });
    
    const recognitionPromise = (async () => {
      console.log('Starting text recognition...');
      const { data: { text } } = await ocrWorker.recognize(imageUri);
      console.log('Text recognition complete, extracted:', text?.length, 'characters');
      return text;
    })();
    
    const text = await Promise.race([recognitionPromise, timeoutPromise]);
    
    // Update usage tracking
    workerUsageCount++;
    lastUsedTime = Date.now();
    
    // Schedule cleanup if needed
    if (workerUsageCount >= MAX_USAGE_BEFORE_CLEANUP) {
      console.log('Max usage reached, scheduling cleanup...');
      // Cleanup in background after a short delay
      setTimeout(() => cleanupWorker(), 1000);
    }
    
    return text;
  } catch (error) {
    console.error('OCR extraction failed:', error);
    // Cleanup worker on error
    await cleanupWorker();
    throw new Error('Failed to extract text from image: ' + error.message);
  }
};

/**
 * Extract text with confidence scores
 * @param {string} imageUri - Local file URI or base64 image
 * @returns {Promise<object>} Extracted text with metadata
 */
export const extractTextWithMetadata = async (imageUri) => {
  try {
    const ocrWorker = await initializeWorker();
    
    const { data } = await ocrWorker.recognize(imageUri);
    
    return {
      text: data.text,
      confidence: data.confidence,
      words: data.words,
      lines: data.lines,
    };
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw new Error('Failed to extract text from image');
  }
};

/**
 * Process image and extract receipt data
 * @param {string} imageUri - Local file URI
 * @returns {Promise<object>} Extracted receipt data
 */
export const processReceiptImage = async (imageUri) => {
  try {
    const text = await extractTextFromImage(imageUri);
    
    return {
      success: true,
      text,
      extractedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Receipt processing failed:', error);
    return {
      success: false,
      text: '',
      error: error.message,
    };
  }
};

/**
 * Cleanup OCR worker with proper error handling
 */
export const cleanupWorker = async () => {
  if (worker) {
    try {
      console.log('Terminating OCR worker...');
      await worker.terminate();
      console.log('✅ OCR worker terminated successfully');
    } catch (error) {
      console.error('Error terminating OCR worker:', error);
    } finally {
      worker = null;
      workerUsageCount = 0;
      lastUsedTime = null;
    }
  }
};

/**
 * Check if OCR worker is idle and needs cleanup
 */
const checkIdleWorker = () => {
  if (worker && lastUsedTime) {
    const idleTime = Date.now() - lastUsedTime;
    if (idleTime > IDLE_TIMEOUT) {
      console.log('OCR worker idle for too long, cleaning up...');
      cleanupWorker();
    }
  }
};

/**
 * Check if OCR is available
 */
export const isOCRAvailable = () => {
  return typeof createWorker === 'function';
};

/**
 * Get OCR worker status (for debugging)
 */
export const getWorkerStatus = () => {
  return {
    initialized: worker !== null,
    usageCount: workerUsageCount,
    lastUsed: lastUsedTime ? new Date(lastUsedTime) : null,
    idleTime: lastUsedTime ? Date.now() - lastUsedTime : null,
  };
};

// Set up periodic idle check (every minute)
if (typeof setInterval !== 'undefined') {
  setInterval(checkIdleWorker, 60000);
}

// Cleanup on app background/terminate
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    console.log('App unloading, cleaning up OCR worker...');
    cleanupWorker();
  });
  
  // Handle visibility change (app going to background)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('App went to background, scheduling OCR cleanup...');
      // Clean up after 30 seconds in background
      setTimeout(() => {
        if (document.hidden) {
          cleanupWorker();
        }
      }, 30000);
    }
  });
}

