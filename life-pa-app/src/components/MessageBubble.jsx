import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export default function MessageBubble({ 
  message, 
  onCopy, 
  onRegenerate 
}) {
  const isUser = message.role === 'user';
  const timestamp = message.timestamp?.toDate ? message.timestamp.toDate() : new Date(message.timestamp);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCopy = () => {
    if (onCopy) {
      onCopy(message.content);
    }
  };

  const handleRegenerate = () => {
    if (onRegenerate && !isUser) {
      onRegenerate(message);
    }
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[
        styles.bubble, 
        isUser ? styles.userBubble : styles.assistantBubble
      ]}>
        <Text style={[
          styles.messageText, 
          isUser ? styles.userText : styles.assistantText
        ]}>
          {message.content}
        </Text>
        
        <View style={styles.messageFooter}>
          <Text style={[
            styles.timestamp, 
            isUser ? styles.userTimestamp : styles.assistantTimestamp
          ]}>
            {formatTime(timestamp)}
          </Text>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleCopy}
            >
              <Text style={styles.actionText}>Copy</Text>
            </TouchableOpacity>
            
            {!isUser && onRegenerate && (
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleRegenerate}
              >
                <Text style={styles.actionText}>Regenerate</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: fonts.sizes.body,
    lineHeight: 20,
  },
  userText: {
    color: colors.surface,
  },
  assistantText: {
    color: colors.text,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timestamp: {
    fontSize: fonts.sizes.small,
    opacity: 0.7,
  },
  userTimestamp: {
    color: colors.surface,
  },
  assistantTimestamp: {
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionText: {
    fontSize: fonts.sizes.small,
    color: colors.surface,
    fontWeight: '500',
  },
});
