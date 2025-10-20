import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import Layout from '../components/Layout';
import AppHeader from '../components/AppHeader';
import ButtonPrimary from '../components/ButtonPrimary';
import {
  AI_PROVIDERS,
  getCurrentProvider,
  setCurrentProvider,
  getCurrentProviderAPIKey,
  storeProviderAPIKey,
  validateProviderAPIKey,
  removeProviderAPIKey,
  getProviderDisplayName,
  getProviderKeyURL,
  initializeAIClients,
} from '../services/aiService';

export default function AIProviderSetupScreen({ navigation }) {
  const [selectedProvider, setSelectedProvider] = useState(AI_PROVIDERS.COHERE);
  const [apiKey, setApiKey] = useState('');
  const [confirmApiKey, setConfirmApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [currentKeyHidden, setCurrentKeyHidden] = useState(true);
  const [hasExistingKey, setHasExistingKey] = useState(false);

  useEffect(() => {
    loadCurrentSettings();
  }, []);

  useEffect(() => {
    // Load API key when provider changes
    loadProviderKey();
  }, [selectedProvider]);

  const loadCurrentSettings = async () => {
    try {
      const provider = await getCurrentProvider();
      setSelectedProvider(provider);
      await initializeAIClients();
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadProviderKey = async () => {
    try {
      // Get the API key for the selected provider specifically
      let existingKey = null;
      
      if (selectedProvider === AI_PROVIDERS.OPENAI) {
        const OpenAIService = require('../services/openai');
        existingKey = await OpenAIService.getStoredAPIKey();
      } else if (selectedProvider === AI_PROVIDERS.HUGGINGFACE) {
        const HuggingFaceService = require('../services/huggingface');
        existingKey = await HuggingFaceService.getStoredHFKey();
      } else if (selectedProvider === AI_PROVIDERS.COHERE) {
        const CohereService = require('../services/cohere');
        existingKey = await CohereService.getStoredCohereKey();
      }
      
      if (existingKey) {
        setHasExistingKey(true);
        setApiKey(existingKey);
        setConfirmApiKey(existingKey);
      } else {
        setHasExistingKey(false);
        setApiKey('');
        setConfirmApiKey('');
      }
    } catch (error) {
      console.error('Error loading provider key:', error);
    }
  };

  const handleProviderChange = async (provider) => {
    setSelectedProvider(provider);
    await setCurrentProvider(provider);
  };

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter your API key');
      return;
    }

    if (apiKey !== confirmApiKey) {
      Alert.alert('Error', 'API keys do not match');
      return;
    }

    if (apiKey.length < 20) {
      Alert.alert('Error', 'Please enter a valid API key');
      return;
    }

    try {
      setValidating(true);
      console.log('Starting API key validation for:', selectedProvider);

      // Validate the API key
      const isValid = await validateProviderAPIKey(selectedProvider, apiKey.trim());
      console.log('API key validation result:', isValid);

      if (!isValid) {
        Alert.alert(
          'Invalid Key',
          'The provided API key is not valid. Please check and try again.'
        );
        return;
      }

      console.log('Storing API key...');
      // Store the validated key
      await storeProviderAPIKey(selectedProvider, apiKey.trim());
      console.log('API key stored successfully');

      Alert.alert('Success', 'API key has been saved successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error saving API key:', error);
      Alert.alert('Error', error.message || 'Failed to save API key');
    } finally {
      setValidating(false);
    }
  };

  const handleSaveWithoutValidation = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter your API key');
      return;
    }

    if (apiKey !== confirmApiKey) {
      Alert.alert('Error', 'API keys do not match');
      return;
    }

    try {
      console.log('Saving API key without validation...');
      await storeProviderAPIKey(selectedProvider, apiKey.trim());
      console.log('API key saved successfully');
      Alert.alert('Success', 'API key saved! (Validation skipped)');
    } catch (error) {
      console.error('Error saving API key:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleClearFields = () => {
    setApiKey('');
    setConfirmApiKey('');
  };

  const handleRemoveKey = () => {
    Alert.alert(
      'Remove API Key',
      'Are you sure you want to remove your API key? This will disable the chat feature until you add a new key.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await removeProviderAPIKey(selectedProvider);
              setApiKey('');
              setConfirmApiKey('');
              setHasExistingKey(false);
              Alert.alert('Success', 'API key has been removed successfully!');
              // Reload to refresh the state
              await loadProviderKey();
            } catch (error) {
              console.error('Error removing API key:', error);
              Alert.alert('Error', 'Failed to remove API key');
            } finally {
              setLoading(false);
            }
          },
        },
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

  const openProviderKeyURL = () => {
    const url = getProviderKeyURL(selectedProvider);
    if (url) {
      Linking.openURL(url);
    }
  };

  const getProviderInstructions = () => {
    if (selectedProvider === AI_PROVIDERS.OPENAI) {
      return (
        "1. Go to https://platform.openai.com/api-keys\n" +
        "2. Sign in to your OpenAI account\n" +
        "3. Click 'Create new secret key'\n" +
        "4. Copy the key and paste it here\n\n" +
        "Note: Requires billing setup. GPT-3.5-turbo costs ~$0.002 per message."
      );
    } else if (selectedProvider === AI_PROVIDERS.COHERE) {
      return (
        "1. Go to https://dashboard.cohere.com/api-keys\n" +
        "2. Sign in or create a FREE account (no credit card needed!)\n" +
        "3. Copy your 'Trial API Key' or create a new one\n" +
        "4. Paste it here\n\n" +
        "✨ Completely FREE! 1000 API calls/month with excellent responses."
      );
    } else {
      return (
        "1. Go to https://huggingface.co/settings/tokens\n" +
        "2. Sign in or create a free account\n" +
        "3. Click 'New token' and select 'Fine-grained'\n" +
        "4. ✅ Check 'Make calls to Inference Providers' under Inference\n" +
        "5. Create and copy the token, paste it here\n\n" +
        "✨ Completely FREE! Uses GPT-2 for conversations."
      );
    }
  };

  return (
    <Layout>
      <AppHeader 
        title="AI Provider Setup" 
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            Choose your AI provider and configure your API key
          </Text>
        </View>

        {/* Provider Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select AI Provider</Text>
          
          <View style={styles.providerButtons}>
            <TouchableOpacity
              style={[
                styles.providerButton,
                selectedProvider === AI_PROVIDERS.COHERE && styles.providerButtonActive,
              ]}
              onPress={() => handleProviderChange(AI_PROVIDERS.COHERE)}
            >
              <Text
                style={[
                  styles.providerButtonText,
                  selectedProvider === AI_PROVIDERS.COHERE &&
                    styles.providerButtonTextActive,
                ]}
              >
                ✨ Cohere
              </Text>
              <Text
                style={[
                  styles.providerButtonSubtext,
                  selectedProvider === AI_PROVIDERS.COHERE &&
                    styles.providerButtonTextActive,
                ]}
              >
                FREE & Reliable
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.providerButton,
                selectedProvider === AI_PROVIDERS.OPENAI && styles.providerButtonActive,
              ]}
              onPress={() => handleProviderChange(AI_PROVIDERS.OPENAI)}
            >
              <Text
                style={[
                  styles.providerButtonText,
                  selectedProvider === AI_PROVIDERS.OPENAI && styles.providerButtonTextActive,
                ]}
              >
                🤖 OpenAI GPT
              </Text>
              <Text
                style={[
                  styles.providerButtonSubtext,
                  selectedProvider === AI_PROVIDERS.OPENAI && styles.providerButtonTextActive,
                ]}
              >
                Premium (Paid)
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.providerButtons}>
            <TouchableOpacity
              style={[
                styles.providerButton,
                selectedProvider === AI_PROVIDERS.HUGGINGFACE && styles.providerButtonActive,
              ]}
              onPress={() => handleProviderChange(AI_PROVIDERS.HUGGINGFACE)}
            >
              <Text
                style={[
                  styles.providerButtonText,
                  selectedProvider === AI_PROVIDERS.HUGGINGFACE &&
                    styles.providerButtonTextActive,
                ]}
              >
                🤗 Hugging Face
              </Text>
              <Text
                style={[
                  styles.providerButtonSubtext,
                  selectedProvider === AI_PROVIDERS.HUGGINGFACE &&
                    styles.providerButtonTextActive,
                ]}
              >
                FREE (Experimental)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <View style={styles.instructionsHeader}>
            <Text style={styles.sectionTitle}>How to get your API key</Text>
            <TouchableOpacity onPress={openProviderKeyURL} style={styles.linkButton}>
              <Text style={styles.linkButtonText}>Open URL →</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.helpText}>{getProviderInstructions()}</Text>
        </View>

        {/* Current Key Display */}
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

        {/* API Key Input */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {hasExistingKey ? 'Update API Key' : 'Enter your API key'}
            </Text>
            {(apiKey || confirmApiKey) && (
              <TouchableOpacity onPress={handleClearFields} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear Fields ✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <TextInput
            style={styles.input}
            placeholder={
              selectedProvider === AI_PROVIDERS.OPENAI 
                ? 'sk-...' 
                : selectedProvider === AI_PROVIDERS.COHERE
                ? 'Your Cohere API key'
                : 'hf_...'
            }
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

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <ButtonPrimary
            title={validating ? 'Validating...' : 'Save API Key'}
            onPress={handleSaveKey}
            loading={validating}
            disabled={loading || validating || !apiKey.trim()}
          />

          <ButtonPrimary
            title="Save Without Validation (Quick)"
            onPress={handleSaveWithoutValidation}
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
            🔒 Your API key is stored securely on your device and is never shared with
            anyone except the AI provider you selected.
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: fonts.sizes.title,
    fontWeight: '600',
    color: colors.deepGreen,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.secondary,
    borderRadius: 6,
  },
  clearButtonText: {
    color: colors.surface,
    fontSize: fonts.sizes.small,
    fontWeight: '600',
  },
  providerButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  providerButton: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  providerButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  providerButtonText: {
    fontSize: fonts.sizes.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  providerButtonTextActive: {
    color: colors.primary,
  },
  providerButtonSubtext: {
    fontSize: fonts.sizes.small,
    color: colors.text,
    opacity: 0.6,
  },
  instructionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  linkButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  linkButtonText: {
    color: colors.surface,
    fontSize: fonts.sizes.small,
    fontWeight: '600',
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

