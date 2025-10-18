<!-- App Template — plan.md
     This is a reusable template for creating new Expo/React Native apps.
     
     🎯 HOW TO USE THIS TEMPLATE:
     1. Copy this entire file for your new project
     2. Replace "YOUR_APP_NAME" with your actual app name throughout
     3. Update the Goal section with your app's specific purpose
     4. Customize Phase 3+ with your app-specific features
     5. Phases 1-2 are pre-built: Project setup + Authentication (complete baseline)
     
     Cursor-ready: Highlight any section and press Ctrl+I (Windows) or Cmd+I (Mac)
-->

# 📱 YOUR_APP_NAME — Project Plan

> **Goal:** Cross-platform mobile app (Android + iOS) built with Expo & React Native.
> 
> **Template Status:** This template includes a complete baseline with:
> - ✅ Expo project setup (SDK 51)
> - ✅ Firebase authentication (email + Google)
> - ✅ Navigation structure ready
> 
> **Customize from Phase 3 onwards** with your app-specific features.
---

## ⚠️ Preconditions (do these first)
- Install Node.js (v16+)
- Install Expo CLI (optional): `npm install -g expo-cli` or use `npx create-expo-app`
- Version SDK 51
- Create a free Firebase project (we will add config later)
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
npx create-expo-app@latest your-app-name --template blank
cd your-app-name
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
/your-app-name
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

## 🎯 Phase 3: Core Feature #1 [CUSTOMIZE]

**⚠️ TEMPLATE - Replace with your app's main feature**

**Objective:** [Describe your primary feature - e.g., "Allow users to create and manage items", "Capture and process data", "Display and interact with content"]

**Tasks:**

- [ ] Define feature requirements
- [ ] Design user flow and UI mockups
- [ ] Implement data model/schema
- [ ] Create necessary screens and components
- [ ] Add business logic and validation
- [ ] Test feature end-to-end

**Example Schema (customize):**
```javascript
// Firestore collection: 'items'
{
  id: string,
  title: string,
  description: string,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  userId: string,
  // Add your specific fields here
}
```

**Example Files to Create:**
- `src/screens/Feature1Screen.jsx`
- `src/components/Feature1Component.jsx`
- `src/services/feature1Service.js`

---

## 🎯 Phase 4: Core Feature #2 [CUSTOMIZE]

**⚠️ TEMPLATE - Replace with your app's secondary feature**

**Objective:** [Describe your second major feature]

**Tasks:**

- [ ] Define feature requirements
- [ ] Design integration with existing features
- [ ] Implement feature logic
- [ ] Create UI components
- [ ] Add necessary API/service calls
- [ ] Test integration

---

## 🗄️ Phase 5: Data Management & Storage

**Objective:** Establish data schema, Firestore rules, and data helpers.

**Tasks:**

- [ ] Define all Firestore collections and schemas
- [ ] Create data service files (`src/services/dataService.js`)
- [ ] Implement CRUD operations for all entities
- [ ] Add Firestore security rules
- [ ] Setup indexes for queries
- [ ] Add data validation helpers
- [ ] Implement offline persistence (optional)

**Example Service Structure:**
```javascript
// src/services/dataService.js
export const createItem = async (userId, data) => { ... }
export const getItems = async (userId) => { ... }
export const updateItem = async (itemId, data) => { ... }
export const deleteItem = async (itemId) => { ... }
```

---

## 🎨 Phase 6: UI Polish & Theming

**Objective:** Create a cohesive, polished user interface with consistent styling.

**Tasks:**

- [ ] Install UI library (optional):
  ```bash
  npm install react-native-paper
  # OR
  npm install @rneui/themed @rneui/base
  ```

- [ ] Define global theme:
  - `src/theme/colors.js`
  - `src/theme/typography.js`
  - `src/theme/spacing.js`

- [ ] Create reusable components:
  - `src/components/Button.jsx`
  - `src/components/Card.jsx`
  - `src/components/Input.jsx`
  - `src/components/Header.jsx`

- [ ] Implement light/dark mode toggle (optional)
- [ ] Add loading states and skeleton screens
- [ ] Implement error boundaries
- [ ] Add success/error toast notifications

---

## 🔍 Phase 7: Search, Filter & Organization [OPTIONAL]

**Objective:** Enable users to find and organize content efficiently.

**Tasks:**

- [ ] Add search functionality
- [ ] Implement filtering options
- [ ] Add sorting capabilities (date, name, custom)
- [ ] Create categories or tags system (if applicable)
- [ ] Implement pagination or infinite scroll
- [ ] Add "favorites" or "bookmarks" feature

**Files to Create:**
- `src/components/SearchBar.jsx`
- `src/components/FilterModal.jsx`
- `src/utils/searchHelpers.js`

