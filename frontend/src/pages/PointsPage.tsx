import React from 'react';
import {
  Box,
  VStack,
  Text,
  Heading,
  useToast,
  useColorModeValue,
  Skeleton,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pointsAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import {
  PointBreakdown,
  UserWithPoints,
  PointStatistics,
  PointRule,
} from '../types/points';

// Import new modular components
import AdminPointsView from '../components/points/AdminPointsView';
import StudentPointsView from '../components/points/StudentPointsView';

const PointsPage: React.FC = () => {
  const { user } = useAuthStore();
  const toast = useToast();
  const queryClient = useQueryClient();
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  // Student queries
  const { data: breakdownResponse, isLoading: breakdownLoading } = useQuery({
    queryKey: ['pointBreakdown'],
    queryFn: () => pointsAPI.getMyBreakdown(),
    enabled: user?.role === 'STUDENT',
  });

  // Rules are fetched for both student and admin, so apply staleTime here
  const { data: rulesResponse, isLoading: rulesLoading } = useQuery({
    queryKey: ['pointRules'],
    queryFn: () => pointsAPI.getPointRules(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Admin queries
  const { data: statisticsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ['pointStatistics'],
    queryFn: () => pointsAPI.getPointStatistics(),
    enabled: user?.role === 'ADMIN',
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: usersResponse, isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => pointsAPI.getAllUsers(),
    enabled: user?.role === 'ADMIN',
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const breakdown: PointBreakdown | undefined = breakdownResponse?.data?.data;
  const rules: PointRule[] = rulesResponse?.data?.data || [];
  const statistics: PointStatistics | undefined =
    statisticsResponse?.data?.data;
  const users: UserWithPoints[] = usersResponse?.data?.data || [];

  const updateAllPointsMutation = useMutation({
    mutationFn: () => pointsAPI.updateAllUserPoints(),
    onSuccess: () => {
      toast({
        title: 'Points Updated',
        description: 'All user points have been recalculated successfully.',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['pointStatistics'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] }); // Invalidate all users for admin view
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.response?.data?.error || 'Failed to update points',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleUpdateAllPoints = () => {
    updateAllPointsMutation.mutate();
  };

  const isLoading =
    user?.role === 'STUDENT'
      ? breakdownLoading || rulesLoading
      : statsLoading || rulesLoading || usersLoading;

  if (isLoading) {
    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            {user?.role === 'ADMIN' ? 'Points Management' : 'My Points'}
          </Heading>
          <Text color="gray.400">
            {user?.role === 'ADMIN'
              ? "Manage all users' points"
              : 'Track your progress and point breakdown'}
          </Text>
        </Box>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
          {[...Array(4)].map((_, i) => (
            <GridItem key={i}>
              <Skeleton height="200px" />
            </GridItem>
          ))}
        </Grid>
      </VStack>
    );
  }

  if (user?.role === 'ADMIN') {
    return (
      <AdminPointsView
        statistics={statistics}
        onUpdateAllPoints={handleUpdateAllPoints}
        isUpdatingAllPoints={updateAllPointsMutation.isPending}
        users={users}
        usersLoading={usersLoading}
        rules={rules}
      />
    );
  }

  return <StudentPointsView breakdown={breakdown} rules={rules} />;
};

export default PointsPage;
