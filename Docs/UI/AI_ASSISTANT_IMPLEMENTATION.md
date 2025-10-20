# AI Assistant Implementation Guide

**Status:** ✅ Fully Implemented  
**Date Updated:** October 20, 2025

---

## 📋 Overview

The AI Assistant is a conversational AI feature that enables users to interact with their Life PA app through natural language. It supports multiple AI providers, function calling (tool use), and conversational memory, allowing users to create events, set reminders, view tasks, and more through chat.

### Key Features

- 🤖 **Multi-Provider Support** - Choose between OpenAI (GPT), Cohere, or Hugging Face
- 🛠️ **Function Calling** - AI can execute actions like creating events and reminders
- 💬 **Conversation History** - Persistent chat conversations stored in Firestore
- 📅 **Contextual Awareness** - AI understands current date/time for scheduling
- 🔄 **Message Regeneration** - Regenerate AI responses if needed
- 🎨 **Modern UI** - Clean chat interface with message bubbles and input
- 🔐 **Secure** - API keys stored locally, conversations tied to user authentication

---

## 🏗️ Architecture

### Component Structure

```
AI Assistant System
├── Chat Interface (ChatScreen.jsx)
│   ├── MessageBubble.jsx - Display chat messages
│   └── ChatInput.jsx - User input component
│
├── Service Layer
│   ├── aiService.js - Unified AI provider management
│   ├── chatService.js - Firestore conversation CRUD
│   ├── openai.js - OpenAI GPT integration
│   ├── cohere.js - Cohere API integration
│   ├── huggingface.js - Hugging Face API integration
│   └── functionExecutor.js - AI tool execution
│
├── AI Tools System
│   ├── aiTools.js - Tool definitions
│   └── Function handlers:
│       ├── create_event - Creates calendar events
│       ├── set_reminder - Sets reminders
│       ├── view_upcoming_tasks - Shows schedule
│       └── scan_receipt - Triggers receipt scanner
│
└── Configuration
    ├── AIProviderSetupScreen.jsx - Provider & API key setup
    └── SettingsScreen.jsx - Access point for settings
```

---

## 🔧 Services Breakdown

### 1. aiService.js - Unified AI Provider Management

**Purpose:** Central service that manages multiple AI providers and routes requests to the appropriate provider.

**Key Functions:**

```javascript
// Get/Set current provider
getCurrentProvider() → Promise<string>
setCurrentProvider(provider) → Promise<void>

// Initialize all AI clients on app start
initializeAIClients() → Promise<Object>

// Check if current provider is ready
isProviderInitialized() → Promise<boolean>

// Send message using current provider
sendChatMessage(messages, options) → Promise<string|Object>

// API key management
getCurrentProviderAPIKey() → Promise<string|null>
storeProviderAPIKey(provider, apiKey) → Promise<void>
validateProviderAPIKey(provider, apiKey) → Promise<boolean>
removeProviderAPIKey(provider) → Promise<void>
```

**Supported Providers:**
- `AI_PROVIDERS.OPENAI` - OpenAI GPT (Premium, Paid)
- `AI_PROVIDERS.COHERE` - Cohere (Free tier available)
- `AI_PROVIDERS.HUGGINGFACE` - Hugging Face (Free)

**Provider Selection Logic:**
1. Default provider is Cohere (free and reliable)
2. Users can switch providers in Settings → AI Provider Setup
3. Each provider has its own API key storage
4. Provider choice persists across app sessions

---

### 2. chatService.js - Conversation Management

**Purpose:** Handles CRUD operations for chat conversations in Firestore.

**Key Functions:**

```javascript
// Create a new conversation
createConversation(title?) → Promise<conversationId>

// Get all user's conversations
getConversations() → Promise<Array<Conversation>>

// Get specific conversation
getConversation(conversationId) → Promise<Conversation>

// Add message to conversation
addMessage(conversationId, role, content) → Promise<void>

// Update conversation title
updateConversationTitle(conversationId, title) → Promise<void>

// Delete conversation
deleteConversation(conversationId) → Promise<void>

// Clear all conversations
clearAllConversations() → Promise<void>
```

**Firestore Schema:**

```javascript
// Collection: conversations
{
  id: "auto-generated",
  userId: "firebase-user-id",
  title: "Auto-generated from first message",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  messages: [
    {
      id: "timestamp-based-id",
      role: "user" | "assistant",
      content: "message text",
      timestamp: Date,
      isToolResult?: boolean
    }
  ]
}
```

