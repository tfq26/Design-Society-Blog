import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './Components/Navbar';
import Dashboard from './Pages/Dashboard';
import Post from './Pages/Post';
import CreatePost from './Pages/CreatePost';
import Profile from './Pages/Profile';
import Login from './Components/auth/Login';
import Signup from './Components/auth/Signup';
import { initFirebase } from './Api/api';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import useTheme from './hooks/useTheme';
import PrivateRoute from './Components/auth/PrivateRoute';
import { ErrorBoundary, ErrorPage } from './Components/ErrorBoundary';

function App() {
  const [isFirebaseReady, setFirebaseReady] = useState(false);
  const [initializationError, setInitializationError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const initialize = async () => {
      try {
        await initFirebase();
        setFirebaseReady(true);
      } catch (error) {
        console.error("Firebase initialization failed", error);
        setInitializationError(error);
      }
    };
    initialize();
  }, []);

  useTheme();

  if (initializationError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorPage 
          error={initializationError} 
          resetError={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!isFirebaseReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8" style={{ color: 'var(--eerie-black)' }}>
          Initializing application...
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div>
        <NavBar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                <ErrorBoundary>
                  <Dashboard />
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/post/:id" 
              element={
                <ErrorBoundary>
                  <Post />
                </ErrorBoundary>
              } 
            />
            <Route
              path="/create"
              element={
                <ErrorBoundary>
                  <PrivateRoute>
                    <CreatePost />
                  </PrivateRoute>
                </ErrorBoundary>
              }
            />
            <Route 
              path="/login" 
              element={
                <ErrorBoundary>
                  {!currentUser ? <Login /> : <Navigate to="/" />}
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <ErrorBoundary>
                  {!currentUser ? <Signup /> : <Navigate to="/" />}
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ErrorBoundary>
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                </ErrorBoundary>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
