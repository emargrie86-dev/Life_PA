/**
 * Habit Analysis Service
 * Uses Gemini 2.5 Flash to analyze habit patterns and provide insights
 * Part of the Habit Formation Engine
 */

import { sendChatMessage } from './gemini';
import { getHabits, getHabitStats, updateHabit } from './habitService';
import { getTasks } from './taskService';

/**
 * Analyze a single habit and generate AI insights
 * @param {string} habitId
 * @returns {Promise<Object>} Analysis results with insights
 */
export const analyzeHabit = async (habitId) => {
  try {
    console.log('=== HABIT ANALYSIS ===');
    console.log('Analyzing habit:', habitId);

    // Get habit statistics
    const stats = await getHabitStats(habitId);
    const { habit, completions, dayOfWeekStats, hourOfDayStats, bestDay, bestHour } = stats;

    // Prepare analysis prompt for Gemini
    const prompt = createHabitAnalysisPrompt(habit, completions, dayOfWeekStats, hourOfDayStats, bestDay, bestHour);

    // Get AI analysis from Gemini
    const aiResponse = await sendChatMessage([
      {
        role: 'system',
        content: 'You are a habit formation expert and behavioral psychologist. Analyze user habits and provide actionable insights to help them succeed.',
      },
      {
        role: 'user',
        content: prompt,
      }
    ], {
      temperature: 0.7,
      max_tokens: 500,
    });

    console.log('AI Analysis received');

    // Store AI insights in habit
    await updateHabit(habitId, {
      aiNotes: aiResponse,
      lastAnalyzedAt: new Date(),
    });

    return {
      habitId,
      habitName: habit.name,
      insights: aiResponse,
      stats: {
        currentStreak: habit.progress.currentStreak,
        longestStreak: habit.progress.longestStreak,
        completionRate: habit.progress.completionRate,
        totalCompletions: habit.progress.totalCompletions,
        bestDay,
        bestHour,
      },
    };
  } catch (error) {
    console.error('Error analyzing habit:', error);
    throw error;
  }
};

/**
 * Create habit analysis prompt for Gemini
 */
const createHabitAnalysisPrompt = (habit, completions, dayOfWeekStats, hourOfDayStats, bestDay, bestHour) => {
  const recentCompletions = completions.slice(0, 7); // Last 7 completions
  
  return `Analyze this habit and provide actionable insights:

**HABIT DETAILS:**
- Name: ${habit.name}
- Description: ${habit.description || 'N/A'}
- Cue/Trigger: ${habit.cue || 'Not specified'}
- Routine: ${habit.routine || 'Not specified'}
- Target Frequency: ${habit.targetFrequency}

**PERFORMANCE METRICS:**
- Current Streak: ${habit.progress.currentStreak} days
- Longest Streak: ${habit.progress.longestStreak} days
- Total Completions: ${habit.progress.totalCompletions}
- Completion Rate (30 days): ${habit.progress.completionRate}%
- Last Completed: ${habit.progress.lastCompletedAt ? habit.progress.lastCompletedAt.toLocaleDateString() : 'Never'}

**PATTERNS:**
- Best Day of Week: ${bestDay} (${dayOfWeekStats[bestDay] || 0} completions)
- Most Common Hour: ${bestHour}:00
- Recent Activity: ${recentCompletions.length} completions in last 7 days

Please provide:
1. **Performance Assessment** - How is the user doing? (2-3 sentences)
2. **Pattern Insights** - What patterns do you notice? (2-3 sentences)
3. **Optimization Tips** - 2-3 specific, actionable recommendations to improve consistency
4. **Motivation** - A brief encouraging message

Keep it concise, positive, and actionable. Focus on helping the user build this habit sustainably.`;
};

/**
 * Analyze all user habits and provide weekly summary
 * @returns {Promise<Object>} Weekly analysis with recommendations
 */
