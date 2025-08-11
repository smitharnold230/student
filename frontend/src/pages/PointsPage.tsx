import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  useToast,
  useColorModeValue,
  useDisclosure,
  Skeleton,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiRefreshCw } from 'react-icons/fi';
import { pointsAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { PointBreakdown, UserWithPoints, PointStatistics, PointRule } from '../types/points';
import { getStudentLevel } from '../utils/points';

// Import new modular components
import AdminPointsSummaryCards from '../components/points/AdminPointsSummaryCards';
import AdminUserPointsTable from '../components/points/AdminUserPointsTable';
import UpdatePointsModal from '../components/points/UpdatePointsModal';
import ResetPointsModal from '../components/points/ResetPointsModal';
import StudentPointsSummaryCards from '../components/points/StudentPointsSummaryCards';
import StudentDetailedBreakdown from '../components/points/StudentDetailedBreakdown';
import PointRulesDisplay from '../components/points/PointRulesDisplay';

// Admin Points View Component
const AdminPointsView: React.FC<{ 
  statistics: PointStatistics | undefined; 
  onUpdateAllPoints: () => void;
  isUpdatingAllPoints: boolean; // New prop for loading state
  users: UserWithPoints[];
  usersLoading: boolean;
  rules: PointRule[];
}> = ({ statistics, onUpdateAllPoints, isUpdatingAllPoints, users, usersLoading, rules }) => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { isOpen: isUpdateModalOpen, onOpen: onUpdateModalOpen, onClose: onUpdateModalClose } = useDisclosure();
  const { isOpen: isResetModalOpen, onOpen: onResetModalOpen, onClose: onResetModalClose } = useDisclosure();
  const [updateForm, setUpdateForm] = useState({ pointsToAdd: 0, reason: '' });
  const [resetForm, setResetForm] = useState({ reason: '' });

  const updateUsersMutation = useMutation({
    mutationFn: (data: { userIds: string[]; pointsToAdd: number; reason: string }) =>
      pointsAPI.updateUserPoints(data.userIds, data.pointsToAdd, data.reason),
    onSuccess: (response) => {
      toast({
        title: 'Points Updated',
        description: `Successfully updated points for ${response.data.data.length} users`,
        status: 'success',
        duration: 3000,
      });
      onUpdateModalClose();
      setUpdateForm({ pointsToAdd: 0, reason: '' });
      setSelectedUsers([]);
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['pointStatistics'] });
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

  const resetUsersMutation = useMutation({
    mutationFn: (data: { userIds: string[]; reason: string }) =>
      pointsAPI.resetUserPoints(data.userIds, data.reason),
    onSuccess: (response) => {
      toast({
        title: 'Points Reset',
        description: `Successfully reset points for ${response.data.data.length} users`,
        status: 'success',
        duration: 3000,
      });
      onResetModalClose();
      setResetForm({ reason: '' });
      setSelectedUsers([]);
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['pointStatistics'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Reset Failed',
        description: error.response?.data?.error || 'Failed to reset points',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(users.map((user: UserWithPoints) => user.id));
  };

  const handleClearSelection = () => {
    setSelectedUsers([]);
  };

  const handleUpdatePoints = () => {
    if (selectedUsers.length === 0) {
      toast({
        title: 'No Users Selected',
        description: 'Please select at least one user',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (!updateForm.reason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for the points update',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    updateUsersMutation.mutate({
      userIds: selectedUsers,
      pointsToAdd: updateForm.pointsToAdd,
      reason: updateForm.reason,
    });
  };

  // Modified to accept reason directly from modal
  const handleResetPoints = (reason: string) => {
    if (selectedUsers.length === 0) {
      toast({
        title: 'No Users Selected',
        description: 'Please select at least one user',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    // Client-side validation for reason is now handled by react-hook-form in the modal
    resetUsersMutation.mutate({
      userIds: selectedUsers,
      reason: reason, // Use the reason passed from the modal
    });
  };

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            Points Management
          </Heading>
          <Text color="gray.400">
            Manage all users' points
          </Text>
        </Box>
        
        <Button
          leftIcon={<FiRefreshCw />}
          colorScheme="brand"
          onClick={onUpdateAllPoints}
          isLoading={isUpdatingAllPoints} // Use the new prop here
        >
          Update All Points
        </Button>
      </HStack>

      <AdminPointsSummaryCards statistics={statistics} />

      <AdminUserPointsTable
        users={users}
        usersLoading={usersLoading}
        selectedUsers={selectedUsers}
        handleUserSelection={handleUserSelection}
        handleSelectAll={handleSelectAll}
        handleClearSelection={handleClearSelection}
        onUpdateModalOpen={onUpdateModalOpen}
        onResetModalOpen={onResetModalOpen}
      />

      <PointRulesDisplay rules={rules} />

      <UpdatePointsModal
        isOpen={isUpdateModalOpen}
        onClose={onUpdateModalClose}
        selectedUsersCount={selectedUsers.length}
        updateForm={updateForm}
        setUpdateForm={setUpdateForm}
        handleUpdatePoints={handleUpdatePoints}
        isUpdating={updateUsersMutation.isPending}
      />

      <ResetPointsModal
        isOpen={isResetModalOpen}
        onClose={onResetModalClose}
        selectedUsersCount={selectedUsers.length}
        resetForm={resetForm}
        setResetForm={setResetForm}
        handleResetPoints={handleResetPoints}
        isResetting={resetUsersMutation.isPending}
      />
    </VStack>
  );
};

// Student Points View Component
const StudentPointsView: React.FC<{ breakdown: PointBreakdown | undefined; rules: PointRule[] }> = ({ breakdown, rules }) => {
  const { level, nextLevelPoints, progressPercentage } = getStudentLevel(breakdown?.totalPoints || 0);

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="lg" color="white" mb={2}>
          My Points
        </Heading>
        <Text color="gray.400">
          Track your progress and point breakdown
        </Text>
      </Box>

      <StudentPointsSummaryCards
        breakdown={breakdown}
        level={level}
        nextLevelPoints={nextLevelPoints}
        progressPercentage={progressPercentage}
      />

      <StudentDetailedBreakdown breakdown={breakdown} rules={rules} />

      <PointRulesDisplay rules={rules} />
    </VStack>
  );
};

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
  const statistics: PointStatistics | undefined = statisticsResponse?.data?.data;
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

  const isLoading = user?.role === 'STUDENT' ? (breakdownLoading || rulesLoading) : (statsLoading || rulesLoading || usersLoading);

  if (isLoading) {
    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            {user?.role === 'ADMIN' ? 'Points Management' : 'My Points'}
          </Heading>
          <Text color="gray.400">
            {user?.role === 'ADMIN' ? 'Manage all users\' points' : 'Track your progress and point breakdown'}
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
        isUpdatingAllPoints={updateAllPointsMutation.isPending} // Pass the loading state
        users={users}
        usersLoading={usersLoading}
        rules={rules}
      />
    );
  }

  return <StudentPointsView breakdown={breakdown} rules={rules} />;
};

export default PointsPage;