**Security Rules:**
- Only authenticated users can access conversations
- Users can only access their own conversations
- Verified by checking `userId === user.uid`

---

### 3. Provider Services (openai.js, cohere.js, huggingface.js)

Each provider service implements:

**Common Interface:**
```javascript
// Store/retrieve API key
storeXKey(apiKey) → Promise<void>
getStoredXKey() → Promise<string|null>
removeXKey() → Promise<void>

// Initialize client
initializeXClientOnStart() → Promise<boolean>

// Send chat message
sendXChatMessage(messages, options) → Promise<string|Object>

// Validate API key
validateXKey(apiKey) → Promise<boolean>
```

**Provider-Specific Details:**

#### OpenAI (openai.js)
- Uses official OpenAI SDK
- Model: `gpt-3.5-turbo`
- Supports function calling natively
- Requires billing setup
- Cost: ~$0.002 per message

#### Cohere (cohere.js)
- Uses Cohere REST API
- Model: `command-r-08-2024`
- Supports function calling via tools parameter
- Free tier: 1000 API calls/month
- Recommended default provider

#### Hugging Face (huggingface.js)
- Uses Hugging Face Inference API
- Model: GPT-2 based
- Limited function calling support
- Free tier available
- Experimental status

---

### 4. functionExecutor.js - AI Tool Execution

**Purpose:** Executes AI function calls and integrates with app features.

**Main Functions:**

```javascript
// Execute a single function
executeFunction(functionName, parameters) → Promise<Result>

// Execute multiple function calls in sequence
executeToolCalls(toolCalls) → Promise<Array<Result>>
```

**Available Functions:**

#### create_event(params)
Creates a calendar event in Firestore.

**Parameters:**
- `title` (required): Event name
- `date` (required): Date in YYYY-MM-DD format
- `time` (required): Time in HH:MM format (24-hour)
- `description` (optional): Event details
- `category` (optional): Event category (work, personal, health, etc.)

**Process:**
1. Parse natural language date/time
2. Combine into datetime object
3. Save to Firestore `events` collection
4. Return success message with event details

#### set_reminder(params)
Creates a reminder in Firestore.

**Parameters:**
- `title` (required): What to be reminded about
- `date` (required): Date in YYYY-MM-DD format
- `time` (required): Time in HH:MM format
- `notes` (optional): Additional information

**Process:**
1. Parse date/time
2. Create datetime object
3. Save to Firestore `reminders` collection
4. Mark as incomplete
5. Return confirmation

#### view_upcoming_tasks(params)
Retrieves upcoming events and reminders.

**Parameters:**
- `days` (optional): Number of days to look ahead (default: 7)

**Process:**
1. Query events and reminders from Firestore
2. Filter by date range and user ID
3. Sort by datetime
4. Format as readable list
5. Return formatted message

#### scan_receipt()
Triggers navigation to receipt scanner.

**Process:**
1. Return special action flag: `navigate_to_scan`
2. ChatScreen detects this flag
3. Navigates user to ScanReceiptScreen
4. User can scan receipt

---

### 5. aiTools.js - Tool Definitions

**Purpose:** Defines the tools/functions available to the AI.

**AI_TOOLS Array:**
Each tool follows this structure:
```javascript
{
  name: "function_name",
  description: "What this function does",
  parameter_definitions: {
    param_name: {
      description: "What this parameter is for",
      type: "string" | "number",
      required: true | false
    }
  }
}
```

**Helper Functions:**

#### getCurrentDateTimeContext()
Provides temporal context to the AI.
```javascript
Returns: {
  today: "2025-10-20",
  currentTime: "14:30",
  dayOfWeek: "Monday",
  timestamp: "2025-10-20T14:30:00.000Z"
}
```

#### parseNaturalDate(dateString)
Converts natural language to YYYY-MM-DD format.

**Supported formats:**
- "today" → Current date
- "tomorrow" → Next day
- "next monday" → Next occurrence of day
- "in 3 days" → Date X days from now
- "2025-10-20" → Passes through

#### parseNaturalTime(timeString)
Converts natural language to HH:MM format (24-hour).

**Supported formats:**
- "2pm" → "14:00"
- "2:30pm" → "14:30"
- "14:30" → "14:30"
- "noon" → "12:00"
- "midnight" → "00:00"

