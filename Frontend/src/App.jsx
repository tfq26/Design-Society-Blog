import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useRouteError, useLocation } from 'react-router-dom';
import NavBar from './Components/Navbar';
import Dashboard from './Pages/Dashboard';
import Post from './Pages/Post';
import Discussion from './Pages/Discussion';
import CreatePost from './Pages/CreatePost';
import Profile from './Pages/Profile';
import Login from './Components/auth/Login';
import Signup from './Components/auth/Signup';
import { initFirebase } from './Api/api';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import useTheme from './hooks/useTheme';
import PrivateRoute from './Components/auth/PrivateRoute';
import { ErrorBoundary } from './Components/ErrorBoundary';

function App() {
  const [isFirebaseReady, setFirebaseReady] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const initialize = async () => {
      try {
        await initFirebase();
        setFirebaseReady(true);
      } catch (error) {
        console.error("Firebase initialization failed", error);
      }
    };
    initialize();
  }, []);

  useTheme();

  if (!isFirebaseReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8">Initializing application...</div>
      </div>
    );
  }

  // Error boundary wrapper for routes
  const ErrorBoundaryRoute = ({ element: Element }) => (
    <ErrorBoundary>
      <Element />
    </ErrorBoundary>
  );

  // Error boundary wrapper for private routes
  const PrivateRouteWithErrorBoundary = ({ element: Element, ...rest }) => (
    <ErrorBoundary>
      <PrivateRoute element={Element} {...rest} />
    </ErrorBoundary>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <NavBar />
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<ErrorBoundaryRoute element={Dashboard} />} />
            <Route path="/login" element={!currentUser ? <ErrorBoundaryRoute element={Login} /> : <Navigate to="/" />} />
            <Route path="/signup" element={!currentUser ? <ErrorBoundaryRoute element={Signup} /> : <Navigate to="/" />} />
            <Route path="/create" element={<PrivateRoute><CreatePost /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/post/:id" element={<ErrorBoundaryRoute element={Post} />} />
            <Route path="/post/:id/discussion" element={<ErrorBoundaryRoute element={Discussion} />} />
            <Route path="*" element={
              <ErrorBoundary>
                <div className="min-h-screen flex items-center justify-center">
                  <h1 className="text-2xl font-semibold">404 - Page Not Found</h1>
                </div>
              </ErrorBoundary>
            } />
          </Routes>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
