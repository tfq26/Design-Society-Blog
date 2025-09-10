import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { ApiError, handleFirestoreError } from './api.js';

/**
 * Get all users
 * @param {Object} options - Options for filtering and sorting
 * @param {string} options.role - Filter by user role
 * @param {string} options.orderBy - Field to order by (default: 'displayName')
 * @param {'asc'|'desc'} options.orderDirection - Sort direction (default: 'asc')
 * @returns {Promise<Array>} Array of users
 */
export const getUsers = async (options = {}) => {
  try {
    const {
      role,
      orderBy: orderByField = 'displayName',
      orderDirection = 'asc'
    } = options;

    let q = query(collection(db, 'users'));
    
    if (role) {
      q = query(q, where('role', '==', role));
    }
    
    q = query(q, orderBy(orderByField, orderDirection));
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    throw handleFirestoreError(error);
  }
};

/**
 * Get a single user by ID
 * @param {string} userId - ID of the user to retrieve
 * @returns {Promise<Object>} The user data
 */
export const getUser = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new ApiError('User not found', 'not-found');
    }
    
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error('Error getting user:', error);
    throw handleFirestoreError(error);
  }
};

/**
 * Update a user
 * @param {string} userId - ID of the user to update
 * @param {Object} userData - Fields to update
 * @returns {Promise<void>}
 */
export const updateUser = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw handleFirestoreError(error);
  }
};

/**
 * Delete a user
 * @param {string} userId - ID of the user to delete
 * @returns {Promise<void>}
 */
export const deleteUser = async (userId) => {
  try {
    // Note: This only deletes the user document, not the authentication record
    // You might want to use Firebase Admin SDK on the backend to delete auth users
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw handleFirestoreError(error);
  }
};

/**
 * Update user role
 * @param {string} userId - ID of the user to update
 * @param {string} role - New role (e.g., 'admin', 'author', 'user')
 * @returns {Promise<void>}
 */
export const updateUserRole = async (userId, role) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw handleFirestoreError(error);
  }
};
