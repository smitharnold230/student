import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  Text,
  Heading,
  useColorModeValue,
  Skeleton,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { 
  FiCalendar, 
  FiAward, 
  FiUsers, 
  FiDownload,
  FiSettings, 
} from 'react-icons/fi';
import { adminAPI, eventAPI, profileAPI, pointsAPI } from '../services/api';

// Import new modular components
import AdminOverviewStats from '../components/admin/AdminOverviewStats';
import AdminQuickActions from '../components/admin/AdminQuickActions';
import AdminPointSystemOverview from '../components/admin/AdminPointSystemOverview';
import AdminUserActivityOverview from '../components/admin/AdminUserActivityOverview';
import AdminSystemHealthAndAlerts from '../components/admin/AdminSystemHealthAndAlerts';

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

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const { data: eventsResponse, isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventAPI.getEvents(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: systemStatsResponse, isLoading: systemStatsLoading } = useQuery({
    queryKey: ['systemStats'],
    queryFn: () => adminAPI.getSystemStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: profileRequestsResponse, isLoading: profileRequestsLoading } = useQuery({
    queryKey: ['profileRequests'],
    queryFn: () => profileAPI.getPendingRequests(),
    staleTime: 1000 * 60 * 1, // 1 minute, as these might change more frequently
  });

  const { data: pointStatsResponse, isLoading: pointStatsLoading } = useQuery({
    queryKey: ['pointStats'],
    queryFn: () => pointsAPI.getPointStatistics(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const systemStats: SystemStats = systemStatsResponse?.data || {
    totalStudents: 0,
    totalEvents: 0,
    pendingCertifications: 0,
    activeUsers: 0,
    totalPoints: 0,
    averagePoints: 0,
  };

  const events: Event[] = eventsResponse?.data || [];
  const profileRequests: ProfileRequest[] = profileRequestsResponse?.data || [];
  const pointStats: { totalUsers: number; totalPoints: number; averagePoints: number; topPerformers: UserWithPoints[] } = pointStatsResponse?.data?.data || {
    totalUsers: 0,
    totalPoints: 0,
    averagePoints: 0,
    topPerformers: [],
  };

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

  const isLoading = eventsLoading || systemStatsLoading || profileRequestsLoading || pointStatsLoading;

  if (isLoading) {
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
        <Skeleton height="120px" />
        <Skeleton height="200px" />
        <Skeleton height="250px" />
        <Skeleton height="200px" />
        <Skeleton height="200px" />
      </VStack>
    );
  }

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

export default AdminDashboardPage;