// Chat Service
// CRUD operations for chat conversations and messages in Firestore

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { getCurrentUser } from './auth';

const CONVERSATIONS_COLLECTION = 'conversations';

/**
 * Create a new conversation
 * @param {string} title - Conversation title (auto-generated if not provided)
 * @returns {Promise<string>} - Conversation ID
 */
export const createConversation = async (title = 'New Conversation') => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User must be authenticated to create conversations');
    }

    const conversationData = {
      userId: user.uid,
      title: title,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      messages: []
    };

    const docRef = await addDoc(collection(db, CONVERSATIONS_COLLECTION), conversationData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw new Error('Failed to create conversation');
  }
};

/**
 * Get all conversations for the current user
 * @returns {Promise<Array>} - Array of conversation objects
 */
export const getConversations = async () => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User must be authenticated to get conversations');
    }

    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const conversations = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      conversations.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });

    return conversations;
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw new Error('Failed to get conversations');
  }
};

/**
 * Get a specific conversation by ID
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object|null>} - Conversation object or null if not found
 */
export const getConversation = async (conversationId) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User must be authenticated to get conversation');
    }

    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const conversationDoc = await getDoc(conversationRef);

    if (!conversationDoc.exists()) {
      return null;
    }

    const data = conversationDoc.data();

    // Verify user owns this conversation
    if (data.userId !== user.uid) {
      throw new Error('Access denied to this conversation');
    }

    return {
      id: conversationDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw new Error('Failed to get conversation');
  }
};

/**
 * Add a message to a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} role - Message role ('user' or 'assistant')
 * @param {string} content - Message content
 * @returns {Promise<void>}
 */
export const addMessage = async (conversationId, role, content) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User must be authenticated to add messages');
    }

    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const conversationDoc = await getDoc(conversationRef);

    if (!conversationDoc.exists()) {
      throw new Error('Conversation not found');
    }

    const conversationData = conversationDoc.data();

    // Verify user owns this conversation
    if (conversationData.userId !== user.uid) {
      throw new Error('Access denied to this conversation');
    }

    const newMessage = {
      id: Date.now().toString(),
      role: role,
      content: content,
      timestamp: new Date() // Use regular Date instead of serverTimestamp for array elements
    };

    // Update conversation with new message
    await updateDoc(conversationRef, {
      messages: [...conversationData.messages, newMessage],
      updatedAt: serverTimestamp()
    });

    // Auto-generate title from first user message if title is still default
    if (role === 'user' && 
        conversationData.title === 'New Conversation' && 
        conversationData.messages.length === 0) {
      const title = content.length > 50 ? content.substring(0, 47) + '...' : content;
      await updateDoc(conversationRef, {
        title: title
      });
    }
  } catch (error) {
    console.error('Error adding message:', error);
    throw new Error('Failed to add message');
  }
};

/**
 * Update conversation title
 * @param {string} conversationId - Conversation ID
 * @param {string} title - New title
 * @returns {Promise<void>}
 */
export const updateConversationTitle = async (conversationId, title) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User must be authenticated to update conversation');
    }

    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const conversationDoc = await getDoc(conversationRef);

    if (!conversationDoc.exists()) {
      throw new Error('Conversation not found');
    }

    const conversationData = conversationDoc.data();

    // Verify user owns this conversation
    if (conversationData.userId !== user.uid) {
      throw new Error('Access denied to this conversation');
    }

    await updateDoc(conversationRef, {
      title: title,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating conversation title:', error);
    throw new Error('Failed to update conversation title');
  }
};

/**
 * Delete a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<void>}
 */
export const deleteConversation = async (conversationId) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User must be authenticated to delete conversation');
    }

    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const conversationDoc = await getDoc(conversationRef);

    if (!conversationDoc.exists()) {
      throw new Error('Conversation not found');
    }

    const conversationData = conversationDoc.data();

    // Verify user owns this conversation
    if (conversationData.userId !== user.uid) {
      throw new Error('Access denied to this conversation');
    }

    await deleteDoc(conversationRef);
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw new Error('Failed to delete conversation');
  }
};

/**
 * Clear all conversations for the current user
 * @returns {Promise<void>}
 */
export const clearAllConversations = async () => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User must be authenticated to clear conversations');
    }

    const conversations = await getConversations();
    const deletePromises = conversations.map(conversation => 
      deleteConversation(conversation.id)
    );

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error clearing conversations:', error);
    throw new Error('Failed to clear conversations');
  }
};
