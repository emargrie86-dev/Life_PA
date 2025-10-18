<!-- AI Life Personal Assistant — plan.md
     Project plan for building a mobile-first AI personal assistant
     with reminders, receipt scanning, voice chat, and contextual AI actions.
     
     🎯 HOW TO USE THIS PLAN:
     1. Each phase is designed to be executed incrementally
     2. Highlight any phase section and press Ctrl+I (Windows) or Cmd+I (Mac)
     3. Phases 1-2 are tested baseline (setup + auth)
     4. Phases 3+ add core features: UI, AI chat, reminders, scanning
     
     Cursor-ready: Execute phases sequentially for best results
-->

# 🧭 AI Life Personal Assistant — Project Plan

> **Goal:** A mobile-first personal assistant app (Android & iOS) that helps users with reminders, receipt/bill scanning & formatting, voice chat, and contextual AI actions.
> 
> **Project Status:** This project includes a tested baseline with:
> - ✅ Expo project setup (SDK 51) - Phase 1 Complete
> - ✅ Firebase authentication (email + Google) - Phase 2 Complete
> - ✅ Navigation structure ready
> 
> **Core Features to Build:**
> - 🏠 Dashboard with quick actions
> - 💬 AI Chat Assistant (OpenAI GPT)
> - ⏰ Smart Reminders & Notifications
> - 📸 Receipt/Document Scanning with OCR
> - ⚙️ Settings & Profile Management
---

