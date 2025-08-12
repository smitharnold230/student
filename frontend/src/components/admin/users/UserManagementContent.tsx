import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  CardBody,
  Button,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import {
  FiUsers,
  FiUserPlus,
  FiShield,
  FiUser,
  FiUploadCloud
} from 'react-icons/fi';
import { UseMutationResult } from '@tanstack/react-query';
import { AxiosProgressEvent } from 'axios';
import { z } from 'zod';

// Import modular components
import UserTable from './UserTable';
import BulkUserUploadModal from '../BulkUserUploadModal';
import CreateUserModal from './CreateUserModal'; // Will create this new modal component

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
  role: z.string().refine(val => val === 'STUDENT' || val === 'ADMIN', { message: 'Role is required' }),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

interface UserManagementContentProps {
  users: User[];
  usersLoading: boolean;
  handleDeleteUser: (userId: string, email: string) => void;
  deleteUserMutation: UseMutationResult<any, Error, string, unknown>;
  
  isCreateModalOpen: boolean;
  onCreateModalOpen: () => void;
  onCreateModalClose: () => void;
  handleCreateUserSubmit: (data: CreateUserForm) => void;
  createUserMutation: UseMutationResult<any, Error, CreateUserForm, unknown>;

  isBulkUploadModalOpen: boolean;
  onBulkUploadModalOpen: () => void;
  onBulkUploadModalClose: () => void;
  bulkUploadUsersMutation: UseMutationResult<any, Error, File, unknown>;
  uploadProgress: number;
  setUploadProgress: React.Dispatch<React.SetStateAction<number>>;
}

const UserManagementContent: React.FC<UserManagementContentProps> = ({
  users,
  usersLoading,
  handleDeleteUser,
  deleteUserMutation,
  isCreateModalOpen,
  onCreateModalOpen,
  onCreateModalClose,
  handleCreateUserSubmit,
  createUserMutation,
  isBulkUploadModalOpen,
  onBulkUploadModalOpen,
  onBulkUploadModalClose,
  bulkUploadUsersMutation,
  uploadProgress,
  setUploadProgress,
}) => {
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const totalStudents = users.filter(u => u.role === 'STUDENT').length;
  const totalAdmins = users.filter(u => u.role === 'ADMIN').length;

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <Heading size="lg" color="white" mb={2}>
          User Management
        </Heading>
        <Text color="gray.400">
          Manage all users in the system
        </Text>
      </Box>

      {/* Statistics */}
      <HStack spacing={4}>
        <Card bg={cardBg} border="1px solid" borderColor={borderColor} flex={1}>
          <CardBody>
            <HStack spacing={4}>
              <Box p={2} borderRadius="lg" bg="blue.500" color="white">
                <FiUsers size={20} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text color="gray.400" fontSize="sm">
                  Total Users
                </Text>
                <Text color="white" fontSize="xl" fontWeight="bold">
                  {users.length}
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderColor} flex={1}>
          <CardBody>
            <HStack spacing={4}>
              <Box p={2} borderRadius="lg" bg="green.500" color="white">
                <FiUser size={20} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text color="gray.400" fontSize="sm">
                  Students
                </Text>
                <Text color="white" fontSize="xl" fontWeight="bold">
                  {totalStudents}
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderColor} flex={1}>
          <CardBody>
            <HStack spacing={4}>
              <Box p={2} borderRadius="lg" bg="red.500" color="white">
                <FiShield size={20} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text color="gray.400" fontSize="sm">
                  Admins
                </Text>
                <Text color="white" fontSize="xl" fontWeight="bold">
                  {totalAdmins}
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      </HStack>

      {/* Actions */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <HStack justify="space-between">
            <Heading size="md" color="white">
              Users
            </Heading>
            <HStack spacing={3}>
              <Button
                leftIcon={<Icon as={FiUploadCloud} />}
                colorScheme="purple"
                onClick={onBulkUploadModalOpen}
              >
                Bulk Upload Users
              </Button>
              <Button
                leftIcon={<Icon as={FiUserPlus} />}
                colorScheme="green"
                onClick={onCreateModalOpen}
              >
                Add User
              </Button>
            </HStack>
          </HStack>
        </CardBody>
      </Card>

      {/* Users Table */}
      <UserTable
        users={users}
        isLoading={usersLoading}
        handleDeleteUser={handleDeleteUser}
        deleteUserMutation={deleteUserMutation}
        cardBg={cardBg}
        borderColor={borderColor}
      />

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={onCreateModalClose}
        handleCreateUserSubmit={handleCreateUserSubmit}
        createUserMutation={createUserMutation}
      />

      {/* Bulk User Upload Modal */}
      <BulkUserUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={onBulkUploadModalClose}
        uploadMutation={bulkUploadUsersMutation}
        uploadProgress={uploadProgress}
        setUploadProgress={setUploadProgress}
      />
    </VStack>
  );
};

export default UserManagementContent;