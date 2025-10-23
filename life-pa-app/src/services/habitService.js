/**
 * Habit Service
 * Manages habit tracking, completion logging, and streak calculation in Firestore
 * Supports the Habit Formation Engine with Gemini AI analysis
 */

import { db } from './firebase';
import { getCurrentUser } from './auth';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  orderBy,
  Timestamp,
  limit,
} from 'firebase/firestore';

/**
 * Habit frequency types
 */
export const HABIT_FREQUENCIES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  CUSTOM: 'custom', // e.g., 3 times per week
};

/**
 * Get all habits for the current user
 * @returns {Promise<Array>}
 */
export const getHabits = async () => {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.log('No user authenticated, returning empty habits');
      return [];
    }

    console.log('Fetching habits for user:', user.uid);

    const habitsQuery = query(
      collection(db, 'habits'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(habitsQuery);
    const habits = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      };
    });

    console.log(`Fetched ${habits.length} habits`);
    return habits;
  } catch (error) {
    console.error('Error getting habits from Firestore:', error);
    return [];
  }
};

/**
 * Get a single habit by ID
 * @param {string} habitId - Habit ID
 * @returns {Promise<Object>}
 */
export const getHabit = async (habitId) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const habitRef = doc(db, 'habits', habitId);
    const habitSnap = await getDoc(habitRef);

    if (!habitSnap.exists()) {
      throw new Error('Habit not found');
    }

    const data = habitSnap.data();
    
    // Verify ownership
    if (data.userId !== user.uid) {
      throw new Error('Unauthorized access to habit');
    }

    return {
      id: habitSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
    };
  } catch (error) {
    console.error('Error getting habit:', error);
    throw error;
  }
};

/**
 * Create a new habit
 * @param {Object} habitData
 * @returns {Promise<Object>}
 */
export const createHabit = async (habitData) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Creating habit:', habitData);

    const now = new Date();
    const habit = {
      userId: user.uid,
      name: habitData.name,
      description: habitData.description || '',
      cue: habitData.cue || '', // Trigger (e.g., "After morning coffee", "9am alarm")
      routine: habitData.routine || '', // The action to perform
      reward: habitData.reward || '', // What the user gets (e.g., "Feel energized", "Track progress")
      targetFrequency: habitData.targetFrequency || HABIT_FREQUENCIES.DAILY,
      customFrequencyCount: habitData.customFrequencyCount || null, // e.g., 3 for "3 times per week"
      customFrequencyPeriod: habitData.customFrequencyPeriod || null, // e.g., "week"
      progress: {
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions: 0,
        completionRate: 0,
        lastCompletedAt: null,
      },
      aiNotes: '', // AI-generated insights from Gemini
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, 'habits'), habit);
    console.log('✅ Habit created successfully with ID:', docRef.id);

    return {
      success: true,
      id: docRef.id,
      habit: { id: docRef.id, ...habit },
      message: 'Habit created successfully',
    };
  } catch (error) {
    console.error('Error creating habit:', error);
    throw error;
  }
};

/**
 * Update an existing habit
 * @param {string} habitId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export const updateHabit = async (habitId, updates) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify ownership
    const habit = await getHabit(habitId);
    if (habit.userId !== user.uid) {
      throw new Error('Unauthorized to update this habit');
    }

    const habitRef = doc(db, 'habits', habitId);
    await updateDoc(habitRef, {
      ...updates,
      updatedAt: new Date(),
    });

    console.log('✅ Habit updated successfully:', habitId);
    return { id: habitId, ...updates };
  } catch (error) {
    console.error('Error updating habit:', error);
    throw error;
  }
};

/**
 * Delete a habit
 * @param {string} habitId
 * @returns {Promise<void>}
 */
export const deleteHabit = async (habitId) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify ownership
    const habit = await getHabit(habitId);
    if (habit.userId !== user.uid) {
      throw new Error('Unauthorized to delete this habit');
    }

    const habitRef = doc(db, 'habits', habitId);
    await deleteDoc(habitRef);

    // Also delete all completions for this habit
    const completionsQuery = query(
      collection(db, 'habit_completions'),
      where('habitId', '==', habitId)
    );
    const completionsSnapshot = await getDocs(completionsQuery);
    const deletions = completionsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletions);

    console.log('✅ Habit and completions deleted:', habitId);
  } catch (error) {
    console.error('Error deleting habit:', error);
    throw error;
  }
};

