import { useEffect, useState, useCallback } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile as updateAuthProfile,
  EmailAuthProvider,
  sendEmailVerification as sendEmailVerificationFirebase
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';
import { AuthContext } from './auth-context';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      const newUserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email,
        photoURL: user.photoURL || null,
        emailVerified: user.emailVerified || false,
        role: 'basic',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', user.uid), newUserData);
      return { ...user, ...newUserData };
    } catch (error) {
      console.error('Error getting user data:', error);
      return user; // Return basic user data if Firestore fails
    }
  }, []);

  // Check if user has a specific role
  const hasRole = (user, role) => {
    if (!user) return false;
    return user.role === role || user.isAdmin === true;
  };

  // Check if user is admin
  const isUserAdmin = (user) => {
    return hasRole(user, 'admin');
  };

  // Check if user is authorized (has specific role or is admin)
  const isUserAuthorized = (user) => {
    return hasRole(user, 'author') || isUserAdmin(user);
  };

  // Sign up with email and password
  const signup = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateAuthProfile(userCredential.user, { displayName });
      await sendEmailVerificationFirebase(userCredential.user);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Update last login time
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        lastLogin: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    if (!currentUser) {
      throw new Error('No user is signed in');
    }

    try {
      // Update auth profile
      if (updates.displayName || updates.photoURL) {
        await updateAuthProfile(auth.currentUser, {
          displayName: updates.displayName,
          photoURL: updates.photoURL
        });
      }

      // Update Firestore
      const userUpdates = {};
      if (updates.displayName) userUpdates.displayName = updates.displayName;
      if (updates.photoURL) userUpdates.photoURL = updates.photoURL;
      
      if (Object.keys(userUpdates).length > 0) {
        await updateDoc(doc(db, 'users', currentUser.uid), userUpdates);
      }

      // Update local state
      setCurrentUser(prev => ({
        ...prev,
        ...userUpdates
      }));

      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  };

  // Update user banner
  const updateUserBanner = async (file) => {
    if (!currentUser) {
      throw new Error('No user is signed in');
    }

    try {
      // Upload the file to Firebase Storage
      const fileRef = ref(storage, `banners/${currentUser.uid}/${file.name}`);
      await uploadBytes(fileRef, file);
      const bannerURL = await getDownloadURL(fileRef);

      // Update Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        bannerURL
      });

      // Update local state
      setCurrentUser(prev => ({
        ...prev,
        bannerURL
      }));

      return { success: true, bannerURL };
    } catch (error) {
      console.error('Error updating banner:', error);
      return { success: false, error: error.message };
    }
  };

  // Send email verification
  const sendEmailVerification = async (user = currentUser) => {
    if (!user) {
      throw new Error('No user is signed in');
    }

    try {
      await sendEmailVerificationFirebase(user);
      return { success: true };
    } catch (error) {
      console.error('Error sending verification email:', error);
      return { success: false, error: error.message };
    }
  };

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await getUserData(user);
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [getUserData]);

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
    sendEmailVerification: (user) => sendEmailVerification(user)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
