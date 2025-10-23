import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, Alert, Platform } from 'react-native';
import { MotiView } from 'moti';
import { getCurrentUser, signOutUser } from '../services/auth';
import Layout from '../components/Layout';
import CardContainer from '../components/CardContainer';
import WeatherTile from '../components/WeatherTile';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { getCategoryById } from '../theme/categories';
import { getTasks } from '../services/taskService';
import { getUserDocuments } from '../services/documentService';

export default function HomeScreen({ navigation }) {
  const user = getCurrentUser();
  const [menuVisible, setMenuVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [upcomingExpenses, setUpcomingExpenses] = useState([]);

  // Load upcoming tasks and expenses
  useEffect(() => {
    loadUpcomingEvents();
    loadUpcomingExpenses();
  }, []);

  // Reload when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUpcomingEvents();
      loadUpcomingExpenses();
    });
    return unsubscribe;
  }, [navigation]);

  const loadUpcomingEvents = async () => {
    try {
      const tasks = await getTasks();
      // Filter to only show incomplete tasks and sort by due date
      const upcoming = tasks
        .filter(task => !task.isCompleted)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 4) // Show only first 4 upcoming tasks
        .map(task => ({
          id: task.id,
          title: task.title,
          date: formatEventDate(task.dueDate),
          time: formatEventTime(task.dueDate),
          categoryId: task.categoryId,
        }));
      setUpcomingEvents(upcoming);
    } catch (error) {
      console.error('Error loading upcoming events:', error);
      setUpcomingEvents([]);
    }
  };

  const formatEventDate = (date) => {
    const now = new Date();
    const eventDate = new Date(date);
    const diffTime = eventDate - now;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const formatEventTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const loadUpcomingExpenses = async () => {
    try {
      if (!user) return;
      
      const receipts = await getUserDocuments(user.uid, 100);
      
      // Filter receipts with due dates and show upcoming/overdue ones
      const now = new Date();
      const upcoming = receipts
        .filter(receipt => receipt.dueDate && receipt.dueDate.toDate)
        .map(receipt => ({
          id: receipt.id,
          merchantName: receipt.merchantName,
          amount: receipt.totalAmount,
          currency: receipt.currency,
          dueDate: receipt.dueDate.toDate(),
          category: receipt.category,
          isRecurring: receipt.isRecurring,
        }))
        .sort((a, b) => a.dueDate - b.dueDate)
        .slice(0, 4); // Show only first 4 upcoming expenses
      
      setUpcomingExpenses(upcoming);
    } catch (error) {
      console.error('Error loading upcoming expenses:', error);
      setUpcomingExpenses([]);
    }
  };

  const getCurrencySymbol = (currencyCode) => {
    const symbols = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'CAD': 'C$', 'AUD': 'A$',
      'JPY': '¥', 'CNY': '¥', 'INR': '₹',
    };
    return symbols[currencyCode] || currencyCode || '$';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Groceries': '#4CAF50',
      'Dining': '#FF9800',
      'Transport': '#2196F3',
      'Shopping': '#E91E63',
      'Healthcare': '#9C27B0',
      'Entertainment': '#00BCD4',
      'Utilities': '#795548',
      'Other': '#757575',
    };
    return colors[category] || colors.Other;
  };

  const handleMenuPress = () => {
    setMenuVisible(true);
  };

  const handleCloseMenu = () => {
    setMenuVisible(false);
  };

  const handleProfilePress = () => {
    setMenuVisible(false);
    navigation.navigate('Profile');
  };

  const handleSettingsPress = () => {
    setMenuVisible(false);
    navigation.navigate('Settings');
  };

  const handleLogout = async () => {
    setMenuVisible(false);
    
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

  const handleAIAssistantPress = () => {
    navigation.navigate('Chat');
  };

  const handleEventPress = (event) => {
    navigation.navigate('TaskDetail', { taskId: event.id });
  };

  return (
    <Layout style={styles.layout}>
      {/* Custom Header with Menu Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={handleMenuPress}
          activeOpacity={0.7}
        >
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          Welcome back {user?.displayName || 'User'}
        </Text>
        
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Weather Tile */}
        <WeatherTile />

        {/* Quick Action Buttons */}
        <View style={styles.quickActionsGrid}>
          {/* 1. Add Event */}
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 100 }}
          >
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('AddEvent', { type: 'event' })}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Text style={styles.quickActionEmoji}>➕</Text>
              </View>
              <Text style={styles.quickActionText}>Add Event</Text>
            </TouchableOpacity>
          </MotiView>

          {/* 2. Add Task */}
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 200 }}
          >
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('AddEvent', { type: 'task' })}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Text style={styles.quickActionEmoji}>📝</Text>
              </View>
              <Text style={styles.quickActionText}>Add Task</Text>
            </TouchableOpacity>
          </MotiView>

          {/* 3. View Tasks */}
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 300 }}
          >
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('ViewTasks')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Text style={styles.quickActionEmoji}>✓</Text>
              </View>
              <Text style={styles.quickActionText}>View Tasks</Text>
            </TouchableOpacity>
          </MotiView>

          {/* 4. Upload Document */}
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 400 }}
          >
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('UploadDocument')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Text style={styles.quickActionEmoji}>📄</Text>
              </View>
              <Text style={styles.quickActionText}>Upload Document</Text>
            </TouchableOpacity>
          </MotiView>

          {/* 5. View Documents */}
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 500 }}
          >
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('DocumentsList')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.accent + '20' }]}>
                <Text style={styles.quickActionEmoji}>🧾</Text>
              </View>
              <Text style={styles.quickActionText}>View Documents</Text>
            </TouchableOpacity>
          </MotiView>
        </View>

        {/* Upcoming Events Wrapper */}
        <CardContainer elevated style={styles.eventsWrapper}>
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ViewTasks')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Event Tiles */}
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event, index) => {
              const category = getCategoryById(event.categoryId);
              const isLastItem = index === upcomingEvents.length - 1;
              return (
                <MotiView
                  key={event.id}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ 
                    type: 'timing', 
                    duration: 400, 
                    delay: 500 + (index * 100) 
                  }}
                >
                  <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={() => handleEventPress(event)}
                  >
                    <View style={[styles.eventCard, !isLastItem && styles.eventCardWithBorder]}>
                      <View style={styles.eventContent}>
                        <View style={[styles.eventIconContainer, { backgroundColor: category.color + '20' }]}>
                          <Text style={styles.eventIcon}>{category.icon}</Text>
                        </View>
                        
                        <View style={styles.eventDetails}>
                          <Text style={styles.eventTitle}>{event.title}</Text>
                          <View style={styles.eventMeta}>
                            <Text style={styles.eventDate}>{event.date}</Text>
                            <Text style={styles.eventTime}>• {event.time}</Text>
                          </View>
                          <View style={[styles.eventCategory, { backgroundColor: category.color + '15' }]}>
                            <Text style={[styles.eventCategoryText, { color: category.color }]}>
                              {category.name}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.eventArrow}>
                          <Text style={styles.arrowText}>›</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </MotiView>
              );
            })
          ) : (
            /* Empty State Message */
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📅</Text>
              <Text style={styles.emptyStateText}>No upcoming tasks</Text>
              <Text style={styles.emptyStateSubtext}>Create a reminder to get started</Text>
            </View>
          )}
        </CardContainer>

        {/* Upcoming Expenses Wrapper */}
        <CardContainer elevated style={styles.eventsWrapper}>
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Expenses</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DocumentsList')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Expense Tiles */}
          {upcomingExpenses.length > 0 ? (
            upcomingExpenses.map((expense, index) => {
              const isLastItem = index === upcomingExpenses.length - 1;
              const categoryColor = getCategoryColor(expense.category);
              return (
                <MotiView
                  key={expense.id}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ 
                    type: 'timing', 
                    duration: 400, 
                    delay: 500 + (index * 100) 
                  }}
                >
                  <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('DocumentDetail', { documentId: expense.id })}
                  >
                    <View style={[styles.eventCard, !isLastItem && styles.eventCardWithBorder]}>
                      <View style={styles.eventContent}>
                        <View style={[styles.eventIconContainer, { backgroundColor: categoryColor + '20' }]}>
                          <Text style={styles.eventIcon}>💰</Text>
                        </View>
                        
                        <View style={styles.eventDetails}>
                          <Text style={styles.eventTitle}>{expense.merchantName}</Text>
                          <View style={styles.eventMeta}>
                            <Text style={styles.eventDate}>{formatEventDate(expense.dueDate)}</Text>
                            {expense.isRecurring && (
                              <Text style={styles.eventTime}>• 🔄 Recurring</Text>
                            )}
                          </View>
                          <View style={[styles.eventCategory, { backgroundColor: categoryColor + '15' }]}>
                            <Text style={[styles.eventCategoryText, { color: categoryColor }]}>
                              {expense.category || 'Other'}
                            </Text>
                          </View>
                        </View>

                        {/* Amount */}
                        <View style={styles.expenseAmountContainer}>
                          <Text style={styles.expenseAmount}>
                            {getCurrencySymbol(expense.currency)}{expense.amount.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </MotiView>
              );
            })
          ) : (
            /* Empty State Message */
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>💳</Text>
              <Text style={styles.emptyStateText}>No upcoming expenses</Text>
              <Text style={styles.emptyStateSubtext}>Upload a document with a due date</Text>
            </View>
          )}
        </CardContainer>

      </ScrollView>

      {/* AI Assistant Speech Bubble */}
      <TouchableOpacity 
        style={styles.aiAssistantBubble}
        onPress={handleAIAssistantPress}
        activeOpacity={0.9}
      >
        <View style={styles.aiAssistantContent}>
          <Text style={styles.aiAssistantIcon}>🤖</Text>
          <Text style={styles.aiAssistantText}>How can I help?</Text>
        </View>
        {/* Speech bubble tail */}
        <View style={styles.bubbleTail} />
      </TouchableOpacity>

      {/* Slide-in Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseMenu}
      >
        <TouchableOpacity 
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={handleCloseMenu}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuHeaderText}>Menu</Text>
              <TouchableOpacity onPress={handleCloseMenu} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <View style={styles.menuItems}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleProfilePress}
                activeOpacity={0.7}
              >
                <Text style={styles.menuItemIcon}>👤</Text>
                <Text style={styles.menuItemText}>Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('Analytics');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.menuItemIcon}>📊</Text>
                <Text style={styles.menuItemText}>Analytics</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleSettingsPress}
                activeOpacity={0.7}
              >
                <Text style={styles.menuItemIcon}>⚙️</Text>
                <Text style={styles.menuItemText}>Settings</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleLogout}
                activeOpacity={0.7}
                disabled={isLoggingOut}
              >
                <Text style={styles.menuItemIcon}>🚪</Text>
                <Text style={[styles.menuItemText, styles.logoutText]}>
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </Layout>
  );
}

const styles = StyleSheet.create({
  layout: {
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 8,
  },
  menuLine: {
    width: 24,
    height: 3,
    backgroundColor: colors.textLight,
    marginVertical: 2,
    borderRadius: 2,
  },
  headerTitle: {
    flex: 1,
    fontSize: fonts.sizes.title,
    fontWeight: '600',
    color: colors.textLight,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionEmoji: {
    fontSize: 22,
  },
  quickActionText: {
    fontSize: fonts.sizes.body,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  eventsWrapper: {
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: fonts.sizes.title,
    fontWeight: '700',
    color: colors.text,
  },
  viewAllText: {
    fontSize: fonts.sizes.body,
    color: colors.primary,
    fontWeight: '600',
  },
  eventCard: {
    paddingVertical: 12,
  },
  eventCardWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 12,
    paddingBottom: 16,
  },
  eventContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventIcon: {
    fontSize: 28,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: fonts.sizes.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: fonts.sizes.small,
    color: colors.text,
    opacity: 0.7,
    fontWeight: '500',
  },
  eventTime: {
    fontSize: fonts.sizes.small,
    color: colors.text,
    opacity: 0.7,
    marginLeft: 4,
  },
  eventCategory: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventCategoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  eventArrow: {
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 28,
    color: colors.text,
    opacity: 0.3,
  },
  expenseAmountContainer: {
    marginLeft: 'auto',
    paddingLeft: 12,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingTop: 8,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: fonts.sizes.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: fonts.sizes.small,
    color: colors.text,
    opacity: 0.6,
  },
  aiAssistantBubble: {
    position: 'absolute',
    bottom: 35,
    right: 20,
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  aiAssistantContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiAssistantIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  aiAssistantText: {
    color: colors.surface,
    fontSize: fonts.sizes.body,
    fontWeight: '600',
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -22,
    left: 16,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.primary,
    transform: [{ rotate: '20deg' }],
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  menuContainer: {
    width: 280,
    height: '100%',
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuHeaderText: {
    fontSize: fonts.sizes.title,
    fontWeight: '600',
    color: colors.textLight,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.textLight,
    opacity: 0.6,
  },
  menuItems: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemIcon: {
    fontSize: 22,
    marginRight: 16,
    width: 28,
  },
  menuItemText: {
    fontSize: fonts.sizes.body,
    color: colors.textLight,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
    marginHorizontal: 20,
  },
  logoutText: {
    color: colors.danger,
  },
});

