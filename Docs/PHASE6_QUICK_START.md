# Phase 6: Receipt Scanning - Quick Start Guide 🚀

## ✅ What Was Implemented

Phase 6 adds full receipt scanning and management capabilities to the Life PA app:

### Features Added
- 📸 **Camera-based receipt scanning**
- 🔍 **OCR text extraction** using Tesseract.js
- 🧠 **Intelligent parsing** (merchant, amount, date, items)
- 💾 **Receipt storage** in Firestore with images
- 📋 **Receipt gallery** with filtering and search
- ✏️ **Edit receipts** with full CRUD operations
- 📊 **Spending analytics** by category

---

## 🚀 How to Test

### 1. Start the Development Server
```bash
cd life-pa-app
npm start
```

### 2. Test on Mobile Device (Recommended)
The camera features work best on a real device:

#### iOS
```bash
npm run ios
```
Or scan QR code with Expo Go app

#### Android
```bash
npm run android
```
Or scan QR code with Expo Go app

### 3. Test Receipt Scanning

#### From Home Screen:
1. Login to the app
2. Tap **"Scan Receipt"** quick action
3. Allow camera permissions when prompted
4. Point camera at a receipt
5. Tap the circular capture button
6. Review the image preview
7. Tap **"Process Receipt"**
8. Wait for OCR processing (shows progress)
9. Review extracted data in detail screen
10. Edit any fields if needed
11. View in "My Receipts" gallery

#### From AI Chat:
1. Open Chat screen
2. Say "scan my receipt" or "I want to save a receipt"
3. AI will navigate to scanner
4. Follow scanning process above

#### Using Gallery:
1. Open Scan Receipt screen
2. Tap **"Gallery"** icon (🖼️)
3. Select existing receipt photo
4. Process as normal

### 4. Test Receipt Management

#### View All Receipts:
1. From Home, tap **"My Receipts"** quick action
2. See summary card with total spending
3. Filter by category using chips
4. Pull down to refresh
5. Tap any receipt to view details

#### Edit Receipt:
1. Open receipt detail
2. Tap **"Edit"** button
3. Update merchant name, amount, or category
4. Tap **"Save Changes"**

#### Delete Receipt:
1. Open receipt detail
2. Tap **"Delete"** button
3. Confirm deletion
4. Receipt removed from list

---

## 📝 Test Receipts

For testing, you can use:
- Real receipts from your wallet
- Online receipt images (Google "sample receipt")
- Test receipt generators online

### Good Test Cases:
- ✅ Grocery store receipts
- ✅ Restaurant bills
- ✅ Gas station receipts
- ✅ Online order printouts
- ✅ Utility bills

### Tips for Best Results:
- 📷 Good lighting (natural light best)
- 📏 Receipt laid flat on surface
- 🎯 Entire receipt in frame
- ❌ Avoid shadows and glare
- 🔍 Focus camera properly

---

## 🗂️ New Navigation Routes

The following screens are now accessible:

```javascript
// Scan a receipt
navigation.navigate('ScanReceipt');

// View all receipts
navigation.navigate('ReceiptsList');

// View specific receipt
navigation.navigate('ReceiptDetail', { receiptId: 'xxx' });
```

---

## 🎯 Testing Checklist

### Basic Functionality
- [ ] Camera opens correctly
- [ ] Photo capture works
- [ ] Gallery selection works
- [ ] Image preview displays
- [ ] OCR extracts text
- [ ] Parsed data looks reasonable
- [ ] Receipt saves to Firestore
- [ ] Receipt appears in list
- [ ] Detail view shows all info
- [ ] Edit mode works
- [ ] Delete removes receipt

### Permissions
- [ ] Camera permission requested
- [ ] Gallery permission requested
- [ ] Permission denial handled
- [ ] Web platform shows appropriate message

### User Experience
- [ ] Loading indicators appear
- [ ] Toast notifications show
- [ ] Empty states display
- [ ] Error messages are clear
- [ ] Navigation flows smoothly
- [ ] Images load correctly

