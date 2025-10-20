// AI Tools Definition
// Defines what functions/actions the AI assistant can perform

/**
 * Available tools that the AI can use to interact with the app
 */
export const AI_TOOLS = [
  {
    name: 'create_event',
    description: 'Create a new calendar event with a title, date, time, and optional description',
    parameter_definitions: {
      title: {
        description: 'The title/name of the event',
        type: 'string',
        required: true,
      },
      date: {
        description: 'The date of the event in YYYY-MM-DD format',
        type: 'string',
        required: true,
      },
      time: {
        description: 'The time of the event in HH:MM format (24-hour)',
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
    description: 'Set a reminder for a specific date and time',
    parameter_definitions: {
      title: {
        description: 'What to be reminded about',
        type: 'string',
        required: true,
      },
      date: {
        description: 'The date for the reminder in YYYY-MM-DD format',
        type: 'string',
        required: true,
      },
      time: {
        description: 'The time for the reminder in HH:MM format (24-hour)',
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
    name: 'scan_receipt',
    description: 'Trigger the receipt scanning feature to capture and save receipt information',
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

