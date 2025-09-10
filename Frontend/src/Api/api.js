import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc, 
  query, 
  orderBy,
  increment,
  runTransaction,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- Exports ---
export { auth, db, storage };

export const initFirebase = async () => {
  try {
    // Already initialized above
    return { app, auth, db };
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    throw error;
  }
};

// --- Authentication ---
// Initialize Google auth provider
const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Custom error class for API errors
export class ApiError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

// Helper function to handle Firebase Auth errors
const handleAuthError = (error) => {
  console.error('Auth error:', error);
  
  // Default error message
  let message = 'Authentication failed';
  let code = error.code || 'auth/unknown';
  
  // Map Firebase Auth error codes to user-friendly messages
  const errorMap = {
    'auth/invalid-email': 'Invalid email address',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'Email is already in use',
    'auth/weak-password': 'Password is too weak',
    'auth/too-many-requests': 'Too many attempts. Please try again later',
    'auth/requires-recent-login': 'Please log in again to perform this action',
    'auth/network-request-failed': 'Network error. Please check your connection',
  };
  
  return new ApiError(
    errorMap[code] || error.message || message,
    code,
    { originalError: error }
  );
};

// Helper function to handle Firestore errors
export const handleFirestoreError = (error) => {
  console.error('Firestore error:', error);
  
  let message = 'Database operation failed';
  let code = error.code || 'firestore/unknown';
  
  const errorMap = {
    'permission-denied': 'You do not have permission to perform this action',
    'not-found': 'The requested document was not found',
    'already-exists': 'A document with this ID already exists',
    'unavailable': 'Service is currently unavailable. Please try again later.',
  };
  
  return new ApiError(
    errorMap[code] || error.message || message,
    code,
    { originalError: error }
  );
};

// Helper function to handle Storage errors
const handleStorageError = (error) => {
  console.error('Storage error:', error);
  
  let message = 'File operation failed';
  let code = error.code || 'storage/unknown';
  
  const errorMap = {
    'storage/unauthorized': 'You do not have permission to access this file',
    'storage/canceled': 'The operation was canceled',
    'storage/unknown': 'An unknown error occurred during file operation',
    'storage/object-not-found': 'The requested file does not exist',
    'storage/quota-exceeded': 'Storage quota exceeded',
  };
  
  return new ApiError(
    errorMap[code] || error.message || message,
    code,
    { originalError: error }
  );
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    throw handleAuthError(error);
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Check if user exists in Firestore, if not create a new user document
    try {
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          provider: 'google.com',
          createdAt: new Date().toISOString(),
        });
      }
      return { success: true };
    } catch (firestoreError) {
      // If Firestore fails, sign out the user to prevent auth state inconsistencies
      await signOut(auth);
      throw handleFirestoreError(firestoreError);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw handleAuthError(error);
  }
};

export const signup = async (email, password, username) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: username,
        createdAt: new Date().toISOString(),
      });
    } catch (firestoreError) {
      // If Firestore fails, delete the auth user to prevent orphaned accounts
      try {
        await user.delete();
      } catch (deleteError) {
        console.error('Failed to clean up auth user after Firestore error:', deleteError);
      }
      throw handleFirestoreError(firestoreError);
    }

    return { success: true, user };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw handleAuthError(error);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    throw handleAuthError(error);
  }
};

/**
 * Fetch posts in real time with optional filtering and sorting.
 * @param {function} callback - Called with array of posts whenever updated
 * @param {object} [options] - Options for filtering and sorting
 * @param {string} [options.postType] - Filter by post type (regular, community, design_doc)
 * @param {string} [options.userId] - Filter by author user ID
 * @param {boolean} [options.includeUserVotes] - Whether to include user's vote status (requires auth)
 * @param {string} [options.sortBy='createdAt'] - Field to sort by (default: 'createdAt')
 * @param {string} [options.sortOrder='desc'] - Sort order ('asc' or 'desc')
 * @param {number} [options.limit] - Maximum number of posts to return
 * @param {function} [onError] - Error callback
 * @returns {function} - Unsubscribe function
 */
