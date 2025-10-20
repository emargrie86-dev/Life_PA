/**
 * OCR Service
 * Handles text extraction from images using Tesseract.js
 */

import { createWorker } from 'tesseract.js';

let worker = null;

/**
 * Initialize Tesseract worker
 */
const initializeWorker = async () => {
  if (worker) return worker;

  try {
    worker = await createWorker('eng');
    return worker;
  } catch (error) {
    console.error('Failed to initialize OCR worker:', error);
    throw new Error('OCR initialization failed');
  }
};

/**
 * Extract text from image URI
 * @param {string} imageUri - Local file URI or base64 image
 * @returns {Promise<string>} Extracted text
 */
export const extractTextFromImage = async (imageUri) => {
  try {
    console.log('=== OCR SERVICE ===');
    console.log('Starting OCR extraction for:', imageUri?.substring(0, 100));
    
    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OCR timeout after 30 seconds')), 30000);
    });
    
    const ocrPromise = (async () => {
      console.log('Initializing OCR worker...');
      const ocrWorker = await initializeWorker();
      console.log('OCR worker initialized');
      
      console.log('Starting text recognition...');
      const { data: { text } } = await ocrWorker.recognize(imageUri);
      console.log('Text recognition complete, extracted:', text?.length, 'characters');
      
      return text;
    })();
    
    const text = await Promise.race([ocrPromise, timeoutPromise]);
    
    return text;
  } catch (error) {
    console.error('OCR extraction failed:', error);
    console.error('Error details:', error.message, error.stack);
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
 * Cleanup OCR worker
 */
export const cleanupWorker = async () => {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
};

/**
 * Check if OCR is available
 */
export const isOCRAvailable = () => {
  return typeof createWorker === 'function';
};

