/**
 * DocumentsListScreen (formerly ReceiptsListScreen)
 * Display all documents in a scrollable list
 * Includes receipts, invoices, bills, and other document types
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Layout from '../components/Layout';
import AppHeader from '../components/AppHeader';
import ReceiptCard from '../components/ReceiptCard';
import CardContainer from '../components/CardContainer';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { getUserDocuments, getTotalsByCategory, deleteDocument } from '../services/documentService';
import { auth } from '../services/firebase';

export default function DocumentsListScreen({ navigation }) {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' or category name
  const [totalSpending, setTotalSpending] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadReceipts();
    }, [])
  );

  const loadReceipts = async () => {
    try {
      console.log('=== LOADING RECEIPTS ===');
      setLoading(true);
      const userId = auth.currentUser?.uid;
      console.log('User ID:', userId);
      
      if (!userId) {
        console.error('User not authenticated');
        setLoading(false);
        return;
      }

      console.log('Fetching documents from Firestore...');
      const receiptsData = await getUserDocuments(userId, 100);
      console.log(`✅ Loaded ${receiptsData.length} receipts:`, receiptsData.map(r => ({
        id: r.id,
        merchant: r.merchantName,
        amount: r.totalAmount,
        date: r.date,
      })));
      setReceipts(receiptsData);

      // Calculate total spending
      const totals = await getTotalsByCategory(userId);
      const total = Object.values(totals).reduce((sum, val) => sum + val, 0);
      setTotalSpending(total);
      console.log('Total spending:', total);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load receipts:', error);
      console.error('Error details:', error.message);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReceipts();
    setRefreshing(false);
  };

  const handleReceiptPress = (receipt) => {
    navigation.navigate('DocumentDetail', { documentId: receipt.id });
  };

  const handleScanPress = () => {
    navigation.navigate('UploadDocument');
  };

  const handleDeleteReceipt = async (receiptId) => {
    console.log('🎯 handleDeleteReceipt called with ID:', receiptId);
    console.log('Current receipts count:', receipts.length);
    
    const performDelete = async () => {
      console.log('Delete confirmed, proceeding...');
      try {
        // Find the receipt to get the imageUrl
        const receipt = receipts.find(r => r.id === receiptId);
        console.log('Found document to delete:', receipt?.merchantName);
        
        await deleteDocument(receiptId, receipt?.imageUrl);
        console.log('Document deleted from Firestore');
        
        // Update local state
        const updatedReceipts = receipts.filter(r => r.id !== receiptId);
        setReceipts(updatedReceipts);
        console.log('Updated receipts count:', updatedReceipts.length);
        
        // Recalculate total spending
        const newTotal = updatedReceipts.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
        setTotalSpending(newTotal);
        console.log('New total spending:', newTotal);
        
        console.log('✅ Receipt deleted successfully');
      } catch (error) {
        console.error('Failed to delete receipt:', error);
        if (Platform.OS === 'web') {
          window.alert('Failed to delete document. Please try again.');
        } else {
          Alert.alert('Error', 'Failed to delete document. Please try again.');
        }
      }
    };

    // Use window.confirm on web, Alert on native
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to delete this document? This action cannot be undone.');
      if (confirmed) {
        await performDelete();
      } else {
        console.log('Delete cancelled');
      }
    } else {
      Alert.alert(
        'Delete Document',
        'Are you sure you want to delete this document? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => console.log('Delete cancelled'),
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: performDelete,
          },
        ]
      );
    }
  };

  // Filter receipts by search and category
  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = searchQuery.trim() === '' ||
      receipt.merchantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filter === 'all' || receipt.category === filter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'Groceries', 'Dining', 'Transport', 'Shopping', 'Healthcare', 'Entertainment', 'Utilities', 'Other'];
  
  const receiptCount = receipts.length;
  const filteredCount = filteredReceipts.length;

  const renderReceipt = ({ item }) => (
    <ReceiptCard 
      receipt={item} 
      onPress={() => handleReceiptPress(item)}
      onDelete={handleDeleteReceipt}
    />
  );

  const getCurrencySymbol = (currencyCode) => {
    const symbols = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'CAD': 'C$', 'AUD': 'A$',
      'JPY': '¥', 'CNY': '¥', 'INR': '₹',
    };
    return symbols[currencyCode] || currencyCode || '$';
  };

  if (loading) {
    return (
      <Layout>
        <AppHeader title="My Documents" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading documents...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout style={styles.layout}>
      <AppHeader title="My Documents" />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <CardContainer style={styles.statCard}>
            <Text style={styles.statNumber}>{getCurrencySymbol('GBP')}{totalSpending.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Spending</Text>
          </CardContainer>
          
          <CardContainer style={styles.statCard}>
            <Text style={styles.statNumber}>{receiptCount}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </CardContainer>
          
          <CardContainer style={styles.statCard}>
            <Text style={styles.statNumber}>{filteredCount}</Text>
            <Text style={styles.statLabel}>Showing</Text>
          </CardContainer>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search documents..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearButton}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Filter Buttons */}
        <View style={styles.filterButtonsContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          
          {categories.filter(c => c !== 'all').slice(0, 4).map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.filterButton, filter === category && styles.filterButtonActive]}
              onPress={() => setFilter(category)}
            >
              <Text style={[styles.filterButtonText, filter === category && styles.filterButtonTextActive]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* More Categories Row */}
        <View style={styles.filterButtonsContainer}>
          {categories.filter(c => c !== 'all').slice(4).map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.filterButton, filter === category && styles.filterButtonActive]}
              onPress={() => setFilter(category)}
            >
              <Text style={[styles.filterButtonText, filter === category && styles.filterButtonTextActive]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upload New Document Button */}
        <TouchableOpacity style={styles.scanButton} onPress={handleScanPress}>
          <Text style={styles.scanButtonIcon}>📤</Text>
          <Text style={styles.scanButtonText}>Upload New Document</Text>
        </TouchableOpacity>

        {/* Receipts List */}
        <View style={styles.receiptsContainer}>
          {filteredReceipts.length > 0 ? (
            filteredReceipts.map((receipt) => (
              <View key={receipt.id} style={styles.receiptWrapper}>
                <ReceiptCard 
                  receipt={receipt} 
                  onPress={() => handleReceiptPress(receipt)}
                  onDelete={handleDeleteReceipt}
                />
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🧾</Text>
              <Text style={styles.emptyStateText}>No documents found</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery ? 'Try a different search' : 'Upload a document to get started'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  layout: {
    padding: 0,
  },
  scrollView: {
    flex: 1,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: fonts.sizes.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: fonts.sizes.body,
    color: colors.text,
  },
  clearButton: {
    fontSize: 20,
    color: colors.textSecondary,
    paddingHorizontal: 8,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: fonts.sizes.small,
    fontWeight: '600',
    color: colors.text,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
  },
  scanButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  scanButtonText: {
    fontSize: fonts.sizes.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  receiptsContainer: {
    paddingBottom: 24,
  },
  receiptWrapper: {
    marginBottom: 0,
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 72,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: fonts.sizes.title,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: fonts.sizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

