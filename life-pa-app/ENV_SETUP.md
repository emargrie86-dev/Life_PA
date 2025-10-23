# Environment Variables Setup Guide

## Overview
This application requires environment variables to securely store API keys and configuration.

## Setup Instructions

### 1. Create Environment Files

Create a `.env` file in the `life-pa-app/` directory with the following content:

```bash
# Firebase Configuration
FIREBASE_API_KEY=AIzaSyCi5purybWWGJNKtIsKnrEDLgh0kn9gf-A
FIREBASE_AUTH_DOMAIN=life-pa-d1d6c.firebaseapp.com
FIREBASE_PROJECT_ID=life-pa-d1d6c
FIREBASE_STORAGE_BUCKET=life-pa-d1d6c.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=709387836577
FIREBASE_APP_ID=1:709387836577:web:aca0560b2a8c99d54b24e0
FIREBASE_MEASUREMENT_ID=G-JC2M2FWDRN

# AI Services
# Note: Users should set their own API key in app settings
GEMINI_API_KEY=
```

### 2. Example Template

A `.env.example` file should also be created for reference:

```bash
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id

# AI Services
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Important Notes

- **Never commit `.env` files to version control**
- The `.gitignore` file has been updated to exclude `.env` files
- Users set their Gemini API key through the app's Settings screen
- Firebase credentials are safe to include as they're protected by Firebase security rules

### 4. Verification

After creating the `.env` file:
1. Restart your development server
2. The app should load without errors
3. Firebase should connect successfully

