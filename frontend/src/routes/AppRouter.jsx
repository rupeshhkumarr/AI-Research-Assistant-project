import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Loader } from '../components/common/Loader';
import { useAuthContext } from '../context/AuthContext';

// Lazy loading pages for performance
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Upload = lazy(() => import('../pages/Upload'));
const Chat = lazy(() => import('../pages/Chat'));
const DocumentLibrary = lazy(() => import('../pages/DocumentLibrary'));
const Settings = lazy(() => import('../pages/Settings'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const VerifyEmail = lazy(() => import('../pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));

const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center h-full min-h-[400px]">
    <Loader size="lg" />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { session } = useAuthContext();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={
        <Suspense fallback={<PageLoader />}>
          <Login />
        </Suspense>
      } />
      <Route path="/register" element={
        <Suspense fallback={<PageLoader />}>
          <Register />
        </Suspense>
      } />
      <Route path="/verify-email" element={
        <Suspense fallback={<PageLoader />}>
          <VerifyEmail />
        </Suspense>
      } />
      <Route path="/forgot-password" element={
        <Suspense fallback={<PageLoader />}>
          <ForgotPassword />
        </Suspense>
      } />
      <Route path="/reset-password" element={
        <Suspense fallback={<PageLoader />}>
          <ResetPassword />
        </Suspense>
      } />

      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        } />
        <Route path="upload" element={
          <Suspense fallback={<PageLoader />}>
            <Upload />
          </Suspense>
        } />
        <Route path="chat" element={
          <Suspense fallback={<PageLoader />}>
            <Chat />
          </Suspense>
        } />
        <Route path="documents" element={
          <Suspense fallback={<PageLoader />}>
            <DocumentLibrary />
          </Suspense>
        } />
        <Route path="settings" element={
          <Suspense fallback={<PageLoader />}>
            <Settings />
          </Suspense>
        } />
      </Route>
    </Routes>
  );
};
