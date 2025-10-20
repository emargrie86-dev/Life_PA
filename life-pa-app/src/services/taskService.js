// Task Service
// Helper functions for task/reminder management with AsyncStorage persistence

import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_STORAGE_KEY = '@life_pa_tasks';

// Mock initial tasks data
const initialTasks = [
  {
    id: '1',
    title: 'Complete project proposal',
    description: 'Finish the Q4 project proposal document',
    dueDate: new Date('2025-10-20T14:00:00').toISOString(),
    categoryId: 'work',
    priority: 'high',
    isCompleted: false,
  },
  {
    id: '2',
    title: 'Buy groceries',
    description: 'Milk, eggs, bread, vegetables',
    dueDate: new Date('2025-10-19T18:00:00').toISOString(),
    categoryId: 'shopping',
    priority: 'medium',
    isCompleted: false,
  },
  {
    id: '3',
    title: 'Gym workout',
    description: 'Leg day - squats and deadlifts',
    dueDate: new Date('2025-10-18T19:00:00').toISOString(),
    categoryId: 'health',
    priority: 'medium',
    isCompleted: true,
  },
  {
    id: '4',
    title: 'Call dentist',
    description: 'Schedule teeth cleaning appointment',
    dueDate: new Date('2025-10-21T10:00:00').toISOString(),
    categoryId: 'appointments',
    priority: 'low',
    isCompleted: false,
  },
  {
    id: '5',
    title: 'Review presentation',
    description: 'Review slides for Monday meeting',
    dueDate: new Date('2025-10-22T09:00:00').toISOString(),
    categoryId: 'work',
    priority: 'high',
    isCompleted: false,
  },
];

/**
 * Initialize tasks storage with mock data if not exists
 */
const initializeTasks = async () => {
  try {
    const existingTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    if (!existingTasks) {
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(initialTasks));
      return initialTasks;
    }
    return JSON.parse(existingTasks);
  } catch (error) {
    console.error('Error initializing tasks:', error);
    return initialTasks;
  }
};

/**
 * Get all tasks
 * @returns {Promise<Array>}
 */
export const getTasks = async () => {
  try {
    const tasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    if (!tasks) {
      return await initializeTasks();
    }
    // Parse tasks and convert date strings back to Date objects
    const parsedTasks = JSON.parse(tasks);
    return parsedTasks.map(task => ({
      ...task,
      dueDate: new Date(task.dueDate)
    }));
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
};

/**
 * Save tasks to storage
 * @param {Array} tasks 
 * @returns {Promise<void>}
 */
const saveTasks = async (tasks) => {
  try {
    // Convert Date objects to ISO strings for storage
    const tasksToStore = tasks.map(task => ({
      ...task,
      dueDate: task.dueDate instanceof Date ? task.dueDate.toISOString() : task.dueDate
    }));
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasksToStore));
  } catch (error) {
    console.error('Error saving tasks:', error);
    throw error;
  }
};

/**
 * Add a new task
 * @param {Object} task 
 * @returns {Promise<Object>}
 */
export const addTask = async (task) => {
  try {
    const tasks = await getTasks();
    const newTask = {
      ...task,
      id: Date.now().toString(),
      isCompleted: false,
    };
    const updatedTasks = [...tasks, newTask];
    await saveTasks(updatedTasks);
    return newTask;
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

/**
 * Update an existing task
 * @param {string} taskId 
 * @param {Object} updates 
 * @returns {Promise<Object>}
 */
export const updateTask = async (taskId, updates) => {
  try {
    const tasks = await getTasks();
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    );
    await saveTasks(updatedTasks);
    return updatedTasks.find(task => task.id === taskId);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

/**
 * Toggle task completion status
 * @param {string} taskId 
 * @returns {Promise<Object>}
 */
export const toggleTaskCompletion = async (taskId) => {
  try {
    const tasks = await getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');
    
    return await updateTask(taskId, { isCompleted: !task.isCompleted });
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
    const tasks = await getTasks();
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    await saveTasks(updatedTasks);
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
    await AsyncStorage.removeItem(TASKS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing tasks:', error);
    throw error;
  }
};

/**
 * Reset tasks to initial mock data
 * @returns {Promise<Array>}
 */
export const resetTasks = async () => {
  try {
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(initialTasks));
    return initialTasks;
  } catch (error) {
    console.error('Error resetting tasks:', error);
    throw error;
  }
};

