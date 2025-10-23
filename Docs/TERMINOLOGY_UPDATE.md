# Terminology Update: Receipt → Document

## Overview
Updated all user-facing terminology from "Receipt" to "Document" to accurately reflect the app's expanded capabilities. The system now handles multiple document types (receipts, invoices, utility bills, MOT certificates, etc.), not just receipts.

## What Was Changed

### 1. Screen Titles & Headers

**ReceiptPreviewScreen.jsx**
- ✅ Header: "Review Document" (was "Review Receipt")
- ✅ Toast messages: "Uploading document...", "Saving document..."
- ✅ Comments: "DocumentPreviewScreen (formerly ReceiptPreviewScreen)"
- ✅ Variable names: `documentData` (was `receiptData`)
- ✅ Console logs: "Creating document with data..."
- ✅ Image section: "Document Image Preview"

**ReceiptDetailScreen.jsx**
- ✅ Header: "Document Details" (was "Receipt Details")
- ✅ Comments: "DocumentDetailScreen (formerly ReceiptDetailScreen)"
- ✅ Image section: "Document Image"

**ReceiptsListScreen.jsx**
- ✅ Header: "My Documents" (was "My Receipts")
- ✅ Comments: "DocumentsListScreen (formerly ReceiptsListScreen)"
- ✅ Search placeholder: "Search documents..." (was "Search receipts...")
- ✅ Loading text: "Loading documents..." (was "Loading receipts...")

**ScanReceiptScreen.jsx**
- ✅ Header: "Upload Document" (unchanged - was already correct)
- ✅ Console logs: "STARTING DOCUMENT PROCESSING", "DOCUMENT PROCESSING ERROR"
- ✅ Instructions: "Place document on flat surface" (was "Place receipt on flat surface")
- ✅ Processing text: "Extracting text and analyzing document..."
- ✅ Alert messages: "Please capture or select a document image first"
- ✅ Navigation comment: "Navigate to document preview screen"

**aiReceiptParser.js**
- ✅ Comments: "AI-Powered Document Parser (formerly aiReceiptParser)"
- ✅ Description: "Uses AI models to intelligently extract data from various document types"

### 2. What Was NOT Changed (By Design)

These items were intentionally kept as "receipt" to maintain:
- Database compatibility
- Existing data structure
- Service function names
- Internal variable names where it doesn't affect users

**Kept as "receipt":**
- ✅ File names: `ReceiptPreviewScreen.jsx`, `ReceiptDetailScreen.jsx`, etc. (React Native navigation depends on these)
- ✅ Service functions: `createReceipt()`, `uploadReceiptImage()`, `receiptService.js`
- ✅ Database collection: `receipts` (Firestore collection name)
- ✅ Internal variables: `receiptId`, `receipt` object (internal only)
- ✅ CSS class names: `receiptImage`, `receiptCard` (styling)

**Reason:** Changing these would break existing functionality and require database migration. The internal implementation can use "receipt" as the technical term, while the UI presents it as "document" to users.

## User-Visible Changes Summary

### Before:
- "My Receipts"
- "Upload Receipt"
- "Receipt Details"
- "Search receipts..."
- "Loading receipts..."
- "Saving receipt..."

### After:
- "My Documents" ✅
- "Upload Document" ✅
- "Document Details" ✅
- "Search documents..." ✅
- "Loading documents..." ✅
- "Saving document..." ✅

## Technical Implementation Notes

### Screen Navigation
The navigation still uses route names like `ReceiptPreview` and `ReceiptDetail` internally. This is intentional - React Navigation routes don't need to match screen titles, and changing them would require updates to all navigation calls throughout the app.

```javascript
// Route name (internal) - kept as is
navigation.navigate('ReceiptDetail', { receiptId });

// Screen title (user-facing) - updated
<AppHeader title="Document Details" />
```

### Database Schema
The Firestore collection remains `receipts` with fields:
- `merchantName` (for all document types)
- `documentType` (NEW - distinguishes document types)
- All other existing fields

This ensures backward compatibility with existing data.

### Variable Naming Convention
- **User-facing text:** "document"
- **Internal code:** "receipt" (for consistency with existing codebase)
- **New features:** Use "document" terminology

## Files Modified

1. ✅ `life-pa-app/src/screens/ReceiptPreviewScreen.jsx` - 8 changes
2. ✅ `life-pa-app/src/screens/ReceiptDetailScreen.jsx` - 4 changes
3. ✅ `life-pa-app/src/screens/ReceiptsListScreen.jsx` - 5 changes
4. ✅ `life-pa-app/src/screens/ScanReceiptScreen.jsx` - 6 changes
5. ✅ `life-pa-app/src/services/aiReceiptParser.js` - 2 changes

**Total:** 25 terminology updates across 5 files

## Testing Checklist

After these changes, verify:
- [ ] Upload document screen shows "Document" terminology
- [ ] Document list screen shows "My Documents"
- [ ] Document detail screen shows "Document Details"
- [ ] Search placeholder says "Search documents..."
- [ ] Toast messages say "Saving document..."
- [ ] All existing documents still load correctly
- [ ] Navigation between screens works
- [ ] No console errors

## User Benefits

1. **Clearer Purpose:** Users understand the app handles more than just receipts
2. **Professional Terminology:** "Documents" is more professional than "receipts" for bills and invoices
3. **Accurate Labeling:** Document types are now clearly identified (Utility Bill, Invoice, etc.)
4. **Consistent Experience:** All UI text now reflects the app's true capabilities

## Backward Compatibility

✅ **100% Backward Compatible**
- All existing receipts display as documents
- No data migration needed
- No breaking changes to functionality
- Service layer unchanged

## Future Considerations

If we want to rename files and services in the future:
1. Rename `receiptService.js` → `documentService.js`
2. Update all imports throughout the app
3. Consider aliasing: `export { receipt as document }`
4. Update test files
5. Update documentation

For now, keeping the service layer as "receipt" maintains stability while the UI accurately represents capabilities.

---

**Status:** ✅ Complete  
**Date:** October 21, 2025  
**Impact:** User-facing text only, no breaking changes  
**Backward Compatible:** Yes  
**Testing Required:** UI verification only