---

## ⚙️ Phase 8: Settings & User Profile

**Objective:** Allow users to customize app experience and manage their profile.

**Tasks:**

- [ ] Create Settings screen (`src/screens/SettingsScreen.jsx`)
- [ ] Create Profile screen (`src/screens/ProfileScreen.jsx`)
- [ ] Add profile photo upload functionality
- [ ] Implement user preferences storage (AsyncStorage)
- [ ] Add account management options:
  - Change password
  - Update email
  - Delete account
- [ ] Add app settings (notifications, theme, etc.)
- [ ] Implement logout functionality

---

## 🧪 Phase 9: Testing & Quality Assurance

**Objective:** Ensure app stability and quality across devices.

**Tasks:**

- [ ] Setup testing framework:
  ```bash
  npm install --save-dev jest @testing-library/react-native
  ```

- [ ] Write unit tests for:
  - Authentication helpers
  - Data services
  - Utility functions

- [ ] Write component tests for key UI elements
- [ ] Manual testing checklist:
  - [ ] Test on Android device/emulator
  - [ ] Test on iOS device/simulator
  - [ ] Test offline functionality
  - [ ] Test authentication flows
  - [ ] Test all CRUD operations
  - [ ] Test error handling

- [ ] Performance testing and optimization

---

## 🚀 Phase 10: Deployment & Publishing

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
      "name": "Your App Name",
      "slug": "your-app-name",
      "version": "1.0.0",
      "icon": "./assets/icon.png",
      "splash": { ... },
      "ios": { "bundleIdentifier": "com.yourcompany.yourapp" },
      "android": { "package": "com.yourcompany.yourapp" }
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

## 🔄 Phase 11: Post-Launch & Enhancements [OPTIONAL]

**Objective:** Add advanced features and improvements based on user feedback.

**Ideas to Consider:**

- [ ] Analytics integration (Firebase Analytics, Amplitude)
- [ ] Crash reporting (Sentry)
- [ ] Push notifications
- [ ] In-app purchases / subscriptions
- [ ] Social sharing
- [ ] Export/Import functionality
- [ ] Multi-language support (i18n)
- [ ] Accessibility improvements
- [ ] Advanced animations and transitions
- [ ] AI/ML features
- [ ] Integration with third-party APIs



---

## ✅ Summary Table

| Phase | Status | Deliverable | Key Components |
|-------|--------|-------------|----------------|
| 1 | ✅ Complete | Project Setup | Expo scaffold, folder structure |
| 2 | ✅ Complete | Auth & Navigation | Firebase auth, Login/Signup screens, Navigation |
| 3 | 📝 Customize | Core Feature #1 | [Your primary feature] |
| 4 | 📝 Customize | Core Feature #2 | [Your secondary feature] |
| 5 | 🔨 Build | Data Management | Firestore schemas, CRUD services |
| 6 | 🎨 Build | UI Polish | Theme, components, styling |
| 7 | ⚙️ Optional | Search & Filter | Search, sorting, organization |
| 8 | ⚙️ Build | Settings & Profile | User settings, profile management |
| 9 | 🧪 Build | Testing | Unit tests, integration tests |
| 10 | 🚀 Build | Deployment | App store builds and submission |
| 11 | 🔄 Optional | Enhancements | Analytics, notifications, advanced features |

---

## 🎬 Quick Start Guide

**For Your First App Using This Template:**

1. **Copy this template** to your new project repository

2. **Customize the header:**
   - Replace `YOUR_APP_NAME` with your actual app name
   - Update the Goal section with your app's purpose

3. **Run Phase 1 & 2** (if not already done):
   - These provide your authentication-ready baseline
   - Highlight Phase 1, press Ctrl+I (or Cmd+I), and execute
   - Then do the same for Phase 2
   - Don't forget to add your Firebase config!

4. **Customize Phase 3 onwards:**
   - Replace Phase 3 & 4 with your app's specific features
   - Keep or remove optional phases based on your needs
   - Update file names and component names to match your domain

5. **Execute phases incrementally:**
   - Highlight each phase section
   - Press Ctrl+I (or Cmd+I)
   - Ask Cursor to implement that phase
   - Test before moving to the next phase

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

- **Start small:** Get Phase 1-2 working before adding features
- **Test frequently:** Run `npx expo start` after each major change
- **Use git branches:** Create a branch for each phase
- **Check logs:** Use `console.log` liberally during development
- **Expo Go app:** Install on your phone for real-device testing
- **Documentation:** Keep notes on customizations you make

---

**Template Version:** 1.0  
**Last Updated:** October 2025  
**Baseline Includes:** Expo SDK 51, Firebase Auth, React Navigation


