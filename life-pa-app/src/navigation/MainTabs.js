// Main Navigator
// Stack navigation for authenticated users with menu-based navigation

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import UploadDocumentScreen from '../screens/UploadDocumentScreen';
import AddEventScreen from '../screens/AddEventScreen';
import ViewTasksScreen from '../screens/ViewTasksScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import ChatScreen from '../screens/ChatScreen';
import APIKeySetupScreen from '../screens/APIKeySetupScreen';
import AIProviderSetupScreen from '../screens/AIProviderSetupScreen';
import DocumentsListScreen from '../screens/DocumentsListScreen';
import DocumentDetailScreen from '../screens/DocumentDetailScreen';
import DocumentPreviewScreen from '../screens/DocumentPreviewScreen';
import HabitsScreen from '../screens/HabitsScreen';
import HabitDetailScreen from '../screens/HabitDetailScreen';
import AddHabitScreen from '../screens/AddHabitScreen';

const Stack = createStackNavigator();

export default function MainTabs() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="UploadDocument" component={UploadDocumentScreen} />
      <Stack.Screen name="DocumentPreview" component={DocumentPreviewScreen} />
      <Stack.Screen name="DocumentsList" component={DocumentsListScreen} />
      <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} />
      <Stack.Screen name="AddEvent" component={AddEventScreen} />
      <Stack.Screen name="ViewTasks" component={ViewTasksScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="APIKeySetup" component={APIKeySetupScreen} />
      <Stack.Screen name="AIProviderSetup" component={AIProviderSetupScreen} />
      <Stack.Screen name="Habits" component={HabitsScreen} />
      <Stack.Screen name="HabitDetail" component={HabitDetailScreen} />
      <Stack.Screen name="AddHabit" component={AddHabitScreen} />
    </Stack.Navigator>
  );
}