export const getPosts = (callback, options = {}, onError) => {
  try {
    const {
      postType,
      userId,
      includeUserVotes = false,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit
    } = options;
    
    // Start with the base posts collection
    let postsQuery = collection(db, "posts");
    
    // Add filters
    const queryConstraints = [];
    
    // Filter by post type if specified
    if (postType && Object.values(POST_TYPES).includes(postType)) {
      queryConstraints.push(where('postType', '==', postType));
    }
    
    // Filter by user ID if specified
    if (userId) {
      queryConstraints.push(where('authorId', '==', userId));
    }
    
    // Add sorting
    queryConstraints.push(orderBy(
      sortBy === 'votes' ? 'upvotes' : sortBy, // Use upvotes for vote-based sorting
      sortOrder === 'asc' ? 'asc' : 'desc'
    ));
    
    // Add limit if specified
    if (limit && typeof limit === 'number' && limit > 0) {
      queryConstraints.push(limit(limit));
    }
    
    // Create the query
    const q = query(postsQuery, ...queryConstraints);
    
    const unsubscribe = onSnapshot(q, 
      async (snapshot) => {
        try {
          let posts = [];
          
          // Process each document
          for (const docSnapshot of snapshot.docs) {
            const postData = { id: docSnapshot.id, ...docSnapshot.data() };
            
            // If user is authenticated and we need to include their vote status
            if (includeUserVotes && auth.currentUser) {
              try {
                const voteDoc = await getDoc(doc(db, `posts/${doc.id}/userVotes/${auth.currentUser.uid}`));
                if (voteDoc.exists()) {
                  postData.userVote = voteDoc.data().direction; // 'up' or 'down'
                }
              } catch (error) {
                console.error('Error fetching user vote:', error);
                // Continue without vote data if there's an error
              }
            }
            
            // Ensure default values for required fields
            postData.votes = postData.upvotes - (postData.downvotes || 0);
            postData.commentCount = postData.commentCount || 0;
            postData.postType = postData.postType || POST_TYPES.REGULAR;
            
            posts.push(postData);
          }
          
          // If we're not using Firestore's sorting, sort in-memory
          if (sortBy === 'votes' && sortOrder) {
            posts.sort((a, b) => {
              const aVotes = (a.upvotes || 0) - (a.downvotes || 0);
              const bVotes = (b.upvotes || 0) - (b.downvotes || 0);
              return sortOrder === 'asc' ? aVotes - bVotes : bVotes - aVotes;
            });
          }
          
          callback(posts);
        } catch (error) {
          console.error('Error processing posts:', error);
          if (onError) onError(handleFirestoreError(error));
        }
      },
      (error) => {
        console.error("Error fetching posts:", error);
        if (onError) {
          onError(handleFirestoreError(error));
        } else {
          throw handleFirestoreError(error);
        }
      }
    );
    
    return unsubscribe;
  } catch (error) {
    console.error("Error setting up posts listener:", error);
    if (onError) {
      onError(handleFirestoreError(error));
      return () => {}; // Return a no-op function for consistency
    }
    throw handleFirestoreError(error);
  }
};

/**
 * Fetch a single post by its ID.
 * @param {string} postId - The ID of the post to fetch.
 * @returns {Promise<object>} - The post data.
 * @throws {ApiError} - If the post is not found or an error occurs.
 */
