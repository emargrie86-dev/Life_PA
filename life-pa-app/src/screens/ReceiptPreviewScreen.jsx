/**
 * ReceiptPreviewScreen
 * Preview extracted receipt data before saving
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Platform,
} from 'react-native';
import Layout from '../components/Layout';
import AppHeader from '../components/AppHeader';
import ButtonPrimary from '../components/ButtonPrimary';
import Toast from '../components/Toast';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { createReceipt, uploadReceiptImage } from '../services/receiptService';
import { createReminder } from '../services/taskService';
import { auth } from '../services/firebase';
import { Timestamp } from 'firebase/firestore';

export default function ReceiptPreviewScreen({ route, navigation }) {
  const { imageUri, parsedData, extractedText } = route.params;
  
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Editable fields
  const [merchantName, setMerchantName] = useState(parsedData.merchantName || '');
  const [totalAmount, setTotalAmount] = useState(parsedData.totalAmount?.toString() || '0');
  const [currency, setCurrency] = useState(parsedData.currency || 'USD');
  const [category, setCategory] = useState(parsedData.category || 'Other');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');
  const [setupReminder, setSetupReminder] = useState(false);
  const [reminderDaysBefore, setReminderDaysBefore] = useState('3');

  const categories = ['Groceries', 'Dining', 'Transport', 'Shopping', 'Healthcare', 'Entertainment', 'Utilities', 'Other'];
  const currencies = ['GBP', 'USD', 'EUR', 'CAD', 'AUD', 'JPY'];
  const frequencies = ['weekly', 'monthly', 'quarterly', 'yearly'];

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

  const handleSave = async () => {
    try {
      setSaving(true);
      showToast('Uploading receipt...', 'info');

      // Upload image to Firebase Storage
      console.log('Uploading to Firebase Storage...');
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const imageUrl = await uploadReceiptImage(userId, imageUri);
      console.log('Image uploaded:', imageUrl);

      // Create receipt document
      showToast('Saving receipt...', 'info');
      
      // Convert date to Firestore Timestamp
      let receiptDate;
      if (parsedData.date instanceof Date) {
        receiptDate = Timestamp.fromDate(parsedData.date);
      } else if (parsedData.date) {
        receiptDate = Timestamp.fromDate(new Date(parsedData.date));
      } else {
        receiptDate = Timestamp.now();
      }
      
      // Convert due date to Timestamp if set
      let dueDateTimestamp = null;
      if (dueDate) {
        dueDateTimestamp = Timestamp.fromDate(new Date(dueDate));
      }

      const receiptData = {
        userId,
        imageUrl,
        merchantName,
        date: receiptDate,
        totalAmount: parseFloat(totalAmount) || 0,
        currency,
        category,
        extractedText: extractedText || '',
        items: parsedData.items || [],
        notes,
        dueDate: dueDateTimestamp,
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : null,
      };

      console.log('Creating receipt with data:', {
        ...receiptData,
        date: receiptDate.toDate().toISOString(),
        dueDate: dueDateTimestamp ? dueDateTimestamp.toDate().toISOString() : null,
      });

      const receiptId = await createReceipt(receiptData);
      console.log('✅ Receipt created successfully with ID:', receiptId);
      console.log('Receipt should now appear in the list');

      // Create reminder if requested
      if (setupReminder && dueDateTimestamp) {
        try {
          showToast('Creating reminder...', 'info');
          const daysBefore = parseInt(reminderDaysBefore) || 3;
          const reminderDate = new Date(dueDateTimestamp.toDate());
          reminderDate.setDate(reminderDate.getDate() - daysBefore);

          await createReminder({
            userId,
            title: `Payment Due: ${merchantName}`,
            description: `Bill payment of ${getCurrencySymbol(currency)}${parseFloat(totalAmount).toFixed(2)} due`,
            dueDate: Timestamp.fromDate(reminderDate),
            category: 'Bills',
            receiptId,
            isRecurring,
            recurringFrequency: isRecurring ? recurringFrequency : null,
          });
          console.log('✅ Reminder created successfully');
        } catch (reminderError) {
          console.error('Failed to create reminder:', reminderError);
          showToast('Document saved but reminder creation failed', 'warning');
        }
      }

      setSaving(false);
      showToast('Document saved successfully!', 'success');

      // Navigate to receipt detail screen
      setTimeout(() => {
        navigation.replace('ReceiptDetail', { receiptId });
      }, 500);

    } catch (error) {
      console.error('Failed to save receipt:', error);
      setSaving(false);
      showToast('Failed to save document: ' + error.message, 'error');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const formatDate = (date) => {
    try {
      const d = date instanceof Date ? date : new Date(date);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Today';
    }
  };

  return (
    <Layout style={styles.layout}>
      <AppHeader title="Review Document" onBackPress={handleCancel} />
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Preview Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Review Extracted Data</Text>
          <Text style={styles.headerSubtext}>
            Edit any fields before saving
          </Text>
        </View>

        {/* Receipt Image Preview */}
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.receiptImage}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Editable Fields */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Merchant Name</Text>
            <TextInput
              style={styles.input}
              value={merchantName}
              onChangeText={setMerchantName}
              placeholder="Enter merchant name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.valueText}>{formatDate(parsedData.date)}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Total Amount</Text>
            <View style={styles.amountRow}>
              <TouchableOpacity
                style={styles.currencyButton}
                onPress={() => {
                  // Cycle through currencies
                  const currentIndex = currencies.indexOf(currency);
                  const nextIndex = (currentIndex + 1) % currencies.length;
                  setCurrency(currencies[nextIndex]);
                }}
              >
                <Text style={styles.currencyText}>{getCurrencySymbol(currency)}</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.input, styles.amountInput]}
                value={totalAmount}
                onChangeText={setTotalAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <Text style={styles.hint}>Tap {getCurrencySymbol(currency)} to change currency</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
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
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Due Date Section */}
          <View style={styles.field}>
            <Text style={styles.label}>Due Date (Optional)</Text>
            <TextInput
              style={styles.input}
              value={dueDate || ''}
              onChangeText={setDueDate}
              placeholder="YYYY-MM-DD (e.g., 2025-11-20)"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.hint}>Enter date when this bill is due</Text>
          </View>

          {/* Recurring Billing */}
          <View style={styles.field}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Recurring Bill</Text>
              <Switch
                value={isRecurring}
                onValueChange={setIsRecurring}
                trackColor={{ false: colors.border, true: colors.primary + '80' }}
                thumbColor={isRecurring ? colors.primary : '#f4f3f4'}
              />
            </View>
            {isRecurring && (
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
            )}
          </View>

          {/* Set Up Reminder */}
          {dueDate && (
            <View style={styles.field}>
              <View style={styles.switchRow}>
                <Text style={styles.label}>Set Up Reminder</Text>
                <Switch
                  value={setupReminder}
                  onValueChange={setSetupReminder}
                  trackColor={{ false: colors.border, true: colors.primary + '80' }}
                  thumbColor={setupReminder ? colors.primary : '#f4f3f4'}
                />
              </View>
              {setupReminder && (
                <View style={styles.reminderConfig}>
                  <Text style={styles.reminderLabel}>Remind me</Text>
                  <View style={styles.reminderRow}>
                    <TextInput
                      style={[styles.input, styles.reminderDaysInput]}
                      value={reminderDaysBefore}
                      onChangeText={setReminderDaysBefore}
                      placeholder="3"
                      keyboardType="number-pad"
                      placeholderTextColor={colors.textSecondary}
                    />
                    <Text style={styles.reminderText}>days before due date</Text>
                  </View>
                  <Text style={styles.reminderPreview}>
                    💡 Reminder will be created for {new Date(new Date(dueDate).getTime() - (parseInt(reminderDaysBefore) || 3) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Items Preview */}
          {parsedData.items && parsedData.items.length > 0 && (
            <View style={styles.field}>
              <Text style={styles.label}>Line Items Detected</Text>
              <View style={styles.itemsList}>
                {parsedData.items.slice(0, 3).map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>
                      {getCurrencySymbol(currency)}{item.price?.toFixed(2)}
                    </Text>
                  </View>
                ))}
                {parsedData.items.length > 3 && (
                  <Text style={styles.moreItems}>
                    +{parsedData.items.length - 3} more items
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <ButtonPrimary
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
            style={styles.actionButton}
            disabled={saving}
          />
          <ButtonPrimary
            title={saving ? "Saving..." : "Save Document"}
            onPress={handleSave}
            style={styles.actionButton}
            disabled={saving}
          />
        </View>

        {saving && (
          <View style={styles.savingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.savingText}>Saving receipt...</Text>
          </View>
        )}
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
  header: {
    padding: 16,
    backgroundColor: colors.primary + '10',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fonts.sizes.title,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtext: {
    fontSize: fonts.sizes.small,
    color: colors.textSecondary,
  },
  imageContainer: {
    backgroundColor: '#000',
    height: 200,
    marginVertical: 16,
  },
  receiptImage: {
    width: '100%',
    height: '100%',
  },
  form: {
    padding: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: fonts.sizes.small,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: fonts.sizes.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  valueText: {
    fontSize: fonts.sizes.body,
    color: colors.text,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  currencyText: {
    fontSize: fonts.sizes.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  amountInput: {
    flex: 1,
    fontSize: fonts.sizes.title,
    fontWeight: '600',
  },
  hint: {
    fontSize: fonts.sizes.tiny,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
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
  itemsList: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
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
    fontSize: fonts.sizes.small,
    color: colors.text,
  },
  itemPrice: {
    fontSize: fonts.sizes.small,
    fontWeight: '600',
    color: colors.text,
  },
  moreItems: {
    fontSize: fonts.sizes.small,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
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
  savingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingText: {
    marginTop: 16,
    fontSize: fonts.sizes.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  frequencyPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  frequencyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
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
  reminderConfig: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  reminderLabel: {
    fontSize: fonts.sizes.small,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reminderDaysInput: {
    width: 60,
    textAlign: 'center',
    fontSize: fonts.sizes.body,
    fontWeight: '600',
  },
  reminderText: {
    fontSize: fonts.sizes.body,
    color: colors.text,
    flex: 1,
  },
  reminderPreview: {
    fontSize: fonts.sizes.tiny,
    color: colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

