import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { MotiView } from 'moti';
import Layout from '../components/Layout';
import AppHeader from '../components/AppHeader';
import CardContainer from '../components/CardContainer';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { getCategoryById } from '../theme/categories';

export default function AnalyticsScreen({ navigation }) {
  const [timeRange, setTimeRange] = useState('week'); // week, month, year

  // Mock analytics data
  const analytics = {
    tasks: {
      total: 45,
      completed: 32,
      active: 13,
      overdue: 3,
      completionRate: 71,
      thisWeek: 12,
      thisMonth: 45,
    },
    events: {
      total: 28,
      upcoming: 15,
      past: 13,
      thisWeek: 8,
      thisMonth: 28,
    },
    receipts: {
      total: 23,
      thisWeek: 5,
      thisMonth: 23,
      totalAmount: 1847.65,
      avgAmount: 80.33,
    },
    productivity: {
      streak: 7,
      bestStreak: 14,
      avgTasksPerDay: 2.3,
      mostProductiveDay: 'Tuesday',
    },
    categoryBreakdown: [
      { categoryId: 'work', count: 15, percentage: 33 },
      { categoryId: 'personal', count: 12, percentage: 27 },
      { categoryId: 'health', count: 8, percentage: 18 },
      { categoryId: 'shopping', count: 6, percentage: 13 },
      { categoryId: 'social', count: 4, percentage: 9 },
    ],
  };

  const timeRanges = [
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'year', label: 'Year' },
  ];

  return (
    <Layout style={styles.layout}>
      <AppHeader title="Analytics" onBackPress={() => navigation.goBack()} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {timeRanges.map((range) => (
            <TouchableOpacity
              key={range.id}
              style={[
                styles.timeRangeButton,
                timeRange === range.id && styles.timeRangeButtonActive,
              ]}
              onPress={() => setTimeRange(range.id)}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === range.id && styles.timeRangeTextActive,
                ]}
              >
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview Stats */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
        >
          <Text style={styles.sectionTitle}>Overview</Text>
        </MotiView>
        
        <View style={styles.overviewGrid}>
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 400, delay: 100 }}
          >
            <CardContainer elevated style={styles.overviewCard}>
              <Text style={styles.overviewIcon}>✓</Text>
              <Text style={styles.overviewNumber}>{analytics.tasks.completed}</Text>
              <Text style={styles.overviewLabel}>Tasks Done</Text>
            </CardContainer>
          </MotiView>

          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 400, delay: 200 }}
          >
            <CardContainer elevated style={styles.overviewCard}>
              <Text style={styles.overviewIcon}>📅</Text>
              <Text style={styles.overviewNumber}>{analytics.events.total}</Text>
              <Text style={styles.overviewLabel}>Events</Text>
            </CardContainer>
          </MotiView>

          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 400, delay: 300 }}
          >
            <CardContainer elevated style={styles.overviewCard}>
              <Text style={styles.overviewIcon}>🧾</Text>
              <Text style={styles.overviewNumber}>{analytics.receipts.total}</Text>
              <Text style={styles.overviewLabel}>Receipts</Text>
            </CardContainer>
          </MotiView>

          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 400, delay: 400 }}
          >
            <CardContainer elevated style={styles.overviewCard}>
              <Text style={styles.overviewIcon}>🔥</Text>
              <Text style={styles.overviewNumber}>{analytics.productivity.streak}</Text>
              <Text style={styles.overviewLabel}>Day Streak</Text>
            </CardContainer>
          </MotiView>
        </View>

        {/* Task Completion Rate */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 500 }}
        >
          <Text style={styles.sectionTitle}>Task Completion</Text>
        </MotiView>
        
        <MotiView
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 600 }}
        >
          <CardContainer elevated style={styles.chartCard}>
          <View style={styles.completionHeader}>
            <View>
              <Text style={styles.completionRate}>
                {analytics.tasks.completionRate}%
              </Text>
              <Text style={styles.completionLabel}>Completion Rate</Text>
            </View>
            <View style={styles.completionStats}>
              <View style={styles.completionStatRow}>
                <View style={[styles.completionDot, { backgroundColor: colors.primary }]} />
                <Text style={styles.completionStatText}>
                  {analytics.tasks.completed} Completed
                </Text>
              </View>
              <View style={styles.completionStatRow}>
                <View style={[styles.completionDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.completionStatText}>
                  {analytics.tasks.active} Active
                </Text>
              </View>
              <View style={styles.completionStatRow}>
                <View style={[styles.completionDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.completionStatText}>
                  {analytics.tasks.overdue} Overdue
                </Text>
              </View>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <MotiView
              from={{ width: '0%' }}
              animate={{ width: `${analytics.tasks.completionRate}%` }}
              transition={{ type: 'timing', duration: 1000, delay: 800 }}
              style={styles.progressBar}
            />
          </View>
        </CardContainer>
        </MotiView>

        {/* Productivity Insights */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 700 }}
        >
          <Text style={styles.sectionTitle}>Productivity</Text>
        </MotiView>
        
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 800 }}
        >
          <CardContainer elevated style={styles.insightsCard}>
          <View style={styles.insightRow}>
            <View style={styles.insightIconContainer}>
              <Text style={styles.insightIcon}>📊</Text>
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightLabel}>Average per day</Text>
              <Text style={styles.insightValue}>
                {analytics.productivity.avgTasksPerDay} tasks
              </Text>
            </View>
          </View>

          <View style={styles.insightDivider} />

          <View style={styles.insightRow}>
            <View style={styles.insightIconContainer}>
              <Text style={styles.insightIcon}>🏆</Text>
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightLabel}>Best streak</Text>
              <Text style={styles.insightValue}>
                {analytics.productivity.bestStreak} days
              </Text>
            </View>
          </View>

          <View style={styles.insightDivider} />

          <View style={styles.insightRow}>
            <View style={styles.insightIconContainer}>
              <Text style={styles.insightIcon}>⭐</Text>
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightLabel}>Most productive day</Text>
              <Text style={styles.insightValue}>
                {analytics.productivity.mostProductiveDay}
              </Text>
            </View>
          </View>
        </CardContainer>
        </MotiView>

        {/* Category Breakdown */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 900 }}
        >
          <Text style={styles.sectionTitle}>Tasks by Category</Text>
        </MotiView>
        
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 1000 }}
        >
          <CardContainer elevated style={styles.categoryCard}>
          {analytics.categoryBreakdown.map((item, index) => {
            const category = getCategoryById(item.categoryId);
            const isLast = index === analytics.categoryBreakdown.length - 1;
            
            return (
              <View key={item.categoryId}>
                <View style={styles.categoryRow}>
                  <View style={styles.categoryInfo}>
                    <View
                      style={[
                        styles.categoryIconContainer,
                        { backgroundColor: category.color + '20' },
                      ]}
                    >
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>

                  <View style={styles.categoryStats}>
                    <Text style={styles.categoryCount}>{item.count}</Text>
                    <Text style={styles.categoryPercentage}>
                      {item.percentage}%
                    </Text>
                  </View>
                </View>

                {/* Category Progress Bar */}
                <View style={styles.categoryProgressContainer}>
                  <MotiView
                    from={{ width: '0%' }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ 
                      type: 'timing', 
                      duration: 800, 
                      delay: 1100 + (index * 100) 
                    }}
                    style={[
                      styles.categoryProgressBar,
                      { backgroundColor: category.color },
                    ]}
                  />
                </View>

                {!isLast && <View style={styles.categoryDivider} />}
              </View>
            );
          })}
        </CardContainer>
        </MotiView>

        {/* Financial Summary */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 1100 }}
        >
          <Text style={styles.sectionTitle}>Receipt Summary</Text>
        </MotiView>
        
        <MotiView
          from={{ opacity: 0, translateX: 20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 1200 }}
        >
          <CardContainer elevated style={styles.financialCard}>
          <View style={styles.financialRow}>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Total Spent</Text>
              <Text style={styles.financialAmount}>
                ${analytics.receipts.totalAmount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.financialDivider} />
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Average Receipt</Text>
              <Text style={styles.financialAmount}>
                ${analytics.receipts.avgAmount.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.financialFooter}>
            <Text style={styles.financialFooterText}>
              📊 Based on {analytics.receipts.total} receipts this month
            </Text>
          </View>
        </CardContainer>
        </MotiView>

        {/* Events Summary */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 1300 }}
        >
          <Text style={styles.sectionTitle}>Events Summary</Text>
        </MotiView>
        
        <View style={styles.eventsGrid}>
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 1400 }}
            style={{ flex: 1 }}
          >
            <CardContainer elevated style={styles.eventSummaryCard}>
              <Text style={styles.eventSummaryNumber}>
                {analytics.events.upcoming}
              </Text>
              <Text style={styles.eventSummaryLabel}>Upcoming</Text>
              <View style={[styles.eventSummaryBar, { backgroundColor: colors.primary }]} />
            </CardContainer>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 1500 }}
            style={{ flex: 1 }}
          >
            <CardContainer elevated style={styles.eventSummaryCard}>
              <Text style={styles.eventSummaryNumber}>
                {analytics.events.past}
              </Text>
              <Text style={styles.eventSummaryLabel}>Completed</Text>
              <View style={[styles.eventSummaryBar, { backgroundColor: colors.accent }]} />
            </CardContainer>
          </MotiView>
        </View>

        {/* Achievement Banner */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            type: 'spring',
            damping: 15,
            stiffness: 100,
            delay: 1600 
          }}
        >
          <CardContainer elevated style={styles.achievementBanner}>
          <Text style={styles.achievementIcon}>🎉</Text>
          <Text style={styles.achievementTitle}>Great Job!</Text>
          <Text style={styles.achievementText}>
              You've completed {analytics.tasks.thisWeek} tasks this week and maintained a {analytics.productivity.streak}-day streak!
            </Text>
          </CardContainer>
        </MotiView>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  layout: {
    padding: 0,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeRangeText: {
    fontSize: fonts.sizes.body,
    color: colors.text,
    fontWeight: '500',
  },
  timeRangeTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: fonts.sizes.title,
    fontWeight: '700',
    color: colors.textLight,
    marginBottom: 12,
    marginTop: 8,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  overviewCard: {
    flex: 1,
    minWidth: '47%',
    padding: 16,
    alignItems: 'center',
  },
  overviewIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  overviewNumber: {
    fontSize: fonts.sizes.heading,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: fonts.sizes.small,
    color: colors.text,
    opacity: 0.7,
  },
  chartCard: {
    padding: 16,
    marginBottom: 24,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  completionRate: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
  },
  completionLabel: {
    fontSize: fonts.sizes.small,
    color: colors.text,
    opacity: 0.7,
  },
  completionStats: {
    gap: 8,
  },
  completionStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  completionStatText: {
    fontSize: fonts.sizes.small,
    color: colors.text,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  insightsCard: {
    padding: 16,
    marginBottom: 24,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  insightIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  insightIcon: {
    fontSize: 24,
  },
  insightContent: {
    flex: 1,
  },
  insightLabel: {
    fontSize: fonts.sizes.small,
    color: colors.text,
    opacity: 0.7,
    marginBottom: 4,
  },
  insightValue: {
    fontSize: fonts.sizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  insightDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  categoryCard: {
    padding: 16,
    marginBottom: 24,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: fonts.sizes.body,
    fontWeight: '500',
    color: colors.text,
  },
  categoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryCount: {
    fontSize: fonts.sizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  categoryPercentage: {
    fontSize: fonts.sizes.small,
    color: colors.text,
    opacity: 0.6,
    minWidth: 40,
    textAlign: 'right',
  },
  categoryProgressContainer: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  categoryProgressBar: {
    height: '100%',
    borderRadius: 3,
  },
  categoryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  financialCard: {
    padding: 16,
    marginBottom: 24,
  },
  financialRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  financialItem: {
    flex: 1,
    alignItems: 'center',
  },
  financialLabel: {
    fontSize: fonts.sizes.small,
    color: colors.text,
    opacity: 0.7,
    marginBottom: 8,
  },
  financialAmount: {
    fontSize: fonts.sizes.title,
    fontWeight: '700',
    color: colors.primary,
  },
  financialDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  financialFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },
  financialFooterText: {
    fontSize: fonts.sizes.small,
    color: colors.text,
    opacity: 0.6,
  },
  eventsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  eventSummaryCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  eventSummaryNumber: {
    fontSize: fonts.sizes.heading,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  eventSummaryLabel: {
    fontSize: fonts.sizes.small,
    color: colors.text,
    opacity: 0.7,
    marginBottom: 16,
  },
  eventSummaryBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
  },
  achievementBanner: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    marginBottom: 16,
  },
  achievementIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: fonts.sizes.title,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  achievementText: {
    fontSize: fonts.sizes.body,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomSpacing: {
    height: 32,
  },
});