export const getPost = async (postId) => {
  console.log('[API] Fetching post with ID:', postId);
  try {
    if (!postId) {
      console.error('[API] Error: No post ID provided');
      throw new ApiError('Post ID is required', 'validation/missing-post-id');
    }
    
    const postRef = doc(db, "posts", postId);
    console.log('[API] Post reference created:', postRef.path);
    
    const postSnap = await getDoc(postRef);
    console.log('[API] Post document snapshot:', postSnap.exists() ? 'exists' : 'does not exist');

    if (!postSnap.exists()) {
      console.error(`[API] Error: No post found with ID: ${postId}`);
      throw new ApiError('Post not found', 'firestore/not-found');
    }
    
    const postData = { id: postSnap.id, ...postSnap.data() };
    console.log('[API] Retrieved post data:', postData);
    return postData;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw handleFirestoreError(error);
  }
};

// Post type constants
export const POST_TYPES = {
  REGULAR: 'regular',
  COMMUNITY: 'community',
  DESIGN_DOC: 'design_doc'
};

/**
 * Upload files for a post
 * @param {Array<File>} files - Array of files to upload
 * @param {string} postId - The ID of the post
 * @returns {Promise<Array<object>>} - Array of file metadata with download URLs
 */
export const uploadPostFiles = async (files, postId) => {
  if (!files || !files.length) return [];
  
  const uploadPromises = files.map(async (file) => {
    try {
      const filePath = `posts/${postId}/${Date.now()}-${file.name}`;
      const fileRef = ref(storage, filePath);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      
      return {
        name: file.name,
        type: file.type,
        size: file.size,
        url: downloadURL,
        path: filePath
      };
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      throw handleStorageError(error);
    }
  });
  
  return Promise.all(uploadPromises);
};

/**
 * Add a new post with optional files and post type.
 * @param {string} title - The title of the post.
 * @param {string} content - The content of the post.
 * @param {string} [postType=POST_TYPES.REGULAR] - The type of the post (regular, community, design_doc).
 * @param {Array<File>} [files=[]] - Optional array of files to upload with the post.
 * @param {object} [options={}] - Additional options for the post.
 * @param {Array<string>} [options.tags=[]] - Tags for the post.
 * @param {boolean} [options.isPinned=false] - Whether the post should be pinned.
 * @param {boolean} [options.isFeatured=false] - Whether the post is featured.
 * @returns {Promise<object>} The newly created post data.
 * @throws {ApiError} If post creation fails.
 */
