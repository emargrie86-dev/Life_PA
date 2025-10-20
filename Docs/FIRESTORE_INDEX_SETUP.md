# Firestore Index Setup for View Tasks

## What Changed
The View Tasks screen now reads from Firestore (where AI creates events) instead of local storage.

## Potential Index Requirement

If you see an error like: **"The query requires an index"** when opening the View Tasks screen, you need to create Firestore indexes.

### How to Create Indexes

#### Option 1: Click the Link (Easiest)
1. When the error appears in the console, it will show a link
2. Click the link - it will open Firebase Console
3. Click **Create Index**
4. Wait 1-2 minutes for the index to build
5. Refresh the app

#### Option 2: Manual Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **life-pa-d1d6c**
3. Go to **Firestore Database** → **Indexes** tab
4. Click **Create Index**

**For Events Collection:**
- Collection ID: `events`
- Fields to index:
  - `userId` (Ascending)
  - `datetime` (Ascending)
- Query Scope: Collection

**For Reminders Collection:**
- Collection ID: `reminders`
- Fields to index:
  - `userId` (Ascending)
  - `datetime` (Ascending)
- Query Scope: Collection

5. Click **Create Index**
6. Wait for indexes to build (usually 1-2 minutes)

## Why Indexes Are Needed

Firestore requires indexes when you:
- Filter by one field (`where userId == ...`)
- AND sort by another field (`orderBy datetime`)

This is a security and performance feature of Firestore.

## Testing

After creating indexes (or if no index is needed):
1. Go to **View Tasks** screen
2. You should see your AI-created events!
3. Events will show with:
   - Title (e.g., "Team call")
   - Date/time
   - Category
   - Can be deleted

---

**Note**: Some Firestore configurations may not require manual index creation. If View Tasks loads without errors, you don't need to do anything!

