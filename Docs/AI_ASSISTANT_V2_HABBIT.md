# 🧠 Update Request: Add Habit Formation Engine (Gemini 2.5 Flash)

## **Goal:**
Enable the AI assistant to **analyze, establish, and reinforce user habits** using Gemini 2.5 Flash.  
This feature should let the Life PA app learn from user behavior, suggest new habits, and adapt reminders or routines automatically.

---

## **Description:**

We’re extending the current AI layer (Gemini 2.5 Flash) to include a **Habit Formation Engine**.  
The system should track user data (tasks, events, logs, completions) and feed it into Gemini for weekly analysis and recommendations.

---

## **Core Habit Loop**

| Stage | Description |
|-------|--------------|
| **Cue** | Trigger for the habit (e.g. time, event, location) |
| **Routine** | The user’s action (e.g. “drink water”, “go to gym”) |
| **Reward** | AI-generated feedback (streaks, praise, stats) |
| **Track** | Store completion data for performance insights |
| **Refine** | Gemini analyzes results weekly and suggests optimizations |

---

## **Steps (copy & run):**

1. **Add Database Schema**

   Create a new `habits` collection/table:

   ```json
   {
     "habit_id": "drink_water",
     "name": "Drink 2L of water",
     "cue": "Morning notification",
     "routine": "Log water intake",
     "reward": "Positive message + streak counter",
     "target_frequency": "daily",
     "progress": {
       "streak": 5,
       "completion_rate": 80
     },
     "ai_notes": "User tends to complete better before 5pm"
   }