/**
 * Log habit completion for today
 * @param {string} habitId
 * @param {Date} completionDate - Optional, defaults to today
 * @returns {Promise<Object>}
 */
export const logHabitCompletion = async (habitId, completionDate = new Date()) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify ownership
    const habit = await getHabit(habitId);
    if (habit.userId !== user.uid) {
      throw new Error('Unauthorized to log completion for this habit');
    }

    // Check if already completed today
    const dateStr = completionDate.toISOString().split('T')[0];
    const existingCompletion = await getCompletionForDate(habitId, dateStr);
    
    if (existingCompletion) {
      console.log('Habit already completed for this date');
      return { success: false, message: 'Habit already completed today' };
    }

    // Add completion record
    const completion = {
      habitId,
      userId: user.uid,
      completedAt: completionDate,
      date: dateStr,
      createdAt: new Date(),
    };

    await addDoc(collection(db, 'habit_completions'), completion);

    // Update habit progress
    await updateHabitProgress(habitId);

    console.log('✅ Habit completion logged:', habitId);
    return { success: true, message: 'Habit completed!' };
  } catch (error) {
    console.error('Error logging habit completion:', error);
    throw error;
  }
};

/**
 * Remove habit completion for a specific date
 * @param {string} habitId
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {Promise<Object>}
 */
export const removeHabitCompletion = async (habitId, dateStr) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify ownership
    const habit = await getHabit(habitId);
    if (habit.userId !== user.uid) {
      throw new Error('Unauthorized to modify this habit');
    }

    const completionsQuery = query(
      collection(db, 'habit_completions'),
      where('habitId', '==', habitId),
      where('date', '==', dateStr)
    );

    const snapshot = await getDocs(completionsQuery);
    const deletions = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletions);

    // Update habit progress
    await updateHabitProgress(habitId);

    console.log('✅ Habit completion removed for date:', dateStr);
    return { success: true, message: 'Completion removed' };
  } catch (error) {
    console.error('Error removing habit completion:', error);
    throw error;
  }
};

/**
 * Get habit completions for a specific date
 * @param {string} habitId
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {Promise<Object|null>}
 */
export const getCompletionForDate = async (habitId, dateStr) => {
  try {
    const completionsQuery = query(
      collection(db, 'habit_completions'),
      where('habitId', '==', habitId),
      where('date', '==', dateStr),
      limit(1)
    );

    const snapshot = await getDocs(completionsQuery);
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    console.error('Error getting completion for date:', error);
    return null;
  }
};

/**
 * Get all completions for a habit
 * @param {string} habitId
 * @param {number} limitCount - Optional limit
 * @returns {Promise<Array>}
 */
export const getHabitCompletions = async (habitId, limitCount = null) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    let completionsQuery = query(
      collection(db, 'habit_completions'),
      where('habitId', '==', habitId),
      where('userId', '==', user.uid),
      orderBy('completedAt', 'desc')
    );

    if (limitCount) {
      completionsQuery = query(completionsQuery, limit(limitCount));
    }

    const snapshot = await getDocs(completionsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      completedAt: doc.data().completedAt?.toDate ? doc.data().completedAt.toDate() : new Date(doc.data().completedAt),
    }));
  } catch (error) {
    console.error('Error getting habit completions:', error);
    return [];
  }
};

/**
 * Calculate and update habit progress (streak, completion rate, etc.)
 * @param {string} habitId
 * @returns {Promise<void>}
 */
export const updateHabitProgress = async (habitId) => {
  try {
    const completions = await getHabitCompletions(habitId);
    
    if (completions.length === 0) {
      // No completions yet
      await updateHabit(habitId, {
        progress: {
          currentStreak: 0,
          longestStreak: 0,
          totalCompletions: 0,
          completionRate: 0,
          lastCompletedAt: null,
        },
      });
      return;
    }

    // Calculate current streak
    const currentStreak = calculateCurrentStreak(completions);
    
    // Calculate longest streak
    const longestStreak = calculateLongestStreak(completions);
    
    // Total completions
    const totalCompletions = completions.length;
    
    // Calculate completion rate (last 30 days)
    const completionRate = calculateCompletionRate(completions);
    
    // Last completed date
    const lastCompletedAt = completions[0].completedAt;

    await updateHabit(habitId, {
      progress: {
        currentStreak,
        longestStreak,
        totalCompletions,
        completionRate,
        lastCompletedAt,
      },
    });

    console.log('✅ Habit progress updated:', {
      currentStreak,
      longestStreak,
      totalCompletions,
      completionRate,
    });
  } catch (error) {
    console.error('Error updating habit progress:', error);
  }
};

