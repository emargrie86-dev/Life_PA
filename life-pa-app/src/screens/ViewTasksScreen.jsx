import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  TextInput 
} from 'react-native';
import Layout from '../components/Layout';
import AppHeader from '../components/AppHeader';
import CardContainer from '../components/CardContainer';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { getCategoryById } from '../theme/categories';

export default function ViewTasksScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, completed
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock tasks data
  const mockTasks = [
    {
      id: 1,
      title: 'Complete project proposal',
      description: 'Finish the Q4 project proposal document',
      dueDate: new Date('2025-10-20T14:00:00'),
      categoryId: 'work',
      priority: 'high',
      isCompleted: false,
    },
    {
      id: 2,
      title: 'Buy groceries',
      description: 'Milk, eggs, bread, vegetables',
      dueDate: new Date('2025-10-19T18:00:00'),
      categoryId: 'shopping',
      priority: 'medium',
      isCompleted: false,
    },
    {
      id: 3,
      title: 'Gym workout',
      description: 'Leg day - squats and deadlifts',
      dueDate: new Date('2025-10-18T19:00:00'),
      categoryId: 'health',
      priority: 'medium',
      isCompleted: true,
    },
    {
      id: 4,
      title: 'Call dentist',
      description: 'Schedule teeth cleaning appointment',
      dueDate: new Date('2025-10-21T10:00:00'),
      categoryId: 'appointments',
      priority: 'low',
      isCompleted: false,
    },
    {
      id: 5,
      title: 'Review presentation',
      description: 'Review slides for Monday meeting',
      dueDate: new Date('2025-10-22T09:00:00'),
      categoryId: 'work',
      priority: 'high',
      isCompleted: false,
    },
  ];

  const [tasks, setTasks] = useState(mockTasks);

  const handleToggleComplete = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, isCompleted: !task.isCompleted }
        : task
    ));
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && !task.isCompleted) ||
                         (filterStatus === 'completed' && task.isCompleted);
    const matchesCategory = filterCategory === 'all' || task.categoryId === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const activeTasks = tasks.filter(t => !t.isCompleted).length;
  const completedTasks = tasks.filter(t => t.isCompleted).length;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const formatDueDate = (date) => {
    const now = new Date();
    const diff = date - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return '⚠️ Overdue';
    if (days === 0) return '🔔 Today';
    if (days === 1) return '📅 Tomorrow';
    return `📅 ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  return (
    <Layout style={styles.layout}>
      <AppHeader title="View Tasks" onBackPress={() => navigation.goBack()} />
      
      <View style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <CardContainer elevated style={styles.statCard}>
            <Text style={styles.statNumber}>{activeTasks}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </CardContainer>
          <CardContainer elevated style={styles.statCard}>
            <Text style={styles.statNumber}>{completedTasks}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </CardContainer>
          <CardContainer elevated style={styles.statCard}>
            <Text style={styles.statNumber}>{tasks.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </CardContainer>
        </View>

        {/* Search Bar */}
        <CardContainer elevated style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </CardContainer>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus('all')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === 'all' && styles.filterButtonTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === 'active' && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus('active')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === 'active' && styles.filterButtonTextActive,
              ]}
            >
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === 'completed' && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus('completed')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === 'completed' && styles.filterButtonTextActive,
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tasks List */}
        <ScrollView 
          style={styles.tasksList}
          showsVerticalScrollIndicator={false}
        >
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const category = getCategoryById(task.categoryId);
              const priorityColor = getPriorityColor(task.priority);
              
              return (
                <CardContainer key={task.id} elevated style={styles.taskCard}>
                  <View style={styles.taskContent}>
                    {/* Checkbox */}
                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() => handleToggleComplete(task.id)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          task.isCompleted && styles.checkboxCompleted,
                        ]}
                      >
                        {task.isCompleted && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Task Details */}
                    <View style={styles.taskDetails}>
                      <View style={styles.taskHeader}>
                        <Text
                          style={[
                            styles.taskTitle,
                            task.isCompleted && styles.taskTitleCompleted,
                          ]}
                        >
                          {task.title}
                        </Text>
                        <View
                          style={[
                            styles.priorityDot,
                            { backgroundColor: priorityColor },
                          ]}
                        />
                      </View>
                      
                      {task.description && (
                        <Text style={styles.taskDescription}>
                          {task.description}
                        </Text>
                      )}
                      
                      <View style={styles.taskMeta}>
                        <View
                          style={[
                            styles.categoryBadge,
                            { backgroundColor: category.color + '20' },
                          ]}
                        >
                          <Text style={styles.categoryIcon}>{category.icon}</Text>
                          <Text
                            style={[
                              styles.categoryName,
                              { color: category.color },
                            ]}
                          >
                            {category.name}
                          </Text>
                        </View>
                        
                        <Text style={styles.dueDate}>
                          {formatDueDate(task.dueDate)}
                        </Text>
                      </View>
                    </View>

                    {/* Delete Button */}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteTask(task.id)}
                    >
                      <Text style={styles.deleteIcon}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </CardContainer>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📋</Text>
              <Text style={styles.emptyStateText}>No tasks found</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery ? 'Try a different search' : 'Create a new reminder to get started'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: fonts.sizes.heading,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: fonts.sizes.small,
    color: colors.text,
    opacity: 0.7,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: fonts.sizes.body,
    color: colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: fonts.sizes.body,
    color: colors.text,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  tasksList: {
    flex: 1,
  },
  taskCard: {
    padding: 16,
    marginBottom: 12,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxContainer: {
    paddingTop: 2,
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskDetails: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  taskTitle: {
    flex: 1,
    fontSize: fonts.sizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 6,
  },
  taskDescription: {
    fontSize: fonts.sizes.small,
    color: colors.text,
    opacity: 0.7,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryName: {
    fontSize: fonts.sizes.small,
    fontWeight: '600',
  },
  dueDate: {
    fontSize: fonts.sizes.small,
    color: colors.text,
    opacity: 0.7,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  deleteIcon: {
    fontSize: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: fonts.sizes.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: fonts.sizes.small,
    color: colors.text,
    opacity: 0.6,
    textAlign: 'center',
  },
});

