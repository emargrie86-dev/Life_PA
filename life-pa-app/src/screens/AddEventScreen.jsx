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

export default function AddEventScreen({ navigation, route }) {
  // Get initial type from route params, default to 'event'
  const initialType = route?.params?.type || 'event';
  
  const [itemType, setItemType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3600000)); // 1 hour later
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('personal');
  const [isAllDay, setIsAllDay] = useState(false);
  const [priority, setPriority] = useState('medium');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('weekly');
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const categories = getAllCategories();
  
  const priorities = [
    { id: 'high', name: 'High', color: '#EF4444' },
    { id: 'medium', name: 'Medium', color: '#F59E0B' },
    { id: 'low', name: 'Low', color: '#10B981' },
  ];

  const recurringFrequencies = [
    { id: 'daily', name: 'Every day', icon: '📅' },
    { id: 'weekly', name: 'Every week', icon: '📆' },
    { id: 'monthly', name: 'Every month', icon: '🗓️' },
    { id: 'yearly', name: 'Every year', icon: '📅' },
    { id: 'custom', name: 'Custom', icon: '⚙️' },
  ];

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setStartDate(new Date());
    setEndDate(new Date(Date.now() + 3600000));
    setDate(new Date());
    setTime(new Date());
    setSelectedCategory('personal');
    setIsAllDay(false);
    setPriority('medium');
    setIsRecurring(false);
    setRecurringFrequency('weekly');
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

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      const itemName = itemType.charAt(0).toUpperCase() + itemType.slice(1);
      setToastMessage(`Please enter a ${itemName.toLowerCase()} title`);
      setToastType('error');
      setShowToast(true);
      return;
    }

    if (itemType === 'event' && endDate <= startDate && !isAllDay) {
      setToastMessage('End time must be after start time');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setIsSaving(true);

    try {
      let newTask = {};
      
      if (itemType === 'event') {
        newTask = {
          type: 'event',
          title: title.trim(),
          description: description.trim() + (location ? `\n📍 ${location}` : ''),
          dueDate: startDate,
          categoryId: selectedCategory,
          priority: 'medium',
          isAllDay,
          endDate: endDate,
          isRecurring,
          recurringFrequency: isRecurring ? recurringFrequency : null,
        };
      } else if (itemType === 'task') {
        // Combine date and time into a single datetime
        const combinedDateTime = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          time.getHours(),
          time.getMinutes()
        );
        
        newTask = {
          type: 'task',
          title: title.trim(),
          description: description.trim(),
          dueDate: combinedDateTime,
          categoryId: selectedCategory,
          priority,
          isRecurring,
          recurringFrequency: isRecurring ? recurringFrequency : null,
        };
      } else if (itemType === 'reminder') {
        // Combine date and time into a single datetime
        const combinedDateTime = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          time.getHours(),
          time.getMinutes()
        );
        
        newTask = {
          type: 'reminder',
          title: title.trim(),
          description: description.trim(),
          dueDate: combinedDateTime,
          categoryId: selectedCategory,
          priority,
          isRecurring,
          recurringFrequency: isRecurring ? recurringFrequency : null,
        };
      }

      await addTask(newTask);

      // Show success toast and reset form
      const itemName = itemType.charAt(0).toUpperCase() + itemType.slice(1);
      setToastMessage(`${itemName} created successfully!`);
      setToastType('success');
      setShowToast(true);
      setIsSaving(false);
      
      // Reset form to blank state
      resetForm();
    } catch (error) {
      console.error(`Error saving ${itemType}:`, error);
      setIsSaving(false);
      
      const itemName = itemType.charAt(0).toUpperCase() + itemType.slice(1);
      setToastMessage(`Failed to create ${itemName.toLowerCase()}. Please try again.`);
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

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getHeaderTitle = () => {
    if (itemType === 'event') return 'Add Event';
    if (itemType === 'task') return 'Add Task';
    return 'Set Reminder';
  };

  const getSaveButtonText = () => {
    if (isSaving) {
      const itemName = itemType.charAt(0).toUpperCase() + itemType.slice(1);
      return `Creating ${itemName}...`;
    }
    const itemName = itemType.charAt(0).toUpperCase() + itemType.slice(1);
    return `Create ${itemName}`;
  };

  return (
    <Layout style={styles.layout}>
      <AppHeader title={getHeaderTitle()} onBackPress={() => navigation.goBack()} />
      
      <Toast
        message={toastMessage}
        visible={showToast}
        onHide={() => setShowToast(false)}
        type={toastType}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Type Selector */}
        <CardContainer elevated style={styles.section}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                itemType === 'event' && styles.typeButtonActive,
              ]}
              onPress={() => setItemType('event')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  itemType === 'event' && styles.typeButtonTextActive,
                ]}
              >
                Event
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeButton,
                itemType === 'task' && styles.typeButtonActive,
              ]}
              onPress={() => setItemType('task')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  itemType === 'task' && styles.typeButtonTextActive,
                ]}
              >
                Task
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeButton,
                itemType === 'reminder' && styles.typeButtonActive,
              ]}
              onPress={() => setItemType('reminder')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  itemType === 'reminder' && styles.typeButtonTextActive,
                ]}
              >
                Reminder
              </Text>
            </TouchableOpacity>
          </View>
        </CardContainer>

        {/* Title Input */}
        <CardContainer elevated style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder={`Enter ${itemType} title`}
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

        {/* Date & Time - Conditional Rendering Based on Type */}
        <CardContainer elevated style={styles.section}>
          {itemType === 'event' ? (
            <>
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
            </>
          ) : (
            <>
              <Text style={styles.label}>Date & Time</Text>
              
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateTimeIcon}>📅</Text>
                <View style={styles.dateTimeInfo}>
                  <Text style={styles.dateTimeLabel}>Date</Text>
                  <Text style={styles.dateTimeValue}>{formatDate(date)}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateTimeIcon}>🕐</Text>
                <View style={styles.dateTimeInfo}>
                  <Text style={styles.dateTimeLabel}>Time</Text>
                  <Text style={styles.dateTimeValue}>{formatTime(time)}</Text>
                </View>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                />
              )}
            </>
          )}
        </CardContainer>

        {/* Recurring Toggle - For All Types */}
        <CardContainer elevated style={styles.section}>
          <TouchableOpacity
            style={styles.toggleContainer}
            onPress={() => setIsRecurring(!isRecurring)}
          >
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>
                {itemType === 'event' ? 'Recurring Event' : itemType === 'task' ? 'Recurring Task' : 'Recurring Reminder'}
              </Text>
              <Text style={styles.toggleDescription}>
                {itemType === 'event' ? 'Repeat this event' : itemType === 'task' ? 'Repeat this task' : 'Repeat this reminder'}
              </Text>
            </View>
            <View
              style={[
                styles.toggle,
                isRecurring && styles.toggleActive,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  isRecurring && styles.toggleThumbActive,
                ]}
              />
            </View>
          </TouchableOpacity>

          {/* Frequency Options - Show when recurring is enabled */}
          {isRecurring && (
            <View style={styles.frequencyContainer}>
              <View style={styles.frequencyRow}>
                {recurringFrequencies.map((freq) => (
                  <TouchableOpacity
                    key={freq.id}
                    style={[
                      styles.frequencyButton,
                      recurringFrequency === freq.id && styles.frequencyButtonActive,
                    ]}
                    onPress={() => setRecurringFrequency(freq.id)}
                  >
                    <Text style={styles.frequencyIcon}>{freq.icon}</Text>
                    <Text
                      style={[
                        styles.frequencyText,
                        recurringFrequency === freq.id && styles.frequencyTextActive,
                      ]}
                    >
                      {freq.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </CardContainer>

        {/* Location Input - Only for Events */}
        {itemType === 'event' && (
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
        )}

        {/* Priority Selection - For Tasks and Reminders */}
        {(itemType === 'task' || itemType === 'reminder') && (
          <CardContainer elevated style={styles.section}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              {priorities.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.priorityButton,
                    priority === p.id && {
                      backgroundColor: p.color + '20',
                      borderColor: p.color,
                    },
                  ]}
                  onPress={() => setPriority(p.id)}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      priority === p.id && { color: p.color, fontWeight: '600' },
                    ]}
                  >
                    {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </CardContainer>
        )}

        {/* Description Input */}
        <CardContainer elevated style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={`Add ${itemType} details (optional)`}
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
          />
        </CardContainer>

        {/* Save Button */}
        <ButtonPrimary
          title={getSaveButtonText()}
          onPress={handleSave}
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
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: fonts.sizes.body,
    color: colors.text,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: colors.primary,
    fontWeight: '700',
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
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  priorityText: {
    fontSize: fonts.sizes.body,
    color: colors.text,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: fonts.sizes.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: fonts.sizes.small,
    color: '#64748B',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#CBD5E1',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
  frequencyContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  frequencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyButton: {
    flexBasis: '48%',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 8,
  },
  frequencyButtonActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  frequencyIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  frequencyText: {
    fontSize: fonts.sizes.small,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  frequencyTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  saveButton: {
    marginBottom: 32,
  },
});