## ⚠️ Preconditions (do these first)
- Install Node.js (v16+)
- Install Expo CLI (optional): `npm install -g expo-cli` or use `npx create-expo-app`
- Expo SDK 51
- Create a free Firebase project at [Firebase Console](https://console.firebase.google.com/)
- Obtain an OpenAI API key from [OpenAI Platform](https://platform.openai.com/)
- Open this repository in Cursor (editor mode)

---

## 🏁 How to use this plan in Cursor
1. Save this file as `docs/plan.md` in your project.  
2. Open `plan.md` in the editor (not the preview).  
3. Highlight the section you want to run (e.g., the entire **Phase 1: Setup** block).  
4. Press **Ctrl+I** (Windows/Linux) or **Cmd+I** (Mac) to open the Cursor AI panel.  
5. In the panel, click the action like “Run” or type: `Execute the highlighted plan and create the files described.`  
6. Cursor will scaffold files and boilerplate for that section.  
   - If right-click shows “Run Plan”, you can use that too.

---

## ✅ Status Legend
- [ ] = not started  
- [~] = in progress  
- [x] = complete

---

## 🏗️ Phase 1: Project Setup  [✅ BASELINE - COMPLETE]

**Goal:** Create a working Expo + React Native project with the basic folder structure.

**What's Included:**
- [x] Expo project scaffold (SDK 51)
- [x] Basic folder structure (`/src`, `/assets`, `/components`)
- [x] Configuration files (`app.json`, `package.json`)
- [x] Development server ready to run

**Initial Setup Command:**
```bash
npx create-expo-app@latest Life_PA --template blank
cd Life_PA
npm install
npm install --save-dev cross-env
npm install react-dom react-native-web
```

**Update package.json scripts:**
```json
"scripts": {
  "start": "cross-env NODE_TLS_REJECT_UNAUTHORIZED=0 expo start",
  "android": "cross-env NODE_TLS_REJECT_UNAUTHORIZED=0 expo start --android",
  "ios": "cross-env NODE_TLS_REJECT_UNAUTHORIZED=0 expo start --ios",
  "web": "cross-env NODE_TLS_REJECT_UNAUTHORIZED=0 expo start --web"
}
```

**Project Structure:**
```
/Life_PA
  /src
    /screens
    /components
    /navigation
    /services
    /utils
  /assets
  App.js
  app.json
  package.json
```

---

## 🔐 Phase 2: Authentication & Navigation [✅ BASELINE - COMPLETE]

**Goal:** Implement Firebase authentication and navigation structure so users can sign up, log in, and access the app.

**What's Included:**
- [x] Firebase configuration and initialization
- [x] Email/password authentication
- [x] Google Sign-In integration
- [x] React Navigation setup (Stack + Tab navigation)
- [x] Auth state management
- [x] Login/Signup screens with validation
- [x] Protected routes pattern

**Dependencies Installed:**
```bash
npm install firebase
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
```

**Key Files Created:**
- `src/services/firebase.js` - Firebase config and initialization
- `src/services/auth.js` - Authentication helpers
- `src/navigation/AuthStack.js` - Login/Signup flow
- `src/navigation/AppNavigator.js` - Main app navigation
- `src/screens/LoginScreen.jsx`
- `src/screens/SignupScreen.jsx`
- `src/screens/HomeScreen.jsx`

---

## 🏠 Phase 3: UI Layout & Home Screen Dashboard

**Objective:** Create the main app layout with bottom tab navigation and a functional home screen dashboard that provides quick access to all major features.

**Tasks:**

- [ ] Update navigation to include bottom tabs (Home, Chat, Reminders, Scan, Settings)
- [ ] Create HomeScreen with dashboard layout
- [ ] Build reusable UI components (Card, ActionButton, QuickActionGrid)
- [ ] Define app theme (colors, typography, spacing)
- [ ] Add screen placeholders for Chat, Reminders, Scan, Settings
- [ ] Implement navigation between screens
- [ ] Test navigation flow on iOS and Android

**Install Dependencies:**
```bash
npm install react-native-vector-icons
npm install @react-native-async-storage/async-storage
```

**Files to Create/Update:**
- `src/navigation/MainTabs.js` - Update with 5 tabs (Home, Chat, Reminders, Scan, Settings)
- `src/screens/HomeScreen.jsx` - Dashboard with quick action cards
- `src/screens/ChatScreen.jsx` - Placeholder for AI chat
- `src/screens/RemindersScreen.jsx` - Placeholder for reminders list
- `src/screens/ScanScreen.jsx` - Placeholder for camera/scan
- `src/screens/SettingsScreen.jsx` - Placeholder for settings
- `src/components/QuickActionCard.jsx` - Reusable card component
- `src/theme/colors.js` - Color palette
- `src/theme/spacing.js` - Spacing constants

**Home Screen Features:**
- Welcome message with user's name
- Quick action cards: "Chat with AI", "Add Reminder", "Scan Receipt", "View History"
- Recent activity section (recent reminders or scanned receipts)
- Stats overview (total reminders, receipts this month)

---

## 💬 Phase 4: AI Chat Assistant (OpenAI Integration)

**Objective:** Implement a conversational AI assistant powered by OpenAI GPT that can help users with tasks, answer questions, and provide contextual assistance.

**Tasks:**

- [ ] Set up OpenAI API client and configuration
- [ ] Create secure API key storage (AsyncStorage or Firestore)
- [ ] Build ChatScreen with message list and input
- [ ] Implement chat message components (user vs AI bubbles)
- [ ] Add conversation history management (Firestore)
- [ ] Implement context management for conversations
- [ ] Add typing indicators and loading states
- [ ] Handle API errors gracefully
- [ ] Add conversation history persistence
- [ ] (Optional) Integrate voice input using expo-speech

**Install Dependencies:**
```bash
npm install openai
npm install expo-speech
```

**Files to Create:**
- `src/services/openai.js` - OpenAI API configuration and helpers
- `src/services/chatService.js` - Chat message CRUD operations
- `src/screens/ChatScreen.jsx` - Main chat interface
- `src/components/MessageBubble.jsx` - Individual message component
- `src/components/ChatInput.jsx` - Message input with send button
- `src/screens/APIKeySetupScreen.jsx` - Screen to input/update API key

**Chat Data Schema (Firestore):**
```javascript
// Collection: 'conversations'
{
  id: string,
  userId: string,
  title: string, // Auto-generated from first message
  createdAt: Timestamp,
  updatedAt: Timestamp,
  messages: [
    {
      id: string,
      role: 'user' | 'assistant',
      content: string,
      timestamp: Timestamp
    }
  ]
}
```

**Features to Implement:**
- New conversation creation
- Message streaming (optional, for better UX)
- Conversation list view
- Delete/archive conversations
- Copy message text
- Regenerate AI response

---

## ⏰ Phase 5: Smart Reminders & Notifications

**Objective:** Implement a comprehensive reminder system with local notifications, categories, priorities, and smart scheduling features.

**Tasks:**

- [ ] Set up Expo Notifications
- [ ] Request notification permissions on app start
- [ ] Create RemindersScreen with list view
- [ ] Build AddReminderScreen with form
- [ ] Implement reminder CRUD operations
- [ ] Set up local notification scheduling
- [ ] Add reminder categories (Personal, Work, Shopping, Health, etc.)
- [ ] Add priority levels (High, Medium, Low)
- [ ] Implement recurring reminders (daily, weekly, monthly)
- [ ] Add snooze functionality
- [ ] Create notification action handlers
- [ ] Implement reminder search and filter

**Install Dependencies:**
```bash
npm install expo-notifications
npm install @react-native-community/datetimepicker
npm install react-native-modal
```

**Files to Create:**
- `src/services/reminderService.js` - Reminder CRUD operations
- `src/services/notificationService.js` - Notification scheduling helpers
- `src/screens/RemindersScreen.jsx` - Reminder list with filters
- `src/screens/AddReminderScreen.jsx` - Create/edit reminder form
- `src/screens/ReminderDetailScreen.jsx` - View/edit reminder details
- `src/components/ReminderCard.jsx` - Individual reminder item
- `src/components/CategoryPicker.jsx` - Category selection component
- `src/components/DateTimePicker.jsx` - Date/time selection wrapper

**Reminder Data Schema (Firestore):**
```javascript
// Collection: 'reminders'
{
  id: string,
  userId: string,
  title: string,
  description: string,
  dueDate: Timestamp,
  category: 'Personal' | 'Work' | 'Shopping' | 'Health' | 'Other',
  priority: 'High' | 'Medium' | 'Low',
  isCompleted: boolean,
  isRecurring: boolean,
  recurringType: 'daily' | 'weekly' | 'monthly' | null,
  notificationId: string, // Local notification identifier
  createdAt: Timestamp,
  updatedAt: Timestamp,
  completedAt: Timestamp | null
}
```

**Features to Implement:**
- Today's reminders view
- Upcoming reminders (next 7 days)
- Overdue reminders
- Completed reminders archive
- Mark as complete/incomplete
- Edit and delete reminders
- Notification when reminder is due
- Snooze for 10min/1hr/1day

---

## 📸 Phase 6: Receipt/Document Scanning & OCR

**Objective:** Implement camera-based document scanning with OCR text extraction, allowing users to capture and digitize receipts, bills, and other documents.

**Tasks:**

- [ ] Set up Expo Camera and image picker
- [ ] Request camera and media library permissions
- [ ] Create ScanScreen with camera preview
- [ ] Implement photo capture functionality
- [ ] Add image preview and retake options
- [ ] Integrate open-source OCR (tesseract.js or expo-ocr)
- [ ] Extract text from captured images
- [ ] Format extracted text (detect dates, amounts, merchants)
- [ ] Create receipt data structure and storage
- [ ] Build receipt detail view
- [ ] Add manual editing for OCR corrections
- [ ] Implement receipt gallery/list view
- [ ] Add receipt categorization (Groceries, Dining, Transport, etc.)

**Install Dependencies:**
```bash
npm install expo-camera
npm install expo-image-picker
npm install expo-file-system
npm install tesseract.js
# OR
npm install react-native-tesseract-ocr
```

**Files to Create:**
- `src/services/ocrService.js` - OCR processing helpers
- `src/services/receiptService.js` - Receipt CRUD operations
- `src/screens/ScanScreen.jsx` - Camera interface
- `src/screens/ReceiptDetailScreen.jsx` - View/edit scanned receipt
- `src/screens/ReceiptsListScreen.jsx` - Gallery of all receipts
- `src/components/CameraPreview.jsx` - Camera view component
- `src/components/ImagePreview.jsx` - Image preview with crop/rotate
- `src/components/ReceiptCard.jsx` - Receipt thumbnail in list
- `src/utils/textParsing.js` - Text parsing helpers (extract dates, amounts)

**Receipt Data Schema (Firestore):**
```javascript
// Collection: 'receipts'
{
  id: string,
  userId: string,
  imageUrl: string, // Firebase Storage URL
  merchantName: string,
  date: Timestamp,
  totalAmount: number,
  currency: string,
  category: 'Groceries' | 'Dining' | 'Transport' | 'Shopping' | 'Other',
  extractedText: string, // Full OCR text
  notes: string,
  items: [
    {
      name: string,
      quantity: number,
      price: number
    }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Features to Implement:**
- Take photo from camera
- Select photo from gallery
- Crop and rotate image
- Run OCR on image
- Auto-detect merchant, date, and total
- Manual editing of OCR results
- Save to Firestore with image storage
- View receipt history
- Search receipts
- Filter by date range or category
- Export receipt data (CSV/PDF)

---

## 🗄️ Phase 7: Data Management & Firestore Optimization

**Objective:** Establish comprehensive data schemas, security rules, and data management helpers for all app features.

**Tasks:**

- [ ] Define all Firestore collections and schemas (already done in previous phases)
- [ ] Create consolidated data service file
- [ ] Implement Firestore security rules
- [ ] Set up Firestore indexes for complex queries
- [ ] Add data validation helpers
- [ ] Implement offline persistence
- [ ] Add data export functionality (backup user data)
- [ ] Create data migration helpers (for future updates)
- [ ] Implement data cleanup utilities (delete old/completed items)

**Firestore Security Rules to Implement:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /reminders/{reminderId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /receipts/{receiptId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

**Files to Create:**
- `src/services/dataService.js` - Consolidated CRUD operations
- `src/utils/validation.js` - Data validation helpers
- `src/utils/dataExport.js` - Export user data to JSON/CSV

**Indexes to Create (Firestore Console):**
- Reminders: `userId` + `dueDate` (ascending)
- Receipts: `userId` + `date` (descending)
- Conversations: `userId` + `updatedAt` (descending)

---

## 🎨 Phase 8: UI Polish & Theming

**Objective:** Create a cohesive, polished user interface with consistent styling and smooth user experience.

**Tasks:**

- [ ] Install UI library (optional):
  ```bash
  npm install react-native-paper
  # OR
  npm install @rneui/themed @rneui/base
  ```

- [ ] Refine global theme (already started in Phase 3):
  - `src/theme/colors.js` - Update with full palette
  - `src/theme/typography.js` - Font sizes, weights
  - `src/theme/spacing.js` - Consistent margins/padding

- [ ] Create additional reusable components:
  - `src/components/Button.jsx` - Primary, secondary, outline variants
  - `src/components/Card.jsx` - Consistent card styling
  - `src/components/Input.jsx` - Styled text inputs
  - `src/components/Header.jsx` - Screen headers
  - `src/components/LoadingSpinner.jsx` - Loading indicator
  - `src/components/EmptyState.jsx` - Empty list placeholder

- [ ] Implement light/dark mode toggle (optional)
- [ ] Add loading states and skeleton screens
- [ ] Implement error boundaries
- [ ] Add success/error toast notifications
- [ ] Polish animations and transitions
- [ ] Add haptic feedback for interactions
- [ ] Ensure consistent spacing throughout app

---

## 🔍 Phase 9: Search, Filter & Settings

**Objective:** Add search and filter functionality across features, plus comprehensive settings and user profile management.

**Tasks:**

**Search & Filter:**
- [ ] Add search functionality for reminders
- [ ] Add search functionality for receipts
- [ ] Add search functionality for chat conversations
- [ ] Implement filtering options (by date, category, status)
- [ ] Add sorting capabilities (date, name, priority)
- [ ] Implement pagination or infinite scroll for long lists
- [ ] Create reusable search bar component

**Settings & Profile:**
- [ ] Complete SettingsScreen with sections:
  - Account settings (profile photo, name, email)
  - API Key management (OpenAI key input/update)
  - Notification preferences
  - Theme preferences (light/dark mode)
  - Data management (export, clear history)
- [ ] Create Profile screen with user stats
- [ ] Add profile photo upload functionality
- [ ] Implement user preferences storage (AsyncStorage)
- [ ] Add account management options:
  - Change password
  - Update email
  - Delete account (with confirmation)
- [ ] Implement logout functionality
- [ ] Add about/help section

**Files to Create:**
- `src/components/SearchBar.jsx` - Reusable search component
- `src/components/FilterModal.jsx` - Filter options modal
- `src/screens/SettingsScreen.jsx` - Complete settings implementation
- `src/screens/ProfileScreen.jsx` - User profile and stats
- `src/screens/APIKeyScreen.jsx` - Manage OpenAI API key
- `src/utils/searchHelpers.js` - Search/filter utilities

---

## 🧪 Phase 10: Testing & Quality Assurance

**Objective:** Ensure app stability and quality across devices.

**Tasks:**

- [ ] Setup testing framework:
  ```bash
  npm install --save-dev jest @testing-library/react-native
  ```

- [ ] Write unit tests for:
  - Authentication helpers (`auth.js`)
  - Data services (`reminderService.js`, `receiptService.js`, `chatService.js`)
  - OpenAI integration (`openai.js`)
  - OCR processing (`ocrService.js`)
  - Utility functions (validation, text parsing)

- [ ] Write component tests for key UI elements:
  - Message bubbles and chat input
  - Reminder cards and forms
  - Camera preview and image capture
  - Search and filter components

- [ ] Manual testing checklist:
  - [ ] Test on Android device/emulator
  - [ ] Test on iOS device/simulator
  - [ ] Test offline functionality (Firestore persistence)
  - [ ] Test authentication flows (login, signup, logout)
  - [ ] Test all CRUD operations (reminders, receipts, chats)
  - [ ] Test notifications (local reminders)
  - [ ] Test camera permissions and capture
  - [ ] Test OCR accuracy with various receipt types
  - [ ] Test OpenAI API integration and error handling
  - [ ] Test error handling and edge cases

- [ ] Performance testing and optimization:
  - [ ] Test with large datasets (100+ reminders, receipts)
  - [ ] Optimize image upload and OCR processing
  - [ ] Test API rate limiting and error recovery

---

## 🚀 Phase 11: Deployment & Publishing

**Objective:** Prepare and publish the app to app stores.

**Tasks:**

- [ ] Create app assets:
  - App icon (1024x1024)
  - Splash screen
  - Store screenshots
  - App description and metadata

- [ ] Configure `app.json`:
  ```json
  {
    "expo": {
      "name": "AI Life Personal Assistant",
      "slug": "life-pa",
      "version": "1.0.0",
      "icon": "./assets/icon.png",
      "splash": { 
        "image": "./assets/splash-icon.png",
        "resizeMode": "contain",
        "backgroundColor": "#ffffff"
      },
      "ios": { "bundleIdentifier": "com.lifepa.app" },
      "android": { 
        "package": "com.lifepa.app",
        "permissions": ["CAMERA", "NOTIFICATIONS", "READ_EXTERNAL_STORAGE"]
      }
    }
  }
  ```

- [ ] Setup Expo EAS:
  ```bash
  npm install -g eas-cli
  eas login
  eas build:configure
  ```

- [ ] Build for Android:
  ```bash
  eas build -p android
  ```

- [ ] Build for iOS:
  ```bash
  eas build -p ios
  ```

- [ ] Test builds thoroughly
- [ ] Create Play Store listing
- [ ] Create App Store listing
- [ ] Submit for review
- [ ] Publish releases

---

## 🔄 Phase 12: Post-Launch & Advanced Features [OPTIONAL]

**Objective:** Add advanced features and improvements based on user feedback and expand app capabilities.

**Ideas to Consider:**

- [ ] Analytics integration (Firebase Analytics, Amplitude)
- [ ] Crash reporting (Sentry, Bugsnag)
- [ ] Push notifications (for reminders backup/sync)
- [ ] Cloud sync across devices
- [ ] Advanced AI features:
  - Context-aware suggestions
  - Smart reminder creation from chat
  - Automatic receipt categorization using AI
  - Voice commands and voice responses
- [ ] Calendar integration (sync reminders with Google Calendar, Apple Calendar)
- [ ] Email integration (send receipts/summaries via email)
- [ ] Social sharing (share receipts, export data)
- [ ] Advanced export options (PDF reports, CSV exports)
- [ ] Multi-language support (i18n)
- [ ] Accessibility improvements (screen reader, high contrast)
- [ ] Widget support (home screen widgets for quick actions)
- [ ] Apple Watch / Wear OS companion app
- [ ] Collaboration features (shared reminders/receipts)
- [ ] Advanced OCR with machine learning
- [ ] Receipt expense tracking and budget insights
- [ ] Integration with accounting software (QuickBooks, Xero)
- [ ] In-app purchases / premium features subscription



---

## ✅ Summary Table

| Phase | Status | Deliverable | Key Components |
|-------|--------|-------------|----------------|
| 1 | ✅ Complete | Project Setup | Expo scaffold, folder structure |
| 2 | ✅ Complete | Auth & Navigation | Firebase auth, Login/Signup screens, Navigation |
| 3 | 🔨 Build | UI Layout & Home | Bottom tabs, dashboard, theme setup |
| 4 | 🤖 Build | AI Chat Assistant | OpenAI GPT integration, chat interface |
| 5 | ⏰ Build | Smart Reminders | Notifications, reminder CRUD, categories |
| 6 | 📸 Build | Receipt Scanning | Camera, OCR, receipt storage |
| 7 | 🗄️ Build | Data Management | Firestore rules, security, indexes |
| 8 | 🎨 Build | UI Polish | Consistent styling, animations, themes |
| 9 | 🔍 Build | Search & Settings | Search/filter, settings, profile, API keys |
| 10 | 🧪 Build | Testing | Unit tests, integration tests, QA |
| 11 | 🚀 Build | Deployment | App store builds and submission |
| 12 | 🔄 Optional | Advanced Features | Analytics, calendar sync, widgets, premium |

---

## 🎬 Quick Start Guide

**Getting Started with AI Life Personal Assistant:**

1. **Prerequisites Setup:**
   - ✅ Expo project created (Life_PA)
   - ✅ Firebase project created and configured
   - ✅ OpenAI API key obtained
   - ✅ Phase 1 & 2 baseline complete

2. **Phase Execution:**
   - Start with Phase 3 (UI Layout & Home Screen)
   - Highlight the entire phase section
   - Press Ctrl+I (or Cmd+I) to open Cursor AI
   - Ask: "Implement this phase as described"
   - Test the implementation before moving forward

3. **Recommended Order:**
   - **Phase 3:** Set up navigation and home dashboard (foundation)
   - **Phase 4:** Implement AI chat (core feature)
   - **Phase 5:** Add reminders system (high-value feature)
   - **Phase 6:** Implement receipt scanning (differentiation)
   - **Phase 7:** Set up data management and security
   - **Phase 8:** Polish UI for better UX
   - **Phase 9:** Add search/filter and settings
   - **Phase 10:** Test thoroughly
   - **Phase 11:** Deploy to stores

4. **Testing After Each Phase:**
   - Run `npm start` to launch Expo
   - Test on both iOS and Android if possible
   - Verify all features work as expected
   - Check console for errors

5. **Configuration Checklist:**
   - [ ] Firebase config added to `src/services/firebase.js`
   - [ ] OpenAI API key stored securely
   - [ ] App permissions configured in `app.json`
   - [ ] Navigation structure set up
   - [ ] Theme and colors defined

---

## 📋 Firebase Setup Reminder

Before running Phase 2, create a Firebase project:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Enable Authentication (Email/Password + Google)
4. Enable Firestore Database
5. Get your config and add to `src/services/firebase.js`:

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

---

## 💡 Tips for Success

- **Start small:** Get Phase 1-2 baseline working, then build incrementally
- **Test frequently:** Run `npm start` (or `npx expo start`) after each phase
- **Use git branches:** Create a branch for each phase to track progress
- **Check logs:** Use `console.log` liberally during development
- **Expo Go app:** Install on your phone for real-device testing
- **API Keys:** Store OpenAI API key securely (never commit to git)
- **Permissions:** Test camera and notification permissions on real devices
- **Error handling:** Always handle API errors gracefully (OpenAI, Firestore, OCR)
- **Offline support:** Enable Firestore offline persistence for better UX
- **Budget awareness:** Monitor OpenAI API usage to control costs
- **OCR accuracy:** Test with various receipt types to tune OCR settings
- **Documentation:** Keep notes on customizations and configurations

---

**Project:** AI Life Personal Assistant  
**Last Updated:** October 2025  
**Tech Stack:** Expo SDK 51, Firebase (Auth + Firestore), React Navigation, OpenAI GPT, OCR  
**Status:** Phase 1-2 Complete (Baseline Ready) | Phase 3+ In Development