---

## 🎨 User Interface Components

### ChatScreen.jsx

**Main Chat Interface**

**Features:**
- Header with title and close button
- Scrollable message list with auto-scroll
- Empty state for new conversations
- Pull-to-refresh
- Chat input with send button
- Loading indicators

**Message Flow:**
1. User types message → Sent immediately to UI
2. Message saved to Firestore
3. AI processes with context (date/time)
4. AI response received
5. If tool calls exist:
   - Execute functions
   - Display tool results
   - Handle special actions (navigation)
6. Otherwise, display text response
7. Save AI message to Firestore

**Key State:**
```javascript
const [conversation, setConversation] = useState(null);
const [messages, setMessages] = useState([]);
const [loading, setLoading] = useState(false);
const [sendingMessage, setSendingMessage] = useState(false);
```

**Message Structure:**
```javascript
{
  id: "unique-id",
  role: "user" | "assistant",
  content: "message text",
  timestamp: Date,
  isToolResult?: boolean  // For function execution results
}
```

---

### MessageBubble.jsx

**Individual Message Display**

**Features:**
- User messages (right-aligned, blue)
- Assistant messages (left-aligned, green)
- Timestamp display
- Long-press menu:
  - Copy message
  - Regenerate response (last message only)

**Styling:**
- User: Blue background, white text
- Assistant: Green background, white text
- Tool results: Special formatting with checkmarks/X marks

---

### ChatInput.jsx

**Message Input Component**

**Features:**
- Multi-line text input
- Send button (only enabled when text present)
- Loading state (disabled during AI processing)
- Auto-grows with content
- Keyboard-aware

---

### AIProviderSetupScreen.jsx

**Provider Configuration Interface**

**Features:**
- Provider selection (radio buttons)
- Current API key display (masked)
- API key input with confirmation
- Validation on save
- Quick save without validation
- Remove key option
- Instructions for each provider
- Direct links to API key pages

**Provider Cards:**
```
✨ Cohere (FREE & Reliable) - Recommended
🤖 OpenAI GPT (Premium, Paid)
🤗 Hugging Face (FREE, Experimental)
```

**Validation Flow:**
1. User enters API key twice (confirmation)
2. Keys must match
3. Key validated against provider API
4. If valid, saved to AsyncStorage
5. Success message displayed

---

## 🔄 Message Flow Diagram

```
User Input
    ↓
ChatScreen.handleSendMessage()
    ↓
Add user message to UI immediately
    ↓
Save to Firestore via chatService.addMessage()
    ↓
Add system context (date/time)
    ↓
Send to AI via aiService.sendChatMessage()
    ↓
    ├─→ Text only response
    │   └─→ Display text
    │       └─→ Save to Firestore
    │
    └─→ Tool calls detected
        ↓
        executeToolCalls()
        ↓
        Display tool execution results
        ↓
        Save results to Firestore
        ↓
        Check for special actions
        └─→ Navigate if needed (e.g., scan_receipt)
```

---

## 🔐 Security & Privacy

### API Key Storage
- Keys stored in AsyncStorage (mobile) or localStorage (web)
- Keys never sent to backend
- Keys only sent to selected AI provider
- Each provider's key stored separately

### User Data Protection
- All conversations require authentication
- Conversations filtered by userId
- Firestore rules enforce user ownership
- Events/reminders tied to user account

