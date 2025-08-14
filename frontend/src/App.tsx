import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, useColorMode } from '@chakra-ui/react';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import EventsPage from './pages/EventsPage';
import CodingStatsPage from './pages/CodingStatsPage';
import CertificationsPage from './pages/CertificationsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLogsPage from './pages/AdminLogsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminProfileRequestsPage from './pages/AdminProfileRequestsPage';
import NotificationsPage from './pages/NotificationsPage';
import PointsPage from './pages/PointsPage';
import EligibilityPage from './pages/EligibilityPage';
import PointRulesPage from './pages/PointRulesPage';
import UserManagementPage from './pages/UserManagementPage';
import EventDetailsPage from './pages/EventDetailsPage'; // Import the new EventDetailsPage

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { colorMode } = useColorMode();

  return (
    <Box
      minH="100vh"
      bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}
      color={colorMode === 'dark' ? 'white' : 'gray.900'}
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:eventId" element={<EventDetailsPage />} />{' '}
          {/* New route for individual event details */}
          <Route path="coding-stats" element={<CodingStatsPage />} />
          <Route path="certifications" element={<CertificationsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="points" element={<PointsPage />} />
          <Route path="eligibility" element={<EligibilityPage />} />
          {/* Admin Routes */}
          <Route
            path="admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/point-rules"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <PointRulesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/logs"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/settings"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/profile-requests"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminProfileRequestsPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;
