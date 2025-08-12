import React from 'react';
import {
  Box,
  VStack,
  Text,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import {
  FiCalendar,
  FiAward,
  FiUsers,
  FiDownload,
  FiSettings,
} from 'react-icons/fi';

// Import existing modular components
import AdminOverviewStats from './AdminOverviewStats';
import AdminQuickActions from './AdminQuickActions';
import AdminPointSystemOverview from './AdminPointSystemOverview';
import AdminUserActivityOverview from './AdminUserActivityOverview';
import AdminSystemHealthAndAlerts from './AdminSystemHealthAndAlerts';

interface SystemStats {
  totalStudents: number;
  totalEvents: number;
  pendingCertifications: number;
  activeUsers: number;
  totalPoints: number;
  averagePoints: number;
}

interface ProfileRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  requestedData: any;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  adminNote?: string;
}

interface Event {
  id: string;
  name: string;
  type: 'WORKSHOP' | 'HACKATHON';
  date: string;
  organizer: string;
  url: string;
  link: string;
  certificationDeadline?: string;
}

interface UserWithPoints {
  id: string;
  name: string;
  email: string;
  class: string;
  batch: string;
  points: number;
  profileId: string;
}

interface AdminDashboardContentProps {
  systemStats: SystemStats;
  events: Event[];
  profileRequests: ProfileRequest[];
  pointStats: { totalUsers: number; totalPoints: number; averagePoints: number; topPerformers: UserWithPoints[] };
}

const AdminDashboardContent: React.FC<AdminDashboardContentProps> = ({
  systemStats,
  events,
  profileRequests,
  pointStats,
}) => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const quickActions = [
    {
      label: 'Manage Events',
      description: 'Create & edit events',
      icon: FiCalendar,
      color: 'blue',
      onClick: () => navigate('/events'),
    },
    {
      label: 'Verify Certifications',
      description: 'Review submissions',
      icon: FiAward,
      color: 'purple',
      onClick: () => navigate('/certifications'),
    },
    {
      label: 'Profile Requests',
      description: 'Review edit requests',
      icon: FiUsers,
      color: 'cyan',
      onClick: () => navigate('/admin/profile-requests'),
    },
    {
      label: 'Export Data',
      description: 'Download reports',
      icon: FiDownload,
      color: 'green',
      onClick: () => navigate('/admin/logs'),
    },
    {
      label: 'System Settings',
      description: 'Configure points & rules',
      icon: FiSettings,
      color: 'orange',
      onClick: () => navigate('/admin/settings'),
    },
  ];

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="lg" color="white" mb={2}>
          Admin Dashboard
        </Heading>
        <Text color="gray.400">
          Monitor system activity and manage student development
        </Text>
      </Box>

      <AdminOverviewStats
        systemStats={systemStats}
        cardBg={cardBg}
        borderColor={borderColor}
      />

      <AdminQuickActions
        quickActions={quickActions}
        cardBg={cardBg}
        borderColor={borderColor}
      />

      <AdminPointSystemOverview
        pointStats={pointStats}
        cardBg={cardBg}
        borderColor={borderColor}
      />

      <AdminUserActivityOverview
        pointStats={pointStats}
        profileRequests={profileRequests}
        events={events}
        systemStats={systemStats}
        cardBg={cardBg}
        borderColor={borderColor}
      />

      <AdminSystemHealthAndAlerts
        systemStats={systemStats}
        profileRequests={profileRequests}
        cardBg={cardBg}
        borderColor={borderColor}
      />
    </VStack>
  );
};

export default AdminDashboardContent;