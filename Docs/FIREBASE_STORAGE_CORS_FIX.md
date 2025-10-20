# Firebase Storage CORS Fix 🔧

**Issue:** CORS errors when uploading to Firebase Storage  
**Cause:** Storage not properly initialized or CORS not configured  
**Status:** Needs final setup step

---

## ✅ You've Upgraded to Blaze Plan

Great! But you still need to **initialize Firebase Storage**:

### Step 1: Go to Firebase Storage

1. **Open:** https://console.firebase.google.com/project/life-pa-d1d6c/storage
2. You should now see a "Get Started" button (since you have Blaze plan)
3. **Click "Get Started"**

### Step 2: Choose Location

1. Select a location (e.g., `us-central1` or closest to you)
2. Click **"Done"**
3. Storage will initialize (takes 30 seconds)

### Step 3: Set Storage Rules

Once initialized, go to the **Rules** tab and paste:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /receipts/{userId}/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Click **Publish**

---

## 🧪 Test After Setup

1. Refresh your app (`F5`)
2. Try processing a receipt
3. Should upload successfully! ✅

---

## 🔄 Current Workaround

I've improved the workaround to:
- ⏱️ **Timeout after 5 seconds** (fail fast)
- 📸 **Convert to base64** (better than blob URI)
- ✅ **Receipt still saves** with all data
- ⚠️ **Image won't persist** until Storage is configured

You can continue testing now, and images will work properly once Storage is set up!

---

## 📝 Console Messages

You'll see these in console:

**With workaround active:**
```
⚠️ WORKAROUND ACTIVE: Using local image URI
⚠️ Receipt will save but image won't persist after page refresh
✅ Image converted to base64
```

**When Storage works:**
```
✅ Image uploaded successfully: https://firebasestorage.googleapis.com/...
```

---

*Last Updated: October 20, 2025*

