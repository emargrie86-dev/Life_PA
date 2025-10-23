// Function Executor Service
// Executes AI tool calls and interacts with app features
// Now with comprehensive validation and error handling

import { db } from './firebase';
import { getCurrentUser } from './auth';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { parseNaturalDate, parseNaturalTime, getCurrentDateTimeContext } from './aiTools';
import { validateEventParams, validateReminderParams, ValidationError } from '../utils/validation';
import { handleAsyncOperation, getUserFriendlyError } from '../utils/errorHandler';

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
      
      case 'upload_document':
      case 'scan_receipt': // backward compatibility
        console.log('Calling triggerDocumentUpload...');
        return await triggerDocumentUpload();
      
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
 * Create a calendar event with validation
 */
const createEvent = async (params) => {
  console.log('=== CREATE EVENT FUNCTION ===');
  console.log('Raw params received:', JSON.stringify(params, null, 2));
  
  // Check authentication
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated. Please log in to create events.');
  }

  const { title, date, time, description, category } = params;
  
  // Parse date and time first
  const eventDate = parseNaturalDate(date);
  const eventTime = parseNaturalTime(time);
  
  // Validate parameters
  try {
    validateEventParams({
      title,
      date: eventDate,
      time: eventTime,
      description,
      category,
    });
  } catch (validationError) {
    console.error('Event validation failed:', validationError.message);
    return {
      success: false,
      error: validationError.message,
      message: `Validation failed: ${validationError.message}`,
    };
  }
  
  // Combine date and time into a Date object
  const eventDateTime = new Date(`${eventDate}T${eventTime}:00`);
  
  // Validate the datetime is valid
  if (isNaN(eventDateTime.getTime())) {
    return {
      success: false,
      error: 'Invalid date/time combination',
      message: `Invalid date/time: ${eventDate} ${eventTime}`,
    };
  }
  
  // Create event in Firestore
  const eventData = {
    userId: user.uid,
    title: title.trim(),
    date: eventDate,
    time: eventTime,
    datetime: eventDateTime,
    description: description ? description.trim() : '',
    category: category ? category.toLowerCase() : 'other',
    createdAt: new Date(),
    createdBy: 'ai_assistant',
  };

  try {
    const docRef = await addDoc(collection(db, 'events'), eventData);
    console.log('✅ Event created successfully with ID:', docRef.id);
    
    return {
      success: true,
      eventId: docRef.id,
      message: `Event "${title}" created for ${eventDate} at ${eventTime}`,
      data: eventData,
    };
  } catch (error) {
    console.error('Firestore error creating event:', error);
    const errorMessage = getUserFriendlyError(error, 'Failed to create event');
    return {
      success: false,
      error: errorMessage,
      message: errorMessage,
    };
  }
};

/**
 * Set a reminder with validation
 */
const setReminder = async (params) => {
  // Check authentication
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated. Please log in to set reminders.');
  }

  const { title, date, time, notes } = params;
  
  // Parse date and time first
  const reminderDate = parseNaturalDate(date);
  const reminderTime = parseNaturalTime(time);
  
  // Validate parameters
  try {
    validateReminderParams({
      title,
      date: reminderDate,
      time: reminderTime,
      notes,
    });
  } catch (validationError) {
    console.error('Reminder validation failed:', validationError.message);
    return {
      success: false,
      error: validationError.message,
      message: `Validation failed: ${validationError.message}`,
    };
  }
  
  // Combine date and time into a Date object
  const reminderDateTime = new Date(`${reminderDate}T${reminderTime}:00`);
  
  // Validate the datetime is valid
  if (isNaN(reminderDateTime.getTime())) {
    return {
      success: false,
      error: 'Invalid date/time combination',
      message: `Invalid date/time: ${reminderDate} ${reminderTime}`,
    };
  }
  
  // Create reminder in Firestore
  const reminderData = {
    userId: user.uid,
    title: title.trim(),
    date: reminderDate,
    time: reminderTime,
    datetime: reminderDateTime,
    notes: notes ? notes.trim() : '',
    completed: false,
    createdAt: new Date(),
    createdBy: 'ai_assistant',
  };

  try {
    const docRef = await addDoc(collection(db, 'reminders'), reminderData);
    console.log('✅ Reminder created successfully with ID:', docRef.id);
    
    return {
      success: true,
      reminderId: docRef.id,
      message: `Reminder "${title}" set for ${reminderDate} at ${reminderTime}`,
      data: reminderData,
    };
  } catch (error) {
    console.error('Firestore error creating reminder:', error);
    const errorMessage = getUserFriendlyError(error, 'Failed to create reminder');
    return {
      success: false,
      error: errorMessage,
      message: errorMessage,
    };
  }
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
 * Trigger document upload
 */
const triggerDocumentUpload = async () => {
  // This function will be called to indicate the user should be redirected to the upload screen
  return {
    success: true,
    action: 'navigate_to_scan',
    message: 'Opening document upload...',
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

