import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, Alert, Platform } from 'react-native';
import { MotiView } from 'moti';
import { getCurrentUser, signOutUser } from '../services/auth';
import Layout from '../components/Layout';
import CardContainer from '../components/CardContainer';
import WeatherTile from '../components/WeatherTile';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { getCategoryById } from '../theme/categories';

export default function HomeScreen({ navigation }) {
  const user = getCurrentUser();
  const [menuVisible, setMenuVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Mock upcoming events data
  // categoryId should match one of the categories in src/theme/categories.js
  const upcomingEvents = [
    {
      id: 1,
      title: 'Team Meeting',
      date: 'Today',
      time: '2:00 PM',
      categoryId: 'work',
    },
    {
      id: 2,
      title: 'Dentist Appointment',
      date: 'Tomorrow',
      time: '10:30 AM',
      categoryId: 'appointments',
    },
    {
      id: 3,
      title: 'Birthday Party',
      date: 'Saturday',
      time: '6:00 PM',
      categoryId: 'social',
    },
    {
      id: 4,
      title: 'Gym Session',
      date: 'Sunday',
      time: '8:00 AM',
      categoryId: 'health',
    },
  ];

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
    console.log('AI Assistant pressed');
    // AI Assistant functionality will be implemented later
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
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 100 }}
          >
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('SetReminder')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Text style={styles.quickActionEmoji}>🔔</Text>
              </View>
              <Text style={styles.quickActionText}>Set Reminder</Text>
            </TouchableOpacity>
          </MotiView>

          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 200 }}
          >
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('ScanReceipt')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Text style={styles.quickActionEmoji}>📄</Text>
              </View>
              <Text style={styles.quickActionText}>Scan Receipt</Text>
            </TouchableOpacity>
          </MotiView>

          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 300 }}
          >
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('AddEvent')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Text style={styles.quickActionEmoji}>➕</Text>
              </View>
              <Text style={styles.quickActionText}>Add Event</Text>
            </TouchableOpacity>
          </MotiView>

          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 400 }}
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
        </View>

        {/* Upcoming Events Wrapper */}
        <CardContainer elevated style={styles.eventsWrapper}>
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity>
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
                    onPress={() => console.log(`Event pressed: ${event.title}`)}
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
              <Text style={styles.emptyStateText}>No upcoming events</Text>
              <Text style={styles.emptyStateSubtext}>Your schedule is clear!</Text>
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

