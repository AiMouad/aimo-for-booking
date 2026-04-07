import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

// Context
import { AuthProvider } from './context/AuthContext';

// Layout
import Layout from './components/layout/Layout';

// Feature components
import LoginForm from './features/auth/components/LoginForm';
import RegisterForm from './features/auth/components/RegisterForm';
import ServiceGrid from './features/services/components/ServiceGrid';
import BookService from './features/services/components/BookService';
import MyReservations from './features/reservations/components/MyReservations';
import OwnerDashboard from './features/dashboard/components/OwnerDashboard';
import WorkerDashboard from './features/dashboard/components/WorkerDashboard';
import ChatInterface from './features/chatbot/components/ChatInterface';
import NotificationDropdown from './features/notifications/components/NotificationDropdown';

// Hooks
import useAuth from './hooks/useAuth';

const AppContent = () => {
  const { user, loading, isAuthenticated } = useAuth();

  // Protected route wrapper
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
      return <Navigate to="/unauthorized" replace />;
    }

    return children;
  };

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          
          {/* Service Routes */}
          <Route path="/services" element={<ServiceGrid />} />
          <Route path="/services/:id/book" element={
            <ProtectedRoute allowedRoles={['CLIENT']}>
              <BookService />
            </ProtectedRoute>
          } />
          
          {/* Client Routes */}
          <Route path="/my-reservations" element={
            <ProtectedRoute allowedRoles={['CLIENT']}>
              <MyReservations />
            </ProtectedRoute>
          } />
          
          {/* Worker Routes */}
          <Route path="/worker" element={
            <ProtectedRoute allowedRoles={['WORKER']}>
              <WorkerDashboard />
            </ProtectedRoute>
          } />
          
          {/* Owner Routes */}
          <Route path="/owner" element={
            <ProtectedRoute allowedRoles={['OWNER']}>
              <OwnerDashboard />
            </ProtectedRoute>
          } />
          
          {/* Chatbot - Available to all authenticated users */}
          <Route path="/chatbot" element={
            <ProtectedRoute>
              <ChatInterface />
            </ProtectedRoute>
          } />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/services" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Provider>
  );
};

export default App;