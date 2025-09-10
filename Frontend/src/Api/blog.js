import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  orderBy, 
  serverTimestamp,
  where,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';
import { ApiError, handleFirestoreError } from './api.js';

/**
 * Create a new blog post
 * @param {Object} postData - Post data to create
 * @returns {Promise<Object>} The created post with ID
 */
export const createBlogPost = async (postData) => {
  try {
    const postWithTimestamps = {
      ...postData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      published: postData.published || false,
      views: 0,
      likes: 0,
      comments: []
    };
    
    const docRef = await addDoc(collection(db, 'blogPosts'), postWithTimestamps);
    return { id: docRef.id, ...postWithTimestamps };
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw handleFirestoreError(error);
  }
};

/**
 * Get all blog posts
 * @param {Object} options - Options for filtering and sorting
 * @param {boolean} options.publishedOnly - Only return published posts
 * @param {string} options.orderBy - Field to order by (default: 'createdAt')
 * @param {'asc'|'desc'} options.orderDirection - Sort direction (default: 'desc')
 * @returns {Promise<Array>} Array of blog posts
 */
export const getBlogPosts = async (options = {}) => {
  try {
    const {
      publishedOnly = false,
      orderBy: orderByField = 'createdAt',
      orderDirection = 'desc'
    } = options;

    let q = query(collection(db, 'blogPosts'));
    
    if (publishedOnly) {
      q = query(q, where('published', '==', true));
    }
    
    q = query(q, orderBy(orderByField, orderDirection));
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting blog posts:', error);
    throw handleFirestoreError(error);
  }
};

/**
 * Get a single blog post by ID
 * @param {string} postId - ID of the post to retrieve
 * @returns {Promise<Object>} The blog post data
 */
export const getBlogPost = async (postId) => {
  try {
    const docRef = doc(db, 'blogPosts', postId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new ApiError('Post not found', 'not-found');
    }
    
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error('Error getting blog post:', error);
    throw handleFirestoreError(error);
  }
};

/**
 * Update a blog post
 * @param {string} postId - ID of the post to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateBlogPost = async (postId, updates) => {
  try {
    const postRef = doc(db, 'blogPosts', postId);
    await updateDoc(postRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    throw handleFirestoreError(error);
  }
};

/**
 * Delete a blog post
 * @param {string} postId - ID of the post to delete
 * @returns {Promise<void>}
 */
export const deleteBlogPost = async (postId) => {
  try {
    await deleteDoc(doc(db, 'blogPosts', postId));
  } catch (error) {
    console.error('Error deleting blog post:', error);
    throw handleFirestoreError(error);
  }
};

/**
 * Increment the view count of a blog post
 * @param {string} postId - ID of the post to update
 * @returns {Promise<void>}
 */
export const incrementViewCount = async (postId) => {
  try {
    const postRef = doc(db, 'blogPosts', postId);
    await updateDoc(postRef, {
      views: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    // Don't throw error to avoid breaking the UI for this non-critical feature
  }
};
