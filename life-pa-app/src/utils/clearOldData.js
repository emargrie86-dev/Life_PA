// Utility to clear old AsyncStorage data
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Clear old task data from AsyncStorage
 * This removes the legacy @life_pa_tasks storage that was used before Firestore
 */
export const clearOldTaskData = async () => {
  try {
    console.log('Clearing old AsyncStorage task data...');
    await AsyncStorage.removeItem('@life_pa_tasks');
    console.log('Old task data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing old data:', error);
    return false;
  }
};

/**
 * Check what's in AsyncStorage
 */
export const checkAsyncStorage = async () => {
  try {
    const tasks = await AsyncStorage.getItem('@life_pa_tasks');
    console.log('AsyncStorage tasks:', tasks);
    return tasks;
  } catch (error) {
    console.error('Error checking AsyncStorage:', error);
    return null;
  }
};

