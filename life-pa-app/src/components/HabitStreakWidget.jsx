/**
 * HabitStreakWidget Component
 * Shows streak calendar and visual streak progress
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';

const HabitStreakWidget = ({ completions, currentStreak, longestStreak }) => {
  // Generate last 30 days for calendar view
  const getLast30Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    
    return days;
  };

  // Check if a date has a completion
  const isDateCompleted = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return completions.some(c => {
      const completionDate = c.completedAt.toISOString().split('T')[0];
      return completionDate === dateStr;
    });
  };

  const days = getLast30Days();

  return (
    <View style={styles.container}>
      {/* Streak Summary */}
      <View style={styles.streakSummary}>
        <View style={styles.streakItem}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakValue}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>Current Streak</Text>
        </View>
        
        <View style={styles.streakItem}>
          <Text style={styles.streakEmoji}>🏆</Text>
          <Text style={styles.streakValue}>{longestStreak}</Text>
          <Text style={styles.streakLabel}>Best Streak</Text>
        </View>
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarContainer}>
        <Text style={styles.calendarTitle}>Last 30 Days</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendarScroll}
        >
          {days.map((day, index) => {
            const isCompleted = isDateCompleted(day);
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <View key={index} style={styles.dayContainer}>
                <Text style={styles.dayLabel}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })[0]}
                </Text>
                <View 
                  style={[
                    styles.dayBox,
                    isCompleted && styles.dayBoxCompleted,
                    isToday && styles.dayBoxToday,
                  ]}
                >
                  <Text style={[
                    styles.dayNumber,
                    isCompleted && styles.dayNumberCompleted,
                  ]}>
                    {day.getDate()}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  streakSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  streakItem: {
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  streakValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  calendarContainer: {
    marginTop: 8,
  },
  calendarTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  calendarScroll: {
    paddingVertical: 4,
  },
  dayContainer: {
    alignItems: 'center',
    marginRight: 8,
  },
  dayLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dayBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBoxCompleted: {
    backgroundColor: colors.primary,
  },
  dayBoxToday: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dayNumberCompleted: {
    color: '#fff',
  },
});

export default HabitStreakWidget;

