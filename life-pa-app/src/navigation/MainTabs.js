// Main Navigator
// Stack navigation for authenticated users with menu-based navigation

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SetReminderScreen from '../screens/SetReminderScreen';
import ScanReceiptScreen from '../screens/ScanReceiptScreen';
import AddEventScreen from '../screens/AddEventScreen';
import ViewTasksScreen from '../screens/ViewTasksScreen';
import ChatScreen from '../screens/ChatScreen';
import APIKeySetupScreen from '../screens/APIKeySetupScreen';
import AIProviderSetupScreen from '../screens/AIProviderSetupScreen';

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
      <Stack.Screen name="SetReminder" component={SetReminderScreen} />
      <Stack.Screen name="ScanReceipt" component={ScanReceiptScreen} />
      <Stack.Screen name="AddEvent" component={AddEventScreen} />
      <Stack.Screen name="ViewTasks" component={ViewTasksScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="APIKeySetup" component={APIKeySetupScreen} />
      <Stack.Screen name="AIProviderSetup" component={AIProviderSetupScreen} />
    </Stack.Navigator>
  );
}

