# Document Upload Debug Guide 🔍

**Issue:** Document picker opens but nothing happens after selecting a file  
**Status:** 🔧 Debugging

---

## 🧪 Testing & Debugging

I've added extensive console logging to help identify the issue. Here's how to debug:

### Step 1: Open Browser Console

**Chrome/Edge:**
- Press `F12` or `Right-click > Inspect`
- Click the "Console" tab

**Firefox:**
- Press `F12` or `Ctrl+Shift+K`
- Click "Console"

### Step 2: Try Document Upload

1. In the app, click "Scan Receipt"
2. Click the "Document" button (📄)
3. Select an image or PDF file
4. **Watch the console output**

### Step 3: Look for These Messages

The console should show:

```javascript
// When you click Document button:
"Opening document picker..."

// After you select a file:
"Document picker result: { ... }"

// File details:
"Document selected: { uri: '...', name: '...', mimeType: '...', size: ... }"

// File type detection:
"File type detection: { isImage: true/false, isPDF: true/false, ... }"

// Processing:
"Processing as image" or "Processing as PDF"

// Success:
"Image loaded successfully"
```

---

## ❓ What to Check

### If You See "Opening document picker..." But Nothing After:

**Possible Issue:** File picker not returning a result

**Solution:**
1. Try selecting a different file
2. Check if file picker dialog actually opened
3. Look for any error messages in console

### If You See Result But No File Details:

**Possible Issue:** Result format mismatch

**What to check:**
- Copy the full result object from console
- Share it so I can see the exact structure
- We may need to adjust the parsing

### If You See "No document in result":

**Possible Issue:** API format change

**Solution:**
- Check the console output for the full result
- The expo-document-picker API may have changed
- We'll adjust the code to match

### If You See File Details But No Preview:

**Possible Issue:** `setCapturedImage` not working

**What to check:**
- Is the URI valid?
- Is the image preview section rendering?
- Check React DevTools state

---

## 🔍 Common Issues & Solutions

### Issue 1: File Picker Doesn't Open
```
Symptom: Click "Document" button, nothing happens
Console: "Opening document picker..." appears
```

**Fix:**
- Check browser console for permission errors
- Try allowing file access in browser settings
- Test with Chrome/Edge (better file picker support)

### Issue 2: File Selected But Not Displayed
```
Symptom: File selected, but no preview shows
Console: Shows file details but no "Processing as image"
```

**Fix:**
- Check if mimeType is being detected
- Verify file extension is recognized
- May need to add more file types

### Issue 3: Wrong File Type Detection
```
Symptom: Image file rejected as "unsupported"
Console: Shows wrong mimeType or missing extension
```

**Fix:**
- Check the mimeType value in console
- We can add more supported types
- May need to adjust detection logic

---

## 📊 What Console Output Means

### Good Output (Working):
```
Opening document picker...
Document picker result: { 
  "canceled": false, 
  "assets": [{ 
    "uri": "blob:http://...", 
    "name": "receipt.jpg",
    "mimeType": "image/jpeg"
  }]
}
Document selected: { uri: "blob:...", name: "receipt.jpg", mimeType: "image/jpeg", size: 123456 }
File type detection: { isImage: true, isPDF: false, mimeType: "image/jpeg", fileExtension: "jpg" }
Processing as image
Image loaded successfully
```

### Bad Output (Problem):
```
Opening document picker...
Document picker result: { "canceled": true }
Document selection canceled
```
OR
```
Opening document picker...
Document picker result: { }
No document in result: {}
```

---

## 🛠️ Improved Features

I've added:

### 1. Better Error Handling
- Handles both old and new API formats
- Checks multiple ways to detect file types
- Graceful fallbacks

### 2. Extensive Logging
- Logs every step of the process
- Shows result structure
- Displays file type detection logic

### 3. Multiple File Type Detection Methods
- Checks `mimeType` property
- Falls back to file extension
- Recognizes common image formats

### 4. User Feedback
- Toast notifications on success
- Error messages with details
- Web-specific confirmation dialogs

### 5. Platform-Specific Handling
- Uses `window.confirm()` on web for PDFs
- Uses `Alert.alert()` on mobile
- Different UI for each platform

---

## 🧪 Test These Scenarios

### Test 1: JPEG Image
1. Click "Document"
2. Select a `.jpg` or `.jpeg` file
3. Should show: "Processing as image" → "Image loaded successfully"
4. Image preview should appear

### Test 2: PNG Image
1. Click "Document"
2. Select a `.png` file
3. Should show same success messages
4. Image preview should appear

### Test 3: PDF Document
1. Click "Document"
2. Select a `.pdf` file
3. Should show: "Processing as PDF"
4. Confirmation dialog appears
5. Click "OK" to continue
6. PDF should load (though preview may not work perfectly)

### Test 4: Gallery Picker
1. Click "Gallery" instead
2. Select an image
3. Should also work with same logging

---

## 📝 How to Report Issues

If it still doesn't work, please share:

1. **Console Output:**
   ```
   Copy and paste everything from:
   "Opening document picker..."
   to the last message
   ```

2. **File Type:**
   - What type of file did you try? (JPG, PNG, PDF, etc.)
   - File size?

3. **Browser:**
   - Chrome, Firefox, Safari, Edge?
   - Version?

4. **What Happened:**
   - Did file picker open?
   - Did you select a file?
   - What did you see (or not see)?

---

## 🔄 Next Steps

**Try this now:**

1. Open browser console (F12)
2. Click "Document" button
3. Select an image file
4. **Share the console output with me**

The console logs will tell us exactly where the process is failing, and we can fix it from there!

---

## 💡 Quick Fixes to Try

### If Nothing Shows After Selection:

**Try 1:** Use Gallery button instead
- Gallery picker might work better on web
- Same result, different API

**Try 2:** Try a different file
- Start with a simple JPG image
- Small file size (< 1MB)

**Try 3:** Different browser
- Chrome generally has best support
- Safari/Firefox may have issues

**Try 4:** Check file permissions
- Make sure file is accessible
- Not from a restricted location

---

**Status:** Debugging mode enabled ✅  
**Console logging:** Active ✅  
**Ready for testing:** Yes ✅

Please test and share the console output! 🚀

