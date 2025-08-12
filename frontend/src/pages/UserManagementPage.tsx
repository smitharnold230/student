import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  CardBody,
  Button,
  Badge,
  useToast,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
  Skeleton,
  Avatar,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FiUsers, 
  FiUserPlus, 
  FiTrash2, 
  FiEdit,
  FiMail,
  FiCalendar,
  FiShield,
  FiUser,
  FiUploadCloud // New icon for bulk upload
} from 'react-icons/fi';
import { authAPI, adminAPI } from '../services/api'; // Import adminAPI
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosProgressEvent } from 'axios'; // Import AxiosProgressEvent

// Import new modal component
import BulkUserUploadModal from '../components/admin/BulkUserUploadModal';
import UserTable from '../components/admin/users/UserTable'; // Import the new UserTable component

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

const UserManagementPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isBulkUploadModalOpen, onOpen: onBulkUploadModalOpen, onClose: onBulkUploadModalClose } = useDisclosure();
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  // Get all users
  const { data: usersResponse, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => authAPI.getAllUsers(),
  });

  const users: User[] = usersResponse?.data?.data || [];

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserForm) => authAPI.signup(data.email, data.password, data.role as 'STUDENT' | 'ADMIN'),
    onSuccess: () => {
      toast({
        title: 'User Created',
        description: 'User has been created successfully.',
        status: 'success',
        duration: 3000,
      });
      onClose();
      reset(); // Reset form fields after successful submission
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
    mutationFn: (file: File) => adminAPI.bulkUploadUsers(file, (progressEvent: AxiosProgressEvent) => {
      if (progressEvent.total) {
        setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { email: '', password: '', role: 'STUDENT' },
  });

  const handleCreateUserSubmit = (data: CreateUserForm) => {
    createUserMutation.mutate(data);
  };

  const handleDeleteUser = (userId: string, email: string) => {
    if (window.confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) {
      deleteUserMutation.mutate(userId);
    }
  };

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
                  {users.filter(u => u.role === 'STUDENT').length}
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
                  {users.filter(u => u.role === 'ADMIN').length}
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
                onClick={onOpen}
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
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
          <ModalHeader color="white">Add New User</ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody>
            <VStack spacing={4} as="form" id="create-user-form" onSubmit={handleSubmit(handleCreateUserSubmit)}>
              <FormControl isInvalid={!!errors.email} isRequired>
                <FormLabel color="gray.300">Email</FormLabel>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  bg="gray.700"
                  borderColor={borderColor}
                  color="white"
                  _placeholder={{ color: 'gray.400' }}
                  {...register('email')}
                />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.password} isRequired>
                <FormLabel color="gray.300">Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Enter password"
                  bg="gray.700"
                  borderColor={borderColor}
                  color="white"
                  _placeholder={{ color: 'gray.400' }}
                  {...register('password')}
                />
                <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.role} isRequired>
                <FormLabel color="gray.300">Role</FormLabel>
                <Select
                  bg="gray.700"
                  borderColor={borderColor}
                  color="white"
                  {...register('role')}
                >
                  <option value="STUDENT">Student</option>
                  <option value="ADMIN">Admin</option>
                </Select>
                <FormErrorMessage>{errors.role?.message}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              type="submit"
              form="create-user-form" // Link button to form
              isLoading={createUserMutation.isPending}
            >
              Create User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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

export default UserManagementPage;