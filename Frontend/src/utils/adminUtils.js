import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Api/api';

// Check if a user is an admin
export const isUserAdmin = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().isAdmin || false;
    }
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Get all users (for admin panel)
export const getAllUsers = async () => {
  try {
    // This would require a Firestore index and a collection group query
    // For now, we'll just return an empty array
    console.warn('getAllUsers function needs to be implemented with proper Firestore query');
    return [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};