---

## 📦 New Dependencies

The following packages were added:
```json
{
  "expo-camera": "^14.0.0",
  "expo-image-picker": "^14.0.0",
  "expo-file-system": "^16.0.0",
  "tesseract.js": "^5.0.0"
}
```

---

## 🔍 Troubleshooting

### Camera Not Working
**Problem:** Camera doesn't open or shows black screen  
**Solution:** 
- Ensure permissions granted in device settings
- Restart app after granting permissions
- Try on real device (not simulator)

### OCR Results Poor
**Problem:** Text extraction not accurate  
**Solution:**
- Improve lighting conditions
- Hold camera steady
- Ensure receipt is flat
- Use higher quality image
- Manually edit extracted fields

### Images Not Uploading
**Problem:** Receipt saves but no image  
**Solution:**
- Check Firebase Storage rules
- Verify internet connection
- Check Firebase Storage quota
- Review console for errors

### Web Not Working
**Problem:** Camera features disabled on web  
**Solution:**
- This is expected - use mobile app
- Web shows appropriate message

---

## 🎨 UI Components

### New Screens
1. **ScanReceiptScreen** - Camera interface with live preview
2. **ReceiptsListScreen** - Gallery of all receipts
3. **ReceiptDetailScreen** - View/edit individual receipt

### New Components
1. **ReceiptCard** - Receipt list item with thumbnail

### Updated Screens
1. **HomeScreen** - Added "My Receipts" quick action

---

## 📊 Data Flow

```
User captures image
    ↓
Image sent to OCR service
    ↓
Tesseract.js extracts text
    ↓
Text parser extracts data
    ↓
Image uploaded to Storage
    ↓
Receipt saved to Firestore
    ↓
Navigate to detail screen
    ↓
User can view/edit/delete
```

---

## 🔧 Configuration

### Firebase Storage Rules
Make sure your Firebase Storage rules allow authenticated users to upload:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /receipts/{userId}/{filename} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Firestore Rules
Ensure receipts collection has proper rules:

```javascript
match /receipts/{receiptId} {
  allow read, write: if request.auth != null && 
    request.auth.uid == resource.data.userId;
}
```

---

## 📱 Screenshots Locations

When testing, the UI should show:
- Camera preview with scan frame corners
- Image preview with retake/process buttons
- Receipt list with category filters
- Receipt detail with full information
- Edit mode with input fields
- Summary card with spending totals

---

## 🎯 Success Criteria

Phase 6 is working correctly if:
1. ✅ Camera opens and captures photos
2. ✅ OCR extracts readable text
3. ✅ Receipt data parsed into fields
4. ✅ Receipts saved to Firestore
5. ✅ Images uploaded to Storage
6. ✅ Receipt list displays all receipts
7. ✅ Detail screen shows full info
8. ✅ Edit mode updates fields
9. ✅ Delete removes receipts
10. ✅ Category filtering works

---

## 💡 Pro Tips

### For Demo/Testing:
1. Use well-lit receipts with clear text
2. Test various receipt types (store, restaurant, gas)
3. Try both camera and gallery selection
4. Test editing all fields
5. Verify category auto-detection
6. Check spending summary updates

### For Development:
1. Check console logs for OCR results
2. Verify Firestore documents created
3. Check Firebase Storage for images
4. Test with various image qualities
5. Handle edge cases (no text, poor quality)

---

## 🚀 Next Steps

After testing Phase 6, you can:
1. Proceed to **Phase 7** - Data Management & Firestore Optimization
2. Add more receipt categories
3. Implement advanced analytics
4. Add export functionality
5. Integrate with accounting software

---

## 📞 Getting Help

If you encounter issues:
1. Check console logs for errors
2. Verify Firebase configuration
3. Ensure all dependencies installed
4. Review permissions in device settings
5. Check network connection
6. Review `PHASE6_COMPLETE.md` for details

---

**Phase 6 Implementation Status: COMPLETE ✅**

Happy testing! 🎉

