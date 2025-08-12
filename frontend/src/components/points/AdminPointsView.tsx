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
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FiRefreshCw } from 'react-icons/fi';
import { pointsAPI } from '../../services/api';
import { PointStatistics, UserWithPoints, PointRule } from '../../types/points';

// Import modular components
import AdminPointsSummaryCards from './AdminPointsSummaryCards';
import AdminUserPointsTable from './AdminUserPointsTable';
import UpdatePointsModal from './UpdatePointsModal';
import ResetPointsModal from './ResetPointsModal';
import PointRulesDisplay from './PointRulesDisplay';

interface AdminPointsViewProps {
  statistics: PointStatistics | undefined;
  onUpdateAllPoints: () => void;
  isUpdatingAllPoints: boolean;
  users: UserWithPoints[];
  usersLoading: boolean;
  rules: PointRule[];
}

const AdminPointsView: React.FC<AdminPointsViewProps> = ({
  statistics,
  onUpdateAllPoints,
  isUpdatingAllPoints,
  users,
  usersLoading,
  rules,
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { isOpen: isUpdateModalOpen, onOpen: onUpdateModalOpen, onClose: onUpdateModalClose } = useDisclosure();
  const { isOpen: isResetModalOpen, onOpen: onResetModalOpen, onClose: onResetModalClose } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState<string>('');

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
      setSelectedUsers([]);
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['pointStatistics'] });
      queryClient.invalidateQueries({ queryKey: ['pointBreakdown'] }); // Invalidate student's breakdown too
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
      setSelectedUsers([]);
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['pointStatistics'] });
      queryClient.invalidateQueries({ queryKey: ['pointBreakdown'] }); // Invalidate student's breakdown too
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
    setSelectedUsers(filteredUsers.map((user: UserWithPoints) => user.id));
  };

  const handleClearSelection = () => {
    setSelectedUsers([]);
  };

  const handleUpdatePoints = (data: { pointsToAdd: number; reason: string }) => {
    if (selectedUsers.length === 0) {
      toast({
        title: 'No Users Selected',
        description: 'Please select at least one user',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    updateUsersMutation.mutate({
      userIds: selectedUsers,
      pointsToAdd: data.pointsToAdd,
      reason: data.reason,
    });
  };

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

    resetUsersMutation.mutate({
      userIds: selectedUsers,
      reason: reason,
    });
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          isLoading={isUpdatingAllPoints}
        >
          Update All Points
        </Button>
      </HStack>

      <AdminPointsSummaryCards statistics={statistics} />

      <AdminUserPointsTable
        users={filteredUsers}
        usersLoading={usersLoading}
        selectedUsers={selectedUsers}
        handleUserSelection={handleUserSelection}
        handleSelectAll={handleSelectAll}
        handleClearSelection={handleClearSelection}
        onUpdateModalOpen={onUpdateModalOpen}
        onResetModalOpen={onResetModalOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <PointRulesDisplay rules={rules} />

      <UpdatePointsModal
        isOpen={isUpdateModalOpen}
        onClose={onUpdateModalClose}
        selectedUsersCount={selectedUsers.length}
        handleUpdatePoints={handleUpdatePoints}
        isUpdating={updateUsersMutation.isPending}
        initialPointsToAdd={0}
        initialReason={''}
      />

      <ResetPointsModal
        isOpen={isResetModalOpen}
        onClose={onResetModalClose}
        selectedUsersCount={selectedUsers.length}
        handleResetPoints={handleResetPoints}
        isResetting={resetUsersMutation.isPending}
        initialReason={''}
      />
    </VStack>
  );
};

export default AdminPointsView;