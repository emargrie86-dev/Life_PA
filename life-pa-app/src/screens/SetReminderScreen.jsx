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
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { getAllCategories } from '../theme/categories';

export default function SetReminderScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('personal');
  const [priority, setPriority] = useState('medium');
  const [isRecurring, setIsRecurring] = useState(false);

  const categories = getAllCategories();
  const priorities = [
    { id: 'high', name: 'High', color: '#EF4444' },
    { id: 'medium', name: 'Medium', color: '#F59E0B' },
    { id: 'low', name: 'Low', color: '#10B981' },
  ];

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

  const handleSaveReminder = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a reminder title');
      return;
    }

    // TODO: Save reminder to database
    console.log('Saving reminder:', {
      title,
      description,
      date,
      time,
      category: selectedCategory,
      priority,
      isRecurring,
    });

    Alert.alert(
      'Success',
      'Reminder created successfully!',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
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

  return (
    <Layout style={styles.layout}>
      <AppHeader title="Set Reminder" onBackPress={() => navigation.goBack()} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Input */}
        <CardContainer elevated style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter reminder title"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
          />
        </CardContainer>

        {/* Description Input */}
        <CardContainer elevated style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add a description (optional)"
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </CardContainer>

        {/* Date & Time Picker */}
        <CardContainer elevated style={styles.section}>
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
        </CardContainer>

        {/* Category Selection */}
        <CardContainer elevated style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.slice(0, 8).map((category) => (
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
          </View>
        </CardContainer>

        {/* Priority Selection */}
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

        {/* Recurring Toggle */}
        <CardContainer elevated style={styles.section}>
          <TouchableOpacity
            style={styles.toggleContainer}
            onPress={() => setIsRecurring(!isRecurring)}
          >
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Recurring Reminder</Text>
              <Text style={styles.toggleDescription}>Repeat this reminder</Text>
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
        </CardContainer>

        {/* Save Button */}
        <ButtonPrimary
          title="Create Reminder"
          onPress={handleSaveReminder}
          style={styles.saveButton}
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
    minHeight: 100,
    textAlignVertical: 'top',
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    minWidth: '45%',
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  categoryText: {
    fontSize: fonts.sizes.small,
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
  saveButton: {
    marginBottom: 32,
  },
});