/**
 * Calculate current streak (consecutive days)
 * @param {Array} completions - Sorted by date desc
 * @returns {number}
 */
const calculateCurrentStreak = (completions) => {
  if (completions.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let streak = 0;
  let currentDate = today;

  // Check if completed today or yesterday (streak is still active)
  const lastCompletion = completions[0].completedAt;
  lastCompletion.setHours(0, 0, 0, 0);
  
  if (lastCompletion < yesterday) {
    // Streak is broken
    return 0;
  }

  // Count consecutive days backwards from today
  for (const completion of completions) {
    const completionDate = new Date(completion.completedAt);
    completionDate.setHours(0, 0, 0, 0);
    
    if (completionDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (completionDate < currentDate) {
      // Gap found, streak is broken
      break;
    }
  }

  return streak;
};

/**
 * Calculate longest streak ever
 * @param {Array} completions - Sorted by date desc
 * @returns {number}
 */
const calculateLongestStreak = (completions) => {
  if (completions.length === 0) return 0;

  // Sort by date ascending for easier processing
  const sorted = [...completions].sort((a, b) => a.completedAt - b.completedAt);
  
  let maxStreak = 1;
  let currentStreak = 1;
  let prevDate = new Date(sorted[0].completedAt);
  prevDate.setHours(0, 0, 0, 0);

  for (let i = 1; i < sorted.length; i++) {
    const currentDate = new Date(sorted[i].completedAt);
    currentDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutive day
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else if (daysDiff > 1) {
      // Gap found, reset streak
      currentStreak = 1;
    }
    // daysDiff === 0 means same day (duplicate), don't count
    
    prevDate = currentDate;
  }

  return maxStreak;
};

/**
 * Calculate completion rate for the last 30 days
 * @param {Array} completions
 * @returns {number} Percentage (0-100)
 */
const calculateCompletionRate = (completions) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const recentCompletions = completions.filter(c => c.completedAt >= thirtyDaysAgo);
  
  if (recentCompletions.length === 0) return 0;

  // Calculate unique days completed in the last 30 days
  const uniqueDays = new Set(
    recentCompletions.map(c => c.completedAt.toISOString().split('T')[0])
  );

  const rate = (uniqueDays.size / 30) * 100;
  return Math.round(rate);
};

/**
 * Get habit statistics for analysis
 * @param {string} habitId
 * @returns {Promise<Object>}
 */
export const getHabitStats = async (habitId) => {
  try {
    const habit = await getHabit(habitId);
    const completions = await getHabitCompletions(habitId);
    
    // Group completions by day of week
    const dayOfWeekStats = {};
    completions.forEach(c => {
      const dayName = c.completedAt.toLocaleDateString('en-US', { weekday: 'long' });
      dayOfWeekStats[dayName] = (dayOfWeekStats[dayName] || 0) + 1;
    });

    // Group completions by hour of day
    const hourOfDayStats = {};
    completions.forEach(c => {
      const hour = c.completedAt.getHours();
      hourOfDayStats[hour] = (hourOfDayStats[hour] || 0) + 1;
    });

    return {
      habit,
      completions,
      dayOfWeekStats,
      hourOfDayStats,
      totalDays: completions.length,
      bestDay: Object.keys(dayOfWeekStats).reduce((a, b) => 
        dayOfWeekStats[a] > dayOfWeekStats[b] ? a : b, 'N/A'
      ),
      bestHour: Object.keys(hourOfDayStats).reduce((a, b) => 
        hourOfDayStats[a] > hourOfDayStats[b] ? a : b, 'N/A'
      ),
    };
  } catch (error) {
    console.error('Error getting habit stats:', error);
    throw error;
  }
};

