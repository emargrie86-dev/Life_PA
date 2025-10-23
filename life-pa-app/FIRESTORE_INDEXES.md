# Firestore Index Configuration

## Overview
This document lists all required Firestore composite indexes for the Life PA application.

---

## Required Indexes

### 1. Events Collection

**Index Name:** `events_user_datetime`
```
Collection ID: events
Fields:
  - userId (Ascending)
  - datetime (Ascending)
```

**Used By:**
- `functionExecutor.js` - `viewUpcomingTasks()`
- `taskService.js` - `getTasks()`

**Query Pattern:**
```javascript
query(
  collection(db, 'events'),
  where('userId', '==', user.uid),
  orderBy('datetime', 'asc')
)
```

---

### 2. Reminders Collection

**Index Name:** `reminders_user_datetime`
```
Collection ID: reminders
Fields:
  - userId (Ascending)
  - datetime (Ascending)
```

**Used By:**
- `functionExecutor.js` - `viewUpcomingTasks()`
- `taskService.js` - `getTasks()`

**Query Pattern:**
```javascript
query(
  collection(db, 'reminders'),
  where('userId', '==', user.uid),
  orderBy('datetime', 'asc')
)
```

---

### 3. Reminders with Completion Status

**Index Name:** `reminders_user_datetime_completed`
```
Collection ID: reminders
Fields:
  - userId (Ascending)
  - datetime (Ascending)
  - completed (Ascending)
```

**Used By:**
- `functionExecutor.js` - `viewUpcomingTasks()` (for date range queries with completed filter)

**Query Pattern:**
```javascript
query(
  collection(db, 'reminders'),
  where('userId', '==', user.uid),
  where('datetime', '>=', startDate),
  where('datetime', '<=', endDate),
  where('completed', '==', false),
  orderBy('datetime', 'asc')
)
```

---

### 4. Events with Date Range

**Index Name:** `events_user_datetime_range`
```
Collection ID: events
Fields:
  - userId (Ascending)
  - datetime (Ascending)
```

**Used By:**
- `functionExecutor.js` - `viewUpcomingTasks()` (for date range queries)

**Query Pattern:**
```javascript
query(
  collection(db, 'events'),
  where('userId', '==', user.uid),
  where('datetime', '>=', startDate),
  where('datetime', '<=', endDate),
  orderBy('datetime', 'asc')
)
```

---

### 5. Receipts/Documents by Date

**Index Name:** `receipts_user_date`
```
Collection ID: receipts
Fields:
  - userId (Ascending)
  - date (Descending)
```

**Used By:**
- `documentService.js` - `getUserDocuments()`

**Query Pattern:**
```javascript
query(
  collection(db, 'receipts'),
  where('userId', '==', user.uid),
  orderBy('date', 'desc'),
  limit(100)
)
```

---

### 6. Receipts/Documents by Category

**Index Name:** `receipts_user_category_date`
```
Collection ID: receipts
Fields:
  - userId (Ascending)
  - category (Ascending)
  - date (Descending)
```

**Used By:**
- `documentService.js` - `getDocumentsByCategory()`

**Query Pattern:**
```javascript
query(
  collection(db, 'receipts'),
  where('userId', '==', user.uid),
  where('category', '==', category),
  orderBy('date', 'desc')
)
```

---

### 7. Conversations by User

**Index Name:** `conversations_user_updated`
```
Collection ID: conversations
Fields:
  - userId (Ascending)
  - updatedAt (Descending)
```

**Used By:**
- `chatService.js` - `getConversations()`

**Query Pattern:**
```javascript
query(
  collection(db, 'conversations'),
  where('userId', '==', user.uid),
  orderBy('updatedAt', 'desc')
)
```

---

## How to Create Indexes

### Method 1: Automatic (Recommended)

1. **Run the app** and trigger queries that need indexes
2. **Check the browser console** or Firebase logs
3. **Click the index creation link** in the error message
4. Firebase will automatically create the required index

**Example Error:**
```
The query requires an index. You can create it here:
https://console.firebase.google.com/project/life-pa-d1d6c/firestore/indexes?create_composite=...
```

---

### Method 2: Manual Creation

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`life-pa-d1d6c`)
3. Navigate to **Firestore Database** → **Indexes**
4. Click **Create Index**
5. Fill in the details from the specifications above
6. Click **Create**

**Index Creation Time:** Usually 1-5 minutes

---

### Method 3: Using firestore.indexes.json

Create a `firestore.indexes.json` file:

```json
{
  "indexes": [
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "datetime", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "reminders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "datetime", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "reminders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "datetime", "order": "ASCENDING" },
        { "fieldPath": "completed", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "receipts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "receipts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "conversations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Deploy using Firebase CLI:
```bash
firebase deploy --only firestore:indexes
```

---

## Index Status

Check index status in Firebase Console:
- **Building:** Index is being created (wait 1-5 minutes)
- **Enabled:** Index is ready to use
- **Error:** Check configuration and retry

---

## Performance Considerations

### Index Size
- Each index consumes storage space
- Minimal impact for most apps (<1000 documents)
- Monitor index size in Firebase Console

### Query Performance
- **With Index:** <100ms for most queries
- **Without Index:** May timeout or fail
- Always create required indexes before production

### Write Performance
- Indexes slightly slow down writes
- Impact is negligible for this app's use case
- Each document write updates all relevant indexes

---

## Troubleshooting

### Index Not Working
1. **Wait 1-5 minutes** after creation
2. **Refresh the page** to clear cached errors
3. **Check index status** in Firebase Console
4. **Verify field names** match exactly (case-sensitive)

### Query Still Failing
1. **Check field order** (Ascending vs Descending)
2. **Verify collection name** is correct
3. **Ensure userId field** exists in documents
4. **Check Firestore rules** allow the query

### Too Many Indexes
- Review queries for optimization opportunities
- Combine similar queries when possible
- Remove unused indexes

---

## Best Practices

### Do:
✅ Create indexes before production deployment  
✅ Test queries with real data  
✅ Monitor index usage in Firebase Console  
✅ Document new indexes when adding queries  
✅ Use composite indexes for multi-field queries  

### Don't:
❌ Create unnecessary indexes  
❌ Use indexes for simple single-field queries  
❌ Ignore index creation errors  
❌ Deploy without testing queries  
❌ Create duplicate indexes  

---

## Maintenance

### Regular Checks
- **Monthly:** Review index usage statistics
- **Quarterly:** Remove unused indexes
- **After updates:** Test new queries require indexes

### Cleanup
Remove indexes that are:
- No longer used by any queries
- Duplicates of other indexes
- For deleted collections

---

## Security Rules

Ensure your Firestore security rules allow these queries:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Events
    match /events/{eventId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Reminders
    match /reminders/{reminderId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Receipts/Documents
    match /receipts/{receiptId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Conversations
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## Quick Reference

| Collection | Fields | Order | Status |
|------------|--------|-------|--------|
| events | userId, datetime | ASC, ASC | ⚠️ Required |
| reminders | userId, datetime | ASC, ASC | ⚠️ Required |
| reminders | userId, datetime, completed | ASC, ASC, ASC | ⚠️ Required |
| receipts | userId, date | ASC, DESC | ⚠️ Required |
| receipts | userId, category, date | ASC, ASC, DESC | ⚠️ Required |
| conversations | userId, updatedAt | ASC, DESC | ⚠️ Required |

**Status Legend:**
- ⚠️ Required - Must create before production
- ✅ Optional - Improves performance
- ❌ Not needed - Query works without index

---

**Last Updated:** October 23, 2025  
**Firebase Project:** life-pa-d1d6c

