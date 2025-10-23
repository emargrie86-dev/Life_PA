/**
 * EventCard Component
 * Displays a single event/task in a list with category icon and details
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { MotiView } from 'moti';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { getCategoryById } from '../theme/categories';

function EventCard({ 
  event, 
  onPress, 
  isLastItem, 
  animationDelay 
}) {
  const category = getCategoryById(event.categoryId);
  
  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ 
        type: 'timing', 
        duration: 400, 
        delay: animationDelay 
      }}
    >
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => onPress(event)}
      >
        <View style={[styles.eventCard, !isLastItem && styles.eventCardWithBorder]}>
          <View style={styles.eventContent}>
            {/* Category Icon */}
            <View style={[styles.eventIconContainer, { backgroundColor: category.color + '20' }]}>
              <Text style={styles.eventIcon}>{category.icon}</Text>
            </View>
            
            {/* Event Details */}
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle} numberOfLines={1}>
                {event.title}
              </Text>
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

            {/* Arrow Indicator */}
            <View style={styles.eventArrow}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
}

const styles = StyleSheet.create({
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
});

EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    categoryId: PropTypes.string.isRequired,
  }).isRequired,
  onPress: PropTypes.func.isRequired,
  isLastItem: PropTypes.bool,
  animationDelay: PropTypes.number,
};

EventCard.defaultProps = {
  isLastItem: false,
  animationDelay: 0,
};

export default React.memo(EventCard);

