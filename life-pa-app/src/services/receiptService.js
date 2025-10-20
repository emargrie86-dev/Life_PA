/**
 * Receipt Service
 * Handles CRUD operations for receipts in Firestore
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

const RECEIPTS_COLLECTION = 'receipts';

/**
 * Upload receipt image to Firebase Storage
 * @param {string} userId - User ID
 * @param {string} imageUri - Local image URI
 * @returns {Promise<string>} Download URL
 */
export const uploadReceiptImage = async (userId, imageUri) => {
  console.log('uploadReceiptImage called with:', { userId, imageUri });
  
  // Quick check: if Storage isn't properly configured, skip upload
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
      
      const filename = `receipts/${userId}/${Date.now()}.jpg`;
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
    console.warn('⚠️ Receipt will save but image won\'t persist after page refresh');
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
 * Create a new receipt
 * @param {object} receiptData - Receipt data
 * @returns {Promise<string>} Receipt ID
 */
export const createReceipt = async (receiptData) => {
  try {
    const receiptsRef = collection(db, RECEIPTS_COLLECTION);
    
    const receipt = {
      ...receiptData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(receiptsRef, receipt);
    return docRef.id;
  } catch (error) {
    console.error('Error creating receipt:', error);
    throw new Error('Failed to create receipt');
  }
};

/**
 * Get receipt by ID
 * @param {string} receiptId - Receipt ID
 * @returns {Promise<object>} Receipt data
 */
export const getReceipt = async (receiptId) => {
  try {
    const receiptRef = doc(db, RECEIPTS_COLLECTION, receiptId);
    const receiptDoc = await getDoc(receiptRef);
    
    if (!receiptDoc.exists()) {
      throw new Error('Receipt not found');
    }
    
    return {
      id: receiptDoc.id,
      ...receiptDoc.data(),
    };
  } catch (error) {
    console.error('Error getting receipt:', error);
    throw error;
  }
};

/**
 * Get all receipts for a user
 * @param {string} userId - User ID
 * @param {number} maxResults - Maximum number of results
 * @returns {Promise<Array>} Array of receipts
 */
export const getUserReceipts = async (userId, maxResults = 100) => {
  try {
    console.log('getUserReceipts called with userId:', userId);
    const receiptsRef = collection(db, RECEIPTS_COLLECTION);
    const q = query(
      receiptsRef,
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(maxResults)
    );
    
    console.log('Executing Firestore query...');
    const querySnapshot = await getDocs(q);
    console.log('Query returned', querySnapshot.size, 'documents');
    
    const receipts = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Receipt doc:', doc.id, {
        merchant: data.merchantName,
        amount: data.totalAmount,
        currency: data.currency,
        userId: data.userId,
        date: data.date,
      });
      receipts.push({
        id: doc.id,
        ...data,
      });
    });
    
    console.log('Returning', receipts.length, 'receipts');
    return receipts;
  } catch (error) {
    console.error('Error getting user receipts:', error);
    throw new Error('Failed to fetch receipts');
  }
};

/**
 * Get receipts by category
 * @param {string} userId - User ID
 * @param {string} category - Receipt category
 * @returns {Promise<Array>} Array of receipts
 */
export const getReceiptsByCategory = async (userId, category) => {
  try {
    const receiptsRef = collection(db, RECEIPTS_COLLECTION);
    const q = query(
      receiptsRef,
      where('userId', '==', userId),
      where('category', '==', category),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const receipts = [];
    
    querySnapshot.forEach((doc) => {
      receipts.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    return receipts;
  } catch (error) {
    console.error('Error getting receipts by category:', error);
    throw new Error('Failed to fetch receipts');
  }
};

/**
 * Get receipts in date range
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Array of receipts
 */
export const getReceiptsByDateRange = async (userId, startDate, endDate) => {
  try {
    const receiptsRef = collection(db, RECEIPTS_COLLECTION);
    const q = query(
      receiptsRef,
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const receipts = [];
    
    querySnapshot.forEach((doc) => {
      receipts.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    return receipts;
  } catch (error) {
    console.error('Error getting receipts by date range:', error);
    throw new Error('Failed to fetch receipts');
  }
};

/**
 * Update receipt
 * @param {string} receiptId - Receipt ID
 * @param {object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateReceipt = async (receiptId, updates) => {
  try {
    const receiptRef = doc(db, RECEIPTS_COLLECTION, receiptId);
    
    await updateDoc(receiptRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating receipt:', error);
    throw new Error('Failed to update receipt');
  }
};

/**
 * Delete receipt
 * @param {string} receiptId - Receipt ID
 * @param {string} imageUrl - Image URL to delete from storage
 * @returns {Promise<void>}
 */
export const deleteReceipt = async (receiptId, imageUrl) => {
  try {
    // Delete from Firestore
    const receiptRef = doc(db, RECEIPTS_COLLECTION, receiptId);
    await deleteDoc(receiptRef);
    
    // Delete image from Storage if exists
    if (imageUrl) {
      try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      } catch (error) {
        console.warn('Failed to delete image from storage:', error);
      }
    }
  } catch (error) {
    console.error('Error deleting receipt:', error);
    throw new Error('Failed to delete receipt');
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
    let receipts;
    
    if (startDate && endDate) {
      receipts = await getReceiptsByDateRange(userId, startDate, endDate);
    } else {
      receipts = await getUserReceipts(userId);
    }
    
    const totals = {};
    
    receipts.forEach(receipt => {
      const category = receipt.category || 'Other';
      const amount = receipt.totalAmount || 0;
      
      totals[category] = (totals[category] || 0) + amount;
    });
    
    return totals;
  } catch (error) {
    console.error('Error calculating totals by category:', error);
    throw new Error('Failed to calculate totals');
  }
};

/**
 * Search receipts by merchant name
 * @param {string} userId - User ID
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Matching receipts
 */
export const searchReceipts = async (userId, searchTerm) => {
  try {
    const receipts = await getUserReceipts(userId);
    
    const searchLower = searchTerm.toLowerCase();
    
    return receipts.filter(receipt => 
      (receipt.merchantName || '').toLowerCase().includes(searchLower) ||
      (receipt.notes || '').toLowerCase().includes(searchLower) ||
      (receipt.extractedText || '').toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error('Error searching receipts:', error);
    throw new Error('Failed to search receipts');
  }
};

