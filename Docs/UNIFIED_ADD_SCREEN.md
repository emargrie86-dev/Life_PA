# Unified Add Event/Task/Reminder Screen

## Overview
The "Add Event" and "Set Reminder" screens have been combined into a single unified screen that allows users to create Events, Tasks, or Reminders from one interface.

## Changes Made

### 1. **AddEventScreen.jsx** - Now Unified
The AddEventScreen has been enhanced to handle three different types of items:

#### **Type Selector**
- At the top of the screen, users can select between:
  - **Event**: For scheduled events with start/end times and location
  - **Task**: For to-do items with due dates and priority
  - **Reminder**: For reminders with due dates, priority, and recurring options

#### **Conditional Fields**

**Event Type Fields:**
- Title (required)
- Category (all categories available)
- Date & Time:
  - Start date/time
  - End date/time
  - All-day toggle
- Recurring toggle (Repeat this event)
  - *When enabled, expands to show frequency options:*
    - Every day, Every week, Every month, Every year, Custom
- Location (optional)
- Description (optional)

**Task Type Fields:**
- Title (required)
- Category (all categories available)
- Date & Time:
  - Date picker
  - Time picker
- Recurring toggle (Repeat this task)
  - *When enabled, expands to show frequency options:*
    - Every day, Every week, Every month, Every year, Custom
- Priority (High/Medium/Low)
- Description (optional)

**Reminder Type Fields:**
- Title (required)
- Category (all categories available)
- Date & Time:
  - Date picker
  - Time picker
- Recurring toggle (Repeat this reminder)
  - *When enabled, expands to show frequency options:*
    - Every day, Every week, Every month, Every year, Custom
- Priority (High/Medium/Low)
- Description (optional)

### 2. **Navigation Updates**

#### **MainTabs.js**
- Removed `SetReminderScreen` import and route
- Kept `AddEventScreen` as the single unified screen

#### **HomeScreen.jsx**
- Updated "Add Event" button to pass `{ type: 'event' }` parameter
- Changed "Set Reminder" button to "Add Task" with `{ type: 'task' }` parameter
- Both buttons now navigate to the same screen with different default types

### 3. **Deleted Files**
- `SetReminderScreen.jsx` - No longer needed, functionality merged into AddEventScreen

## Usage

### From Code
```javascript
// Navigate to create an event
navigation.navigate('AddEvent', { type: 'event' });

// Navigate to create a task
navigation.navigate('AddEvent', { type: 'task' });

// Navigate to create a reminder
navigation.navigate('AddEvent', { type: 'reminder' });

// Default (no params) - defaults to 'event'
navigation.navigate('AddEvent');
```

### User Experience
1. User taps on "Add Event" or "Add Task" from the home screen
2. The unified screen opens with the appropriate type pre-selected
3. User can switch between Event/Task/Reminder using the type selector at the top
4. The form dynamically shows/hides fields based on the selected type
5. Upon saving, the item is created with the correct type and properties

## Benefits
1. **Consistency**: Single interface for all creation types
2. **Efficiency**: Users can easily switch between types without navigating back
3. **Maintainability**: Only one screen to maintain instead of three
4. **Flexibility**: Easy to add new types in the future

## Categories & Layout
The screen maintains the same category selection and overall layout as the previous AddEventScreen:
- Horizontal scrolling category chips with icons
- Same color scheme and styling
- Consistent with the app's design language

## Technical Details

### State Management
The screen manages multiple states to handle all three types:
- Common states: `title`, `description`, `selectedCategory`, `priority`, `isRecurring`, `recurringFrequency`
- Event-specific: `startDate`, `endDate`, `location`, `isAllDay`
- Task/Reminder-specific: `date`, `time`

### Save Logic
The `handleSave` function constructs the appropriate task object based on `itemType`:
- Event: Uses `startDate` and `endDate`, includes location in description, includes `isRecurring` and `recurringFrequency`
- Task: Combines `date` and `time`, includes `priority`, `isRecurring`, and `recurringFrequency`
- Reminder: Combines `date` and `time`, includes `priority`, `isRecurring`, and `recurringFrequency`

All three types are saved using the same `addTask` service function with appropriate `type` field.

The `recurringFrequency` is only saved when `isRecurring` is `true`, otherwise it's set to `null`.

### Recurring Feature
All three item types now support recurring functionality:
- **Recurring Events**: Repeat scheduled events (e.g., weekly meetings)
- **Recurring Tasks**: Repeat tasks (e.g., daily workout)
- **Recurring Reminders**: Repeat reminders (e.g., monthly bills)

The recurring toggle is positioned directly under the Date & Time card for easy access and consistency across all types.

#### Recurring Frequency Options
When the recurring toggle is enabled, the card expands to show frequency options in a 2-column grid:
- **Every day** 📅 - Daily repetition
- **Every week** 📆 - Weekly repetition (default)
- **Every month** 🗓️ - Monthly repetition
- **Every year** 📅 - Yearly repetition
- **Custom** ⚙️ - Custom recurring pattern

The selected frequency is saved as `recurringFrequency` in the task object (only when `isRecurring` is true).

