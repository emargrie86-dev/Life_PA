import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { initializeAIClients } from './src/services/aiService';

export default function App() {
  useEffect(() => {
    // Initialize AI clients on app start
    console.log('App starting - initializing AI clients...');
    initializeAIClients().then(clients => {
      console.log('AI clients initialization result:', clients);
    }).catch(error => {
      console.log('AI clients initialization error:', error.message);
    });
  }, []);

  return (
    <ErrorBoundary>
      <AppNavigator />
      <StatusBar style="auto" />
    </ErrorBoundary>
  );
}