export const addPost = async (
  title, 
  content, 
  postType = POST_TYPES.REGULAR, 
  files = [], 
  options = {}
) => {
  try {
    // Validate input
    if (!title?.trim() || !content?.trim()) {
      throw new ApiError('Title and content are required', 'validation/missing-fields');
    }

    // Ensure user is authenticated
    const user = auth.currentUser;
    if (!user) {
      throw new ApiError('User must be logged in to create a post', 'auth/not-authenticated');
    }

    // Validate post type
    if (!Object.values(POST_TYPES).includes(postType)) {
      throw new ApiError('Invalid post type', 'validation/invalid-post-type', { postType });
    }

    // Process tags if provided
    const tags = Array.isArray(options.tags) 
      ? options.tags.filter(tag => typeof tag === 'string' && tag.trim() !== '')
      : [];

    // Create post data object
    const postData = {
      title: title.trim(),
      content: content.trim(),
      postType,
      userId: user.uid,
      authorId: user.uid,
      authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      authorPhotoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      votes: 0,
      upvotes: 0,
      downvotes: 0,
      commentCount: 0,
      isPinned: Boolean(options.isPinned),
      isFeatured: Boolean(options.isFeatured),
      tags,
      attachments: [],
    };

    // Add the post to Firestore
    const postRef = await addDoc(collection(db, 'posts'), postData);
    
    // If there are files to upload, handle them
    let attachments = [];
    if (files && files.length > 0) {
      try {
        attachments = await uploadPostFiles(files, postRef.id);
        
        // Update the post with the attachment references
        await updateDoc(postRef, {
          attachments,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        console.error('Error uploading files, but post was created:', error);
        // Continue even if file upload fails, but log the error
      }
    }

    // Return the complete post data with ID and any attachments
    return {
      id: postRef.id,
      ...postData,
      attachments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in addPost:', error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || 'Failed to create post',
      'firestore/post-creation-failed',
      { cause: error }
    );
  }
};

/**
 * Fetch comments for a specific post in real time.
 * @param {string} postId - The ID of the post.
 * @param {function} callback - Function to call with the comments array.
 * @returns {function} - Unsubscribe function.
 * @throws {ApiError} - If postId is invalid or an error occurs.
 */
export const getComments = (postId, callback) => {
  try {
    if (!postId) {
      throw new ApiError('Post ID is required', 'validation/missing-post-id');
    }
    
    const commentsRef = collection(db, "posts", postId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        try {
          const comments = [];
          snapshot.forEach((doc) => {
            comments.push({ id: doc.id, ...doc.data() });
          });
          callback(comments);
        } catch (error) {
          console.error("Error processing comments:", error);
          throw new ApiError('Error processing comments', 'firestore/process-error', { cause: error });
        }
      },
      (error) => {
        console.error("Error fetching comments:", error);
        throw handleFirestoreError(error);
      }
    );
    
    return unsubscribe;
  } catch (error) {
    console.error("Error setting up comments listener:", error);
    if (error instanceof ApiError) throw error;
    throw handleFirestoreError(error);
  }
};

/**
 * Add a comment to a specific post.
 * @param {string} postId - The ID of the post to comment on.
 * @param {string} content - The comment content.
 * @returns {Promise<object>} - The newly created comment data.
 * @throws {ApiError} - If the comment creation fails.
 */
export const updateComment = async (postId, commentId, newContent) => {
  try {
    if (!auth.currentUser) {
      throw new ApiError('User not authenticated', 'auth/not-authenticated');
    }
    if (!postId || !commentId || !newContent) {
      throw new ApiError('Post ID, Comment ID, and new content are required', 'validation/missing-fields');
    }

    const commentRef = doc(db, "posts", postId, "comments", commentId);
    
    await updateDoc(commentRef, {
      content: newContent.trim(),
      updatedAt: serverTimestamp(),
    });

  } catch (error) {
    console.error("Error updating comment:", error);
    if (error instanceof ApiError) throw error;
    throw handleFirestoreError(error);
  }
};

/**
 * Deletes a specific comment.
 * @param {string} postId - The ID of the post containing the comment.
 * @param {string} commentId - The ID of the comment to delete.
 * @returns {Promise<void>}
 * @throws {ApiError} - If the deletion fails.
 */
export const deleteComment = async (postId, commentId) => {
  try {
    if (!auth.currentUser) {
      throw new ApiError('User not authenticated', 'auth/not-authenticated');
    }
    if (!postId || !commentId) {
      throw new ApiError('Post ID and Comment ID are required', 'validation/missing-ids');
    }

    const commentRef = doc(db, "posts", postId, "comments", commentId);
    const postRef = doc(db, "posts", postId);

    await runTransaction(db, async (transaction) => {
      const commentDoc = await transaction.get(commentRef);
      if (!commentDoc.exists()) {
        throw new ApiError('Comment not found', 'firestore/not-found');
      }

      // Ensure the user is the author before deleting
      if (commentDoc.data().authorId !== auth.currentUser.uid) {
        throw new ApiError('You do not have permission to delete this comment', 'permission-denied');
      }

      transaction.delete(commentRef);
      transaction.update(postRef, { 
        commentCount: increment(-1),
        updatedAt: serverTimestamp()
      });
    });

  } catch (error) {
    console.error("Error deleting comment:", error);
    if (error instanceof ApiError) throw error;
    throw handleFirestoreError(error);
  }
};

export const addComment = async (postId, content, parentId = null) => {
  try {
    if (!auth.currentUser) {
      throw new ApiError('User not authenticated', 'auth/not-authenticated');
    }
    
    if (!postId || !content) {
      throw new ApiError('Post ID and content are required', 'validation/missing-fields');
    }
    
    const commentsRef = collection(db, "posts", postId, "comments");
    const commentData = {
      content: content.trim(),
      userId: auth.currentUser.uid,
      authorId: auth.currentUser.uid,
      authorName: auth.currentUser.displayName || 'Anonymous',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      votes: 0,
      parentId: parentId,
    };
    
    // Start a transaction to update both the comment and the post's comment count
    await runTransaction(db, async (transaction) => {
      // Add the comment
      const commentRef = await addDoc(commentsRef, commentData);
      
      // Update the post's comment count
      const postRef = doc(db, "posts", postId);
      transaction.update(postRef, {
        commentCount: increment(1),
        updatedAt: serverTimestamp()
      });
      
      return { id: commentRef.id, ...commentData };
    });
    
    return { ...commentData };
  } catch (error) {
    console.error("Error adding comment:", error);
    if (error instanceof ApiError) throw error;
    throw handleFirestoreError(error);
  }
};

/**
 * Get a user's vote on a post
 * @param {string} postId - The ID of the post
 * @param {string} userId - The ID of the user
 * @returns {Promise<string|null>} - The direction of the vote ('up', 'down') or null if no vote
 */
export const getUserPostVote = async (postId, userId) => {
  if (!postId || !userId) return null;
  
  try {
    const voteDoc = await getDoc(doc(db, `posts/${postId}/userVotes/${userId}`));
    return voteDoc.exists() ? voteDoc.data().direction : null;
  } catch (error) {
    console.error('Error getting user vote:', error);
    return null;
  }
};

/**
 * Vote on a post
 * @param {string} postId - The ID of the post to vote on.
 * @param {'up'|'down'} direction - The direction of the vote ('up' or 'down').
 * @returns {Promise<{newVoteCount: number, direction: string|null}>} - The new vote count and direction
 * @throws {ApiError} - If the voting operation fails.
 */
export const voteOnPost = async (postId, direction) => {
  try {
    if (!auth.currentUser) {
      throw new ApiError('User not authenticated', 'auth/not-authenticated');
    }
    
    if (!postId) {
      throw new ApiError('Post ID is required', 'validation/missing-post-id');
    }
    
    if (direction !== 'up' && direction !== 'down') {
      throw new ApiError('Invalid vote direction', 'validation/invalid-direction');
    }
    
    const postRef = doc(db, "posts", postId);
    const userId = auth.currentUser.uid;
    const userVoteRef = doc(db, `posts/${postId}/userVotes`, userId);
    
    let result = { newVoteCount: 0, direction: null };
    
    await runTransaction(db, async (transaction) => {
      // Check if post exists and get current data
      const postDoc = await transaction.get(postRef);
      if (!postDoc.exists()) {
        throw new ApiError('Post not found', 'firestore/not-found');
      }
      
      const postData = postDoc.data();
      let upvotes = postData.upvotes || 0;
      let downvotes = postData.downvotes || 0;
      
      // Check if user already voted
      const voteDoc = await transaction.get(userVoteRef);
      const existingVote = voteDoc.data();
      
      if (existingVote) {
        // If same vote direction, remove the vote (toggle off)
        if (existingVote.direction === direction) {
          if (direction === 'up') upvotes--;
          else downvotes--;
          
          transaction.delete(userVoteRef);
          result.direction = null;
        } 
        // If opposite direction, update the vote
        else {
          if (direction === 'up') {
            upvotes++;
            downvotes--;
          } else {
            upvotes--;
            downvotes++;
          }
          
          transaction.update(userVoteRef, {
            direction,
            updatedAt: serverTimestamp()
          });
          result.direction = direction;
        }
      } 
      // New vote
      else {
        if (direction === 'up') upvotes++;
        else downvotes++;
        
        transaction.set(userVoteRef, {
          userId,
          postId,
          direction,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        result.direction = direction;
      }
      
      // Calculate the new vote count (upvotes - downvotes)
      const newVoteCount = upvotes - downvotes;
      
      // Update the post with new vote counts
      transaction.update(postRef, {
        upvotes,
        downvotes,
        votes: newVoteCount,
        updatedAt: serverTimestamp()
      });
      
      result.newVoteCount = newVoteCount;
    });
    
    return result;
  } catch (error) {
    console.error("Error voting on post:", error);
    if (error instanceof ApiError) throw error;
    throw handleFirestoreError(error);
  }
};

/**
 * Vote on a comment
 * @param {string} postId - The ID of the post containing the comment.
 * @param {string} commentId - The ID of the comment to vote on.
 * @param {'up'|'down'} direction - The direction of the vote ('up' or 'down').
 * @returns {Promise<void>}
 * @throws {ApiError} - If the voting operation fails.
 */
export const voteOnComment = async (postId, commentId, direction) => {
  try {
    if (!auth.currentUser) {
      throw new ApiError('User not authenticated', 'auth/not-authenticated');
    }
    
    if (!postId || !commentId) {
      throw new ApiError('Post ID and Comment ID are required', 'validation/missing-ids');
    }
    
    if (direction !== 'up' && direction !== 'down') {
      throw new ApiError('Invalid vote direction', 'validation/invalid-direction');
    }
    
    const incrementValue = direction === 'up' ? 1 : -1;
    const commentRef = doc(db, "posts", postId, "comments", commentId);
    const userId = auth.currentUser.uid;
    const voteId = `comment_${commentId}_user_${userId}`;
    const userVoteRef = doc(db, "userCommentVotes", voteId);
    
    await runTransaction(db, async (transaction) => {
      // Check if comment exists
      const commentDoc = await transaction.get(commentRef);
      if (!commentDoc.exists()) {
        throw new ApiError('Comment not found', 'firestore/not-found');
      }
      
      // Check if user already voted
      const voteDoc = await transaction.get(userVoteRef);
      const existingVote = voteDoc.data();
      
      if (existingVote) {
        // If same vote direction, remove the vote (toggle off)
        if (existingVote.direction === direction) {
          transaction.update(commentRef, { votes: increment(-incrementValue) });
          transaction.delete(userVoteRef);
          return;
        } 
        // If opposite direction, update the vote (change from up to down or vice versa)
        else {
          transaction.update(commentRef, { votes: increment(direction === 'up' ? 2 : -2) });
        }
      } 
      // New vote
      else {
        transaction.update(commentRef, { votes: increment(incrementValue) });
      }
      
      // Update or create the user's vote record
      transaction.set(userVoteRef, {
        userId,
        postId,
        commentId,
        direction,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
  } catch (error) {
    console.error("Error voting on comment:", error);
    if (error instanceof ApiError) throw error;
    throw handleFirestoreError(error);
  }
};

/**
 * Upload a file to a specified path in Firebase Storage.
 * @param {File} file - The file to upload.
 * @param {string} path - The storage path (e.g., 'banners/user-id').
 * @returns {Promise<string>} - The download URL of the uploaded file.
 */
export const uploadFile = async (file, path) => {
  try {
    // Validate file
    if (!file) {
      throw new ApiError('No file provided', 'storage/no-file');
    }
    
    // Check file size (e.g., 5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new ApiError('File size exceeds the 5MB limit', 'storage/file-too-large');
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new ApiError('Invalid file type. Only images are allowed', 'storage/invalid-type');
    }
    
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw handleStorageError(error);
  }
};

// Export error types for consistent error handling
export const ERROR_TYPES = {
  AUTH: 'auth',
  FIRESTORE: 'firestore',
  STORAGE: 'storage',
  VALIDATION: 'validation',
  NETWORK: 'network',
  UNKNOWN: 'unknown'
};

// Utility function to check error types
export const isErrorOfType = (error, type) => {
  if (!error || !error.code) return false;
  return error.code.startsWith(type);
};
