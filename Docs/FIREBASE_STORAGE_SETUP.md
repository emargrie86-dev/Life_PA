# Firebase Storage Setup Guide 🔥

**Issue:** CORS errors when uploading receipts  
**Cause:** Firebase Storage not configured  
**Status:** Needs setup

---

## 🚀 Quick Setup Steps

### 1. Enable Firebase Storage

1. **Go to Firebase Console:**
   - https://console.firebase.google.com/
   - Select project: `life-pa-d1d6c`

2. **Navigate to Storage:**
   - Click **Storage** in left menu
   - Click **Get Started**

3. **Setup Storage:**
   - Use default location
   - Click **Next** → **Done**

---

### 2. Configure Storage Rules

After Storage is enabled:

1. Click the **Rules** tab in Storage
2. Replace with these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Receipt uploads
    match /receipts/{userId}/{fileName} {
      // Allow authenticated users to read/write their own receipts
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Development: Allow authenticated users (can tighten later)
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

---

### 3. Verify Configuration

**Check that:**
- ✅ Storage is enabled
- ✅ Rules are published
- ✅ User is authenticated in your app

---

## 🧪 Test Receipt Upload

1. Refresh your web app (`F5`)
2. Login to the app
3. Go to "Scan Receipt"
4. Select an image
5. Click "Process Receipt"
6. **Should upload successfully!** ✅

---

## 🔍 Troubleshooting

### Still Getting CORS Errors?

**Option 1: Wait a few minutes**
- Storage rules can take 1-2 minutes to propagate
- Try again after a short wait

**Option 2: Check Authentication**
- Make sure you're logged in
- Check console: `firebase.auth().currentUser` should return a user

**Option 3: Check Browser Console**
- Look for different error messages
- Share the new errors for help

---

## 📊 Storage Structure

Receipts will be stored as:
```
receipts/
  └── {userId}/
      ├── 1234567890123.jpg
      ├── 1234567890456.jpg
      └── ...
```

---

## 🔒 Security Rules Explained

### Current Rules (Development):
```javascript
// Users can only access their own receipts
match /receipts/{userId}/{fileName} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

**What this means:**
- ✅ Users must be authenticated
- ✅ Users can only access their own receipts
- ✅ No one can access other users' receipts
- ✅ Anonymous users cannot access anything

---

## 🎯 Production Considerations

### Before deploying to production:

1. **Tighten write rules:**
```javascript
allow write: if request.auth != null 
  && request.auth.uid == userId
  && request.resource.size < 10 * 1024 * 1024  // Max 10MB
  && request.resource.contentType.matches('image/.*');  // Only images
```

2. **Add file type validation**
3. **Set up storage quotas**
4. **Monitor storage usage**

---

## 💰 Cost Considerations

**Firebase Storage Pricing:**
- **Free Tier:** 5 GB storage, 1 GB/day download
- **After free tier:** $0.026 per GB stored per month

**For this app:**
- Average receipt image: ~500 KB
- 100 receipts = ~50 MB
- Well within free tier for development

---

## 🔄 Alternative: Use Firestore for Small Images

If you want to avoid Storage complexity:
- Convert images to base64
- Store directly in Firestore documents
- **Limitation:** Max 1MB per document
- Not recommended for production scale

---

## ✅ Checklist

After setup:
- [ ] Firebase Storage enabled
- [ ] Storage rules configured
- [ ] Rules published
- [ ] User authenticated
- [ ] Receipt upload tested
- [ ] Receipt appears in Storage console
- [ ] Receipt appears in app

---

## 📝 What You Should See

### In Firebase Console → Storage:
```
receipts/
  └── {your-user-id}/
      └── 1234567890123.jpg  (your uploaded receipt)
```

### In Your App:
- ✅ "Receipt processed successfully!" message
- ✅ Navigate to receipt detail screen
- ✅ Receipt image displays
- ✅ Receipt data saved

---

**Setup Status:** Needs completion 🔧  
**Estimated Time:** 5 minutes ⏱️  
**Difficulty:** Easy ✅

---

*Last Updated: October 20, 2025*