### Recommended Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Conversations
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    // Events
    match /events/{eventId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    // Reminders
    match /reminders/{reminderId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 🚀 Setup & Configuration

### 1. Install Dependencies

The following packages should already be installed:
```bash
npm install firebase
npm install @react-native-async-storage/async-storage
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
```

### 2. Configure Firebase

Ensure `src/services/firebase.js` has your Firebase config:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

Enable Firestore in Firebase Console:
1. Go to Firestore Database
2. Create database
3. Start in test mode (configure rules later)

### 3. Setup AI Provider

**Option A: Cohere (Recommended - Free)**
1. Go to https://dashboard.cohere.com/api-keys
2. Sign up for free account (no credit card needed)
3. Copy your Trial API Key
4. In app: Settings → AI Provider Setup
5. Select Cohere
6. Paste API key
7. Save

**Option B: OpenAI (Premium)**
1. Go to https://platform.openai.com/api-keys
2. Sign in (requires billing setup)
3. Create new secret key
4. In app: Settings → AI Provider Setup
5. Select OpenAI
6. Paste API key
7. Save

**Option C: Hugging Face (Free, Experimental)**
1. Go to https://huggingface.co/settings/tokens
2. Create free account
3. Create fine-grained token
4. Check "Make calls to Inference Providers"
5. In app: Settings → AI Provider Setup
6. Select Hugging Face
7. Paste token
8. Save

### 4. Firestore Indexes

Some queries require composite indexes. Create these in Firebase Console:

**events collection:**
```
userId (Ascending)
datetime (Ascending)
```

**reminders collection:**
```
userId (Ascending)
datetime (Ascending)
completed (Ascending)
```

Firebase will prompt you with direct links when these are needed.

---

## 🧪 Testing Guide

### Test Scenarios

#### 1. Basic Chat
- Open chat screen
- Send "Hello"
- Verify AI responds
- Check message saved in Firestore

#### 2. Event Creation
- Send: "Create an event called Team Meeting tomorrow at 2pm"
- Verify AI creates event
- Check Events collection in Firestore
- Verify success message shown

#### 3. Reminder Setting
- Send: "Remind me to call mom next Monday at 10am"
- Verify reminder created
- Check Reminders collection
- Verify confirmation message

#### 4. View Tasks
- Send: "What do I have coming up?"
- Verify AI shows upcoming events/reminders
- Check correct date filtering

#### 5. Receipt Scanning
- Send: "I want to scan a receipt"
- Verify app navigates to ScanReceiptScreen

#### 6. Natural Language Parsing
Test various date/time formats:
- "tomorrow at 3pm"
- "next Friday at noon"
- "in 3 days at 14:30"
- "today at midnight"

#### 7. Conversation Persistence
- Create conversation
- Send multiple messages
- Close app
- Reopen app
- Navigate to same conversation
- Verify messages persist

#### 8. Provider Switching
- Set up multiple providers
- Switch between providers in settings
- Test chat with each provider
- Verify all work correctly

#### 9. Error Handling
- Remove API key
- Try to send message
- Verify error message: "API Key Required"
- Verify prompt to go to Settings

#### 10. Message Regeneration
- Send message
- Wait for AI response
- Long-press last AI message
- Select "Regenerate"
- Verify new response generated

---

## 📝 Code Examples

### Sending a Chat Message

```javascript
import { sendChatMessage } from '../services/aiService';
import { AI_TOOLS, getCurrentDateTimeContext } from '../services/aiTools';

const handleSendMessage = async (userMessage) => {
  // Add system context
  const dateTimeContext = getCurrentDateTimeContext();
  const systemMessage = {
    role: 'system',
    content: `Today is ${dateTimeContext.today}, ${dateTimeContext.dayOfWeek}`,
  };

  // Prepare messages
  const messages = [
    systemMessage,
    { role: 'user', content: userMessage }
  ];

  // Send with tools
  const response = await sendChatMessage(messages, { tools: AI_TOOLS });
  
  // Handle response
  if (response.tool_calls) {
    // Execute functions
    const results = await executeToolCalls(response.tool_calls);
    console.log('Function results:', results);
  } else {
    // Display text
    console.log('AI response:', response.text);
  }
};
```

### Creating a Custom Tool

```javascript
// In aiTools.js
export const AI_TOOLS = [
  // ... existing tools
  {
    name: 'get_weather',
    description: 'Get current weather for a location',
    parameter_definitions: {
      location: {
        description: 'City name or zip code',
        type: 'string',
        required: true,
      }
    }
  }
];

// In functionExecutor.js
const getWeather = async (params) => {
  const { location } = params;
  // Your weather API logic here
  return {
    success: true,
    message: `Weather for ${location}: Sunny, 72°F`
  };
};

// Add to switch statement in executeFunction
case 'get_weather':
  return await getWeather(parameters);
```

### Accessing Current User in Functions

```javascript
import { getCurrentUser } from '../services/auth';

const myFunction = async (params) => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  console.log('Current user:', user.uid, user.email);
  // Your logic here
};
```

---

## 🐛 Troubleshooting

### "API Key Required" Error

**Cause:** No API key set for current provider  
**Solution:**
1. Go to Settings → AI Provider Setup
2. Select a provider
3. Enter and save API key

### Messages Not Saving

**Cause:** Firestore rules or connectivity issue  
**Solution:**
1. Check Firebase Console → Firestore
2. Verify rules allow authenticated writes
3. Check network connectivity
4. Check browser console for errors

### Function Calls Not Working

**Cause:** Provider doesn't support function calling, or tools not passed correctly  
**Solution:**
1. Verify using OpenAI or Cohere (not Hugging Face)
2. Check `AI_TOOLS` is passed in options: `{ tools: AI_TOOLS }`
3. Check console logs for tool_calls in response
4. Verify function names match exactly

### Tool Execution Fails

**Cause:** Invalid parameters or missing permissions  
**Solution:**
1. Check console logs for error details
2. Verify user is authenticated
3. Check date/time parsing
4. Verify Firestore collections exist

### "Invalid API Key" Error

**Cause:** API key is wrong or expired  
**Solution:**
1. Go to provider's website
2. Generate new API key
3. Update in app settings
4. For Cohere/OpenAI, check billing status

### Chat Screen Freezes

**Cause:** Long response or infinite loop  
**Solution:**
1. Check console for errors
2. Kill and restart app
3. Check message history length
4. Consider implementing message limit

---

## 🎯 Future Enhancements

### Planned Features
- [ ] Voice input/output (speech-to-text, text-to-speech)
- [ ] Conversation search
- [ ] Message editing
- [ ] Conversation export
- [ ] AI-suggested responses
- [ ] Context from other app features
- [ ] Multiple conversation tabs
- [ ] Rich media messages (images, files)
- [ ] Conversation sharing
- [ ] AI personality customization

### Possible Tools to Add
- `update_event` - Modify existing events
- `delete_event` - Remove events
- `complete_reminder` - Mark reminders done
- `search_tasks` - Search events/reminders
- `get_weather` - Weather information
- `send_email` - Draft emails
- `create_note` - Quick notes
- `calculate` - Math calculations
- `web_search` - Search web for info

---

## 📚 Resources

### Documentation
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [Cohere Tools (Function Calling)](https://docs.cohere.com/docs/tools)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [React Navigation](https://reactnavigation.org/)

### API References
- [OpenAI API](https://platform.openai.com/docs/api-reference)
- [Cohere API](https://docs.cohere.com/reference/about)
- [Hugging Face Inference API](https://huggingface.co/docs/api-inference)

### Community
- [Expo Forums](https://forums.expo.dev/)
- [React Native Community](https://www.reactnative.dev/community/overview)

---

## ✅ Implementation Checklist

Use this checklist to verify your implementation:

### Core Services
- [x] aiService.js - Multi-provider support
- [x] chatService.js - Firestore conversations
- [x] openai.js - OpenAI integration
- [x] cohere.js - Cohere integration
- [x] huggingface.js - Hugging Face integration
- [x] functionExecutor.js - Tool execution
- [x] aiTools.js - Tool definitions

### UI Components
- [x] ChatScreen.jsx - Main chat interface
- [x] MessageBubble.jsx - Message display
- [x] ChatInput.jsx - User input
- [x] AIProviderSetupScreen.jsx - Configuration

### Functions/Tools
- [x] create_event - Creates events
- [x] set_reminder - Sets reminders
- [x] view_upcoming_tasks - Shows schedule
- [x] scan_receipt - Opens scanner
- [x] Natural date parsing
- [x] Natural time parsing

### Features
- [x] Multi-provider switching
- [x] API key validation
- [x] Conversation persistence
- [x] Message history
- [x] Auto-scroll
- [x] Empty states
- [x] Loading indicators
- [x] Error handling
- [x] Message regeneration
- [x] Tool execution feedback
- [x] Navigation integration

### Configuration
- [x] Firebase setup
- [x] Firestore collections
- [x] Security rules
- [x] Provider selection
- [x] API key storage

---

## 🎉 Conclusion

The AI Assistant is a fully-featured conversational AI system that integrates deeply with the Life PA app. It demonstrates:

- **Flexibility** - Multiple AI providers
- **Functionality** - Real tool execution
- **Usability** - Intuitive chat interface
- **Security** - Proper authentication and data protection
- **Scalability** - Easy to add new tools and features

This implementation provides a solid foundation for building advanced AI-powered personal assistant capabilities.

---

**Last Updated:** October 20, 2025  
**Version:** 1.0  
**Status:** Production Ready ✅

