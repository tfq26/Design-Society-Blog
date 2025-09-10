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
import { AuthProvider } from './contexts/AuthProvider';
import { useAuth } from './hooks/useAuth';
import PrivateRoute from './Components/auth/PrivateRoute';
import AdminRoute from './Components/auth/AdminRoute';
import ProtectedRoute from './Components/ProtectedRoute';
import { ErrorBoundary, ErrorPage } from './Components/ErrorBoundary';
import Home from './Pages/Home';
import About from './Pages/About';
import Events from './Pages/Events';
import EventDetail from './Pages/EventDetail';
import AdminDashboard from './Pages/AdminDashboard';
import UserProfile from './Pages/UserProfile';

function App() {
  const [isFirebaseReady, setFirebaseReady] = useState(false);
  const [initializationError, setInitializationError] = useState(null);
  const { currentUser } = useAuth();
  
  // Call the useTheme hook to enable lig

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


  if (initializationError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-red-50 dark:bg-eerie-black">
        <ErrorPage 
          error={initializationError} 
          resetError={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!isFirebaseReady) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-eerie-black">
        <div className="text-center p-8" style={{ color: 'var(--eerie-black)' }}>
          Initializing application...
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {/* Centralized background styling to a top-level div for consistency */}
      <div className="bg-red-50 dark:bg-eerie-black">
        <NavBar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                <ErrorBoundary>
                  <Home />
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
              path="/events" 
              element={
                <ErrorBoundary>
                  <Events />
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/events/:id" 
              element={
                <ErrorBoundary>
                  <EventDetail />
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/user/:userId" 
              element={
                <ErrorBoundary>
                  <UserProfile />
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/about" 
              element={
                <ErrorBoundary>
                  <About />
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ErrorBoundary>
                  <Dashboard />
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
            <Route 
              path="/admin" 
              element={
                <ErrorBoundary>
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
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
