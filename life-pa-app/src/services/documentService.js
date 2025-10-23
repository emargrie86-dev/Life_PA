/**
 * Document Service (formerly receiptService.js)
 * Handles CRUD operations for documents in Firestore
 * Supports receipts, invoices, utility bills, and all document types
 */

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
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

const DOCUMENTS_COLLECTION = 'receipts'; // Keep as 'receipts' for backward compatibility with existing data

/**
 * Upload document image to Firebase Storage
 * @param {string} userId - User ID
 * @param {string} imageUri - Local image URI
 * @returns {Promise<string>} Download URL
 */
export const uploadDocumentImage = async (userId, imageUri) => {
  console.log('uploadDocumentImage called with:', { userId, imageUri });
  
  try {
    console.log('Attempting to upload image to Firebase Storage...');
    console.log('Image URI:', imageUri);
    
    // Add timeout to fail fast on CORS issues
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Upload timeout')), 5000)
    );
    
    const uploadPromise = (async () => {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const filename = `documents/${userId}/${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    })();
    
    const downloadURL = await Promise.race([uploadPromise, timeoutPromise]);
    console.log('✅ Image uploaded successfully:', downloadURL);
    return downloadURL;
    
  } catch (error) {
    console.error('❌ Image upload failed:', error);
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    
    // WORKAROUND: Use local URI when Storage fails
    console.warn('⚠️ WORKAROUND ACTIVE: Using local image URI');
    console.warn('⚠️ Document will save but image won\'t persist after page refresh');
    console.warn('⚠️ To fix: Configure Firebase Storage CORS settings');
    
    // Convert blob URI to base64 for better persistence
    try {
      console.log('Converting image to base64 for local storage...');
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      console.log('✅ Image converted to base64 (length:', base64.length, ')');
      return base64;
    } catch (conversionError) {
      console.error('Base64 conversion failed, using blob URI:', conversionError);
      return imageUri;
    }
  }
};

/**
 * Create a new document
 * @param {object} documentData - Document data
 * @returns {Promise<string>} Document ID
 */
export const createDocument = async (documentData) => {
  try {
    const documentsRef = collection(db, DOCUMENTS_COLLECTION);
    
    const document = {
      ...documentData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(documentsRef, document);
    console.log('✅ Document created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating document:', error);
    throw new Error('Failed to create document');
  }
};

/**
 * Get document by ID
 * @param {string} documentId - Document ID
 * @returns {Promise<object>} Document data
 */
export const getDocument = async (documentId) => {
  try {
    const documentRef = doc(db, DOCUMENTS_COLLECTION, documentId);
    const documentDoc = await getDoc(documentRef);
    
    if (!documentDoc.exists()) {
      throw new Error('Document not found');
    }
    
    return {
      id: documentDoc.id,
      ...documentDoc.data(),
    };
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
};

/**
 * Get all documents for a user
 * @param {string} userId - User ID
 * @param {number} maxResults - Maximum number of results
 * @returns {Promise<Array>} Array of documents
 */
export const getUserDocuments = async (userId, maxResults = 100) => {
  try {
    console.log('getUserDocuments called with userId:', userId);
    const documentsRef = collection(db, DOCUMENTS_COLLECTION);
    const q = query(
      documentsRef,
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(maxResults)
    );
    
    console.log('Executing Firestore query...');
    const querySnapshot = await getDocs(q);
    console.log('Query returned', querySnapshot.size, 'documents');
    
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Document:', doc.id, {
        merchant: data.merchantName,
        amount: data.totalAmount,
        type: data.documentType,
        userId: data.userId,
        date: data.date,
      });
      documents.push({
        id: doc.id,
        ...data,
      });
    });
    
    console.log('Returning', documents.length, 'documents');
    return documents;
  } catch (error) {
    console.error('Error getting user documents:', error);
    throw new Error('Failed to fetch documents');
  }
};

/**
 * Get documents by category
 * @param {string} userId - User ID
 * @param {string} category - Document category
 * @returns {Promise<Array>} Array of documents
 */
export const getDocumentsByCategory = async (userId, category) => {
  try {
    const documentsRef = collection(db, DOCUMENTS_COLLECTION);
    const q = query(
      documentsRef,
      where('userId', '==', userId),
      where('category', '==', category),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    return documents;
  } catch (error) {
    console.error('Error getting documents by category:', error);
    throw new Error('Failed to fetch documents');
  }
};

/**
 * Get documents in date range
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Array of documents
 */
export const getDocumentsByDateRange = async (userId, startDate, endDate) => {
  try {
    const documentsRef = collection(db, DOCUMENTS_COLLECTION);
    const q = query(
      documentsRef,
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    return documents;
  } catch (error) {
    console.error('Error getting documents by date range:', error);
    throw new Error('Failed to fetch documents');
  }
};

/**
 * Update document
 * @param {string} documentId - Document ID
 * @param {object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateDocument = async (documentId, updates) => {
  try {
    const documentRef = doc(db, DOCUMENTS_COLLECTION, documentId);
    
    await updateDoc(documentRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    console.log('✅ Document updated:', documentId);
  } catch (error) {
    console.error('Error updating document:', error);
    throw new Error('Failed to update document');
  }
};

/**
 * Delete document
 * @param {string} documentId - Document ID
 * @param {string} imageUrl - Image URL to delete from storage
 * @returns {Promise<void>}
 */
export const deleteDocument = async (documentId, imageUrl) => {
  try {
    // Delete from Firestore
    const documentRef = doc(db, DOCUMENTS_COLLECTION, documentId);
    await deleteDoc(documentRef);
    
    // Delete image from Storage if exists
    if (imageUrl) {
      try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      } catch (error) {
        console.warn('Failed to delete image from storage:', error);
      }
    }
    console.log('✅ Document deleted:', documentId);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error('Failed to delete document');
  }
};

/**
 * Get total spending by category
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date (optional)
 * @param {Date} endDate - End date (optional)
 * @returns {Promise<object>} Category totals
 */
export const getTotalsByCategory = async (userId, startDate = null, endDate = null) => {
  try {
    let documents;
    
    if (startDate && endDate) {
      documents = await getDocumentsByDateRange(userId, startDate, endDate);
    } else {
      documents = await getUserDocuments(userId);
    }
    
    const totals = {};
    
    documents.forEach(document => {
      const category = document.category || 'Other';
      const amount = document.totalAmount || 0;
      
      totals[category] = (totals[category] || 0) + amount;
    });
    
    return totals;
  } catch (error) {
    console.error('Error calculating totals by category:', error);
    throw new Error('Failed to calculate totals');
  }
};

/**
 * Search documents by merchant name
 * @param {string} userId - User ID
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Matching documents
 */
export const searchDocuments = async (userId, searchTerm) => {
  try {
    const documents = await getUserDocuments(userId);
    
    const searchLower = searchTerm.toLowerCase();
    
    return documents.filter(document => 
      (document.merchantName || '').toLowerCase().includes(searchLower) ||
      (document.notes || '').toLowerCase().includes(searchLower) ||
      (document.extractedText || '').toLowerCase().includes(searchLower) ||
      (document.documentType || '').toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error('Error searching documents:', error);
    throw new Error('Failed to search documents');
  }
};

// Backward compatibility exports (keep old function names as aliases)
export const uploadReceiptImage = uploadDocumentImage;
export const createReceipt = createDocument;
export const getReceipt = getDocument;
export const getUserReceipts = getUserDocuments;
export const getReceiptsByCategory = getDocumentsByCategory;
export const getReceiptsByDateRange = getDocumentsByDateRange;
export const updateReceipt = updateDocument;
export const deleteReceipt = deleteDocument;
export const searchReceipts = searchDocuments;

