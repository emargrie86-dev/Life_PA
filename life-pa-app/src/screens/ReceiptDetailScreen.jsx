/**
 * DocumentDetailScreen (formerly ReceiptDetailScreen)
 * View and edit document details
 * Handles receipts, invoices, bills, and other document types
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import Layout from '../components/Layout';
import AppHeader from '../components/AppHeader';
import ButtonPrimary from '../components/ButtonPrimary';
import Toast from '../components/Toast';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { getDocument, updateDocument, deleteDocument } from '../services/documentService';
import { Timestamp } from 'firebase/firestore';

export default function DocumentDetailScreen({ route, navigation }) {
  const { documentId, receiptId } = route.params; // Support both new and old param names
  const id = documentId || receiptId; // Use documentId if available, fallback to receiptId
  
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Editable fields
  const [merchantName, setMerchantName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');

  const categories = ['Groceries', 'Dining', 'Transport', 'Shopping', 'Healthcare', 'Entertainment', 'Utilities', 'Other'];
  const frequencies = ['weekly', 'monthly', 'quarterly', 'yearly'];

  useEffect(() => {
    loadReceipt();
  }, [id]);

  const loadReceipt = async () => {
    try {
      setLoading(true);
      const receiptData = await getDocument(id);
      setReceipt(receiptData);
      
      // Set editable fields
      setMerchantName(receiptData.merchantName || '');
      setTotalAmount(receiptData.totalAmount?.toString() || '0');
      setCategory(receiptData.category || 'Other');
      setNotes(receiptData.notes || '');
      
      // Set due date if exists
      if (receiptData.dueDate) {
        try {
          const date = receiptData.dueDate.toDate ? receiptData.dueDate.toDate() : new Date(receiptData.dueDate);
          setDueDate(date.toISOString().split('T')[0]);
        } catch (error) {
          console.error('Error parsing due date:', error);
        }
      }
      
      setIsRecurring(receiptData.isRecurring || false);
      setRecurringFrequency(receiptData.recurringFrequency || 'monthly');
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load receipt:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load document details.');
      navigation.goBack();
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Convert due date to Timestamp if set
      let dueDateTimestamp = null;
      if (dueDate) {
        try {
          dueDateTimestamp = Timestamp.fromDate(new Date(dueDate));
        } catch (error) {
          console.error('Invalid due date:', error);
        }
      }
      
      const updates = {
        merchantName,
        totalAmount: parseFloat(totalAmount) || 0,
        category,
        notes,
        dueDate: dueDateTimestamp,
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : null,
      };
      
      await updateDocument(id, updates);
      
      // Update local state
      setReceipt({ ...receipt, ...updates });
      setEditing(false);
      setSaving(false);
      
      showToast('Document updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update receipt:', error);
      setSaving(false);
      Alert.alert('Error', 'Failed to update document. Please try again.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument(id, receipt.imageUrl);
              showToast('Document deleted', 'success');
              navigation.goBack();
            } catch (error) {
              console.error('Failed to delete receipt:', error);
              Alert.alert('Error', 'Failed to delete document.');
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    // Reset fields
    setMerchantName(receipt.merchantName || '');
    setTotalAmount(receipt.totalAmount?.toString() || '0');
    setCategory(receipt.category || 'Other');
    setNotes(receipt.notes || '');
    
    if (receipt.dueDate) {
      try {
        const date = receipt.dueDate.toDate ? receipt.dueDate.toDate() : new Date(receipt.dueDate);
        setDueDate(date.toISOString().split('T')[0]);
      } catch (error) {
        setDueDate('');
      }
    } else {
      setDueDate('');
    }
    
    setIsRecurring(receipt.isRecurring || false);
    setRecurringFrequency(receipt.recurringFrequency || 'monthly');
    setEditing(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return '';
    }
  };

  const getCurrencySymbol = (currencyCode) => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'CAD': 'C$',
      'AUD': 'A$',
      'JPY': '¥',
      'CNY': '¥',
      'INR': '₹',
    };
    return symbols[currencyCode] || currencyCode || '$';
  };

  const formatAmount = (amount, currencyCode) => {
    const symbol = getCurrencySymbol(currencyCode);
    const value = amount?.toFixed(2) || '0.00';
    return `${symbol}${value}`;
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  if (loading) {
    return (
      <Layout>
        <AppHeader title="Document Details" onBackPress={() => navigation.goBack()} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading receipt...</Text>
        </View>
      </Layout>
    );
  }

  if (!receipt) {
    return (
      <Layout>
        <AppHeader title="Document Details" onBackPress={() => navigation.goBack()} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Document not found</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout style={styles.layout}>
      <AppHeader title="Document Details" onBackPress={() => navigation.goBack()} />
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Document Image */}
        {receipt.imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: receipt.imageUrl }}
              style={styles.receiptImage}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Document Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Merchant</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={merchantName}
                onChangeText={setMerchantName}
                placeholder="Merchant name"
              />
            ) : (
              <Text style={styles.value}>{receipt.merchantName}</Text>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{formatDate(receipt.date)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Amount</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={totalAmount}
                onChangeText={setTotalAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            ) : (
              <Text style={[styles.value, styles.amount]}>
                {formatAmount(receipt.totalAmount, receipt.currency)}
              </Text>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Currency</Text>
            <Text style={styles.value}>{receipt.currency || 'USD'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Category</Text>
            {editing ? (
              <View style={styles.categoryPicker}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      category === cat && styles.categoryChipSelected,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        category === cat && styles.categoryChipTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{receipt.category}</Text>
              </View>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Notes</Text>
            {editing ? (
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add notes..."
                multiline
                numberOfLines={3}
              />
            ) : (
              <Text style={styles.value}>
                {receipt.notes || 'No notes'}
              </Text>
            )}
          </View>

          {/* Due Date */}
          <View style={styles.detailRow}>
            <Text style={styles.label}>Due Date</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="YYYY-MM-DD"
              />
            ) : (
              <Text style={styles.value}>
                {receipt.dueDate ? formatDate(receipt.dueDate) : 'Not set'}
              </Text>
            )}
          </View>

          {/* Recurring Billing */}
          <View style={styles.detailRow}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Recurring Bill</Text>
              {editing ? (
                <Switch
                  value={isRecurring}
                  onValueChange={setIsRecurring}
                  trackColor={{ false: colors.border, true: colors.primary + '80' }}
                  thumbColor={isRecurring ? colors.primary : '#f4f3f4'}
                />
              ) : (
                <Text style={styles.value}>
                  {receipt.isRecurring ? 'Yes' : 'No'}
                </Text>
              )}
            </View>
            {(editing && isRecurring) || (!editing && receipt.isRecurring) ? (
              <View style={styles.frequencySection}>
                <Text style={styles.frequencyLabel}>Frequency:</Text>
                {editing ? (
                  <View style={styles.frequencyPicker}>
                    {frequencies.map((freq) => (
                      <TouchableOpacity
                        key={freq}
                        style={[
                          styles.frequencyChip,
                          recurringFrequency === freq && styles.frequencyChipSelected,
                        ]}
                        onPress={() => setRecurringFrequency(freq)}
                      >
                        <Text
                          style={[
                            styles.frequencyChipText,
                            recurringFrequency === freq && styles.frequencyChipTextSelected,
                          ]}
                        >
                          {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.frequencyValue}>
                    {receipt.recurringFrequency ? 
                      receipt.recurringFrequency.charAt(0).toUpperCase() + receipt.recurringFrequency.slice(1)
                      : 'Monthly'}
                  </Text>
                )}
              </View>
            ) : null}
          </View>

          {/* Items List */}
          {receipt.items && receipt.items.length > 0 && (
            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>Items</Text>
              {receipt.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.itemDetails}>
                    {item.quantity > 1 && (
                      <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                    )}
                    <Text style={styles.itemPrice}>
                      {formatAmount(item.price, receipt.currency)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Extracted Text */}
          {receipt.extractedText && (
            <View style={styles.extractedSection}>
              <Text style={styles.sectionTitle}>Extracted Text (OCR)</Text>
              <ScrollView style={styles.extractedTextContainer} nestedScrollEnabled>
                <Text style={styles.extractedText}>{receipt.extractedText}</Text>
              </ScrollView>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {editing ? (
            <>
              <ButtonPrimary
                title="Cancel"
                onPress={handleCancel}
                variant="outline"
                style={styles.actionButton}
              />
              <ButtonPrimary
                title="Save Changes"
                onPress={handleSave}
                disabled={saving}
                style={styles.actionButton}
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
                variant="outline"
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
    padding: 0,
  },
  content: {
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
  errorText: {
    fontSize: fonts.sizes.body,
    color: colors.error,
  },
  imageContainer: {
    backgroundColor: '#000',
    height: 300,
  },
  receiptImage: {
    width: '100%',
    height: '100%',
  },
  detailsCard: {
    backgroundColor: colors.surface,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  detailRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: fonts.sizes.small,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  value: {
    fontSize: fonts.sizes.body,
    color: colors.text,
  },
  amount: {
    fontSize: fonts.sizes.title,
    fontWeight: '700',
    color: colors.primary,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: fonts.sizes.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: fonts.sizes.small,
    color: colors.text,
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: fonts.sizes.small,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  itemsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: fonts.sizes.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemName: {
    flex: 1,
    fontSize: fonts.sizes.body,
    color: colors.text,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemQuantity: {
    fontSize: fonts.sizes.small,
    color: colors.textSecondary,
  },
  itemPrice: {
    fontSize: fonts.sizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  extractedSection: {
    marginTop: 16,
  },
  extractedTextContainer: {
    maxHeight: 200,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
  },
  extractedText: {
    fontSize: fonts.sizes.small,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 32,
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    borderColor: colors.error,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  frequencySection: {
    marginTop: 12,
  },
  frequencyLabel: {
    fontSize: fonts.sizes.small,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  frequencyValue: {
    fontSize: fonts.sizes.body,
    color: colors.text,
    paddingVertical: 8,
  },
  frequencyPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  frequencyChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  frequencyChipText: {
    fontSize: fonts.sizes.small,
    color: colors.text,
  },
  frequencyChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

