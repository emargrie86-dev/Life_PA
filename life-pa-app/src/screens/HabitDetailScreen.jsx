/**
 * HabitDetailScreen
 * Shows detailed habit information, streak calendar, AI insights, and completion tracking
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Layout from '../components/Layout';
import HabitStreakWidget from '../components/HabitStreakWidget';
import { colors } from '../theme/colors';
import {
  getHabit,
  getHabitCompletions,
  logHabitCompletion,
  removeHabitCompletion,
  getCompletionForDate,
  deleteHabit,
} from '../services/habitService';
import { analyzeHabit, generateEncouragement } from '../services/habitAnalysisService';

const HabitDetailScreen = ({ route, navigation }) => {
  const { habitId } = route.params;
  const [habit, setHabit] = useState(null);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [isCompletedToday, setIsCompletedToday] = useState(false);
  const [encouragement, setEncouragement] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadHabitData();
  }, [habitId]);

  const loadHabitData = async () => {
    try {
      setLoading(true);
      const habitData = await getHabit(habitId);
      const completionsData = await getHabitCompletions(habitId);
      const todayCompletion = await getCompletionForDate(habitId, today);

      setHabit(habitData);
      setCompletions(completionsData);
      setIsCompletedToday(!!todayCompletion);

      console.log('Loaded habit:', habitData.name);
    } catch (error) {
      console.error('Error loading habit:', error);
      Alert.alert('Error', 'Failed to load habit details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async () => {
    try {
      if (isCompletedToday) {
        await removeHabitCompletion(habitId, today);
        setIsCompletedToday(false);
      } else {
        await logHabitCompletion(habitId);
        setIsCompletedToday(true);
        
        // Generate encouragement message
        const msg = await generateEncouragement(habitId);
        setEncouragement(msg);
        
        Alert.alert('🎉 Great job!', msg, [{ text: 'OK' }]);
      }

      // Reload data
      await loadHabitData();
    } catch (error) {
      console.error('Error toggling completion:', error);
      Alert.alert('Error', 'Failed to update habit');
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      const analysis = await analyzeHabit(habitId);
      
      Alert.alert(
        '📊 AI Analysis',
        analysis.insights,
        [{ text: 'OK' }]
      );
      
      // Reload to show updated AI notes
      await loadHabitData();
    } catch (error) {
      console.error('Error analyzing habit:', error);
      Alert.alert('Error', 'Failed to analyze habit');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit?.name}"? This will also delete all completion history.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit(habitId);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting habit:', error);
              Alert.alert('Error', 'Failed to delete habit');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <Layout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading habit...</Text>
        </View>
      </Layout>
    );
  }

  if (!habit) {
    return (
      <Layout>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Habit not found</Text>
        </View>
      </Layout>
    );
  }

  const { name, description, cue, routine, reward, progress, aiNotes } = habit;

  return (
    <Layout>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.deleteButton}>Delete</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.title}>{name}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}

        {/* Complete Today Button */}
        <TouchableOpacity
          style={[
            styles.completeButton,
            isCompletedToday && styles.completeButtonCompleted,
          ]}
          onPress={handleToggleComplete}
        >
          <Text style={styles.completeButtonText}>
            {isCompletedToday ? '✓ Completed Today' : 'Mark as Complete Today'}
          </Text>
        </TouchableOpacity>

        {/* Streak Widget */}
        <HabitStreakWidget
          completions={completions}
          currentStreak={progress.currentStreak}
          longestStreak={progress.longestStreak}
        />

        {/* Stats Summary */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>📈 Performance</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Completions:</Text>
            <Text style={styles.statValue}>{progress.totalCompletions}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Completion Rate (30 days):</Text>
            <Text style={styles.statValue}>{progress.completionRate}%</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Last Completed:</Text>
            <Text style={styles.statValue}>
              {progress.lastCompletedAt 
                ? new Date(progress.lastCompletedAt).toLocaleDateString() 
                : 'Never'}
            </Text>
          </View>
        </View>

        {/* Habit Loop Details */}
        <View style={styles.loopCard}>
          <Text style={styles.cardTitle}>🔄 Habit Loop</Text>
          
          {cue ? (
            <View style={styles.loopItem}>
              <Text style={styles.loopLabel}>Cue (Trigger):</Text>
              <Text style={styles.loopValue}>{cue}</Text>
            </View>
          ) : null}

          {routine ? (
            <View style={styles.loopItem}>
              <Text style={styles.loopLabel}>Routine (Action):</Text>
              <Text style={styles.loopValue}>{routine}</Text>
            </View>
          ) : null}

          {reward ? (
            <View style={styles.loopItem}>
              <Text style={styles.loopLabel}>Reward (Benefit):</Text>
              <Text style={styles.loopValue}>{reward}</Text>
            </View>
          ) : null}
        </View>

        {/* AI Insights */}
        {aiNotes ? (
          <View style={styles.insightsCard}>
            <Text style={styles.cardTitle}>🧠 AI Insights</Text>
            <Text style={styles.insightsText}>{aiNotes}</Text>
          </View>
        ) : null}

        {/* Analyze Button */}
        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={handleAnalyze}
          disabled={analyzing}
        >
          {analyzing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.analyzeButtonText}>
              {aiNotes ? '🔄 Refresh AI Analysis' : '🧠 Get AI Analysis'}
            </Text>
          )}
        </TouchableOpacity>

        {encouragement ? (
          <View style={styles.encouragementCard}>
            <Text style={styles.encouragementText}>💬 {encouragement}</Text>
          </View>
        ) : null}
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
  deleteButton: {
    fontSize: 16,
    color: colors.error || '#F44336',
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  completeButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  completeButtonCompleted: {
    backgroundColor: colors.success || '#4CAF50',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  loopCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  loopItem: {
    marginBottom: 12,
  },
  loopLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  loopValue: {
    fontSize: 14,
    color: colors.text,
  },
  insightsCard: {
    backgroundColor: colors.primaryLight || '#E8F4FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  insightsText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  analyzeButton: {
    backgroundColor: colors.secondary || colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  encouragementCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  encouragementText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: colors.error || '#F44336',
  },
});

export default HabitDetailScreen;

