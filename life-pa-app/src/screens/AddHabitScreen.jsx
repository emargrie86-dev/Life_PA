/**
 * AddHabitScreen
 * Form for creating new habits
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Layout from '../components/Layout';
import { colors } from '../theme/colors';
import { createHabit, HABIT_FREQUENCIES } from '../services/habitService';

const AddHabitScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cue, setCue] = useState('');
  const [routine, setRoutine] = useState('');
  const [reward, setReward] = useState('');
  const [frequency, setFrequency] = useState(HABIT_FREQUENCIES.DAILY);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter a habit name');
      return;
    }

    try {
      setLoading(true);

      const habitData = {
        name: name.trim(),
        description: description.trim(),
        cue: cue.trim(),
        routine: routine.trim(),
        reward: reward.trim(),
        targetFrequency: frequency,
      };

      await createHabit(habitData);

      Alert.alert(
        'Success! 🎉',
        'Your habit has been created. Start building your streak today!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating habit:', error);
      Alert.alert('Error', 'Failed to create habit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Habit</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Help Text */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>💡 Building Better Habits</Text>
          <Text style={styles.helpText}>
            Follow the Habit Loop: Cue → Routine → Reward. Make it specific, achievable, and track your progress!
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Habit Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Habit Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Drink 2L of water"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Why is this habit important to you?"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Frequency */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.frequencyContainer}>
              <TouchableOpacity
                style={[
                  styles.frequencyButton,
                  frequency === HABIT_FREQUENCIES.DAILY && styles.frequencyButtonActive,
                ]}
                onPress={() => setFrequency(HABIT_FREQUENCIES.DAILY)}
              >
                <Text
                  style={[
                    styles.frequencyButtonText,
                    frequency === HABIT_FREQUENCIES.DAILY && styles.frequencyButtonTextActive,
                  ]}
                >
                  Daily
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.frequencyButton,
                  frequency === HABIT_FREQUENCIES.WEEKLY && styles.frequencyButtonActive,
                ]}
                onPress={() => setFrequency(HABIT_FREQUENCIES.WEEKLY)}
              >
                <Text
                  style={[
                    styles.frequencyButtonText,
                    frequency === HABIT_FREQUENCIES.WEEKLY && styles.frequencyButtonTextActive,
                  ]}
                >
                  Weekly
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Habit Loop Section */}
          <Text style={styles.sectionTitle}>🔄 Habit Loop (Optional but Recommended)</Text>

          {/* Cue */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Cue (When/Where)</Text>
            <TextInput
              style={styles.input}
              value={cue}
              onChangeText={setCue}
              placeholder="e.g., After morning coffee, 9am alarm"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.hint}>What triggers this habit?</Text>
          </View>

          {/* Routine */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Routine (The Action)</Text>
            <TextInput
              style={styles.input}
              value={routine}
              onChangeText={setRoutine}
              placeholder="e.g., Fill water bottle and drink 500ml"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.hint}>What specific action will you take?</Text>
          </View>

          {/* Reward */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Reward (The Benefit)</Text>
            <TextInput
              style={styles.input}
              value={reward}
              onChangeText={setReward}
              placeholder="e.g., Feel energized and hydrated"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.hint}>What benefit do you get?</Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Habit</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  helpCard: {
    backgroundColor: colors.primaryLight || '#E8F4FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  form: {
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  frequencyButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  frequencyButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  frequencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  frequencyButtonTextActive: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddHabitScreen;

