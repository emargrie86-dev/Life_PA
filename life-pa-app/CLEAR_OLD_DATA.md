# Clear Old AsyncStorage Data

## Problem
"Buy groceries" and other old mock tasks keep appearing even though we switched to Firestore.

## Quick Fix

### Option 1: Browser Console (Fastest)
1. Open your app in the browser
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Paste this code and press Enter:

```javascript
// Clear old task data
localStorage.removeItem('@life_pa_tasks');
console.log('Old task data cleared! Refresh the page.');
```

5. **Refresh the page** (F5 or Ctrl+R)
6. Go to View Tasks - old mock data should be gone!

### Option 2: Clear All localStorage (Nuclear Option)
If that doesn't work:

1. Open Developer Tools (F12)
2. Go to **Application** tab (or **Storage** in some browsers)
3. On the left, expand **Local Storage**
4. Click on your app's URL
5. Look for `@life_pa_tasks` key
6. Right-click and **Delete**
7. Refresh the page

### Option 3: Add Debug Button (Permanent Solution)

Check the browser console when you load View Tasks. Look for:
```
Fetched X events
Fetched X reminders
Total tasks: X
Tasks: [array of tasks]
```

This will show if the "Buy groceries" is coming from Firestore or somewhere else.

## Why This Happens

The old `taskService.js` used AsyncStorage with mock data:
- Buy groceries
- Complete project proposal
- Gym workout
- Call dentist
- Review presentation

Even though we switched to Firestore, that old localStorage data might still exist in your browser.

## Verify It's Fixed

After clearing:
1. Refresh the app
2. Go to View Tasks
3. You should ONLY see:
   - Events created by AI (Team call, Meeting, etc.)
   - NO "Buy groceries" or other mock tasks

## If It Still Appears

Check your Firestore Console:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **life-pa-d1d6c**
3. Go to **Firestore Database**
4. Check the **events** and **reminders** collections
5. Look for any document with title "Buy groceries"
6. If found, delete it manually

The task definitely shouldn't be coming from the new code - we removed all mock data!

