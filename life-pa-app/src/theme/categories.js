// Event Categories Configuration
// This file defines all available event categories/tags
// Add new categories here as needed for easy integration

export const eventCategories = {
  personal: {
    id: 'personal',
    name: 'Personal',
    color: '#10B981', // Green
    icon: '👤',
  },
  work: {
    id: 'work',
    name: 'Work',
    color: '#2563EB', // Blue
    icon: '💼',
  },
  social: {
    id: 'social',
    name: 'Social',
    color: '#F59E0B', // Amber
    icon: '🎉',
  },
  finance: {
    id: 'finance',
    name: 'Finance',
    color: '#059669', // Emerald
    icon: '💰',
  },
  health: {
    id: 'health',
    name: 'Health',
    color: '#8B5CF6', // Purple
    icon: '💪',
  },
  education: {
    id: 'education',
    name: 'Education',
    color: '#3B82F6', // Sky Blue
    icon: '📚',
  },
  family: {
    id: 'family',
    name: 'Family',
    color: '#EC4899', // Pink
    icon: '👨‍👩‍👧‍👦',
  },
  travel: {
    id: 'travel',
    name: 'Travel',
    color: '#14B8A6', // Teal
    icon: '✈️',
  },
  hobby: {
    id: 'hobby',
    name: 'Hobby',
    color: '#F97316', // Orange
    icon: '🎨',
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping',
    color: '#A855F7', // Violet
    icon: '🛍️',
  },
  home: {
    id: 'home',
    name: 'Home',
    color: '#06B6D4', // Cyan
    icon: '🏠',
  },
  entertainment: {
    id: 'entertainment',
    name: 'Entertainment',
    color: '#EF4444', // Red
    icon: '🎬',
  },
  appointments: {
    id: 'appointments',
    name: 'Appointments',
    color: '#84CC16', // Lime
    icon: '📅',
  },
  other: {
    id: 'other',
    name: 'Other',
    color: '#6B7280', // Gray
    icon: '📌',
  },
};

// Helper function to get category by id
export const getCategoryById = (categoryId) => {
  return eventCategories[categoryId] || eventCategories.other;
};

// Helper function to get all categories as an array
export const getAllCategories = () => {
  return Object.values(eventCategories);
};

// Helper function to get category color
export const getCategoryColor = (categoryId) => {
  return eventCategories[categoryId]?.color || eventCategories.other.color;
};

// Helper function to get category icon
export const getCategoryIcon = (categoryId) => {
  return eventCategories[categoryId]?.icon || eventCategories.other.icon;
};

// Helper function to get category name
export const getCategoryName = (categoryId) => {
  return eventCategories[categoryId]?.name || eventCategories.other.name;
};

