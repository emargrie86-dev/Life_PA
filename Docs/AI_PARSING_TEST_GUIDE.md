# 🤖 AI-Powered Receipt Parsing - Test Guide

## ✅ What's New

Your receipt scanning now uses **AI models** (OpenAI/Cohere/HuggingFace) to intelligently extract data!

### Before (Regex Parsing) 😕
```
Merchant: BRITISH GAS PLC VAT REG NO 123456 LOOKING AFTER
Amount: $0.00
Currency: USD (wrong!)
```

### After (AI Parsing) 🎉
```
Merchant: British Gas
Amount: £61.91
Currency: GBP (correct!)
Category: Utilities (auto-detected)
```

## 🧪 How to Test

### 1. **Make sure AI is configured**
   - Go to **Settings** → **AI Provider Setup**
   - You should already have OpenAI, Cohere, or HuggingFace configured
   - Check that your API key is set

### 2. **Upload the British Gas receipt**
   - Navigate to **Scan Receipt**
   - Click **"Upload Document"** or **"Choose from Gallery"**
   - Select your British Gas bill (the one with £61.91)

### 3. **Click "Process Receipt"**
   - Watch the toast notifications:
     - ✅ "Extracting text..." (OCR)
     - ✅ "Using AI to extract receipt details..." (AI parsing)
     - ✅ "AI extraction complete!"

### 4. **Check the results**

You should now see:

```
✅ Merchant: British Gas
✅ Total: £61.91 (not $0.00!)
✅ Currency: GBP (not USD!)
✅ Category: Utilities
✅ Date: [Extracted from receipt]
```

### 5. **Edit if needed**
   - Click **"Edit"** button
   - Modify any fields
   - Click **"Save Changes"**

### 6. **Test the console logs**
   - Open browser DevTools (F12)
   - You should see:
     ```
     === AI RECEIPT PARSER ===
     Using AI provider: openai
     AI response received: {"merchantName":"British Gas"...}
     Parsed receipt data: {...}
     ✅ Receipt saved successfully!
     ```

## 🔍 What AI Does Better

### 1. **Merchant Name Extraction**
   - **Before**: "BRITISH GAS PLC VAT REG NO 123456 LOOKING AFTER"
   - **After**: "British Gas"
   - **Why better**: AI filters out legal text, VAT numbers, addresses

### 2. **Amount Detection**
   - **Before**: $0.00 (missed "Total Amount Now Due £61.91")
   - **After**: £61.91
   - **Why better**: AI understands context like "Total Amount Now Due"

### 3. **Currency Recognition**
   - **Before**: USD (default fallback)
   - **After**: GBP (detected from £ symbol)
   - **Why better**: AI recognizes currency symbols and converts to codes

### 4. **Auto-Categorization**
   - **Before**: "Other" (no categorization)
   - **After**: "Utilities" (intelligent)
   - **Why better**: AI recognizes "British Gas" = utility company

### 5. **Date Extraction**
   - **Before**: Current date (fallback)
   - **After**: Actual receipt date
   - **Why better**: AI finds dates in various formats

## 🧩 Fallback Behavior

The system is smart about when to use AI:

### AI Parsing (Preferred)
- ✅ Used when: AI provider configured + API key valid + OCR text > 50 chars
- ✅ More accurate
- ✅ Understands context

### Basic Parsing (Fallback)
- ⚠️ Used when: No AI configured OR AI fails OR text too short
- ⚠️ Less accurate
- ⚠️ Simple regex patterns

**You'll see a toast notification showing which method is being used!**

## 📊 Expected Results

### Test 1: British Gas Bill (£61.91)
```json
{
  "merchantName": "British Gas",
  "totalAmount": 61.91,
  "currency": "GBP",
  "date": "2025-10-15",  // or whatever date on receipt
  "category": "Utilities",
  "items": []  // may be empty if no clear line items
}
```

### Test 2: Grocery Receipt
Upload a grocery receipt and you should get:
```json
{
  "merchantName": "Tesco",  // or whatever store
  "totalAmount": 45.67,
  "currency": "GBP",
  "date": "2025-10-20",
  "category": "Groceries",
  "items": [
    {"name": "Milk", "quantity": 2, "price": 1.50},
    {"name": "Bread", "quantity": 1, "price": 0.95}
    // etc.
  ]
}
```

### Test 3: Restaurant Bill (US)
```json
{
  "merchantName": "Olive Garden",
  "totalAmount": 45.99,
  "currency": "USD",
  "date": "2025-10-19",
  "category": "Dining",
  "items": [...]
}
```

## 🐛 Troubleshooting

### Still seeing "Using basic parsing..."
- **Problem**: AI not configured or no API key
- **Solution**: Go to Settings → AI Provider Setup → Add API key

### Still getting incorrect data
- **Problem**: OCR text is poor quality
- **Solution**: 
  1. Use better quality images
  2. Ensure good lighting
  3. Try a different AI provider (OpenAI usually best)

### "AI parsing failed, using basic parsing..."
- **Problem**: API error or invalid key
- **Solution**: Check Settings → AI Provider Setup → Test the API key

### Still showing wrong currency
- **Problem**: Receipt doesn't have clear currency symbol
- **Solution**: Manually edit after processing

## 💰 Cost Note

Each receipt = 1 AI API call

**OpenAI (GPT-3.5)**:
- Cost: ~$0.001-0.002 per receipt
- Most accurate

**Cohere**:
- Cost: Free tier available
- Good accuracy

**HuggingFace**:
- Cost: Free
- May be slower

**Recommended for receipts**: OpenAI GPT-3.5 or GPT-4

## 🎯 Success Criteria

After testing, you should see:

1. ✅ **Correct merchant names** (no VAT numbers or legal text)
2. ✅ **Accurate amounts** (highest/total amount)
3. ✅ **Correct currency** (£ = GBP, $ = USD, € = EUR)
4. ✅ **Auto-categorization** (Groceries, Dining, Utilities, etc.)
5. ✅ **Extracted dates** (from receipt, not current date)
6. ✅ **Line items** (when available)

## 📝 Next Steps

If everything works:
- ✅ Upload more receipts to test accuracy
- ✅ Try different receipt types (grocery, restaurant, utility)
- ✅ Test with different currencies
- ✅ Edit and save changes

If something doesn't work:
- 🔍 Check console logs (F12 → Console)
- 🔍 Check Settings → AI Provider Setup
- 🔍 Try a different AI provider
- 🔍 Manually edit the receipt details

## 🎉 Summary

**Your receipt scanning is now AI-powered!**

- Upload any receipt (image or PDF)
- AI extracts all data intelligently
- Much more accurate than before
- Automatic currency detection
- Clean merchant names
- Auto-categorization

**Test it now with your British Gas bill!** You should see **£61.91** correctly extracted with **GBP** currency. 🎯

