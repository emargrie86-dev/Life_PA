/**
 * AI-Powered Receipt Parser
 * Uses AI models to intelligently extract receipt data from OCR text
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getChatCompletion as getOpenAICompletion } from './openai';
import { getChatCompletion as getCohereCompletion } from './cohere';
import { getChatCompletion as getHuggingFaceCompletion } from './huggingface';

/**
 * Parse receipt text using AI
 * @param {string} ocrText - Raw OCR extracted text
 * @returns {Promise<Object>} Parsed receipt data
 */
export const parseReceiptWithAI = async (ocrText) => {
  console.log('=== AI RECEIPT PARSER ===');
  console.log('Parsing receipt with AI...');
  console.log('OCR text length:', ocrText?.length);

  if (!ocrText || ocrText.trim().length === 0) {
    throw new Error('No text provided for parsing');
  }

  try {
    // Get the active AI provider
    const activeProvider = await AsyncStorage.getItem('activeAIProvider') || 'openai';
    console.log('Using AI provider:', activeProvider);

    // Create the prompt for AI
    const prompt = createReceiptParsingPrompt(ocrText);

    // Get AI completion
    let aiResponse;
    switch (activeProvider) {
      case 'openai':
        aiResponse = await getOpenAICompletion([
          {
            role: 'system',
            content: 'You are a receipt data extraction assistant. Extract structured data from receipt text and return it as valid JSON. Be accurate and precise.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]);
        break;
      
      case 'cohere':
        aiResponse = await getCohereCompletion([
          {
            role: 'user',
            content: prompt
          }
        ]);
        break;
      
      case 'huggingface':
        aiResponse = await getHuggingFaceCompletion([
          {
            role: 'user',
            content: prompt
          }
        ]);
        break;
      
      default:
        throw new Error('Invalid AI provider');
    }

    console.log('AI response received:', aiResponse?.substring(0, 200));

    // Parse the AI response (should be JSON)
    const parsedData = parseAIResponse(aiResponse);
    console.log('Parsed receipt data:', parsedData);

    return parsedData;

  } catch (error) {
    console.error('AI parsing failed:', error);
    console.error('Falling back to basic parsing...');
    
    // Fallback to basic parsing if AI fails
    return fallbackParsing(ocrText);
  }
};

/**
 * Create a detailed prompt for receipt parsing
 */
const createReceiptParsingPrompt = (ocrText) => {
  const today = new Date().toISOString().split('T')[0];
  
  return `Extract receipt information from the following OCR text and return it as a JSON object.

OCR TEXT:
"""
${ocrText}
"""

Please extract:
1. merchantName: The name of the merchant/store (clean, no address or VAT info)
2. totalAmount: The total amount paid (number only, no currency symbol)
3. currency: The currency code (USD, GBP, EUR, etc.) - detect from text or symbol
4. date: The receipt date in YYYY-MM-DD format (if not found, use today: ${today})
5. category: Best matching category from: Groceries, Dining, Transport, Shopping, Healthcare, Entertainment, Utilities, Other
6. items: Array of line items, each with {name, quantity, price}

Return ONLY a valid JSON object with this structure:
{
  "merchantName": "string",
  "totalAmount": number,
  "currency": "string",
  "date": "YYYY-MM-DD",
  "category": "string",
  "items": [{"name": "string", "quantity": number, "price": number}]
}

Important:
- Use the HIGHEST amount as the total (usually marked as "Total" or "Amount Due")
- Clean the merchant name (remove addresses, VAT numbers, legal text)
- If date is unclear, use ${today}
- Currency: GBP for £, USD for $, EUR for €
- Be accurate with amounts - this is financial data

Return ONLY the JSON, no explanation.`;
};

/**
 * Parse AI response and extract JSON
 */
const parseAIResponse = (response) => {
  try {
    // Try to extract JSON from response
    let jsonStr = response.trim();
    
    // Remove markdown code blocks if present
    jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find JSON object
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    const parsed = JSON.parse(jsonStr);
    
    // Validate required fields
    const result = {
      merchantName: parsed.merchantName || 'Unknown Merchant',
      totalAmount: parseFloat(parsed.totalAmount) || 0,
      currency: parsed.currency || 'USD',
      date: parsed.date || new Date(),
      category: parsed.category || 'Other',
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
    
    // Convert date string to Date object if needed
    if (typeof result.date === 'string') {
      result.date = new Date(result.date);
    }
    
    return result;
    
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    console.error('Raw response:', response);
    throw new Error('Invalid AI response format');
  }
};

/**
 * Fallback to basic parsing if AI fails
 */
const fallbackParsing = (ocrText) => {
  console.log('Using fallback parsing...');
  
  // Simple extraction patterns
  const merchantMatch = ocrText.match(/^([A-Za-z\s&'-]+)/);
  const amountMatch = ocrText.match(/(?:total|amount|due)[\s:$£€]*(\d+[.,]\d{2})/i);
  const currencyMatch = ocrText.match(/[£$€]/);
  
  let currency = 'USD';
  if (currencyMatch) {
    if (currencyMatch[0] === '£') currency = 'GBP';
    else if (currencyMatch[0] === '€') currency = 'EUR';
  }
  
  return {
    merchantName: merchantMatch ? merchantMatch[1].trim() : 'Unknown Merchant',
    totalAmount: amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0,
    currency,
    date: new Date(),
    category: 'Other',
    items: [],
  };
};

/**
 * Check if AI parsing is available
 */
export const isAIParsingAvailable = async () => {
  try {
    const provider = await AsyncStorage.getItem('activeAIProvider');
    const apiKey = await AsyncStorage.getItem(`${provider}ApiKey`);
    return provider && apiKey;
  } catch (error) {
    return false;
  }
};

