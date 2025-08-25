import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification } from 'firebase/auth';
import { auth } from '../Api/api';
import { FiUpload, FiUser, FiMail, FiLock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Profile = () => {
  const { currentUser, updateUserProfile, updateUserBanner } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [photoURL, setPhotoURL] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerURL, setBannerURL] = useState('');
  const fileInputRef = useRef(null);
  const bannerFileInputRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setEmail(currentUser.email || '');
      setPhotoURL(currentUser.photoURL || '');
      setBannerURL(currentUser.bannerURL || '');
    }
  }, [currentUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected for profile photo:', file);

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setMessage({ text: 'File size should be less than 5MB', type: 'error' });
        return;
      }
      setPhotoFile(file);
      setPhotoURL(URL.createObjectURL(file));
    }
  };


  const handleBannerFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setMessage({ text: 'Banner file size should not exceed 5MB', type: 'error' });
        return;
      }
      setBannerFile(file);
      setBannerURL(URL.createObjectURL(file));
    }
  };

  const handleSaveBanner = async () => {
    if (!bannerFile) return;
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const result = await updateUserBanner(bannerFile);
      if (result.success) {
        setMessage({ text: 'Banner updated successfully!', type: 'success' });
        setBannerFile(null);
      } else {
        throw new Error(result.error || 'Failed to update banner');
      }
    } catch (error) {
      console.error("Error updating banner:", error);
      setMessage({ text: error.message || 'Failed to update banner', type: 'error' });
      setBannerURL(currentUser.bannerURL || ''); // Revert on failure
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const updates = { 
        displayName: displayName.trim(),
        photoFile: photoFile // Pass the file object to the context
      };

      if (!updates.displayName) {
        throw new Error('Display name is required');
      }

      // Update profile
      const result = await updateUserProfile(updates);

      if (result.success && result.user) {
        setPhotoURL(result.user.photoURL);
        setMessage({
          text: 'Profile updated successfully!',
          type: 'success'
        });
        setPhotoFile(null); // Clear the photo file state
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
      
      // Clear the file input after successful upload
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      
      let errorMessage = 'Failed to update profile';
      
      // Handle specific error cases
      switch(error.code) {
        case 'auth/requires-recent-login':
          errorMessage = 'Please log in again to update your profile';
          break;
        case 'storage/unauthorized':
          errorMessage = 'You do not have permission to upload files';
          break;
        case 'storage/canceled':
          errorMessage = 'Upload was canceled';
          break;
        case 'storage/unknown':
          errorMessage = 'An unknown error occurred during file upload';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      setMessage({ 
        text: errorMessage, 
        type: 'error' 
      });
      
      // Revert the photo URL on error if we had a previous one
      if (currentUser.photoURL) {
        setPhotoURL(currentUser.photoURL);
      } else {
        setPhotoURL('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentUser || !currentPassword || !newPassword || !confirmPassword) return;
    
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'New passwords do not match', type: 'error', context: 'password' });
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage({ text: 'Password should be at least 6 characters', type: 'error', context: 'password' });
      return;
    }
    
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      
      setMessage({ 
        text: 'Password updated successfully!', 
        type: 'success',
        context: 'password'
      });
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error("Error updating password:", error);
      setMessage({ 
        text: error.message || 'Failed to update password', 
        type: 'error',
        context: 'password'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendVerification = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setMessage({ 
          text: 'Verification email sent. Please check your inbox.', 
          type: 'success' 
        });
      } else {
        throw new Error('No authenticated user found');
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      setMessage({ 
        text: error.message || 'Failed to send verification email', 
        type: 'error' 
      });
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 p-4">
        <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Profile</h2>
          <p className="text-gray-600 dark:text-gray-300">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-800 rounded-xl shadow-lg overflow-hidden">
        {/* Header with cover photo and profile picture */}
        <div className="relative">
          <div className="h-80 bg-gradient-to-r from-blue-500 to-purple-600 relative group">
            {bannerURL ? (
              <img src={bannerURL} alt="Profile banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
            )}
            <button
              onClick={() => bannerFileInputRef.current?.click()}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full shadow-md hover:bg-opacity-75 transition-all opacity-0 group-hover:opacity-100"
              title="Change banner"
            >
              <FiUpload size={20} />
              <input
                type="file"
                ref={bannerFileInputRef}
                onChange={handleBannerFileChange}
                accept="image/*"
                className="hidden"
              />
            </button>
            {bannerFile && (
              <button
                onClick={handleSaveBanner}
                disabled={loading}
                className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {loading ? 'Saving...' : 'Save Banner'}
              </button>
            )}
          </div>
          <div className="absolute bottom-8 left-5 z-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-zinc-800 bg-white dark:bg-zinc-700 overflow-hidden shadow-md">
                {photoURL ? (
                  <img 
                    src={photoURL} 
                    alt={currentUser.displayName || 'User'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-3xl font-bold">
                    {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 
                     currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow-md hover:bg-blue-600 transition-colors"
                title="Change photo"
              >
                <FiUpload size={16} />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </button>
            </div>
          </div>
        </div>
        </div>

        {/* Main content */}
        <div className="mt-20 px-8 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 space-y-4 md:space-y-0">
            <div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  {currentUser.displayName || 'User'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">{currentUser.email}</p>
              </div>
              
              {!currentUser.emailVerified && (
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center text-amber-700 dark:text-amber-300 text-sm">
                  <FiAlertCircle className="mr-2 flex-shrink-0" />
                  <div>
                    <span>Email not verified. </span>
                    <button 
                      onClick={handleResendVerification}
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline ml-1"
                      disabled={loading}
                    >
                      Resend verification email
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${
              currentUser.emailVerified 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' 
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
            } shadow-sm`}>
              {currentUser.emailVerified ? 'Verified' : 'Unverified'}
              {currentUser.emailVerified ? (
                <FiCheckCircle className="ml-1" />
              ) : (
                <FiXCircle className="ml-1" />
              )}
            </span>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-zinc-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'security'
                    ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                }`}
              >
                Security
              </button>
            </nav>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">
                  Display Name
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-zinc-700 dark:text-white p-2"
                    placeholder="Enter your display name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">
                  Email
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    disabled
                    className="bg-gray-100 dark:bg-zinc-700 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:text-gray-300 p-2"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Contact support if you need to change your email address.
                </p>
              </div>

              {message.text && message.context !== 'password' && (
                <div className={`p-3 rounded-md ${
                  message.type === 'error' 
                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' 
                    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading || !displayName.trim()}
                  className={`px-4 py-2 rounded-md text-white ${
                    loading || !displayName.trim() 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } transition-colors`}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">
                  Current Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-zinc-700 dark:text-white p-2"
                    placeholder="Enter your current password"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">
                  New Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-zinc-700 dark:text-white p-2"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">
                  Confirm New Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-zinc-700 dark:text-white p-2"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              {message.text && message.context === 'password' && (
                <div className={`p-3 rounded-md ${
                  message.type === 'error' 
                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' 
                    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                  className={`px-4 py-2 rounded-md text-white ${
                    loading || !currentPassword || !newPassword || !confirmPassword
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } transition-colors`}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
  );
};

export default Profile;