export const analyzeWeeklyHabits = async () => {
  try {
    console.log('=== WEEKLY HABIT ANALYSIS ===');

    const habits = await getHabits();
    
    if (habits.length === 0) {
      return {
        summary: 'No habits tracked yet. Start building positive habits today!',
        recommendations: [],
      };
    }

    // Get stats for all habits
    const habitStats = await Promise.all(
      habits.map(h => getHabitStats(h.id))
    );

    // Prepare weekly analysis prompt
    const prompt = createWeeklyAnalysisPrompt(habits, habitStats);

    // Get AI analysis from Gemini
    const aiResponse = await sendChatMessage([
      {
        role: 'system',
        content: 'You are a habit formation expert. Provide weekly habit summaries and personalized recommendations to help users build better routines.',
      },
      {
        role: 'user',
        content: prompt,
      }
    ], {
      temperature: 0.7,
      max_tokens: 800,
    });

    console.log('Weekly analysis received');

    return {
      summary: aiResponse,
      totalHabits: habits.length,
      activeHabits: habits.filter(h => h.isActive).length,
      avgCompletionRate: calculateAverageCompletionRate(habits),
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error analyzing weekly habits:', error);
    throw error;
  }
};

/**
 * Create weekly analysis prompt for Gemini
 */
const createWeeklyAnalysisPrompt = (habits, habitStats) => {
  const habitSummaries = habits.map((habit, index) => {
    const stats = habitStats[index];
    return `
${index + 1}. **${habit.name}**
   - Target: ${habit.targetFrequency}
   - Current Streak: ${habit.progress.currentStreak} days
   - Completion Rate: ${habit.progress.completionRate}%
   - Best Day: ${stats.bestDay}`;
  }).join('\n');

  return `Provide a weekly habit summary and recommendations:

**USER'S HABITS:**
${habitSummaries}

**TOTAL HABITS TRACKED:** ${habits.length}

Please provide:
1. **Weekly Summary** - Overall performance assessment (3-4 sentences)
2. **Top Performer** - Which habit is going best and why?
3. **Needs Attention** - Which habit needs more focus?
4. **Recommendations** - 3 specific, actionable suggestions to improve overall habit consistency
5. **Encouragement** - A motivational message to keep the user going

Be positive, constructive, and specific. Help the user understand their patterns and improve their habits.`;
};

/**
 * Suggest new habits based on user's tasks and events
 * @returns {Promise<Array>} Suggested habits
 */
export const suggestNewHabits = async () => {
  try {
    console.log('=== HABIT SUGGESTIONS ===');

    const habits = await getHabits();
    const tasks = await getTasks();

    // Prepare suggestion prompt
    const prompt = createHabitSuggestionPrompt(habits, tasks);

    // Get AI suggestions from Gemini
    const aiResponse = await sendChatMessage([
      {
        role: 'system',
        content: 'You are a habit formation expert. Analyze user behavior and suggest relevant, achievable habits that will improve their life.',
      },
      {
        role: 'user',
        content: prompt,
      }
    ], {
      temperature: 0.8, // Higher temperature for creative suggestions
      max_tokens: 600,
    });

    console.log('Habit suggestions received');

    // Parse suggestions (expecting JSON array)
    const suggestions = parseHabitSuggestions(aiResponse);

    return suggestions;
  } catch (error) {
    console.error('Error suggesting habits:', error);
    return [];
  }
};

/**
 * Create habit suggestion prompt
 */
const createHabitSuggestionPrompt = (habits, tasks) => {
  const existingHabits = habits.map(h => h.name).join(', ') || 'None';
  const recentTasks = tasks.slice(0, 10).map(t => `${t.title} (${t.type})`).join(', ');

  return `Based on the user's current activities, suggest 3-5 new habits they could build:

**EXISTING HABITS:**
${existingHabits}

**RECENT TASKS/EVENTS:**
${recentTasks || 'No recent tasks'}

Please suggest habits that:
1. Complement their existing routines
2. Are specific and measurable
3. Are achievable for a beginner
4. Address common productivity/wellness goals

Return your suggestions as a JSON array with this format:
[
  {
    "name": "Habit name",
    "description": "Why this habit is beneficial",
    "cue": "When/where to do it",
    "routine": "The specific action",
    "reward": "The benefit/feeling",
    "frequency": "daily" or "weekly"
  }
]

Be creative but practical. Focus on habits that genuinely improve quality of life.`;
};

/**
 * Parse habit suggestions from AI response
 */
const parseHabitSuggestions = (aiResponse) => {
  try {
    // Try to extract JSON from response
    let jsonStr = aiResponse.trim();
    
    // Remove markdown code blocks if present
    jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find JSON array
    const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    const suggestions = JSON.parse(jsonStr);
    
    // Validate format
    if (!Array.isArray(suggestions)) {
      console.error('Suggestions is not an array');
      return [];
    }
    
    return suggestions.filter(s => s.name && s.description);
  } catch (error) {
    console.error('Failed to parse habit suggestions:', error);
    console.error('Raw response:', aiResponse);
    return [];
  }
};

/**
 * Generate personalized encouragement message
 * @param {string} habitId
 * @returns {Promise<string>}
 */
export const generateEncouragement = async (habitId) => {
  try {
    const habit = await getHabitStats(habitId);
    const { progress } = habit.habit;

    const prompt = `Generate a SHORT (1-2 sentences), personalized encouragement message for this habit:

**Habit:** ${habit.habit.name}
**Current Streak:** ${progress.currentStreak} days
**Completion Rate:** ${progress.completionRate}%

Be positive, specific, and motivating. Acknowledge their progress and encourage them to continue.`;

    const message = await sendChatMessage([
      {
        role: 'user',
        content: prompt,
      }
    ], {
      temperature: 0.9,
      max_tokens: 100,
    });

    return message.trim();
  } catch (error) {
    console.error('Error generating encouragement:', error);
    return 'Keep up the great work! Every day counts. 🌟';
  }
};

/**
 * Calculate average completion rate across all habits
 */
const calculateAverageCompletionRate = (habits) => {
  if (habits.length === 0) return 0;
  
  const total = habits.reduce((sum, h) => sum + (h.progress?.completionRate || 0), 0);
  return Math.round(total / habits.length);
};

/**
 * Analyze habit conflicts with user's schedule
 * @param {string} habitId
 * @returns {Promise<Object>} Conflict analysis
 */
export const analyzeHabitScheduleConflicts = async (habitId) => {
  try {
    const habit = await getHabitStats(habitId);
    const tasks = await getTasks();

    // Filter tasks that might conflict based on time patterns
    const upcomingTasks = tasks.filter(t => t.dueDate >= new Date());

    const prompt = `Analyze if this habit conflicts with the user's schedule:

**HABIT:**
- Name: ${habit.habit.name}
- Cue: ${habit.habit.cue}
- Best completion time: ${habit.bestHour}:00

**UPCOMING TASKS/EVENTS (next 7 days):**
${upcomingTasks.slice(0, 10).map(t => 
  `- ${t.title} at ${t.time || 'unspecified'} on ${new Date(t.dueDate).toLocaleDateString()}`
).join('\n')}

Does the habit timing conflict with any tasks? If yes, suggest better times to perform this habit. Keep response brief (2-3 sentences).`;

    const analysis = await sendChatMessage([
      {
        role: 'user',
        content: prompt,
      }
    ], {
      temperature: 0.7,
      max_tokens: 200,
    });

    return {
      hasConflict: analysis.toLowerCase().includes('conflict') || analysis.toLowerCase().includes('overlap'),
      analysis: analysis.trim(),
    };
  } catch (error) {
    console.error('Error analyzing schedule conflicts:', error);
    return {
      hasConflict: false,
      analysis: 'Unable to analyze schedule conflicts at this time.',
    };
  }
};

