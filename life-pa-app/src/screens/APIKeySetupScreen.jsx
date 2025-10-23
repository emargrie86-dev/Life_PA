import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import Layout from '../components/Layout';
import AppHeader from '../components/AppHeader';
import ButtonPrimary from '../components/ButtonPrimary';
import { 
  getCurrentProviderAPIKey as getStoredAPIKey, 
  storeProviderAPIKey as storeAPIKey, 
  removeProviderAPIKey as removeAPIKey, 
  validateProviderAPIKey as validateAPIKey,
  initializeAIClients as initializeClientOnStart 
} from '../services/aiService';

export default function APIKeySetupScreen({ navigation }) {
  const [apiKey, setApiKey] = useState('');
  const [confirmApiKey, setConfirmApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [currentKeyHidden, setCurrentKeyHidden] = useState(true);
  const [hasExistingKey, setHasExistingKey] = useState(false);

  useEffect(() => {
    loadExistingKey();
    initializeClientOnStart();
  }, []);

  const loadExistingKey = async () => {
    try {
      console.log('Loading existing API key...');
      const existingKey = await getStoredAPIKey();
      console.log('Existing key found:', existingKey ? 'Yes' : 'No');
      if (existingKey) {
        setHasExistingKey(true);
        setApiKey(existingKey);
        setConfirmApiKey(existingKey);
        console.log('Existing key loaded into form');
      }
    } catch (error) {
      console.error('Error loading existing API key:', error);
    }
  };

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter your Gemini API key');
      return;
    }

    if (apiKey !== confirmApiKey) {
      Alert.alert('Error', 'API keys do not match');
      return;
    }

    if (apiKey.length < 20) {
      Alert.alert('Error', 'Please enter a valid Gemini API key');
      return;
    }

    try {
      setValidating(true);
      console.log('Starting API key validation...');
      
      // Validate the API key by making a test request
      const isValid = await validateAPIKey(apiKey.trim());
      console.log('API key validation result:', isValid);
      
      if (!isValid) {
        Alert.alert('Invalid Key', 'The provided API key is not valid. Please check and try again.');
        return;
      }

      console.log('Storing API key...');
      // Store the validated key
      await storeAPIKey(apiKey.trim());
      console.log('API key stored successfully');
      
      Alert.alert(
        'Success', 
        'Gemini API key has been saved successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      
    } catch (error) {
      console.error('Error saving API key:', error);
      Alert.alert('Error', error.message || 'Failed to save API key');
    } finally {
      setValidating(false);
    }
  };

  const handleRemoveKey = () => {
    Alert.alert(
      'Remove API Key',
      'Are you sure you want to remove your Gemini API key? This will disable the chat feature until you add a new key.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await removeAPIKey();
              setApiKey('');
              setConfirmApiKey('');
              setHasExistingKey(false);
              Alert.alert('Success', 'API key has been removed');
            } catch (error) {
              console.error('Error removing API key:', error);
              Alert.alert('Error', 'Failed to remove API key');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const maskApiKey = (key) => {
    if (!key || key.length < 10) return key;
    const start = key.substring(0, 8);
    const end = key.substring(key.length - 4);
    const middle = '*'.repeat(key.length - 12);
    return start + middle + end;
  };

  const getApiKeyHelpText = () => {
    return (
      "To use the AI chat feature, you'll need a Google Gemini API key.\n\n" +
      "1. Go to https://aistudio.google.com/app/apikey\n" +
      "2. Sign in with your Google account\n" +
      "3. Click 'Create API Key'\n" +
      "4. Copy the key and paste it here\n\n" +
      "Note: Your API key is stored securely on your device and is never shared."
    );
  };

  return (
    <Layout>
      <AppHeader 
        title="Gemini API Key" 
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            Configure your Google Gemini API key to enable AI chat features
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to get your API key</Text>
          <Text style={styles.helpText}>{getApiKeyHelpText()}</Text>
        </View>

        {hasExistingKey && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current API Key</Text>
            <View style={styles.currentKeyContainer}>
              <Text style={styles.maskedKey}>
                {currentKeyHidden ? maskApiKey(apiKey) : apiKey}
              </Text>
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setCurrentKeyHidden(!currentKeyHidden)}
              >
                <Text style={styles.toggleButtonText}>
                  {currentKeyHidden ? 'Show' : 'Hide'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {hasExistingKey ? 'Update API Key' : 'Enter your API key'}
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="AIza..."
            value={apiKey}
            onChangeText={setApiKey}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading && !validating}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Confirm API key"
            value={confirmApiKey}
            onChangeText={setConfirmApiKey}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading && !validating}
          />
        </View>

        <View style={styles.buttonContainer}>
          <ButtonPrimary
            title={validating ? 'Validating...' : 'Save API Key'}
            onPress={handleSaveKey}
            loading={validating}
            disabled={loading || validating || !apiKey.trim()}
          />
          
          {/* Skip validation test button */}
          <ButtonPrimary
            title="Save Without Validation (Test)"
            onPress={async () => {
              if (!apiKey.trim()) {
                Alert.alert('Error', 'Please enter your Gemini API key');
                return;
              }
              if (apiKey !== confirmApiKey) {
                Alert.alert('Error', 'API keys do not match');
                return;
              }
              
              try {
                console.log('Saving API key without validation...');
                await storeAPIKey(apiKey.trim());
                console.log('API key saved successfully');
                Alert.alert('Success', 'API key saved! (Validation skipped)');
              } catch (error) {
                console.error('Error saving API key:', error);
                Alert.alert('Error', error.message);
              }
            }}
            variant="outline"
            style={styles.testButton}
          />
          
          {/* Test button for debugging */}
          <ButtonPrimary
            title="Test Storage (Debug)"
            onPress={async () => {
              console.log('Testing storage...');
              try {
                await storeAPIKey('test-key-123');
                console.log('Test key stored');
                const retrieved = await getStoredAPIKey();
                console.log('Test key retrieved:', retrieved);
                Alert.alert('Test Result', `Storage test: ${retrieved === 'test-key-123' ? 'SUCCESS' : 'FAILED'}`);
              } catch (error) {
                console.error('Storage test failed:', error);
                Alert.alert('Test Failed', error.message);
              }
            }}
            variant="outline"
            style={styles.testButton}
          />
          
          {hasExistingKey && (
            <ButtonPrimary
              title={loading ? 'Removing...' : 'Remove Key'}
              onPress={handleRemoveKey}
              loading={loading}
              disabled={validating}
              variant="outline"
              style={styles.removeButton}
            />
          )}
        </View>

        <View style={styles.securityNote}>
          <Text style={styles.securityText}>
            🔒 Your API key is stored securely on your device using AsyncStorage 
            and is never transmitted to our servers except when making requests to Google Gemini.
          </Text>
        </View>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.textLight,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: fonts.sizes.body,
    color: colors.deepGreen,
    opacity: 0.8,
    lineHeight: 22,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: fonts.sizes.title,
    fontWeight: '600',
    color: colors.deepGreen,
    marginBottom: 16,
  },
  helpText: {
    fontSize: fonts.sizes.body,
    color: colors.deepGreen,
    lineHeight: 22,
    opacity: 0.8,
  },
  currentKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  maskedKey: {
    flex: 1,
    fontSize: fonts.sizes.body,
    color: colors.text,
    fontFamily: 'monospace',
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  toggleButtonText: {
    color: colors.surface,
    fontSize: fonts.sizes.small,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: fonts.sizes.body,
    color: colors.text,
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 32,
  },
  removeButton: {
    borderColor: colors.danger,
  },
  testButton: {
    borderColor: colors.secondary,
  },
  securityNote: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  securityText: {
    fontSize: fonts.sizes.small,
    color: '#92400E',
    lineHeight: 18,
  },
});
