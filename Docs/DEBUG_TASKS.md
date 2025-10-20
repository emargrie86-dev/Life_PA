# Debug: Buy Groceries Keep Appearing

## Step 1: Check Console Logs

When you open View Tasks, look in the browser console for these messages:

```
Fetching tasks for user: cxAyUQPK...
Fetched X events
Fetched X reminders
Total tasks: X
Tasks: [array showing each task]
```

**Does "Buy groceries" appear in the "Tasks:" array?**
- If YES → It's in Firestore
- If NO → It's being added by the UI somehow

## Step 2: Check Firestore Directly

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **life-pa-d1d6c**
3. Go to **Firestore Database**
4. Click on **events** collection
5. Look through all documents - is there one with title "Buy groceries"?
6. Click on **reminders** collection  
7. Look through all documents - is there one with title "Buy groceries"?

**If you find "Buy groceries" in Firestore:**
- Click on the document
- Click the three dots (⋮) in the top right
- Click **Delete document**
- Refresh your app

## Step 3: Nuclear Option - Delete All Tasks

If it keeps coming back, let's start fresh. In your browser console:

```javascript
// This will show all tasks in Firestore
const getAllTasks = async () => {
  const { db } = await import('./src/services/firebase.js');
  const { collection, query, where, getDocs } = await import('firebase/firestore');
  
  const userId = 'cxAyUQPK1LURkSpWSfujFilQGqe2';
  
  // Get events
  const eventsQ = query(collection(db, 'events'), where('userId', '==', userId));
  const eventsSnap = await getDocs(eventsQ);
  console.log('=== EVENTS ===');
  eventsSnap.docs.forEach(doc => {
    console.log(doc.id, ':', doc.data().title);
  });
  
  // Get reminders
  const remindersQ = query(collection(db, 'reminders'), where('userId', '==', userId));
  const remindersSnap = await getDocs(remindersQ);
  console.log('=== REMINDERS ===');
  remindersSnap.docs.forEach(doc => {
    console.log(doc.id, ':', doc.data().title);
  });
};

getAllTasks();
```

This will list EVERYTHING in your Firestore. Tell me what you see!

