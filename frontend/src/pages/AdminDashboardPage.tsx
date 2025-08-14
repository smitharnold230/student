import React from 'react';
import {
  Box,
  VStack,
  Text,
  Heading,
  useColorModeValue,
  Skeleton,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI, eventAPI, profileAPI, pointsAPI } from '../services/api';

// Import the new modular component
import AdminDashboardContent from '../components/admin/AdminDashboardContent';

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
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const { data: eventsResponse, isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventAPI.getEvents(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: systemStatsResponse, isLoading: systemStatsLoading } = useQuery(
    {
      queryKey: ['systemStats'],
      queryFn: () => adminAPI.getSystemStats(),
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  );

  const { data: profileRequestsResponse, isLoading: profileRequestsLoading } =
    useQuery({
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
  const pointStats: {
    totalUsers: number;
    totalPoints: number;
    averagePoints: number;
    topPerformers: UserWithPoints[];
  } = pointStatsResponse?.data?.data || {
    totalUsers: 0,
    totalPoints: 0,
    averagePoints: 0,
    topPerformers: [],
  };

  const isLoading =
    eventsLoading ||
    systemStatsLoading ||
    profileRequestsLoading ||
    pointStatsLoading;

  if (isLoading) {
    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            Admin Dashboard
          </Heading>
          <Text color="gray.400">
            Monitoring system activity and managing student development
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
    <AdminDashboardContent
      systemStats={systemStats}
      events={events}
      profileRequests={profileRequests}
      pointStats={pointStats}
    />
  );
};

export default AdminDashboardPage;
