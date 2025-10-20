/**
 * TaskDetailScreen
 * View and edit task/event/reminder details
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Layout from '../components/Layout';
import AppHeader from '../components/AppHeader';
import ButtonPrimary from '../components/ButtonPrimary';
import Toast from '../components/Toast';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { getAllCategories, getCategoryById } from '../theme/categories';
import { getTask, updateTask, deleteTask } from '../services/taskService';
import { Timestamp } from 'firebase/firestore';

export default function TaskDetailScreen({ route, navigation }) {
  const { taskId } = route.params;
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Editable fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [categoryId, setCategoryId] = useState('personal');
  const [isAllDay, setIsAllDay] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const categories = getAllCategories();

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const taskData = await getTask(taskId);
      setTask(taskData);
      
      // Set editable fields
      setTitle(taskData.title || '');
      setDescription(taskData.description || '');
      setLocation(taskData.location || '');
      setCategoryId(taskData.categoryId || 'personal');
      setIsAllDay(taskData.isAllDay || false);
      setIsCompleted(taskData.isCompleted || false);
      
      // Set due date
      if (taskData.dueDate) {
        const date = taskData.dueDate.toDate ? taskData.dueDate.toDate() : new Date(taskData.dueDate);
        setDueDate(date);
      } else if (taskData.datetime) {
        const date = taskData.datetime.toDate ? taskData.datetime.toDate() : new Date(taskData.datetime);
        setDueDate(date);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load task:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load task details.');
      navigation.goBack();
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showToast('Please enter a title', 'error');
      return;
    }

    try {
      setSaving(true);
      
      const updates = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        dueDate,
        datetime: dueDate,
        categoryId,
        isAllDay,
        isCompleted,
        updatedAt: new Date(),
      };

      await updateTask(taskId, updates);
      
      // Update local state
      setTask({ ...task, ...updates });
      setEditing(false);
      setSaving(false);
      
      showToast('Task updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update task:', error);
      setSaving(false);
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(taskId);
              showToast('Task deleted', 'success');
              navigation.goBack();
            } catch (error) {
              console.error('Failed to delete task:', error);
              Alert.alert('Error', 'Failed to delete task.');
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    // Reset fields to original values
    setTitle(task.title || '');
    setDescription(task.description || '');
    setLocation(task.location || '');
    setCategoryId(task.categoryId || 'personal');
    setIsAllDay(task.isAllDay || false);
    setIsCompleted(task.isCompleted || false);
    
    if (task.dueDate) {
      const date = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
      setDueDate(date);
    } else if (task.datetime) {
      const date = task.datetime.toDate ? task.datetime.toDate() : new Date(task.datetime);
      setDueDate(date);
    }
    
    setEditing(false);
  };

  const handleToggleComplete = async () => {
    try {
      const newStatus = !isCompleted;
      setIsCompleted(newStatus);
      
      await updateTask(taskId, {
        isCompleted: newStatus,
        updatedAt: new Date(),
      });
      
      showToast(newStatus ? 'Task completed!' : 'Task marked incomplete', 'success');
    } catch (error) {
      console.error('Failed to toggle complete:', error);
      setIsCompleted(!isCompleted); // Revert on error
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (date) => {
    if (!date) return 'Not set';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedDate) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  if (loading) {
    return (
      <Layout>
        <AppHeader title="Task Details" onBackPress={() => navigation.goBack()} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout>
        <AppHeader title="Task Details" onBackPress={() => navigation.goBack()} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Task not found</Text>
        </View>
      </Layout>
    );
  }

  const category = getCategoryById(categoryId);

  return (
    <Layout style={styles.layout}>
      <AppHeader title="Task Details" onBackPress={() => navigation.goBack()} />
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Status Bar */}
        <View style={[styles.statusBar, { backgroundColor: isCompleted ? colors.success + '20' : colors.primary + '20' }]}>
          <Text style={[styles.statusText, { color: isCompleted ? colors.success : colors.primary }]}>
            {isCompleted ? '✓ Completed' : task.type === 'event' ? '📅 Event' : '🔔 Reminder'}
          </Text>
          <Switch
            value={isCompleted}
            onValueChange={handleToggleComplete}
            trackColor={{ false: colors.border, true: colors.success }}
            thumbColor={isCompleted ? '#fff' : '#f4f3f4'}
          />
        </View>

        {/* Task Details */}
        <View style={styles.detailsCard}>
          {/* Title */}
          <View style={styles.detailRow}>
            <Text style={styles.label}>Title</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Task title"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={styles.value}>{task.title}</Text>
            )}
          </View>

          {/* Description */}
          <View style={styles.detailRow}>
            <Text style={styles.label}>Description</Text>
            {editing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Description (optional)"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            ) : (
              <Text style={styles.value}>{task.description || 'No description'}</Text>
            )}
          </View>

          {/* Location */}
          {task.type === 'event' && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Location</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Location (optional)"
                  placeholderTextColor={colors.textSecondary}
                />
              ) : (
                <Text style={styles.value}>{task.location || 'No location'}</Text>
              )}
            </View>
          )}

          {/* Date & Time */}
          <View style={styles.detailRow}>
            <Text style={styles.label}>Date & Time</Text>
            {editing ? (
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>{formatDate(dueDate)}</Text>
                </TouchableOpacity>
                {!isAllDay && (
                  <TouchableOpacity 
                    style={styles.dateButton}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>{formatTime(dueDate)}</Text>
                  </TouchableOpacity>
                )}
                {showDatePicker && (
                  <DateTimePicker
                    value={dueDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
                {showTimePicker && (
                  <DateTimePicker
                    value={dueDate}
                    mode="time"
                    display="default"
                    onChange={handleTimeChange}
                  />
                )}
              </View>
            ) : (
              <Text style={styles.value}>
                {formatDate(task.dueDate || task.datetime)}
                {!isAllDay && ` at ${formatTime(task.dueDate || task.datetime)}`}
              </Text>
            )}
          </View>

          {/* Category */}
          <View style={styles.detailRow}>
            <Text style={styles.label}>Category</Text>
            {editing ? (
              <View style={styles.categoryGrid}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: cat.color + '20' },
                      categoryId === cat.id && styles.categoryChipSelected,
                    ]}
                    onPress={() => setCategoryId(cat.id)}
                  >
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text style={[styles.categoryLabel, { color: cat.color }]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={[styles.categoryBadge, { backgroundColor: category.color + '20' }]}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[styles.categoryName, { color: category.color }]}>
                  {category.name}
                </Text>
              </View>
            )}
          </View>

          {/* All Day Toggle */}
          {editing && task.type === 'event' && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>All Day Event</Text>
              <Switch
                value={isAllDay}
                onValueChange={setIsAllDay}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={isAllDay ? '#fff' : '#f4f3f4'}
              />
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {editing ? (
            <>
              <ButtonPrimary
                title="Cancel"
                onPress={handleCancel}
                variant="outline"
                style={styles.actionButton}
                disabled={saving}
              />
              <ButtonPrimary
                title={saving ? "Saving..." : "Save"}
                onPress={handleSave}
                style={styles.actionButton}
                disabled={saving}
              />
            </>
          ) : (
            <>
              <ButtonPrimary
                title="Edit"
                onPress={() => setEditing(true)}
                variant="outline"
                style={styles.actionButton}
              />
              <ButtonPrimary
                title="Delete"
                onPress={handleDelete}
                style={[styles.actionButton, styles.deleteButton]}
              />
            </>
          )}
        </View>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: fonts.sizes.body,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: fonts.sizes.body,
    color: colors.error,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusText: {
    fontSize: fonts.sizes.body,
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: fonts.sizes.small,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  value: {
    fontSize: fonts.sizes.body,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: fonts.sizes.body,
    color: colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: fonts.sizes.body,
    color: colors.text,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  categoryChipSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: fonts.sizes.small,
    fontWeight: '600',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    alignSelf: 'flex-start',
  },
  categoryName: {
    fontSize: fonts.sizes.body,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: colors.error || '#F44336',
  },
});

