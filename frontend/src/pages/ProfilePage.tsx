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
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  Badge,
  Divider,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Grid,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface Profile {
  id: string;
  name: string;
  degree: string;
  class: string;
  status: string;
  transport: string;
  hostelInfo: string;
  batch: string;
}

interface EditRequest {
  name?: string;
  degree?: string;
  class?: string;
  status?: string;
  transport?: string;
  hostelInfo?: string;
}

const editRequestSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  degree: z.string().min(1, 'Degree is required'),
  class: z.string().min(1, 'Class is required'),
  status: z.string().min(1, 'Status is required'),
  transport: z.string().optional(),
  hostelInfo: z.string().optional(),
});

type EditRequestForm = z.infer<typeof editRequestSchema>;

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editData, setEditData] = useState<EditRequest>({});
  
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileAPI.getProfile(),
  });

  const profile: Profile = profileResponse?.data;

  const editRequestMutation = useMutation({
    mutationFn: (data: EditRequest) => profileAPI.requestEdit(data),
    onSuccess: () => {
      toast({
        title: 'Edit request submitted',
        description: 'Your profile edit request has been submitted for admin approval.',
        status: 'success',
        duration: 5000,
      });
      onClose();
      setEditData({});
    },
    onError: (error: any) => {
      toast({
        title: 'Request failed',
        description: error.response?.data?.error || 'Failed to submit edit request',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<EditRequestForm>({
    resolver: zodResolver(editRequestSchema),
    defaultValues: {
      name: '',
      degree: '',
      class: '',
      status: '',
      transport: '',
      hostelInfo: '',
    },
  });
  const statusValue = watch('status');

  const handleEditRequest = (data: EditRequestForm) => {
    editRequestMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'dayscholar':
        return 'blue';
      case 'hosteller':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getBatchColor = (batch: string) => {
    if (!batch) return 'gray';
    if (batch.includes('PRODUCT')) return 'purple';
    if (batch.includes('SERVICE_A')) return 'blue';
    if (batch.includes('SERVICE_B')) return 'cyan';
    if (batch.includes('SERVICE_C')) return 'teal';
    return 'gray';
  };

  if (isLoading) {
    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            Profile
          </Heading>
          <Text color="gray.400">
            Manage your student profile and information
          </Text>
        </Box>
        
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <Text color="white">Loading profile...</Text>
          </CardBody>
        </Card>
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="lg" color="white" mb={2}>
          Profile
        </Heading>
        <Text color="gray.400">
          Manage your student profile and information
        </Text>
      </Box>

      {/* Profile Information */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between">
              <Heading size="md" color="white">
                Personal Information
              </Heading>
              <Button
                colorScheme="brand"
                size="sm"
                onClick={onOpen}
              >
                Request Edit
              </Button>
            </HStack>

            <Divider borderColor={borderColor} />

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
              <VStack align="start" spacing={4}>
                <Box>
                  <Text color="gray.400" fontSize="sm" mb={1}>
                    Full Name
                  </Text>
                  <Text color="white" fontSize="md">
                    {profile?.name || 'Not set'}
                  </Text>
                </Box>

                <Box>
                  <Text color="gray.400" fontSize="sm" mb={1}>
                    Email
                  </Text>
                  <Text color="white" fontSize="md">
                    {user?.email}
                  </Text>
                </Box>

                <Box>
                  <Text color="gray.400" fontSize="sm" mb={1}>
                    Degree
                  </Text>
                  <Text color="white" fontSize="md">
                    {profile?.degree || 'Not set'}
                  </Text>
                </Box>

                <Box>
                  <Text color="gray.400" fontSize="sm" mb={1}>
                    Class
                  </Text>
                  <Text color="white" fontSize="md">
                    {profile?.class || 'Not set'}
                  </Text>
                </Box>
              </VStack>

              <VStack align="start" spacing={4}>
                <Box>
                  <Text color="gray.400" fontSize="sm" mb={1}>
                    Status
                  </Text>
                  <Badge
                    colorScheme={getStatusColor(profile?.status)}
                    variant="subtle"
                    fontSize="sm"
                  >
                    {profile?.status || 'Not set'}
                  </Badge>
                </Box>

                <Box>
                  <Text color="gray.400" fontSize="sm" mb={1}>
                    Transport
                  </Text>
                  <Text color="white" fontSize="md">
                    {profile?.transport || 'Not set'}
                  </Text>
                </Box>

                <Box>
                  <Text color="gray.400" fontSize="sm" mb={1}>
                    Hostel Info
                  </Text>
                  <Text color="white" fontSize="md">
                    {profile?.hostelInfo || 'Not set'}
                  </Text>
                </Box>

                <Box>
                  <Text color="gray.400" fontSize="sm" mb={1}>
                    Current Batch
                  </Text>
                  <Badge
                    colorScheme={getBatchColor(profile?.batch)}
                    variant="subtle"
                    fontSize="sm"
                  >
                    {profile?.batch || 'Not Assigned'}
                  </Badge>
                </Box>
              </VStack>
            </Grid>
          </VStack>
        </CardBody>
      </Card>

      {/* Edit Request Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
          <ModalHeader color="white">Request Profile Edit</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <VStack spacing={4} as="form" onSubmit={handleSubmit(handleEditRequest)}>
              <FormControl isInvalid={!!errors.name} isRequired>
                <FormLabel color="gray.300">Full Name</FormLabel>
                <Input
                  placeholder="Enter your full name"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.400' }}
                  {...register('name')}
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.degree} isRequired>
                <FormLabel color="gray.300">Degree</FormLabel>
                <Select
                  placeholder="Select degree"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  {...register('degree')}
                >
                  <option value="B.E">B.E</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.E">M.E</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="Ph.D">Ph.D</option>
                </Select>
                <FormErrorMessage>{errors.degree?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.class} isRequired>
                <FormLabel color="gray.300">Class</FormLabel>
                <Select
                  placeholder="Select class"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  {...register('class')}
                >
                  <option value="CSE">CSE</option>
                  <option value="AIDS">AIDS</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                </Select>
                <FormErrorMessage>{errors.class?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.status} isRequired>
                <FormLabel color="gray.300">Status</FormLabel>
                <Select
                  placeholder="Select status"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  {...register('status')}
                >
                  <option value="Dayscholar">Dayscholar</option>
                  <option value="Hosteller">Hosteller</option>
                </Select>
                <FormErrorMessage>{errors.status?.message}</FormErrorMessage>
              </FormControl>
              {statusValue === 'Dayscholar' && (
                <FormControl isInvalid={!!errors.transport} isRequired>
                  <FormLabel color="gray.300">Transport</FormLabel>
                  <Select
                    placeholder="Select transport"
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    {...register('transport')}
                  >
                    <option value="College Bus">College Bus</option>
                    <option value="Out Bus">Out Bus</option>
                    <option value="Self Transport">Self Transport</option>
                  </Select>
                  <FormErrorMessage>{errors.transport?.message}</FormErrorMessage>
                </FormControl>
              )}
              {statusValue === 'Hosteller' && (
                <FormControl isInvalid={!!errors.hostelInfo} isRequired>
                  <FormLabel color="gray.300">Hostel Information</FormLabel>
                  <Textarea
                    placeholder="Enter hostel details"
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _placeholder={{ color: 'gray.400' }}
                    {...register('hostelInfo')}
                  />
                  <FormErrorMessage>{errors.hostelInfo?.message}</FormErrorMessage>
                </FormControl>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              type="submit"
              form="form"
              isLoading={editRequestMutation.isPending}
              onClick={handleSubmit(handleEditRequest)}
            >
              Submit Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default ProfilePage; 