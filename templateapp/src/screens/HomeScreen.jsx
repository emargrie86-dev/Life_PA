import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert, Platform } from 'react-native';
import { getCurrentUser, signOutUser } from '../services/auth';

export default function HomeScreen() {
  const user = getCurrentUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    // On web, use window.confirm; on mobile, use Alert
    const confirmLogout = Platform.OS === 'web' 
      ? window.confirm('Are you sure you want to logout?')
      : await new Promise((resolve) => {
          Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Logout', style: 'destructive', onPress: () => resolve(true) },
            ]
          );
        });

    if (confirmLogout) {
      setIsLoggingOut(true);
      try {
        await signOutUser();
      } catch (error) {
        console.error('Logout error:', error);
        if (Platform.OS === 'web') {
          alert('Failed to logout. Please try again.');
        } else {
          Alert.alert('Error', 'Failed to logout. Please try again.');
        }
        setIsLoggingOut(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🎉 Welcome!</Text>
        <Text style={styles.subtitle}>Phase 2: Authentication Complete!</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>✅ You're logged in</Text>
          <Text style={styles.infoText}>Name: {user?.displayName || 'User'}</Text>
          <Text style={styles.infoText}>Email: {user?.email}</Text>
        </View>
        
        <View style={styles.featuresBox}>
          <Text style={styles.featuresTitle}>🚀 What's Working:</Text>
          <Text style={styles.featuresText}>• Firebase Authentication</Text>
          <Text style={styles.featuresText}>• Email/Password Login</Text>
          <Text style={styles.featuresText}>• User Registration</Text>
          <Text style={styles.featuresText}>• React Navigation</Text>
          <Text style={styles.featuresText}>• Protected Routes</Text>
        </View>
        
        <View style={styles.nextSteps}>
          <Text style={styles.nextTitle}>📋 Next Steps:</Text>
          <Text style={styles.nextText}>Ready for Phase 3: Add your core features!</Text>
        </View>

        <TouchableOpacity 
          style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
          onPress={handleLogout}
          disabled={isLoggingOut}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutButtonText}>
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  featuresBox: {
    backgroundColor: '#f1f8e9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2E7D32',
  },
  featuresText: {
    fontSize: 16,
    marginBottom: 6,
    color: '#558B2F',
  },
  nextSteps: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    marginBottom: 24,
  },
  nextTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1976D2',
  },
  nextText: {
    fontSize: 16,
    color: '#1565C0',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#f44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    cursor: 'pointer', // Better web support
  },
  logoutButtonDisabled: {
    backgroundColor: '#e57373',
    opacity: 0.7,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

