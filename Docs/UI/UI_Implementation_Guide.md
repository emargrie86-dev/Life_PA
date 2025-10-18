# 🎨 UI Implementation Guide — AI Life Assistant

This document contains the complete implementation details for the UI layout system defined in `UI_Layout.md`.

---

## 📁 File Structure

```
life-pa-app/src/
├── theme/
│   ├── colors.js
│   └── fonts.js
└── components/
    ├── Layout.jsx
    ├── AppHeader.jsx
    ├── ButtonPrimary.jsx
    └── CardContainer.jsx
```

---

## 🎨 Theme System

### colors.js

```js
// src/theme/colors.js
export const colors = {
  background: '#F8FAFC',
  text: '#0F172A',
  primary: '#2563EB',
  accent: '#F59E0B',
  success: '#10B981',
  danger: '#EF4444',
  surface: '#FFFFFF',
};
```

**Color Reference:**

| Color      | Hex       | Usage                    |
|------------|-----------|--------------------------|
| Background | `#F8FAFC` | App background           |
| Text       | `#0F172A` | Primary text             |
| Primary    | `#2563EB` | Buttons, links, accents  |
| Accent     | `#F59E0B` | Secondary actions        |
| Success    | `#10B981` | Success states           |
| Danger     | `#EF4444` | Error states, delete     |
| Surface    | `#FFFFFF` | Cards, modals            |

---

### fonts.js

```js
// src/theme/fonts.js
export const fonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    small: 12,
    body: 16,
    title: 20,
    heading: 28,
    large: 36,
  },
};
```

---

## 🧩 Component Implementations

### Layout.jsx

Main layout wrapper with SafeAreaView and consistent padding.

```jsx
// src/components/Layout.jsx
import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { colors } from '../theme/colors';

export default function Layout({ children, style }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={[styles.container, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 16,
  },
});
```

**Props:**
- `children` - Content to render inside layout
- `style` - Optional style overrides for container

---

### AppHeader.jsx

Flexible header component with optional back button and right action.

```jsx
// src/components/AppHeader.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export default function AppHeader({ title, onBackPress, rightAction }) {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {onBackPress && (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.right}>
        {rightAction}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  left: {
    width: 40,
    alignItems: 'flex-start',
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    fontSize: fonts.sizes.title,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  backButton: {
    padding: 4,
  },
  backText: {
    fontSize: 24,
    color: colors.primary,
  },
});
```

**Props:**
- `title` (string) - Header title text
- `onBackPress` (function, optional) - Shows back button when provided
- `rightAction` (ReactNode, optional) - Component to render on right side

---

### ButtonPrimary.jsx

Versatile button component with multiple variants and loading state.

```jsx
// src/components/ButtonPrimary.jsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export default function ButtonPrimary({ 
  title, 
  onPress, 
  loading = false, 
  disabled = false,
  variant = 'primary',
  style 
}) {
  const buttonStyle = [
    styles.button,
    variant === 'secondary' && styles.buttonSecondary,
    variant === 'outline' && styles.buttonOutline,
    disabled && styles.buttonDisabled,
    style,
  ];

  const textStyle = [
    styles.text,
    variant === 'secondary' && styles.textSecondary,
    variant === 'outline' && styles.textOutline,
    disabled && styles.textDisabled,
  ];

  return (
    <TouchableOpacity 
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.surface} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonSecondary: {
    backgroundColor: colors.accent,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
    opacity: 0.6,
  },
  text: {
    color: colors.surface,
    fontSize: fonts.sizes.body,
    fontWeight: '600',
  },
  textSecondary: {
    color: colors.surface,
  },
  textOutline: {
    color: colors.primary,
  },
  textDisabled: {
    color: '#64748B',
  },
});
```

**Props:**
- `title` (string) - Button text
- `onPress` (function) - Press handler
- `loading` (boolean) - Shows loading spinner
- `disabled` (boolean) - Disables button
- `variant` ('primary' | 'secondary' | 'outline') - Button style variant
- `style` (object) - Optional style overrides

---

