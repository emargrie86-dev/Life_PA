/**
 * HabitsScreen
 * Main screen for viewing and managing all habits
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Layout from '../components/Layout';
import HabitCard from '../components/HabitCard';
import { colors } from '../theme/colors';
import { 
  getHabits, 
  logHabitCompletion, 
  removeHabitCompletion, 
  getCompletionForDate 
} from '../services/habitService';
import { analyzeWeeklyHabits } from '../services/habitAnalysisService';

const HabitsScreen = ({ navigation }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completedToday, setCompletedToday] = useState(new Set());
  const [weeklyInsight, setWeeklyInsight] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // Load habits
  const loadHabits = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      
      const habitsData = await getHabits();
      setHabits(habitsData);

      // Check which habits are completed today
      const completedSet = new Set();
      for (const habit of habitsData) {
        const completion = await getCompletionForDate(habit.id, today);
        if (completion) {
          completedSet.add(habit.id);
        }
      }
      setCompletedToday(completedSet);

      console.log('Loaded habits:', habitsData.length);
    } catch (error) {
      console.error('Error loading habits:', error);
      Alert.alert('Error', 'Failed to load habits');
    } finally {
      if (showLoader) setLoading(false);
      setRefreshing(false);
    }
  };

  // Load weekly AI insight
  const loadWeeklyInsight = async () => {
    try {
      const analysis = await analyzeWeeklyHabits();
      setWeeklyInsight(analysis.summary);
    } catch (error) {
      console.error('Error loading weekly insight:', error);
      // Don't show error to user, just skip insight
    }
  };

  // Refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    loadHabits(false);
    loadWeeklyInsight();
  };

  // Load on mount and when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadHabits();
      loadWeeklyInsight();
    }, [])
  );

  // Toggle habit completion
  const handleToggleComplete = async (habitId) => {
    try {
      const isCompleted = completedToday.has(habitId);
      
      if (isCompleted) {
        // Remove completion
        await removeHabitCompletion(habitId, today);
        setCompletedToday(prev => {
          const newSet = new Set(prev);
          newSet.delete(habitId);
          return newSet;
        });
      } else {
        // Log completion
        await logHabitCompletion(habitId);
        setCompletedToday(prev => new Set(prev).add(habitId));
        
        // Show encouragement
        Alert.alert(
          '🎉 Great job!',
          'Habit completed for today. Keep the streak going!',
          [{ text: 'OK' }]
        );
      }

      // Reload habits to update stats
      await loadHabits(false);
    } catch (error) {
      console.error('Error toggling habit:', error);
      Alert.alert('Error', 'Failed to update habit');
    }
  };

  // Navigate to habit detail
  const handleHabitPress = (habit) => {
    navigation.navigate('HabitDetail', { habitId: habit.id });
  };

  // Navigate to add habit
  const handleAddHabit = () => {
    navigation.navigate('AddHabit');
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🎯</Text>
      <Text style={styles.emptyTitle}>No Habits Yet</Text>
      <Text style={styles.emptyText}>
        Start building positive habits to improve your daily routine
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddHabit}>
        <Text style={styles.addButtonText}>+ Create Your First Habit</Text>
      </TouchableOpacity>
    </View>
  );

  // Render habit item
  const renderHabit = ({ item }) => (
    <HabitCard
      habit={item}
      onPress={() => handleHabitPress(item)}
      onToggleComplete={() => handleToggleComplete(item.id)}
      isCompletedToday={completedToday.has(item.id)}
    />
  );

  // Render header with stats
  const renderHeader = () => {
    if (habits.length === 0) return null;

    const activeHabits = habits.filter(h => h.isActive).length;
    const todayCompleted = completedToday.size;
    const completionPercentage = activeHabits > 0 
      ? Math.round((todayCompleted / activeHabits) * 100) 
      : 0;

    return (
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{activeHabits}</Text>
            <Text style={styles.statLabel}>Active Habits</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{todayCompleted}/{activeHabits}</Text>
            <Text style={styles.statLabel}>Today's Progress</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{completionPercentage}%</Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
        </View>

        {weeklyInsight ? (
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>📊 Weekly Insight</Text>
            <Text style={styles.insightText} numberOfLines={4}>
              {weeklyInsight}
            </Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Your Habits</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <Layout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading habits...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <View style={styles.container}>
        <View style={styles.titleBar}>
          <Text style={styles.title}>Habits</Text>
          <TouchableOpacity onPress={handleAddHabit} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={habits}
          renderItem={renderHabit}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  headerButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  header: {
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  insightCard: {
    backgroundColor: colors.primaryLight || '#E8F4FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
});

export default HabitsScreen;

