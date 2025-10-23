/**
 * Document Parser Service
 * Handles document classification and structured data extraction
 * Supports multiple document types: Invoice, Utility Bill, Contact, MOT, Receipt, etc.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getChatCompletion as getCohereCompletion } from './cohere';
import { getChatCompletion as getOpenAICompletion } from './openai';
import { getChatCompletion as getHuggingFaceCompletion } from './huggingface';

/**
 * Document types supported by the parser
 */
export const DOCUMENT_TYPES = {
  INVOICE: 'Invoice',
  UTILITY_BILL: 'Utility Bill',
  RECEIPT: 'Receipt',
  CONTACT: 'Contact',
  MOT_DOCUMENT: 'MOT Document',
  INSURANCE: 'Insurance Document',
  BANK_STATEMENT: 'Bank Statement',
  TAX_DOCUMENT: 'Tax Document',
  OTHER: 'Other',
};

/**
 * Classify document type from extracted text
 * @param {string} text - Extracted text from document
 * @returns {Promise<string>} Document type
 */
export const classifyDocument = async (text) => {
  console.log('=== DOCUMENT CLASSIFICATION ===');
  console.log('Classifying document from text length:', text?.length);

  if (!text || text.trim().length === 0) {
    return DOCUMENT_TYPES.OTHER;
  }

  try {
    // Get the active AI provider
    const activeProvider = await AsyncStorage.getItem('activeAIProvider') || 'openai';
    console.log('Using AI provider for classification:', activeProvider);

    // Create classification prompt
    const prompt = createClassificationPrompt(text);

    // Get AI classification
    let aiResponse;
    switch (activeProvider) {
      case 'openai':
        aiResponse = await getOpenAICompletion([
          {
            role: 'system',
            content: 'You are a document classification assistant. Analyze documents and classify them into categories. Return only the document type, nothing else.'
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

    console.log('Classification response:', aiResponse);

    // Parse the classification result
    const documentType = parseClassificationResponse(aiResponse);
    console.log('Classified as:', documentType);

    return documentType;

  } catch (error) {
    console.error('Classification failed:', error);
    // Fallback to basic keyword detection
    return fallbackClassification(text);
  }
};

/**
 * Create classification prompt
 */
const createClassificationPrompt = (text) => {
  return `Analyze the following document text and classify it into ONE of these categories:

Categories:
- Invoice: Business invoices, bills from companies
- Utility Bill: Water, gas, electricity, internet bills
- Receipt: Store receipts, purchase receipts
- Contact: Business cards, contact information
- MOT Document: MOT certificates, vehicle inspection documents
- Insurance Document: Insurance policies, insurance statements
- Bank Statement: Bank account statements
- Tax Document: Tax forms, tax statements
- Other: Anything that doesn't fit above categories

Document text:
"""
${text.substring(0, 1000)}
"""

Return ONLY the category name, nothing else. Choose the most appropriate category.`;
};

/**
 * Parse classification response
 */
const parseClassificationResponse = (response) => {
  const normalized = response.trim().toLowerCase();
  
  // Match against known types
  if (normalized.includes('invoice')) return DOCUMENT_TYPES.INVOICE;
  if (normalized.includes('utility') || normalized.includes('bill')) return DOCUMENT_TYPES.UTILITY_BILL;
  if (normalized.includes('receipt')) return DOCUMENT_TYPES.RECEIPT;
  if (normalized.includes('contact')) return DOCUMENT_TYPES.CONTACT;
  if (normalized.includes('mot')) return DOCUMENT_TYPES.MOT_DOCUMENT;
  if (normalized.includes('insurance')) return DOCUMENT_TYPES.INSURANCE;
  if (normalized.includes('bank')) return DOCUMENT_TYPES.BANK_STATEMENT;
  if (normalized.includes('tax')) return DOCUMENT_TYPES.TAX_DOCUMENT;
  
  return DOCUMENT_TYPES.OTHER;
};

/**
 * Fallback classification using keyword detection
 */
const fallbackClassification = (text) => {
  const lowerText = text.toLowerCase();
  
  // Check for keywords
  if (lowerText.includes('invoice') || lowerText.includes('inv no')) {
    return DOCUMENT_TYPES.INVOICE;
  }
  if (lowerText.includes('water') || lowerText.includes('gas') || 
      lowerText.includes('electric') || lowerText.includes('council tax')) {
    return DOCUMENT_TYPES.UTILITY_BILL;
  }
  if (lowerText.includes('mot') || lowerText.includes('vehicle')) {
    return DOCUMENT_TYPES.MOT_DOCUMENT;
  }
  if (lowerText.includes('total') || lowerText.includes('receipt')) {
    return DOCUMENT_TYPES.RECEIPT;
  }
  if (lowerText.includes('insurance') || lowerText.includes('policy')) {
    return DOCUMENT_TYPES.INSURANCE;
  }
  
  return DOCUMENT_TYPES.OTHER;
};

/**
 * Extract structured data based on document type
 * @param {string} text - Extracted text
 * @param {string} documentType - Document type from classification
 * @returns {Promise<Object>} Structured data
 */
export const extractDocumentData = async (text, documentType) => {
  console.log('=== DOCUMENT EXTRACTION ===');
  console.log('Extracting data for type:', documentType);

  if (!text || text.trim().length === 0) {
    throw new Error('No text provided for extraction');
  }

  try {
    // Get the active AI provider
    const activeProvider = await AsyncStorage.getItem('activeAIProvider') || 'openai';
    console.log('Using AI provider for extraction:', activeProvider);

    // Create extraction prompt based on document type
    const prompt = createExtractionPrompt(text, documentType);

    // Get AI extraction
    let aiResponse;
    switch (activeProvider) {
      case 'openai':
        aiResponse = await getOpenAICompletion([
          {
            role: 'system',
            content: 'You are a document data extraction assistant. Extract structured data from documents and return it as valid JSON. Be accurate and precise.'
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

    console.log('Extraction response received:', aiResponse?.substring(0, 200));

    // Parse the extraction result
    const extractedData = parseExtractionResponse(aiResponse, documentType);
    console.log('Extracted data:', extractedData);

    return extractedData;

  } catch (error) {
    console.error('Extraction failed:', error);
    console.error('Falling back to basic extraction...');
    
    // Fallback to basic extraction
    return fallbackExtraction(text, documentType);
  }
};

/**
 * Create extraction prompt based on document type
 */
const createExtractionPrompt = (text, documentType) => {
  const today = new Date().toISOString().split('T')[0];
  
  let extractionFields = '';
  
  switch (documentType) {
    case DOCUMENT_TYPES.INVOICE:
    case DOCUMENT_TYPES.UTILITY_BILL:
      extractionFields = `
1. sender: The FULL company/organization name (e.g., "Thames Water", "British Gas", "Scottish Power") - include the complete company name, not abbreviated
2. issueDate: The document issue/statement date in YYYY-MM-DD format (look for "Date:", "Statement date:", "Issue date:")
3. dueDate: The payment due date in YYYY-MM-DD format (look for "Due by:", "Payment due:", "First payment due:", "Pay by date:")
4. amountDue: The total amount due or monthly payment amount (number only, no currency symbol, look for "Amount due:", "Monthly payment:", "Total:", "Balance:")
5. currency: Currency code (GBP for £, USD for $, EUR for €, etc.)
6. referenceNumber: Account number, invoice number, or reference number (look for "Account number:", "Account no:", "Reference:", "Invoice no:")
7. description: Brief description (e.g., "Water bill", "Payment plan - monthly payment", "Gas bill")

IMPORTANT:
- Extract the COMPLETE company name, not just the first word
- The issueDate is the document date (when it was issued), NOT today's date
- The dueDate is when payment is due (may be in the future)
- For payment plans, the monthly payment amount is the amountDue
- Account numbers often start with multiple zeros - include all digits`;
      break;
    
    case DOCUMENT_TYPES.RECEIPT:
      extractionFields = `
1. sender: Merchant/store name
2. date: Receipt date in YYYY-MM-DD format
3. totalAmount: Total amount paid (number only)
4. currency: Currency code (GBP, USD, EUR, etc.)
5. category: Category (Groceries, Dining, Transport, Shopping, Healthcare, Entertainment, Utilities, Other)
6. items: Array of items purchased (if readable)`;
      break;
    
    case DOCUMENT_TYPES.MOT_DOCUMENT:
      extractionFields = `
1. sender: Testing center name
2. issueDate: Test date in YYYY-MM-DD format
3. expiryDate: MOT expiry date in YYYY-MM-DD format
4. vehicleReg: Vehicle registration number
5. mileage: Vehicle mileage at test
6. testResult: Pass/Fail`;
      break;
    
    case DOCUMENT_TYPES.CONTACT:
      extractionFields = `
1. name: Contact name
2. company: Company name
3. email: Email address
4. phone: Phone number
5. address: Full address`;
      break;
    
    default:
      extractionFields = `
1. sender: Source/sender name
2. date: Document date in YYYY-MM-DD format
3. description: Brief description of document
4. amountDue: Any amount mentioned (if applicable)
5. currency: Currency code (if applicable)`;
  }

  return `You are analyzing a ${documentType} document. Extract information and return it as a JSON object.

DOCUMENT TEXT:
"""
${text}
"""

Please extract the following fields:
${extractionFields}

EXTRACTION RULES:
1. Extract the EXACT text from the document - do NOT make assumptions
2. For dates: Find the ACTUAL date in the document, do NOT use today's date (${today}) unless the document date is truly not found
3. For company names: Extract the COMPLETE company name as it appears (e.g., "Thames Water", not just "Thames")
4. For account numbers: Include ALL digits, including leading zeros
5. Use null for fields that genuinely cannot be found in the text
6. Be precise with numbers - this is financial data

Return ONLY a valid JSON object with these exact field names. No explanation, no markdown, just the JSON object.`;
};

/**
 * Parse extraction response
 */
const parseExtractionResponse = (response, documentType) => {
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
    
    // Normalize the data structure
    const result = {
      documentType,
      sender: parsed.sender || parsed.merchantName || 'Unknown',
      date: parsed.date || parsed.issueDate || new Date(),
      description: parsed.description || '',
    };

    // Add document-type specific fields
    if (parsed.amountDue !== undefined || parsed.totalAmount !== undefined) {
      result.totalAmount = parseFloat(parsed.amountDue || parsed.totalAmount) || 0;
      result.currency = parsed.currency || 'USD';
    }

    if (parsed.dueDate) {
      result.dueDate = parsed.dueDate;
    }

    if (parsed.referenceNumber) {
      result.referenceNumber = parsed.referenceNumber;
    }

    if (parsed.category) {
      result.category = parsed.category;
    }

    if (parsed.items) {
      result.items = parsed.items;
    }

    // MOT specific fields
    if (documentType === DOCUMENT_TYPES.MOT_DOCUMENT) {
      if (parsed.expiryDate) result.expiryDate = parsed.expiryDate;
      if (parsed.vehicleReg) result.vehicleReg = parsed.vehicleReg;
      if (parsed.mileage) result.mileage = parsed.mileage;
      if (parsed.testResult) result.testResult = parsed.testResult;
    }

    // Contact specific fields
    if (documentType === DOCUMENT_TYPES.CONTACT) {
      if (parsed.name) result.name = parsed.name;
      if (parsed.company) result.company = parsed.company;
      if (parsed.email) result.email = parsed.email;
      if (parsed.phone) result.phone = parsed.phone;
      if (parsed.address) result.address = parsed.address;
    }
    
    // Convert date strings to Date objects
    if (typeof result.date === 'string') {
      result.date = new Date(result.date);
    }
    if (result.dueDate && typeof result.dueDate === 'string') {
      result.dueDate = new Date(result.dueDate);
    }
    
    return result;
    
  } catch (error) {
    console.error('Failed to parse extraction response:', error);
    console.error('Raw response:', response);
    throw new Error('Invalid extraction response format');
  }
};

/**
 * Fallback extraction using basic text parsing
 */
const fallbackExtraction = (text, documentType) => {
  console.log('Using fallback extraction...');
  
  // More comprehensive extraction patterns
  const senderMatch = text.match(/^([A-Za-z\s&'-]+(?:Water|Gas|Electric|Power|Energy|Council|Bank)?)/i) ||
                      text.match(/([A-Z][a-z]+\s+[A-Z][a-z]+)/);
  
  const amountMatch = text.match(/(?:payment|total|amount|due|balance)[\s:£$€]*(\d+[.,]\d{2})/i);
  const currencyMatch = text.match(/[£$€]/);
  
  // Try multiple date patterns
  const dateMatch = text.match(/(?:date|issued|statement)[\s:]*(\d{1,2}[-\/\s][A-Za-z]+[-\/\s]\d{2,4})/i) ||
                    text.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/);
  
  // Try to find due date
  const dueDateMatch = text.match(/(?:due|pay by|payment due)[\s:]*(\d{1,2}[-\/\s][A-Za-z]+[-\/\s]\d{2,4})/i) ||
                       text.match(/(?:due|pay by)[\s:]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/);
  
  // Try to find account/reference number
  const refMatch = text.match(/(?:account|reference|invoice)[\s:]*(?:no\.?|number)?[\s:]*(\d+)/i);
  
  let currency = 'USD';
  if (currencyMatch) {
    if (currencyMatch[0] === '£') currency = 'GBP';
    else if (currencyMatch[0] === '€') currency = 'EUR';
  }
  
  // Parse dates
  let parsedDate = new Date();
  if (dateMatch) {
    try {
      parsedDate = new Date(dateMatch[1] || dateMatch[0]);
    } catch (e) {
      console.error('Failed to parse date:', e);
    }
  }
  
  let parsedDueDate = null;
  if (dueDateMatch) {
    try {
      parsedDueDate = new Date(dueDateMatch[1] || dueDateMatch[0]);
    } catch (e) {
      console.error('Failed to parse due date:', e);
    }
  }
  
  return {
    documentType,
    sender: senderMatch ? senderMatch[1].trim() : 'Unknown',
    date: parsedDate,
    dueDate: parsedDueDate,
    description: text.substring(0, 100),
    totalAmount: amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0,
    currency,
    category: documentType === DOCUMENT_TYPES.UTILITY_BILL ? 'Utilities' : 'Other',
    referenceNumber: refMatch ? refMatch[1] : null,
  };
};

/**
 * Complete document parsing workflow (classification + extraction)
 * @param {string} text - Extracted text from document
 * @returns {Promise<Object>} Complete parsed document data
 */
export const parseDocument = async (text) => {
  console.log('=== COMPLETE DOCUMENT PARSING ===');
  
  try {
    // Step 1: Classify document type
    const documentType = await classifyDocument(text);
    console.log('Step 1 - Classification complete:', documentType);
    
    // Step 2: Extract structured data
    const extractedData = await extractDocumentData(text, documentType);
    console.log('Step 2 - Extraction complete');
    
    return {
      ...extractedData,
      documentType,
      extractedText: text,
      parsedAt: new Date(),
    };
    
  } catch (error) {
    console.error('Complete document parsing failed:', error);
    throw error;
  }
};

/**
 * Check if AI parsing is available
 */
export const isDocumentParsingAvailable = async () => {
  try {
    const provider = await AsyncStorage.getItem('activeAIProvider');
    const apiKey = await AsyncStorage.getItem(`${provider}ApiKey`);
    return provider && apiKey;
  } catch (error) {
    return false;
  }
};

