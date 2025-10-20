// Function Executor Service
// Executes AI tool calls and interacts with app features

import { db } from './firebase';
import { getCurrentUser } from './auth';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { parseNaturalDate, parseNaturalTime, getCurrentDateTimeContext } from './aiTools';

/**
 * Execute a function call from the AI
 * @param {string} functionName - Name of the function to execute
 * @param {Object} parameters - Parameters for the function
 * @returns {Promise<Object>} - Result of the function execution
 */
export const executeFunction = async (functionName, parameters) => {
  console.log('=== EXECUTING FUNCTION ===');
  console.log('Function name:', functionName);
  console.log('Parameters:', JSON.stringify(parameters, null, 2));
  
  try {
    switch (functionName) {
      case 'create_event':
        console.log('Calling createEvent...');
        return await createEvent(parameters);
      
      case 'set_reminder':
        console.log('Calling setReminder...');
        return await setReminder(parameters);
      
      case 'view_upcoming_tasks':
        console.log('Calling viewUpcomingTasks...');
        return await viewUpcomingTasks(parameters);
      
      case 'scan_receipt':
        console.log('Calling triggerReceiptScan...');
        return await triggerReceiptScan();
      
      default:
        throw new Error(`Unknown function: ${functionName}`);
    }
  } catch (error) {
    console.error(`Error executing function ${functionName}:`, error);
    return {
      success: false,
      error: error.message,
      message: `Failed to execute ${functionName}: ${error.message}`,
    };
  }
};

/**
 * Create a calendar event
 */
const createEvent = async (params) => {
  console.log('=== CREATE EVENT FUNCTION ===');
  console.log('Raw params received:', JSON.stringify(params, null, 2));
  
  const user = getCurrentUser();
  if (!user) {
    console.error('User not authenticated');
    throw new Error('User not authenticated');
  }
  console.log('User authenticated:', user.uid);

  const { title, date, time, description, category } = params;
  console.log('Extracted params:', { title, date, time, description, category });
  
  // Parse date and time
  const eventDate = parseNaturalDate(date);
  const eventTime = parseNaturalTime(time);
  console.log('Parsed date:', eventDate, 'Parsed time:', eventTime);
  
  // Combine date and time into a Date object
  const eventDateTime = new Date(`${eventDate}T${eventTime}:00`);
  console.log('Event datetime:', eventDateTime);
  
  // Create event in Firestore
  const eventData = {
    userId: user.uid,
    title: title,
    date: eventDate,
    time: eventTime,
    datetime: eventDateTime,
    description: description || '',
    category: category || 'other',
    createdAt: new Date(),
    createdBy: 'ai_assistant',
  };
  
  console.log('About to save event to Firestore:', JSON.stringify(eventData, null, 2));

  try {
    const docRef = await addDoc(collection(db, 'events'), eventData);
    console.log('Event created successfully with ID:', docRef.id);
    
    return {
      success: true,
      eventId: docRef.id,
      message: `Event "${title}" created for ${eventDate} at ${eventTime}`,
      data: eventData,
    };
  } catch (error) {
    console.error('Firestore error creating event:', error);
    throw error;
  }
};

/**
 * Set a reminder
 */
const setReminder = async (params) => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { title, date, time, notes } = params;
  
  // Parse date and time
  const reminderDate = parseNaturalDate(date);
  const reminderTime = parseNaturalTime(time);
  
  // Combine date and time into a Date object
  const reminderDateTime = new Date(`${reminderDate}T${reminderTime}:00`);
  
  // Create reminder in Firestore
  const reminderData = {
    userId: user.uid,
    title: title,
    date: reminderDate,
    time: reminderTime,
    datetime: reminderDateTime,
    notes: notes || '',
    completed: false,
    createdAt: new Date(),
    createdBy: 'ai_assistant',
  };

  const docRef = await addDoc(collection(db, 'reminders'), reminderData);
  
  console.log('Reminder created:', docRef.id);
  
  return {
    success: true,
    reminderId: docRef.id,
    message: `Reminder "${title}" set for ${reminderDate} at ${reminderTime}`,
    data: reminderData,
  };
};

/**
 * View upcoming tasks (events and reminders)
 */
const viewUpcomingTasks = async (params) => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const days = params.days || 7;
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + days);
  
  try {
    // Get upcoming events
    const eventsQuery = query(
      collection(db, 'events'),
      where('userId', '==', user.uid),
      where('datetime', '>=', now),
      where('datetime', '<=', futureDate),
      orderBy('datetime', 'asc'),
      limit(20)
    );
    
    const eventsSnapshot = await getDocs(eventsQuery);
    const events = eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      type: 'event',
      ...doc.data(),
    }));

    // Get upcoming reminders
    const remindersQuery = query(
      collection(db, 'reminders'),
      where('userId', '==', user.uid),
      where('datetime', '>=', now),
      where('datetime', '<=', futureDate),
      where('completed', '==', false),
      orderBy('datetime', 'asc'),
      limit(20)
    );
    
    const remindersSnapshot = await getDocs(remindersQuery);
    const reminders = remindersSnapshot.docs.map(doc => ({
      id: doc.id,
      type: 'reminder',
      ...doc.data(),
    }));

    // Combine and sort
    const allTasks = [...events, ...reminders].sort((a, b) => 
      a.datetime.toDate() - b.datetime.toDate()
    );

    // Format for display
    const formattedTasks = allTasks.map(task => {
      const date = task.datetime.toDate ? task.datetime.toDate() : new Date(task.datetime);
      return `${task.type === 'event' ? '📅' : '⏰'} ${task.title} - ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }).join('\n');

    const message = allTasks.length > 0
      ? `Here are your upcoming tasks for the next ${days} days:\n\n${formattedTasks}`
      : `You have no upcoming tasks for the next ${days} days.`;

    return {
      success: true,
      count: allTasks.length,
      message: message,
      data: allTasks,
    };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    
    // Return a simpler response if complex query fails
    return {
      success: true,
      count: 0,
      message: `Unable to fetch tasks at this moment. Please try viewing your tasks in the app.`,
      data: [],
    };
  }
};

/**
 * Trigger receipt scanning
 */
const triggerReceiptScan = async () => {
  // This function will be called to indicate the user should be redirected to the scan screen
  return {
    success: true,
    action: 'navigate_to_scan',
    message: 'Opening receipt scanner...',
  };
};

/**
 * Execute multiple tool calls in sequence
 * @param {Array} toolCalls - Array of tool call objects
 * @returns {Promise<Array>} - Array of results
 */
export const executeToolCalls = async (toolCalls) => {
  const results = [];
  
  for (const toolCall of toolCalls) {
    try {
      const result = await executeFunction(toolCall.name, toolCall.parameters);
      results.push({
        toolCall: toolCall,
        result: result,
      });
    } catch (error) {
      results.push({
        toolCall: toolCall,
        result: {
          success: false,
          error: error.message,
        },
      });
    }
  }
  
  return results;
};

