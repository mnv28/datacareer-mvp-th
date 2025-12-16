import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
// import { store } from '@/redux/store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import Index from '@/pages/Index';
import QuestionDetail from '@/pages/QuestionDetail';
import JobDatabase from '@/pages/JobDatabase';
import SubscriptionSettings from '@/pages/SubscriptionSettings';
import PaymentSuccess from '@/pages/payment/PaymentSuccess';
import PaymentCancel from '@/pages/payment/PaymentCancel';
import { store } from './redux/store';
import { SidebarProvider } from './contexts/SidebarContext';

const App = () => {
  return (
    <Provider store={store}>
      <SidebarProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Payment redirect routes - minimal, just redirect */}
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/question/:id"
              element={
                <ProtectedRoute>
                  <QuestionDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/job-database"
              element={
                <ProtectedRoute>
                  <JobDatabase />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/subscription"
              element={
                <ProtectedRoute>
                  <SubscriptionSettings />
                </ProtectedRoute>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </Router>
      </SidebarProvider>
    </Provider>
  );
};

export default App;
