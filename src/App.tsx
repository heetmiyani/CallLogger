import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CallLogs from './pages/CallLogs';
import StaffActivity from './pages/StaffActivity';
import MyLogs from './pages/MyLogs';
import ManageUsers from './pages/ManageUsers';
import AdminReminderCalls from './pages/AdminReminderCalls';
import StaffChangeRequest from './pages/StaffChangeRequest';
import AdminManageData from './pages/AdminManageData';
import ManageClients from './pages/admin/ManageClients';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <Routes>
              {/* Default Redirect */}
              <Route
                path="/"
                element={<Navigate to="/login" replace />}
              />

              {/* Login */}
              <Route path="/login" element={<Login />} />

              {/* Dashboard (Role-based inside component) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* ================= ADMIN ROUTES ================= */}

              <Route
                path="/call-logs"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <CallLogs />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/reminder-calls"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminReminderCalls />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/staff-activity"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <StaffActivity />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/manage-users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageUsers />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/manage-data"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminManageData />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/manage-clients"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageClients />
                  </ProtectedRoute>
                }
              />

              {/* ================= STAFF ROUTES ================= */}

              <Route
                path="/my-logs"
                element={
                  <ProtectedRoute allowedRoles={['staff']}>
                    <MyLogs />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/staff/change-request"
                element={
                  <ProtectedRoute allowedRoles={['staff']}>
                    <StaffChangeRequest />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
