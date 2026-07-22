import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Splash } from './pages/Splash';
import { App as CapApp } from '@capacitor/app';
import { supabase } from './lib/supabaseClient';
import { RoleSelect } from './pages/RoleSelect';
import { Login } from './pages/Login';
import { LearnerLayout } from './components/LearnerLayout';
import { LearnerDashboard } from './pages/learner/Dashboard';
import { BookingWizard } from './pages/learner/BookingWizard';
import { LearnerBookings } from './pages/learner/Bookings';
import { LearnerProgress } from './pages/learner/Progress';
import { LearnerWallet } from './pages/learner/Wallet';
import { InstructorLayout } from './components/InstructorLayout';
import { InstructorDashboard } from './pages/instructor/Dashboard';
import { InstructorBookings } from './pages/instructor/Bookings';
import { InstructorStudents } from './pages/instructor/Students';
import { InstructorEarnings } from './pages/instructor/Earnings';
import { InstructorSettings } from './pages/instructor/Settings';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminUsers } from './pages/admin/Users';
import { AdminBookings } from './pages/admin/Bookings';
import { AdminInstructors } from './pages/admin/Instructors';
import { AdminRevenue } from './pages/admin/Revenue';
// Mock components for other routes to prevent errors
const Placeholder = ({ title }: {title: string;}) =>
<div className="p-8 flex items-center justify-center h-full">
    <h2 className="text-2xl text-white/50">{title} - Coming Soon</h2>
  </div>;

function RequireAuth({
  children,
  allowedRole



}: {children: React.ReactNode;allowedRole?: string;}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/role-select" replace />;
  if (!user.onboarded) return <Navigate to="/role-select" replace />;
  if (allowedRole && user.role !== allowedRole)
  return <Navigate to={`/${user.role}`} replace />;
  return <>{children}</>;
}
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/role-select" element={<RoleSelect />} />
      <Route path="/login" element={<Login />} />

      {/* Learner Routes */}
      <Route
        path="/learner"
        element={
        <RequireAuth allowedRole="learner">
            <LearnerLayout />
          </RequireAuth>
        }>
        
        <Route index element={<LearnerDashboard />} />
        <Route path="book" element={<BookingWizard />} />
        <Route path="bookings" element={<LearnerBookings />} />
        <Route path="progress" element={<LearnerProgress />} />
        <Route path="wallet" element={<LearnerWallet />} />
      </Route>

      {/* Instructor Routes */}
      <Route
        path="/instructor"
        element={
        <RequireAuth allowedRole="instructor">
            <InstructorLayout />
          </RequireAuth>
        }>
        
        <Route index element={<InstructorDashboard />} />
        <Route path="bookings" element={<InstructorBookings />} />
        <Route path="students" element={<InstructorStudents />} />
        <Route path="earnings" element={<InstructorEarnings />} />
        <Route path="settings" element={<InstructorSettings />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
        <RequireAuth allowedRole="admin">
            <AdminLayout />
          </RequireAuth>
        }>
        
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="instructors" element={<AdminInstructors />} />
        <Route path="revenue" element={<AdminRevenue />} />
      </Route>
    </Routes>);

}
export function App() {
  useEffect(() => {
    const setupDeepLinks = async () => {
      CapApp.addListener('appUrlOpen', async (event: any) => {
        try {
          const url = new URL(event.url);
          const hash = url.hash.substring(1);
          const params = new URLSearchParams(hash || url.search);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (!error) {
              window.location.hash = '';
            }
          }
        } catch (err) {
          console.error('Error handling deep link:', err);
        }
      });
    };

    setupDeepLinks();

    return () => {
      CapApp.removeAllListeners();
    };
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster theme="dark" position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}