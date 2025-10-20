# AI Event Creation Debugging Guide

## Issue
The AI chatbot is not creating events when asked to do so.

## Changes Made
I've added extensive logging throughout the event creation flow to help identify where the issue is occurring.

### Files Updated
1. **cohere.js** - Added logging to see Cohere API responses and tool calls
2. **functionExecutor.js** - Added logging to track function execution
3. **ChatScreen.jsx** - Added logging to track tool call processing

## How to Test

### Step 1: Start the App
```bash
cd life-pa-app
npm start
```

### Step 2: Open Browser Console
- Press `w` to open in browser
- Open Developer Tools (F12)
- Go to Console tab

### Step 3: Test Event Creation
In the AI chat, try these messages:
- "Create an event called Meeting tomorrow at 2pm"
- "Schedule a dentist appointment for next Monday at 10am"
- "Add an event: Lunch with Sarah on Friday at 12:30"

### Step 4: Check Console Logs
Look for these log messages in order:

1. **"Sending message with tools enabled"** - Tools are being sent to AI
2. **"Tools being sent:"** - Check if AI_TOOLS are correct
3. **"Cohere response received:"** - The AI's full response
4. **"Cohere tool_calls detected:"** or **"No tool_calls in Cohere response"** - Whether AI wants to use tools

#### If you see "No tool_calls in Cohere response":
The AI is not recognizing that it should create an event. Possible causes:
- The prompt is not clear enough
- The tool definitions are not in the right format for Cohere
- The AI model doesn't understand the request

#### If you see "AI REQUESTED TOOL CALLS":
5. **"Tool calls to execute:"** - Check the format of tool calls
6. **"=== EXECUTING FUNCTION ==="** - Function executor is running
7. **"=== CREATE EVENT FUNCTION ==="** - createEvent is being called
8. **"User authenticated:"** - User is logged in
9. **"About to save event to Firestore:"** - Event data ready to save
10. **"Event created successfully with ID:"** - Event saved!

## Common Issues

### Issue 1: Firestore Security Rules
If you see "Firestore error creating event: Missing or insufficient permissions", you need to update Firestore rules.

#### Fix:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **life-pa-d1d6c**
3. Go to **Firestore Database** > **Rules**
4. Update rules to allow event creation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    match /events/{eventId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    match /reminders/{reminderId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

5. Click **Publish**

### Issue 2: AI Not Calling Tools
If Cohere isn't returning tool_calls, the issue is with how tools are formatted or the AI understanding.

**Check the tools format** in the console under "Tools being sent:". It should look like:
```json
[
  {
    "name": "create_event",
    "description": "Create a new calendar event...",
    "parameter_definitions": {
      "title": {
        "description": "The title/name of the event",
        "type": "string",
        "required": true
      },
      ...
    }
  }
]
```

### Issue 3: User Not Authenticated
If you see "User not authenticated", make sure you're logged in before trying to create events.

### Issue 4: Incorrect Tool Call Format
If the function executor receives tool calls but can't parse them, check the format in:
- **"Tool calls to execute:"** log

Expected format:
```json
[
  {
    "name": "create_event",
    "parameters": {
      "title": "Meeting",
      "date": "2025-10-21",
      "time": "14:00",
      "description": "",
      "category": "work"
    }
  }
]
```

## Next Steps Based on Logs

### If logs stop at "No tool_calls in Cohere response":
The AI isn't understanding it should create an event. We need to:
1. Improve the system prompt
2. Adjust tool descriptions
3. Try a more explicit command like "Use the create_event tool to schedule a meeting tomorrow at 2pm"

### If logs show tool calls but fail at execution:
Check the error message in "Firestore error creating event:" - this will tell us exactly what's wrong.

### If logs show successful creation:
Check if events are being saved:
1. Go to Firebase Console > Firestore Database
2. Look for "events" collection
3. Check if new documents appear when you create events

## Additional Debugging

### Check Current AI Provider
The default is Cohere. To verify:
1. Go to Settings in the app
2. Check which AI provider is selected
3. Make sure you have an API key set

### Test Event Creation Directly
To verify Firestore works, try creating an event through the UI:
1. Go to "Add Event" screen
2. Fill in the form
3. Submit
4. Check if it appears in "View Tasks"

If this works, the issue is only with AI tool calling, not Firestore.

## Contact Points
After running these tests, please share:
1. The full console log output
2. Which step the logs stop at
3. Any error messages you see
4. Whether manual event creation works

This will help us identify the exact issue and fix it.

