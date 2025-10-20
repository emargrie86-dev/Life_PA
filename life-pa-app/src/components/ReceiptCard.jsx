/**
 * ReceiptCard Component
 * Displays a receipt card with thumbnail and summary
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function ReceiptCard({ receipt, onPress, onDelete }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };

  const formatAmount = (amount, currency = 'USD') => {
    if (amount === undefined || amount === null) return '$0.00';
    
    const symbol = currency === 'USD' ? '$' : currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  const getCategoryColor = (category) => {
    const categoryColors = {
      'Groceries': '#4CAF50',
      'Dining': '#FF9800',
      'Transport': '#2196F3',
      'Shopping': '#E91E63',
      'Healthcare': '#9C27B0',
      'Entertainment': '#00BCD4',
      'Utilities': '#795548',
      'Other': '#757575',
    };

    return categoryColors[category] || categoryColors.Other;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        {/* Merchant Name and Amount */}
        <View style={styles.header}>
          <Text style={styles.merchantName} numberOfLines={1}>
            {receipt.merchantName || 'Unknown Merchant'}
          </Text>
        </View>
        
        {/* Date */}
        <Text style={styles.date}>{formatDate(receipt.date)}</Text>
        
        {/* Notes (if any) */}
        {receipt.notes && (
          <Text style={styles.notes} numberOfLines={1}>
            {receipt.notes}
          </Text>
        )}
        
        {/* Bottom Row: Category Badge, Amount, Delete Button */}
        <View style={styles.footer}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(receipt.category) }]}>
            <Text style={styles.categoryText}>{receipt.category || 'Other'}</Text>
          </View>
          
          <View style={styles.rightSection}>
            <Text style={styles.amount}>
              {formatAmount(receipt.totalAmount, receipt.currency)}
            </Text>
            
            {/* Delete Button */}
            {onDelete && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={(e) => {
                  console.log('🗑️ Delete button clicked for receipt:', receipt.id);
                  if (e && e.stopPropagation) {
                    e.stopPropagation();
                  }
                  onDelete(receipt.id);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: 8,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  date: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  notes: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 18,
  },
});

