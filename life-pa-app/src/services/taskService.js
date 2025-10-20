// Task Service
// Helper functions for task/reminder management with Firestore

import { db } from './firebase';
import { getCurrentUser } from './auth';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  orderBy 
} from 'firebase/firestore';

/**
 * Get all tasks (events and reminders from Firestore)
 * @returns {Promise<Array>}
 */
export const getTasks = async () => {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.log('No user authenticated, returning empty tasks');
      return [];
    }

    console.log('Fetching tasks for user:', user.uid);

    // Fetch events
    const eventsQuery = query(
      collection(db, 'events'),
      where('userId', '==', user.uid),
      orderBy('datetime', 'asc')
    );
    const eventsSnapshot = await getDocs(eventsQuery);
    const events = eventsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description || '',
        dueDate: data.datetime?.toDate ? data.datetime.toDate() : new Date(data.datetime),
        categoryId: data.category || 'other',
        priority: 'medium', // Events don't have priority, default to medium
        isCompleted: false, // Events are not completable in the same way
        type: 'event',
        date: data.date,
        time: data.time,
      };
    });

    console.log(`Fetched ${events.length} events`);

    // Fetch reminders
    const remindersQuery = query(
      collection(db, 'reminders'),
      where('userId', '==', user.uid),
      orderBy('datetime', 'asc')
    );
    const remindersSnapshot = await getDocs(remindersQuery);
    const reminders = remindersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.notes || '',
        dueDate: data.datetime?.toDate ? data.datetime.toDate() : new Date(data.datetime),
        categoryId: 'other', // Reminders don't have categories
        priority: 'medium',
        isCompleted: data.completed || false,
        type: 'reminder',
        date: data.date,
        time: data.time,
      };
    });

    console.log(`Fetched ${reminders.length} reminders`);

    // Combine and sort by due date
    const allTasks = [...events, ...reminders].sort((a, b) => a.dueDate - b.dueDate);
    
    console.log(`Total tasks: ${allTasks.length}`);
    console.log('Tasks:', allTasks.map(t => ({ id: t.id, title: t.title, type: t.type })));
    return allTasks;
  } catch (error) {
    console.error('Error getting tasks from Firestore:', error);
    return [];
  }
};

/**
 * Add a new task (not used by AI, but kept for manual task creation)
 * @param {Object} task 
 * @returns {Promise<Object>}
 */
export const addTask = async (task) => {
  // This function is for manual task creation through the UI
  // AI uses the functionExecutor service directly
  throw new Error('Use AddEventScreen or SetReminderScreen for manual task creation');
};

/**
 * Update an existing task
 * @param {string} taskId 
 * @param {Object} updates 
 * @returns {Promise<Object>}
 */
export const updateTask = async (taskId, updates) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Try to update in events collection
    try {
      const eventRef = doc(db, 'events', taskId);
      await updateDoc(eventRef, updates);
      return { id: taskId, ...updates };
    } catch (eventError) {
      // If not found in events, try reminders
      const reminderRef = doc(db, 'reminders', taskId);
      await updateDoc(reminderRef, updates);
      return { id: taskId, ...updates };
    }
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

/**
 * Toggle task completion status (only for reminders)
 * @param {string} taskId 
 * @returns {Promise<Object>}
 */
export const toggleTaskCompletion = async (taskId) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get current task to find its completion status
    const tasks = await getTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }

    // Only reminders can be toggled complete
    if (task.type === 'reminder') {
      const reminderRef = doc(db, 'reminders', taskId);
      await updateDoc(reminderRef, {
        completed: !task.isCompleted
      });
      return { ...task, isCompleted: !task.isCompleted };
    }

    // Events can't be marked complete
    return task;
  } catch (error) {
    console.error('Error toggling task completion:', error);
    throw error;
  }
};

/**
 * Delete a task
 * @param {string} taskId 
 * @returns {Promise<void>}
 */
export const deleteTask = async (taskId) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Try to delete from events collection
    try {
      const eventRef = doc(db, 'events', taskId);
      await deleteDoc(eventRef);
      console.log('Event deleted:', taskId);
      return;
    } catch (eventError) {
      // If not found in events, try reminders
      const reminderRef = doc(db, 'reminders', taskId);
      await deleteDoc(reminderRef);
      console.log('Reminder deleted:', taskId);
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

/**
 * Clear all tasks (for testing/debugging)
 * @returns {Promise<void>}
 */
export const clearAllTasks = async () => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Delete all events
    const eventsQuery = query(
      collection(db, 'events'),
      where('userId', '==', user.uid)
    );
    const eventsSnapshot = await getDocs(eventsQuery);
    const eventDeletes = eventsSnapshot.docs.map(doc => deleteDoc(doc.ref));

    // Delete all reminders
    const remindersQuery = query(
      collection(db, 'reminders'),
      where('userId', '==', user.uid)
    );
    const remindersSnapshot = await getDocs(remindersQuery);
    const reminderDeletes = remindersSnapshot.docs.map(doc => deleteDoc(doc.ref));

    await Promise.all([...eventDeletes, ...reminderDeletes]);
    console.log('All tasks cleared');
  } catch (error) {
    console.error('Error clearing tasks:', error);
    throw error;
  }
};

/**
 * Reset tasks to initial mock data (removed - use Firestore data instead)
 * @returns {Promise<Array>}
 */
export const resetTasks = async () => {
  console.log('resetTasks is no longer supported - tasks are managed in Firestore');
  return [];
};

