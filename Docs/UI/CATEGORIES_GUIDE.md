# Event Categories Guide

This guide explains how to use and extend the event categories system in the Life PA app.

---

## 📁 File Location

**`src/theme/categories.js`**

This centralized file contains all event category definitions used throughout the app.

---

## 📋 Available Categories

The app currently includes these predefined categories:

| Category | Color | Icon | Use Case |
|----------|-------|------|----------|
| **Personal** | Green (`#10B981`) | 👤 | Personal tasks, appointments, self-care |
| **Work** | Blue (`#2563EB`) | 💼 | Work meetings, deadlines, projects |
| **Social** | Amber (`#F59E0B`) | 🎉 | Parties, gatherings, meetups |
| **Finance** | Emerald (`#059669`) | 💰 | Bills, payments, banking |
| **Health** | Purple (`#8B5CF6`) | 💪 | Gym, doctor visits, wellness |
| **Education** | Sky Blue (`#3B82F6`) | 📚 | Classes, studying, learning |
| **Family** | Pink (`#EC4899`) | 👨‍👩‍👧‍👦 | Family events, quality time |
| **Travel** | Teal (`#14B8A6`) | ✈️ | Trips, vacations, travel plans |
| **Hobby** | Orange (`#F97316`) | 🎨 | Hobbies, creative activities |
| **Shopping** | Violet (`#A855F7`) | 🛍️ | Shopping lists, purchases |
| **Home** | Cyan (`#06B6D4`) | 🏠 | Home maintenance, chores |
| **Entertainment** | Red (`#EF4444`) | 🎬 | Movies, shows, concerts |
| **Appointments** | Lime (`#84CC16`) | 📅 | General appointments |
| **Other** | Gray (`#6B7280`) | 📌 | Miscellaneous events |

---

## 🔧 How to Use

### In Your Code

```javascript
import { getCategoryById, getAllCategories } from '../theme/categories';

// Get a specific category
const category = getCategoryById('work');
console.log(category.name);  // "Work"
console.log(category.color); // "#2563EB"
console.log(category.icon);  // "💼"

// Get all categories (useful for dropdowns)
const allCategories = getAllCategories();
```

### When Creating Events

```javascript
const newEvent = {
  id: 1,
  title: 'Team Meeting',
  date: 'Today',
  time: '2:00 PM',
  categoryId: 'work', // Use the category ID
};

// Then retrieve the category details when displaying
const category = getCategoryById(newEvent.categoryId);
```

---

## ➕ Adding New Categories

To add a new category, edit `src/theme/categories.js`:

### Step 1: Add to the eventCategories object

```javascript
export const eventCategories = {
  // ... existing categories ...
  
  pets: {
    id: 'pets',
    name: 'Pets',
    color: '#F59E0B', // Choose a color
    icon: '🐾',       // Choose an emoji
  },
};
```

### Step 2: Choose a Color

Use hex colors that are visually distinct from existing categories. Recommended color palette:
- Use Tailwind CSS colors for consistency
- Ensure good contrast for readability
- Consider color psychology for the category purpose

### Step 3: Choose an Icon

- Use emojis that clearly represent the category
- Keep it simple and recognizable
- Test on multiple devices to ensure proper display

---

## 🛠️ Helper Functions

The categories file includes several helper functions:

### `getCategoryById(categoryId)`
Returns the full category object for a given ID. Falls back to "Other" if not found.

```javascript
const category = getCategoryById('work');
// Returns: { id: 'work', name: 'Work', color: '#2563EB', icon: '💼' }
```

### `getAllCategories()`
Returns an array of all categories. Useful for dropdown menus or category selectors.

```javascript
const categories = getAllCategories();
// Returns: [{ id: 'personal', ... }, { id: 'work', ... }, ...]
```

### `getCategoryColor(categoryId)`
Returns just the color hex code for a category.

```javascript
const color = getCategoryColor('work');
// Returns: "#2563EB"
```

### `getCategoryIcon(categoryId)`
Returns just the emoji icon for a category.

```javascript
const icon = getCategoryIcon('work');
// Returns: "💼"
```

### `getCategoryName(categoryId)`
Returns just the display name for a category.

```javascript
const name = getCategoryName('work');
// Returns: "Work"
```

---

## 🎨 Category Object Structure

Each category follows this structure:

```javascript
{
  id: string,        // Unique identifier (lowercase, no spaces)
  name: string,      // Display name (user-facing)
  color: string,     // Hex color code
  icon: string,      // Emoji character
}
```

---

## 💡 Best Practices

1. **Use Category IDs, Not Names** - Always store `categoryId` in your data, not the category name. This makes it easy to rename categories later.

2. **Centralized Updates** - When you need to change a category's color or icon, update it in `categories.js` only. All screens will automatically reflect the change.

3. **Fallback to "Other"** - The helper functions automatically fall back to the "Other" category if an invalid ID is provided.

4. **Consistent Naming** - Use lowercase IDs with no spaces (e.g., `my_category`, not `My Category`).

5. **Color Accessibility** - Ensure category colors have sufficient contrast against white backgrounds.

---

## 🔮 Future Integration

When connecting to your backend:

### Database Structure
```javascript
// Events table
{
  id: number,
  title: string,
  date: datetime,
  time: string,
  categoryId: string,  // Store just the ID
  userId: string,
  // ... other fields
}
```

### API Response
```javascript
// Your backend should return events like this:
{
  id: 1,
  title: "Team Meeting",
  categoryId: "work",
  // ... other fields
}

// Then in your app, get category details:
const category = getCategoryById(event.categoryId);
```

---

## 📝 Examples

### Example 1: Displaying Events with Categories

```javascript
upcomingEvents.map((event) => {
  const category = getCategoryById(event.categoryId);
  return (
    <View>
      <Text>{category.icon} {event.title}</Text>
      <View style={{ backgroundColor: category.color }}>
        <Text>{category.name}</Text>
      </View>
    </View>
  );
});
```

### Example 2: Category Selector Component

```javascript
import { getAllCategories } from '../theme/categories';

function CategorySelector({ onSelect }) {
  const categories = getAllCategories();
  
  return (
    <ScrollView>
      {categories.map((cat) => (
        <TouchableOpacity key={cat.id} onPress={() => onSelect(cat.id)}>
          <Text>{cat.icon} {cat.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
```

---

## ✅ Benefits of This System

- ✅ **Easy to Extend** - Add new categories in one place
- ✅ **Consistent Design** - All screens use the same category styling
- ✅ **Type Safety** - Helper functions prevent errors
- ✅ **Backend Ready** - Structure prepared for database integration
- ✅ **Maintainable** - Change colors/icons globally
- ✅ **Reusable** - Use across all event-related features

---

**Last Updated:** October 18, 2025

