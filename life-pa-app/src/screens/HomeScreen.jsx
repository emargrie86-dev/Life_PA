import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, Alert, Platform } from 'react-native';
import { getCurrentUser, signOutUser } from '../services/auth';
import Layout from '../components/Layout';
import CardContainer from '../components/CardContainer';
import ButtonPrimary from '../components/ButtonPrimary';
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

  const handleAddEventPress = () => {
    console.log('Add Event pressed');
    // Add event functionality will be implemented later
  };

  const handleUploadDocumentPress = () => {
    console.log('Upload Document pressed');
    // Upload document functionality will be implemented later
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
                <TouchableOpacity 
                  key={event.id}
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

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <ButtonPrimary 
            title="➕ Add Event"
            onPress={handleAddEventPress}
            style={styles.actionButton}
          />
          <ButtonPrimary 
            title="📄 Upload Document"
            variant="secondary"
            onPress={handleUploadDocumentPress}
            style={styles.actionButton}
          />
        </View>

      </ScrollView>

      {/* AI Assistant Floating Button */}
      <TouchableOpacity 
        style={styles.aiAssistantButton}
        onPress={handleAIAssistantPress}
        activeOpacity={0.9}
      >
        <View style={styles.aiAssistantContent}>
          <Text style={styles.aiAssistantIcon}>🤖</Text>
          <Text style={styles.aiAssistantText}>How can I help</Text>
        </View>
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
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
    backgroundColor: colors.text,
    marginVertical: 2,
    borderRadius: 2,
  },
  headerTitle: {
    flex: 1,
    fontSize: fonts.sizes.title,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
  aiAssistantButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
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
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  menuContainer: {
    width: 280,
    height: '100%',
    backgroundColor: colors.surface,
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
    borderBottomColor: '#E2E8F0',
  },
  menuHeaderText: {
    fontSize: fonts.sizes.title,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.text,
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
    color: colors.text,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
    marginHorizontal: 20,
  },
  logoutText: {
    color: colors.danger,
  },
});

