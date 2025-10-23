// AI Tools Definition
// Defines what functions/actions the AI assistant can perform

/**
 * Available tools that the AI can use to interact with the app
 */
export const AI_TOOLS = [
  {
    name: 'create_event',
    description: 'Create a new calendar event. YOU MUST calculate dates and times yourself - convert "tomorrow" to the actual date, "4pm" to "16:00", etc. Do NOT ask the user for formats.',
    parameter_definitions: {
      title: {
        description: 'The title/name of the event',
        type: 'string',
        required: true,
      },
      date: {
        description: 'The date in YYYY-MM-DD format. YOU must convert natural language (e.g., "tomorrow", "next Monday") to this format yourself.',
        type: 'string',
        required: true,
      },
      time: {
        description: 'The time in HH:MM 24-hour format. YOU must convert 12-hour times (e.g., "4pm" → "16:00") yourself.',
        type: 'string',
        required: true,
      },
      description: {
        description: 'Optional description or notes about the event',
        type: 'string',
        required: false,
      },
      category: {
        description: 'Event category: work, personal, health, finance, social, travel, education, entertainment, or other',
        type: 'string',
        required: false,
      },
    },
  },
  {
    name: 'set_reminder',
    description: 'Set a reminder. YOU MUST calculate dates and times yourself - convert "tomorrow" to the actual date, "3pm" to "15:00", etc. Do NOT ask the user for formats.',
    parameter_definitions: {
      title: {
        description: 'What to be reminded about',
        type: 'string',
        required: true,
      },
      date: {
        description: 'The date in YYYY-MM-DD format. YOU must convert natural language (e.g., "tomorrow", "next week") to this format yourself.',
        type: 'string',
        required: true,
      },
      time: {
        description: 'The time in HH:MM 24-hour format. YOU must convert 12-hour times (e.g., "3pm" → "15:00") yourself.',
        type: 'string',
        required: true,
      },
      notes: {
        description: 'Optional additional notes for the reminder',
        type: 'string',
        required: false,
      },
    },
  },
  {
    name: 'view_upcoming_tasks',
    description: 'View upcoming events and reminders. Use this when user asks to see their schedule, tasks, or what they have coming up.',
    parameter_definitions: {
      days: {
        description: 'Number of days ahead to look (default 7)',
        type: 'number',
        required: false,
      },
    },
  },
  {
    name: 'upload_document',
    description: 'Trigger the document upload feature to capture and save receipt or document information',
    parameter_definitions: {},
  },
  {
    name: 'create_habit',
    description: 'Create a new habit for the user to track. Use this when user wants to build a new positive routine or habit.',
    parameter_definitions: {
      name: {
        description: 'The name of the habit (e.g., "Drink 2L of water", "Exercise 30 minutes")',
        type: 'string',
        required: true,
      },
      description: {
        description: 'Why this habit is beneficial or important',
        type: 'string',
        required: false,
      },
      cue: {
        description: 'When or where the habit should be triggered (e.g., "After morning coffee", "9am daily alarm")',
        type: 'string',
        required: false,
      },
      routine: {
        description: 'The specific action to perform (e.g., "Fill water bottle and drink 500ml")',
        type: 'string',
        required: false,
      },
      reward: {
        description: 'The benefit or feeling from completing the habit (e.g., "Feel energized and hydrated")',
        type: 'string',
        required: false,
      },
      frequency: {
        description: 'How often to do this habit: "daily" or "weekly"',
        type: 'string',
        required: false,
      },
    },
  },
  {
    name: 'log_habit_completion',
    description: 'Mark a habit as completed for today. Use when user confirms they have done their habit.',
    parameter_definitions: {
      habit_name: {
        description: 'The name of the habit to mark as complete',
        type: 'string',
        required: true,
      },
    },
  },
  {
    name: 'view_habits',
    description: 'View all habits and their progress. Use when user asks to see their habits or habit tracking.',
    parameter_definitions: {},
  },
];

/**
 * Get current date and time information to help AI understand temporal context
 */
export const getCurrentDateTimeContext = () => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
  
  return {
    today,
    currentTime,
    dayOfWeek,
    timestamp: now.toISOString(),
  };
};

/**
 * Parse natural language dates into YYYY-MM-DD format
 * @param {string} dateString - Natural language date like "tomorrow", "next monday", "2024-01-15"
 * @returns {string} Date in YYYY-MM-DD format
 */
export const parseNaturalDate = (dateString) => {
  const now = new Date();
  const lower = dateString.toLowerCase().trim();
  
  // Handle "today"
  if (lower === 'today') {
    return now.toISOString().split('T')[0];
  }
  
  // Handle "tomorrow"
  if (lower === 'tomorrow') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  // Handle "next [day of week]"
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const nextDayMatch = lower.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
  if (nextDayMatch) {
    const targetDay = daysOfWeek.indexOf(nextDayMatch[1]);
    const currentDay = now.getDay();
    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) daysUntil += 7;
    
    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + daysUntil);
    return nextDate.toISOString().split('T')[0];
  }
  
  // Handle "in X days"
  const inDaysMatch = lower.match(/in\s+(\d+)\s+days?/);
  if (inDaysMatch) {
    const days = parseInt(inDaysMatch[1]);
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + days);
    return futureDate.toISOString().split('T')[0];
  }
  
  // If it looks like a date already (YYYY-MM-DD), return it
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Default to today if can't parse
  console.warn('Could not parse date:', dateString, 'defaulting to today');
  return now.toISOString().split('T')[0];
};

/**
 * Parse natural language time into HH:MM format
 * @param {string} timeString - Natural language time like "2pm", "14:30", "noon"
 * @returns {string} Time in HH:MM format (24-hour)
 */
export const parseNaturalTime = (timeString) => {
  const lower = timeString.toLowerCase().trim();
  
  // Handle special cases
  if (lower === 'noon' || lower === 'midday') return '12:00';
  if (lower === 'midnight') return '00:00';
  
  // Handle "Xpm" or "Xam" format
  const ampmMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1]);
    const minutes = ampmMatch[2] || '00';
    const period = ampmMatch[3];
    
    if (period === 'pm' && hours !== 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  
  // Handle 24-hour format (HH:MM)
  if (/^\d{1,2}:\d{2}$/.test(timeString)) {
    const [hours, minutes] = timeString.split(':');
    return `${hours.padStart(2, '0')}:${minutes}`;
  }
  
  // Default to current time if can't parse
  console.warn('Could not parse time:', timeString, 'defaulting to current time');
  const now = new Date();
  return now.toTimeString().split(' ')[0].substring(0, 5);
};

