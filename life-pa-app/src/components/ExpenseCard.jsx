/**
 * ExpenseCard Component
 * Displays upcoming expense with amount and due date
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { MotiView } from 'moti';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

function ExpenseCard({ 
  expense, 
  onPress, 
  isLastItem, 
  animationDelay,
  formatDate,
  getCurrencySymbol,
  getCategoryColor,
}) {
  const categoryColor = getCategoryColor(expense.category);
  
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
        onPress={() => onPress(expense)}
      >
        <View style={[styles.expenseCard, !isLastItem && styles.expenseCardWithBorder]}>
          <View style={styles.expenseContent}>
            {/* Expense Icon */}
            <View style={[styles.expenseIconContainer, { backgroundColor: categoryColor + '20' }]}>
              <Text style={styles.expenseIcon}>💰</Text>
            </View>
            
            {/* Expense Details */}
            <View style={styles.expenseDetails}>
              <Text style={styles.expenseTitle} numberOfLines={1}>
                {expense.merchantName}
              </Text>
              <View style={styles.expenseMeta}>
                <Text style={styles.expenseDate}>{formatDate(expense.dueDate)}</Text>
                {expense.isRecurring && (
                  <Text style={styles.expenseRecurring}>• 🔄 Recurring</Text>
                )}
              </View>
              <View style={[styles.expenseCategory, { backgroundColor: categoryColor + '15' }]}>
                <Text style={[styles.expenseCategoryText, { color: categoryColor }]}>
                  {expense.category || 'Other'}
                </Text>
              </View>
            </View>

            {/* Amount */}
            <View style={styles.expenseAmountContainer}>
              <Text style={styles.expenseAmount}>
                {getCurrencySymbol(expense.currency)}{expense.amount.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  expenseCard: {
    paddingVertical: 12,
  },
  expenseCardWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 12,
    paddingBottom: 16,
  },
  expenseContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseIcon: {
    fontSize: 28,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: fonts.sizes.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  expenseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  expenseDate: {
    fontSize: fonts.sizes.small,
    color: colors.text,
    opacity: 0.7,
    fontWeight: '500',
  },
  expenseRecurring: {
    fontSize: fonts.sizes.small,
    color: colors.text,
    opacity: 0.7,
    marginLeft: 4,
  },
  expenseCategory: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  expenseCategoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  expenseAmountContainer: {
    marginLeft: 'auto',
    paddingLeft: 12,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
});

ExpenseCard.propTypes = {
  expense: PropTypes.shape({
    id: PropTypes.string.isRequired,
    merchantName: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    currency: PropTypes.string.isRequired,
    category: PropTypes.string,
    dueDate: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]).isRequired,
    isRecurring: PropTypes.bool,
  }).isRequired,
  onPress: PropTypes.func.isRequired,
  isLastItem: PropTypes.bool,
  animationDelay: PropTypes.number,
  formatDate: PropTypes.func.isRequired,
  getCurrencySymbol: PropTypes.func.isRequired,
  getCategoryColor: PropTypes.func.isRequired,
};

ExpenseCard.defaultProps = {
  isLastItem: false,
  animationDelay: 0,
};

export default React.memo(ExpenseCard);

