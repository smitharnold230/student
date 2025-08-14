import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Heading,
  useToast,
  useDisclosure,
  Skeleton,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI, adminAPI } from '../services/api';
import { AxiosProgressEvent } from 'axios';
import { z } from 'zod';

// Import new modular component
import UserManagementContent from '../components/admin/users/UserManagementContent';

interface User {
  id: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  createdAt: string;
  Profile?: {
    name: string;
    class: string;
    batch: string;
    status: string;
  };
}

const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z
    .string()
    .refine((val) => val === 'STUDENT' || val === 'ADMIN', {
      message: 'Role is required',
    }),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

const UserManagementPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const {
    isOpen: isCreateModalOpen,
    onOpen: onCreateModalOpen,
    onClose: onCreateModalClose,
  } = useDisclosure();
  const {
    isOpen: isBulkUploadModalOpen,
    onOpen: onBulkUploadModalOpen,
    onClose: onBulkUploadModalClose,
  } = useDisclosure();
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Get all users
  const { data: usersResponse, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => authAPI.getAllUsers(),
  });

  const users: User[] = usersResponse?.data?.data || [];

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserForm) =>
      authAPI.signup(
        data.email,
        data.password,
        data.role as 'STUDENT' | 'ADMIN',
      ),
    onSuccess: () => {
      toast({
        title: 'User Created',
        description: 'User has been created successfully.',
        status: 'success',
        duration: 3000,
      });
      onCreateModalClose();
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Creation Failed',
        description: error.response?.data?.error || 'Failed to create user',
        status: 'error',
        duration: 5000,
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => authAPI.deleteUser(userId),
    onSuccess: () => {
      toast({
        title: 'User Deleted',
        description: 'User has been deleted successfully.',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Deletion Failed',
        description: error.response?.data?.error || 'Failed to delete user',
        status: 'error',
        duration: 5000,
      });
    },
  });

  // Bulk upload users mutation
  const bulkUploadUsersMutation = useMutation({
    mutationFn: (file: File) =>
      adminAPI.bulkUploadUsers(file, (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          setUploadProgress(
            Math.round((progressEvent.loaded * 100) / progressEvent.total),
          );
        }
      }),
    onSuccess: () => {
      // Success toast and result display handled in BulkUserUploadModal
      queryClient.invalidateQueries({ queryKey: ['users'] }); // Invalidate to refresh user list
    },
    onError: () => {
      // Error toast handled in BulkUserUploadModal
    },
  });

  const handleCreateUserSubmit = (data: CreateUserForm) => {
    createUserMutation.mutate(data);
  };

  const handleDeleteUser = (userId: string, email: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete user ${email}? This action cannot be undone.`,
      )
    ) {
      deleteUserMutation.mutate(userId);
    }
  };

  if (usersLoading) {
    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            User Management
          </Heading>
          <Text color="gray.400">Manage all users in the system</Text>
        </Box>

        <Skeleton height="120px" />
        <Skeleton height="150px" />
        <Skeleton height="300px" />
      </VStack>
    );
  }

  return (
    <UserManagementContent
      users={users}
      usersLoading={usersLoading}
      handleDeleteUser={handleDeleteUser}
      deleteUserMutation={deleteUserMutation}
      isCreateModalOpen={isCreateModalOpen}
      onCreateModalOpen={onCreateModalOpen}
      onCreateModalClose={onCreateModalClose}
      handleCreateUserSubmit={handleCreateUserSubmit}
      createUserMutation={createUserMutation}
      isBulkUploadModalOpen={isBulkUploadModalOpen}
      onBulkUploadModalOpen={onBulkUploadModalOpen}
      onBulkUploadModalClose={onBulkUploadModalClose}
      bulkUploadUsersMutation={bulkUploadUsersMutation}
      uploadProgress={uploadProgress}
      setUploadProgress={setUploadProgress}
    />
  );
};

export default UserManagementPage;
