import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  ScrollView, 
  TouchableOpacity,
  Platform,
  Alert 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Layout from '../components/Layout';
import AppHeader from '../components/AppHeader';
import ButtonPrimary from '../components/ButtonPrimary';
import CardContainer from '../components/CardContainer';
import Toast from '../components/Toast';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { getAllCategories } from '../theme/categories';
import { addTask } from '../services/taskService';

export default function AddEventScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3600000)); // 1 hour later
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('personal');
  const [isAllDay, setIsAllDay] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const categories = getAllCategories();

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setStartDate(new Date());
    setEndDate(new Date(Date.now() + 3600000));
    setSelectedCategory('personal');
    setIsAllDay(false);
  };

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
      // Ensure end date is after start date
      if (selectedDate >= endDate) {
        setEndDate(new Date(selectedDate.getTime() + 3600000));
      }
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const handleSaveEvent = async () => {
    if (!title.trim()) {
      setToastMessage('Please enter an event title');
      setToastType('error');
      setShowToast(true);
      return;
    }

    if (endDate <= startDate && !isAllDay) {
      setToastMessage('End time must be after start time');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setIsSaving(true);

    try {
      const newTask = {
        title: title.trim(),
        description: description.trim() + (location ? `\n📍 ${location}` : ''),
        dueDate: startDate,
        categoryId: selectedCategory,
        priority: 'medium', // Default priority for events
        isAllDay,
        endDate: endDate, // Store end date for future use
      };

      await addTask(newTask);

      // Show success toast and reset form
      setToastMessage('Event created successfully!');
      setToastType('success');
      setShowToast(true);
      setIsSaving(false);
      
      // Reset form to blank state
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
      setIsSaving(false);
      
      setToastMessage('Failed to create event. Please try again.');
      setToastType('error');
      setShowToast(true);
    }
  };

  const formatDateTime = (date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Layout style={styles.layout}>
      <AppHeader title="Add Event" onBackPress={() => navigation.goBack()} />
      
      <Toast
        message={toastMessage}
        visible={showToast}
        onHide={() => setShowToast(false)}
        type={toastType}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Input */}
        <CardContainer elevated style={styles.section}>
          <Text style={styles.label}>Event Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter event title"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
          />
        </CardContainer>

        {/* Category Selection */}
        <CardContainer elevated style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && {
                    backgroundColor: category.color + '30',
                    borderColor: category.color,
                  },
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && {
                      color: category.color,
                      fontWeight: '600',
                    },
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </CardContainer>

        {/* Date & Time */}
        <CardContainer elevated style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Date & Time</Text>
            <TouchableOpacity
              style={styles.allDayToggle}
              onPress={() => setIsAllDay(!isAllDay)}
            >
              <View
                style={[
                  styles.checkbox,
                  isAllDay && styles.checkboxActive,
                ]}
              >
                {isAllDay && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.allDayText}>All Day</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={styles.dateTimeIcon}>📅</Text>
            <View style={styles.dateTimeInfo}>
              <Text style={styles.dateTimeLabel}>Start</Text>
              <Text style={styles.dateTimeValue}>
                {isAllDay 
                  ? startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                  : formatDateTime(startDate)
                }
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text style={styles.dateTimeIcon}>🏁</Text>
            <View style={styles.dateTimeInfo}>
              <Text style={styles.dateTimeLabel}>End</Text>
              <Text style={styles.dateTimeValue}>
                {isAllDay 
                  ? endDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                  : formatDateTime(endDate)
                }
              </Text>
            </View>
          </TouchableOpacity>

          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode={isAllDay ? 'date' : 'datetime'}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleStartDateChange}
              minimumDate={new Date()}
            />
          )}

          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode={isAllDay ? 'date' : 'datetime'}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleEndDateChange}
              minimumDate={startDate}
            />
          )}
        </CardContainer>

        {/* Location Input */}
        <CardContainer elevated style={styles.section}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.locationInputContainer}>
            <Text style={styles.locationIcon}>📍</Text>
            <TextInput
              style={styles.locationInput}
              placeholder="Add location (optional)"
              placeholderTextColor="#94A3B8"
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </CardContainer>

        {/* Description Input */}
        <CardContainer elevated style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add event details (optional)"
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
          />
        </CardContainer>

        {/* Save Button */}
        <ButtonPrimary
          title={isSaving ? "Creating Event..." : "Create Event"}
          onPress={handleSaveEvent}
          style={styles.saveButton}
          disabled={isSaving}
        />
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
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: fonts.sizes.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    fontSize: fonts.sizes.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    gap: 8,
    paddingRight: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  categoryText: {
    fontSize: fonts.sizes.small,
    color: colors.text,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  dateTimeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  dateTimeInfo: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: fonts.sizes.small,
    color: '#64748B',
    marginBottom: 2,
  },
  dateTimeValue: {
    fontSize: fonts.sizes.body,
    color: colors.text,
    fontWeight: '500',
  },
  allDayToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  allDayText: {
    fontSize: fonts.sizes.small,
    color: colors.text,
    fontWeight: '500',
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  locationInput: {
    flex: 1,
    padding: 12,
    fontSize: fonts.sizes.body,
    color: colors.text,
  },
  saveButton: {
    marginBottom: 32,
  },
});

