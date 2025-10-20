import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  Clipboard,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import Layout from '../components/Layout';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import { sendChatMessage, isProviderInitialized, initializeAIClients } from '../services/aiService';
import { 
  getConversation, 
  addMessage, 
  createConversation,
  updateConversationTitle 
} from '../services/chatService';
import { getCurrentUser } from '../services/auth';
import { AI_TOOLS, getCurrentDateTimeContext } from '../services/aiTools';
import { executeToolCalls } from '../services/functionExecutor';

export default function ChatScreen({ navigation, route }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const flatListRef = useRef(null);
  const conversationId = route?.params?.conversationId;

  const user = getCurrentUser();

  useEffect(() => {
    if (conversationId) {
      loadConversation();
    } else {
      createNewConversation();
    }
    
    // Ensure AI clients are initialized when screen loads
    const initializeClients = async () => {
      try {
        console.log('ChatScreen: Checking AI provider initialization...');
        const clients = await initializeAIClients();
        console.log('ChatScreen: AI clients initialized:', clients);
      } catch (error) {
        console.log('ChatScreen: AI client initialization failed:', error.message);
      }
    };
    
    initializeClients();
  }, [conversationId]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      const conv = await getConversation(conversationId);
      if (conv) {
        setConversation(conv);
        setMessages(conv.messages || []);
      } else {
        Alert.alert('Error', 'Conversation not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      Alert.alert('Error', 'Failed to load conversation');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      setLoading(true);
      const newConversationId = await createConversation();
      const conv = await getConversation(newConversationId);
      setConversation(conv);
      setMessages([]);
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Error', 'Failed to create new conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;

    // Check if AI provider is initialized
    const isInitialized = await isProviderInitialized();
    console.log('AI provider status:', isInitialized ? 'Initialized' : 'Not initialized');
    
    if (!isInitialized) {
      Alert.alert(
        'API Key Required', 
        'Please set your AI provider API key in Settings to use the chat feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Settings', onPress: () => navigation.navigate('Settings') }
        ]
      );
      return;
    }

    try {
      setSendingMessage(true);

      // Add user message immediately to UI
      const userMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: content,
        timestamp: new Date()
      };

      let currentMessages = [...messages, userMessage];
      setMessages(currentMessages);

      // Add user message to conversation in Firestore
      await addMessage(conversation.id, 'user', content);

      // Add system context about current date/time
      const dateTimeContext = getCurrentDateTimeContext();
      const systemMessage = {
        role: 'system',
        content: `You are a helpful personal assistant. Today is ${dateTimeContext.dayOfWeek}, ${dateTimeContext.today}, and the current time is ${dateTimeContext.currentTime}. When users ask for dates like "tomorrow" or "next Monday", calculate the correct date based on today being ${dateTimeContext.today}.`,
      };

      // Prepare messages for AI (including conversation history and system context)
      const aiMessages = [systemMessage, ...currentMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))];

      // Get AI response with tools
      console.log('Sending message with tools enabled');
      console.log('Tools being sent:', JSON.stringify(AI_TOOLS, null, 2));
      const aiResponse = await sendChatMessage(aiMessages, { tools: AI_TOOLS });
      console.log('AI Response received:', JSON.stringify(aiResponse, null, 2));

      // Check if AI wants to use tools
      if (aiResponse.tool_calls && aiResponse.tool_calls.length > 0) {
        console.log('=== AI REQUESTED TOOL CALLS ===');
        console.log('Tool calls:', JSON.stringify(aiResponse.tool_calls, null, 2));

        // Add intermediate AI message if there's text
        if (aiResponse.text && aiResponse.text.trim()) {
          const thinkingMessage = {
            id: Date.now().toString() + '_thinking',
            role: 'assistant',
            content: aiResponse.text,
            timestamp: new Date(),
          };
          currentMessages = [...currentMessages, thinkingMessage];
          setMessages(currentMessages);
          await addMessage(conversation.id, 'assistant', aiResponse.text);
        }

        // Execute tool calls
        console.log('=== EXECUTING TOOL CALLS ===');
        console.log('Tool calls to execute:', JSON.stringify(aiResponse.tool_calls, null, 2));
        const toolResults = await executeToolCalls(aiResponse.tool_calls);
        console.log('=== TOOL EXECUTION RESULTS ===');
        console.log('Results:', JSON.stringify(toolResults, null, 2));

        // Create a summary of tool execution for display
        const toolResultsSummary = toolResults.map(tr => {
          if (tr.result.success) {
            return `✅ ${tr.result.message || 'Action completed successfully'}`;
          } else {
            return `❌ ${tr.result.message || tr.result.error || 'Action failed'}`;
          }
        }).join('\n');

        // Add tool execution results as a message
        const toolMessage = {
          id: Date.now().toString() + '_tools',
          role: 'assistant',
          content: toolResultsSummary,
          timestamp: new Date(),
          isToolResult: true,
        };

        currentMessages = [...currentMessages, toolMessage];
        setMessages(currentMessages);
        await addMessage(conversation.id, 'assistant', toolResultsSummary);

        // Check for special actions
        const scanAction = toolResults.find(tr => tr.result.action === 'navigate_to_scan');
        if (scanAction) {
          // Navigate to scan receipt screen after a short delay
          setTimeout(() => {
            navigation.navigate('UploadDocument');
          }, 1000);
        }
      } else {
        // No tool calls, just add the text response
        console.log('=== NO TOOL CALLS ===');
        console.log('Response text:', aiResponse.text || aiResponse);
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse.text || aiResponse,
          timestamp: new Date()
        };

        currentMessages = [...currentMessages, aiMessage];
        setMessages(currentMessages);
        await addMessage(conversation.id, 'assistant', aiResponse.text || aiResponse);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove the user message if AI response failed
      setMessages(messages);
      
      Alert.alert('Error', error.message || 'Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCopyMessage = (content) => {
    Clipboard.setString(content);
    Alert.alert('Copied', 'Message copied to clipboard');
  };

  const handleRegenerateResponse = async (messageToRegenerate) => {
    // Find the index of the message to regenerate
    const messageIndex = messages.findIndex(msg => msg.id === messageToRegenerate.id);
    if (messageIndex === -1) return;

    // Get all messages before the one to regenerate
    const messagesUpToRegenerate = messages.slice(0, messageIndex);
    
    try {
      setSendingMessage(true);

      // Prepare messages for OpenAI (excluding the message to regenerate and any after it)
      const openAIMessages = messagesUpToRegenerate.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Get new AI response
      const newResponse = await sendChatMessage(openAIMessages);

      // Update the message and remove any messages after it
      const updatedMessages = [
        ...messagesUpToRegenerate,
        {
          ...messageToRegenerate,
          content: newResponse,
          timestamp: new Date()
        }
      ];

      setMessages(updatedMessages);

      // This is a simplified approach - in a real app you might want to
      // properly update the Firestore conversation to remove the old messages
      // and add the new ones

    } catch (error) {
      console.error('Error regenerating response:', error);
      Alert.alert('Error', error.message || 'Failed to regenerate response. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (conversation?.id) {
      await loadConversation();
    }
    setRefreshing(false);
  };

  const renderMessage = ({ item, index }) => {
    return (
      <MessageBubble
        message={item}
        onCopy={handleCopyMessage}
        onRegenerate={index === messages.length - 1 && item.role === 'assistant' ? handleRegenerateResponse : null}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>Start a conversation</Text>
      <Text style={styles.emptyStateText}>
        Ask me anything! I can help you with reminders, answer questions, or just have a chat.
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading conversation...</Text>
    </View>
  );

  if (loading) {
    return (
      <Layout>
        {renderLoadingState()}
      </Layout>
    );
  }

  return (
    <Layout>
      <View style={styles.container}>
        {/* Header with close button */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI Assistant</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={[styles.messagesContainer, messages.length === 0 && styles.emptyContainer]}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        
        <ChatInput
          onSendMessage={handleSendMessage}
          loading={sendingMessage}
          disabled={sendingMessage}
        />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.textLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.deepGreen,
  },
  headerTitle: {
    fontSize: fonts.sizes.large,
    fontWeight: '700',
    color: colors.surface,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.surface,
    fontWeight: '300',
    lineHeight: 24,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: fonts.sizes.title,
    fontWeight: '600',
    color: colors.deepGreen,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: fonts.sizes.body,
    color: colors.deepGreen,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fonts.sizes.body,
    color: colors.deepGreen,
    marginTop: 16,
  },
});
