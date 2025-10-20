/**
 * Text Parsing Utilities
 * Extracts structured data from OCR text
 */

/**
 * Extract total amount from text
 * Looks for common patterns like "Total: $XX.XX", "Amount: XX.XX", etc.
 */
export const extractTotalAmount = (text) => {
  if (!text) return null;

  const patterns = [
    // Look for "total amount now due" or similar with currency symbols
    /(?:total[\s\w]*(?:amount|due|payable))[\s:£$€]*(\d+[.,]\d{2})/gi,
    /(?:amount[\s\w]*(?:due|payable|owing))[\s:£$€]*(\d+[.,]\d{2})/gi,
    // Look for "£XX.XX" or "$XX.XX"
    /[£$€]\s*(\d+[.,]\d{2})/g,
    // Look for "total: XX.XX" or "amount: XX.XX"
    /(?:total|amount|sum|balance|due)[\s:$£€]*(\d+[.,]\d{2})/gi,
    // Look for just numbers with currency after
    /(\d+[.,]\d{2})\s*(?:usd|dollars?|gbp|pounds?|eur|euros?)/gi,
  ];

  let highestAmount = 0;

  for (const pattern of patterns) {
    try {
      const matches = text.matchAll(pattern);
      
      // Find the highest amount (usually the total)
      for (const match of matches) {
        const amount = match[1] || match[0];
        const numericAmount = parseFloat(amount.replace(/[$£€,]/g, '').replace(',', '.'));
        if (numericAmount > highestAmount) {
          highestAmount = numericAmount;
        }
      }
    } catch (error) {
      console.warn('Pattern match failed:', pattern, error);
    }
  }

  return highestAmount > 0 ? highestAmount : null;
};

/**
 * Extract date from text
 * Looks for various date formats
 */
export const extractDate = (text) => {
  if (!text) return null;

  const patterns = [
    // MM/DD/YYYY or MM-DD-YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
    // DD/MM/YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
    // Month DD, YYYY
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,]+(\d{1,2})[\s,]+(\d{2,4})/i,
    // YYYY-MM-DD
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        const dateStr = match[0];
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      } catch (error) {
        continue;
      }
    }
  }

  return new Date(); // Default to today if no date found
};

/**
 * Extract merchant name from text
 * Looks for text at the top of the receipt
 */
export const extractMerchantName = (text) => {
  if (!text) return 'Unknown Merchant';

  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  if (lines.length === 0) return 'Unknown Merchant';

  // The merchant name is usually in the first few lines
  // Look for lines that are not just numbers or common receipt keywords
  const skipKeywords = ['receipt', 'invoice', 'bill', 'date', 'time', 'total', 'subtotal', 'tax', 'vat registration', 'registration number', 'looking after'];
  
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim();
    
    // Skip lines that are too short or contain only numbers
    if (line.length < 3 || /^\d+$/.test(line)) continue;
    
    // Skip lines with VAT numbers or addresses
    if (/vat|registration|number|^\d{3,}|plc|ltd|limited|head office|street|avenue|road/i.test(line)) continue;
    
    // Skip lines that contain common receipt keywords
    const hasKeyword = skipKeywords.some(keyword => 
      line.toLowerCase().includes(keyword)
    );
    
    if (!hasKeyword && line.length > 3 && line.length < 50) {
      // Clean up the name
      return line
        .replace(/\s+/g, ' ')  // Normalize whitespace
        .replace(/[^\w\s&'-]/g, '')  // Remove special chars except common ones
        .trim()
        .substring(0, 50);
    }
  }

  // If nothing found, return first non-empty line
  return lines[0].replace(/\s+/g, ' ').trim().substring(0, 50);
};

/**
 * Extract individual items from receipt text
 * Attempts to parse line items with quantities and prices
 */
export const extractItems = (text) => {
  if (!text) return [];

  const lines = text.split('\n');
  const items = [];

  // Pattern to match lines like "Item Name 2.50" or "Item Name x2 5.00"
  const itemPattern = /^(.+?)\s+(?:x?(\d+))?\s*(\d+[.,]\d{2})$/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0) continue;

    const match = trimmed.match(itemPattern);
    if (match) {
      const name = match[1].trim();
      const quantity = match[2] ? parseInt(match[2]) : 1;
      const price = parseFloat(match[3].replace(',', '.'));

      if (name && !isNaN(price)) {
        items.push({ name, quantity, price });
      }
    }
  }

  return items;
};

/**
 * Detect receipt category based on merchant name or items
 */
export const detectCategory = (merchantName, items = []) => {
  const name = (merchantName || '').toLowerCase();
  const itemNames = items.map(item => item.name.toLowerCase()).join(' ');
  const searchText = name + ' ' + itemNames;

  // Category keywords
  const categoryKeywords = {
    'Groceries': ['grocery', 'supermarket', 'market', 'food', 'produce', 'walmart', 'target', 'kroger', 'safeway', 'whole foods'],
    'Dining': ['restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'bar', 'diner', 'bistro', 'grill', 'kitchen', 'starbucks', 'mcdonalds'],
    'Transport': ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'parking', 'transit', 'metro', 'bus', 'train', 'airline', 'airport'],
    'Shopping': ['shop', 'store', 'retail', 'mall', 'amazon', 'ebay', 'clothing', 'fashion', 'electronics', 'best buy'],
    'Healthcare': ['pharmacy', 'medical', 'doctor', 'clinic', 'hospital', 'health', 'cvs', 'walgreens', 'dental'],
    'Entertainment': ['cinema', 'movie', 'theater', 'ticket', 'game', 'entertainment', 'concert', 'show'],
    'Utilities': ['electric', 'water', 'gas', 'internet', 'phone', 'utility', 'bill', 'service'],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      return category;
    }
  }

  return 'Other';
};

/**
 * Extract currency from text (defaults to USD)
 */
export const extractCurrency = (text) => {
  if (!text) return 'USD';

  const currencyPatterns = {
    'USD': /\$|usd|dollars?/i,
    'EUR': /€|eur|euros?/i,
    'GBP': /£|gbp|pounds?/i,
    'CAD': /cad|canadian/i,
  };

  for (const [currency, pattern] of Object.entries(currencyPatterns)) {
    if (pattern.test(text)) {
      return currency;
    }
  }

  return 'USD';
};

/**
 * Parse full receipt text and extract all available data
 */
export const parseReceiptText = (text) => {
  if (!text || text.trim().length === 0) {
    return {
      merchantName: 'Unknown Merchant',
      date: new Date(),
      totalAmount: 0,
      currency: 'USD',
      category: 'Other',
      items: [],
    };
  }

  const merchantName = extractMerchantName(text);
  const date = extractDate(text);
  const totalAmount = extractTotalAmount(text) || 0;
  const currency = extractCurrency(text);
  const items = extractItems(text);
  const category = detectCategory(merchantName, items);

  return {
    merchantName,
    date,
    totalAmount,
    currency,
    category,
    items,
  };
};