### CardContainer.jsx

Card wrapper component with optional elevation/shadow.

```jsx
// src/components/CardContainer.jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function CardContainer({ children, style, elevated = false }) {
  return (
    <View style={[
      styles.card, 
      elevated && styles.elevated,
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});
```

**Props:**
- `children` - Content to render inside card
- `style` (object) - Optional style overrides
- `elevated` (boolean) - Adds shadow/elevation effect

---

## 💡 Usage Examples

### Basic Screen with Layout

```jsx
import React from 'react';
import { Text } from 'react-native';
import Layout from '../components/Layout';
import AppHeader from '../components/AppHeader';

export default function MyScreen({ navigation }) {
  return (
    <Layout>
      <AppHeader 
        title="My Screen" 
        onBackPress={() => navigation.goBack()}
      />
      <Text>Screen content here</Text>
    </Layout>
  );
}
```

---

### Button Variants

```jsx
import ButtonPrimary from '../components/ButtonPrimary';

// Primary button (default)
<ButtonPrimary 
  title="Save" 
  onPress={handleSave} 
/>

// Secondary button (accent color)
<ButtonPrimary 
  title="Edit" 
  variant="secondary"
  onPress={handleEdit} 
/>

// Outline button
<ButtonPrimary 
  title="Cancel" 
  variant="outline"
  onPress={handleCancel} 
/>

// Loading state
<ButtonPrimary 
  title="Saving..." 
  loading={true}
  onPress={handleSave} 
/>

// Disabled state
<ButtonPrimary 
  title="Submit" 
  disabled={!isValid}
  onPress={handleSubmit} 
/>
```

---

### Cards

```jsx
import { Text } from 'react-native';
import CardContainer from '../components/CardContainer';

// Basic card
<CardContainer>
  <Text>Card content here</Text>
</CardContainer>

// Elevated card with shadow
<CardContainer elevated>
  <Text>Important card content</Text>
</CardContainer>

// Custom styled card
<CardContainer 
  elevated
  style={{ marginHorizontal: 20, padding: 24 }}
>
  <Text>Custom card</Text>
</CardContainer>
```

---

### Header with Right Action

```jsx
import { TouchableOpacity, Text } from 'react-native';
import AppHeader from '../components/AppHeader';

<AppHeader 
  title="Settings"
  onBackPress={() => navigation.goBack()}
  rightAction={
    <TouchableOpacity onPress={handleSave}>
      <Text style={{ color: colors.primary, fontWeight: '600' }}>
        Save
      </Text>
    </TouchableOpacity>
  }
/>
```

---

## 🔧 Customization Tips

### Extending Colors
Add new colors to `colors.js` for specific use cases:

```js
export const colors = {
  // ... existing colors
  warning: '#F59E0B',
  info: '#3B82F6',
  border: '#E2E8F0',
};
```

### Custom Button Variants
Extend `ButtonPrimary` with new variants by adding styles:

```js
variant === 'danger' && styles.buttonDanger,

buttonDanger: {
  backgroundColor: colors.danger,
},
```

### Dark Mode Preparation
Structure makes it easy to add dark mode later:

```js
// colors.js (future enhancement)
export const lightColors = { /* ... */ };
export const darkColors = { /* ... */ };
```

---

## ✅ Implementation Checklist

- [ ] Create `src/theme/colors.js`
- [ ] Create `src/theme/fonts.js`
- [ ] Create `src/components/Layout.jsx`
- [ ] Create `src/components/AppHeader.jsx`
- [ ] Create `src/components/ButtonPrimary.jsx`
- [ ] Create `src/components/CardContainer.jsx`
- [ ] Test components on iOS
- [ ] Test components on Android
- [ ] Update existing screens to use new components

---

## 📚 Related Documentation

- [UI Layout Brief](./UI_Layout.md) - Original design brief
- [Home Page Specs](./Home_Page.md) - Home screen implementation
- [Post Login Specs](./Post_Log_In.md) - Post-login flow

---

**Status**: ✅ Ready for implementation  
**Last Updated**: October 18, 2025

