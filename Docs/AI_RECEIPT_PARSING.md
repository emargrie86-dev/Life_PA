# AI-Powered Receipt Parsing

## Overview

The receipt scanning feature now uses **AI models** (OpenAI GPT, Cohere, or Hugging Face) to intelligently extract data from receipts. This is **much more accurate** than regex pattern matching!

## How It Works

### 1. **OCR Extraction**
- Tesseract.js extracts raw text from the receipt image
- Example output: "British Gas\nVAT Registration No\n123456\nTotal Amount Now Due £61.91\n..."

### 2. **AI Parsing** 🤖
- The raw OCR text is sent to your configured AI provider
- AI intelligently extracts:
  - **Merchant Name**: Clean, no VAT numbers or addresses
  - **Total Amount**: Correctly identifies the highest/final amount
  - **Currency**: GBP (£), USD ($), EUR (€), etc.
  - **Date**: Receipt date in YYYY-MM-DD format
  - **Category**: Auto-categorizes (Groceries, Dining, Utilities, etc.)
  - **Line Items**: Individual items with quantities and prices

### 3. **Structured Data**
- AI returns clean, structured JSON
- Data is saved to Firebase Firestore
- Image is uploaded to Firebase Storage

## Benefits of AI Parsing

### ✅ **More Accurate**
- Understands context (e.g., "Total Amount Now Due" vs "Subtotal")
- Handles variations in receipt formats
- Correctly extracts currency symbols

### ✅ **Better Merchant Names**
- Filters out legal text, VAT numbers, addresses
- Returns clean merchant names
- Example: "British Gas" not "BRITISH GAS PLC VAT REG NO 123456"

### ✅ **Intelligent Categorization**
- Auto-categorizes receipts
- Based on merchant name and items

### ✅ **Currency Detection**
- Automatically detects GBP (£), USD ($), EUR (€)
- Converts symbols to currency codes

## How to Use

### Prerequisites
1. **AI Provider Setup** (Phase 4)
   - Go to **Settings** → **AI Provider Setup**
   - Configure OpenAI, Cohere, or Hugging Face
   - Add your API key

### Using AI-Powered Parsing

1. **Navigate to "Scan Receipt"**
2. **Capture or upload a receipt**
   - Take a photo (mobile)
   - Upload from gallery
   - Upload document (image or PDF)

3. **Click "Process Receipt"**
   - You'll see: "Using AI to extract receipt details..."
   - AI processes the OCR text
   - Extracts structured data

4. **Review the results**
   - Merchant name (cleaned)
   - Total amount with correct currency symbol
   - Date
   - Category
   - Line items

5. **Edit if needed**
   - Click "Edit" to modify any fields
   - Click "Save Changes" when done

## Fallback Behavior

The system intelligently falls back when needed:

### **AI Parsing** (First Choice)
- Used when:
  - AI provider is configured
  - OCR text is > 50 characters
  - API key is valid

### **Basic Parsing** (Fallback)
- Used when:
  - No AI provider configured
  - AI API fails
  - OCR text is too short
- Uses regex pattern matching
- Less accurate but always available

## Testing

### Test with your British Gas receipt:

1. **Upload the receipt**
2. **Process it**
3. **You should see:**
   ```
   Merchant: British Gas
   Amount: £61.91
   Currency: GBP
   Date: [Receipt date]
   Category: Utilities
   Items: [Extracted if present]
   ```

4. **Compare with basic parsing:**
   - More accurate merchant name
   - Correct total amount
   - Better categorization

## Configuration

### AI Provider (Settings → AI Provider Setup)
- **OpenAI**: Best accuracy, requires API key
- **Cohere**: Good alternative, free tier available
- **Hugging Face**: Open-source option

### Which to use?
- **OpenAI GPT-4/GPT-3.5**: Most accurate for receipts
- **Cohere**: Good balance of cost and accuracy
- **Hugging Face**: Free but may be slower

## Technical Details

### Files Modified
- `src/services/aiReceiptParser.js` - New AI parsing service
- `src/screens/ScanReceiptScreen.jsx` - Integrated AI parsing
- OCR flow: Image → Tesseract → AI → Structured Data → Firebase

### API Usage
- Each receipt parsing = 1 AI API call
- Typical cost: ~$0.001-0.01 per receipt (OpenAI)
- Cohere/HuggingFace may have free tiers

### Prompt Engineering
The AI receives a detailed prompt asking it to:
- Extract specific fields
- Return valid JSON
- Clean merchant names
- Detect currency from symbols
- Categorize intelligently

## Troubleshooting

### "Using basic parsing..."
- **Cause**: No AI provider configured
- **Fix**: Go to Settings → AI Provider Setup

### "AI parsing failed, using basic parsing..."
- **Cause**: Invalid API key or API error
- **Fix**: Check API key in Settings

### Still getting incorrect data
- **Try**: Different AI provider (OpenAI usually best)
- **Or**: Edit manually after processing

## Future Improvements

Potential enhancements:
- [ ] Multi-page receipt support
- [ ] Receipt templates/learning
- [ ] Bulk receipt processing
- [ ] Receipt image enhancement (before OCR)
- [ ] Support for more languages

## Summary

🎉 **Your receipts are now parsed by AI!**

- Upload any receipt (image or PDF)
- AI extracts all the data intelligently
- Much more accurate than regex patterns
- Automatic currency detection
- Clean merchant names
- Auto-categorization

**Try it now with your British Gas receipt!**

