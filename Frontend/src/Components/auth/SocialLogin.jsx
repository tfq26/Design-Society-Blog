import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { signInWithGoogle } from '../../Api/api';

const SocialLogin = ({ onError, isSignUp = false }) => {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      if (result && !result.success) {
        onError(result.error || 'Failed to sign in with Google');
      }
    } catch (error) {
      onError(error.message || 'An error occurred during Google sign in');
    }
  };

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-zinc-800 text-gray-500 dark:text-gray-300">
            Or continue with
          </span>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-zinc-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          <FcGoogle className="w-5 h-5" />
          <span className="ml-2">Continue with Google</span>
        </button>
      </div>
    </div>
  );
};

export default SocialLogin;
