import { useEffect, useState, useCallback } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendEmailVerification as sendEmailVerificationFirebase,
  getAuth
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';
import { AuthContext } from './auth-context';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const firebaseAuth = getAuth();

  // Get user data from Firestore including role and admin status
  const getUserData = useCallback(async (user) => {
    if (!user) return null;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return { 
          ...user,
          ...userData,
          role: userData.role || 'basic', // Default to 'basic' if no role is set
          isAdmin: userData.role === 'admin' || userData.isAdmin === true
        };
      }
      // If no user doc exists, create one with default role
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email,
        photoURL: user.photoURL || null,
        emailVerified: user.emailVerified || false,
        role: 'basic',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
      
      return { 
        ...user, 
        role: 'basic',
        isAdmin: false 
      };
    } catch (error) {
      console.error('Error getting user data:', error);
      // On error, assume basic user
      return { 
        ...user, 
        role: 'basic',
        isAdmin: false 
      };
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        try {
          const userWithData = await getUserData(user);
          setCurrentUser({
            ...userWithData,
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: user.displayName || user.email,
            photoURL: user.photoURL || null,
            role: userWithData.role || 'basic',
            isAdmin: userWithData.role === 'admin' || userWithData.isAdmin === true
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: user.displayName || user.email,
            photoURL: user.photoURL || null,
            role: 'basic',
            isAdmin: false
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseAuth, getUserData]);

  // Send email verification
  const sendEmailVerification = async (user) => {
    try {
      await sendEmailVerificationFirebase(user);
      return { success: true };
    } catch (error) {
      console.error('Error sending verification email:', error);
      return { success: false, error: error.message };
    }
  };

  // Upload file to storage
  const uploadFile = async (file, path) => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  // Update auth profile
  const updateAuthProfile = async (updates) => {
    if (!currentUser) return { success: false, error: 'No user is signed in' };
    
    try {
      await updateProfile(currentUser, updates);
      setCurrentUser({ ...currentUser, ...updates });
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  };


  // Update user profile
  const updateUserProfile = async (updates) => {
    if (!currentUser) {
      const error = new Error('No user logged in');
      error.code = 'auth/not-authenticated';
      throw error;
    }

    try {
      let photoURL = currentUser.photoURL; // Start with the current URL

      // If a new photo file is provided, upload it and get the URL
      if (updates.photoFile) {
        try {
          // Validate file type and size
          const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
          const maxSize = 5 * 1024 * 1024; // 5MB
          
          if (!validTypes.includes(updates.photoFile.type)) {
            const error = new Error('Invalid file type. Please upload a JPG, PNG, or GIF image.');
            error.code = 'storage/invalid-file-type';
            throw error;
          }
          
          if (updates.photoFile.size > maxSize) {
            const error = new Error('File is too large. Maximum size is 5MB.');
            error.code = 'storage/file-too-large';
            throw error;
          }
          
          // Add a unique identifier to the filename
          const fileExt = updates.photoFile.name.split('.').pop();
          const fileName = `profile-${Date.now()}.${fileExt}`;
          
          photoURL = await uploadFile(
            updates.photoFile,
            `profile-pictures/${currentUser.uid}/${fileName}`
          );
        } catch (error) {
          console.error('Error uploading photo:', error);
          // Enhance error message for CORS issues
          if (error.code === 'storage/unauthorized' || 
              error.message.includes('CORS') || 
              error.message.includes('Network Error')) {
            const corsError = new Error(
              'Unable to upload image. Please check your internet connection or try again later.'
            );
            corsError.code = 'storage/cors-error';
            throw corsError;
          }
          // Re-throw with enhanced error handling
          const uploadError = new Error(
            error.message || 'Failed to upload photo. Please try again.'
          );
          uploadError.code = error.code || 'storage/upload-failed';
          throw uploadError;
        }
      }

      // Update Firebase Auth profile
      const authUpdates = {};
      if (updates.displayName) authUpdates.displayName = updates.displayName;
      // Always include photoURL in auth updates if it has changed.
      if (photoURL !== currentUser.photoURL) {
        authUpdates.photoURL = photoURL;
      }


      // Update email if provided
      if (updates.email && updates.email !== currentUser.email) {
        await updateEmail(auth.currentUser, updates.email);
      }

      // Update password if provided
      if (updates.password && updates.currentPassword) {
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          updates.currentPassword
        );
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, updates.password);
      }

      // Update Firestore user document
      const userRef = doc(db, 'users', currentUser.uid);
      const firestoreUpdates = {
        updatedAt: serverTimestamp(), // Use server timestamp for consistency
      };
      if (updates.displayName) firestoreUpdates.displayName = updates.displayName.trim();
      if (photoURL !== currentUser.photoURL) {
        firestoreUpdates.photoURL = photoURL;
      }

      // Only proceed with updates if there are actual changes
      if (Object.keys(authUpdates).length > 0 || Object.keys(firestoreUpdates).length > 1) {
        if (Object.keys(authUpdates).length > 0) {
          await updateAuthProfile(auth.currentUser, authUpdates);
        }
        if (Object.keys(firestoreUpdates).length > 1) {
          await updateDoc(userRef, firestoreUpdates);
        }
      }

      // Refresh user data by fetching the latest from Firestore
      await auth.currentUser.reload(); // Get latest data from auth
      const updatedUserDoc = await getDoc(userRef);
      const updatedAuthUser = auth.currentUser;
      const finalUser = {
        ...updatedUserDoc.data(),
        uid: updatedAuthUser.uid,
        email: updatedAuthUser.email,
        emailVerified: updatedAuthUser.emailVerified,
        displayName: updatedAuthUser.displayName,
        photoURL: updatedAuthUser.photoURL,
      };
      setCurrentUser(finalUser);
      
      return { success: true, user: finalUser };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  };

  // Update user banner function is defined below

  // Check if user has a specific role
  const hasRole = (user, role) => {
    if (!user) return false;
    return user.role === role || user.isAdmin; // Admins have all roles
  };

  // Check if user is admin
  const isUserAdmin = (user) => {
    return hasRole(user, 'admin') || (user && user.isAdmin === true);
  };

  // Check if user is authorized (author or admin)
  const isUserAuthorized = (user) => {
    return hasRole(user, 'author') || isUserAdmin(user);
  };

  // Sign up with email and password
  const signup = async (email, password, username) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      await updateAuthProfile(userCredential.user, {
        displayName: username
      });
      
      // Send verification email
      await sendEmailVerification(userCredential.user);
      
      // Create a user document in Firestore with default 'basic' role
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        displayName: username,
        emailVerified: false,
        role: 'basic', // Default role
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });

      // Update local state
      setCurrentUser({
        ...userCredential.user,
        role: 'basic',
        emailVerified: false
      });

      return { 
        success: true,
        message: 'Account created successfully! Please check your email to verify your account.'
      };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create account. Please try again.'
      };
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(firebaseAuth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Update user banner
  const updateUserBanner = async (file) => {
    try {
      if (!currentUser) throw new Error('No user is signed in');

      const path = `banners/${currentUser.uid}/${file.name}`;
      const bannerURL = await uploadFile(file, path);

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { bannerURL });

      setCurrentUser(prevUser => ({ ...prevUser, bannerURL }));
      return { success: true, bannerURL };
    } catch (error) {
      console.error('Error updating banner:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    updateUserProfile,
    updateUserBanner,
    loading,
    hasRole: (role) => hasRole(currentUser, role),
    isAdmin: () => isUserAdmin(currentUser),
    isAuthorized: () => isUserAuthorized(currentUser),
    isVerified: () => currentUser?.emailVerified === true,
    sendEmailVerification: (user) => sendEmailVerification(user || currentUser)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

