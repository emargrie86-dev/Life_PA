# 🔥 Firebase Setup Guide

This guide will help you configure Firebase for the AI Life Personal Assistant app.

---

## 📋 Prerequisites

- A Google account
- Internet connection
- 10 minutes of your time

---

## 🚀 Step-by-Step Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" (or "Create a project")
3. Enter a project name (e.g., "life-pa" or "AI Life PA")
4. Accept terms and click "Continue"
5. (Optional) Enable Google Analytics
6. Click "Create project"
7. Wait for project to be created, then click "Continue"

### Step 2: Add Web App to Your Project

1. In the Firebase Console, click the web icon (`</>`) to add a web app
2. Register your app:
   - App nickname: "AI Life PA Web" (or any name you like)
   - Don't check "Firebase Hosting" (unless you want to)
3. Click "Register app"

### Step 3: Copy Configuration

You'll see a code snippet like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**Copy this entire configuration block!**

### Step 4: Enable Authentication

1. In the left sidebar, click "Authentication"
2. Click "Get started" (if first time)
3. Click on the "Sign-in method" tab
4. Enable "Email/Password":
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

### Step 5: Update Your App

1. Open your project in your code editor
2. Navigate to `src/services/firebase.js`
3. Replace the placeholder config with your actual config:

**Before:**
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**After:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

4. Save the file

### Step 6: Test Your Setup

1. Start your app:
   ```bash
   npm start
   ```

2. Try to create a new account
3. If successful, you'll see the user in Firebase Console > Authentication > Users

---

## ✅ Verification

To verify Firebase is configured correctly:

1. **Check Firebase Console:**
   - Go to Authentication > Users
   - Try creating a test account in your app
   - The user should appear in the Firebase Console

2. **Check for Errors:**
   - Open browser/app console
   - Look for Firebase errors
   - Common issues:
     - "auth/invalid-api-key" = Wrong API key
     - "auth/unauthorized-domain" = Need to add domain (see below)

---

## 🌐 Authorized Domains (for Web)

If you're running on web and get "unauthorized-domain" errors:

1. Go to Firebase Console > Authentication > Settings
2. Click "Authorized domains" tab
3. Add your domains:
   - `localhost` (for development)
   - Your actual domain (for production)

---

## 🔐 Security Best Practices

### DO:
- ✅ Keep your Firebase config in your code (it's safe for client apps)
- ✅ Use Firebase Security Rules to protect data
- ✅ Enable App Check for production apps
- ✅ Monitor usage in Firebase Console

### DON'T:
- ❌ Share your Firebase Admin SDK credentials (different from config)
- ❌ Commit `.env` files with sensitive secrets
- ❌ Leave security rules as "test mode" in production

### Recommended Security Rules

When you start using Firestore (Phase 3+), use these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Items owned by users
    match /items/{itemId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 🆘 Troubleshooting

### Problem: "Firebase: Error (auth/invalid-api-key)"
**Solution:** Your Firebase config is still using placeholder values. Copy your actual config from Firebase Console.

### Problem: "Firebase: Error (auth/operation-not-allowed)"
**Solution:** Email/Password authentication is not enabled. Go to Firebase Console > Authentication > Sign-in method and enable it.

### Problem: "Firebase: Error (auth/unauthorized-domain)"
**Solution:** Add your domain to authorized domains in Firebase Console > Authentication > Settings > Authorized domains.

### Problem: Can't find my Firebase config
**Solution:** 
1. Go to Firebase Console
2. Click the gear icon ⚙️ > Project settings
3. Scroll down to "Your apps"
4. You'll see your web app config there

### Problem: Created user doesn't appear in Firebase
**Solution:** 
1. Check browser/app console for errors
2. Verify Firebase config is correct
3. Ensure you're looking at the correct Firebase project
4. Try refreshing the Firebase Console page

---

## 📱 Optional: Add Android/iOS Support

If you want to run your app on mobile devices:

### For Android:
1. In Firebase Console, click Android icon
2. Enter package name: `com.lifepa.app` (from `app.json`)
3. Download `google-services.json`
4. Follow Expo's Firebase setup guide

### For iOS:
1. In Firebase Console, click iOS icon
2. Enter bundle ID: `com.lifepa.app` (from `app.json`)
3. Download `GoogleService-Info.plist`
4. Follow Expo's Firebase setup guide

---

## 🎓 Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Security Rules Guide](https://firebase.google.com/docs/rules)
- [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/)
- [Firebase YouTube Channel](https://www.youtube.com/user/Firebase)

---

## ✅ Setup Complete!

Once you've completed these steps, you're ready to use authentication in your app!

**Next Steps:**
1. Test login/signup functionality
2. Explore Firebase Console features
3. Start building your app features (Phase 3)

---

**Need help?** Check the [Firebase Support](https://firebase.google.com/support) page or search Stack Overflow for your specific error.

