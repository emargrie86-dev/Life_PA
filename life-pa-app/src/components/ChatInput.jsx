import React, { useState, useRef } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export default function ChatInput({ 
  onSendMessage, 
  loading = false, 
  placeholder = "Type your message...",
  disabled = false 
}) {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleSend = () => {
    if (message.trim() && !loading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      // Keep focus on input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyPress = (event) => {
    if (event.nativeEvent.key === 'Enter' && Platform.OS === 'web') {
      handleSend();
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={[
            styles.textInput,
            disabled && styles.textInputDisabled
          ]}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight + '80'}
          multiline
          maxLength={2000}
          editable={!loading && !disabled}
          onKeyPress={handleKeyPress}
          returnKeyType="default"
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || loading || disabled) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!message.trim() || loading || disabled}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.sendButtonText,
            (!message.trim() || loading || disabled) && styles.sendButtonTextDisabled
          ]}>
            {loading ? '...' : 'Send'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {message.length > 1800 && (
        <Text style={styles.characterCount}>
          {message.length}/2000 characters
        </Text>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    fontSize: fonts.sizes.body,
    color: colors.text,
    paddingVertical: 8,
    paddingHorizontal: 4,
    textAlignVertical: 'top',
  },
  textInputDisabled: {
    color: '#9CA3AF',
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 8,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  sendButtonText: {
    color: colors.surface,
    fontSize: fonts.sizes.body,
    fontWeight: '600',
  },
  sendButtonTextDisabled: {
    color: '#9CA3AF',
  },
  characterCount: {
    fontSize: fonts.sizes.small,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
  },
});
