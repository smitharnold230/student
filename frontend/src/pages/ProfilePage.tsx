import React, { useState, useEffect } from 'react';
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
  Avatar,
  AvatarBadge,
  Progress,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosProgressEvent } from 'axios';
import { FiUpload } from 'react-icons/fi';
import { Profile } from '../types/profile'; // Import Profile type

// Updated schema to match backend's profile.editRequest
const editRequestSchema = z.object({
  name: z.string().min(1, 'Full name is required').optional(),
  degree: z.string().min(1, 'Degree is required').optional(),
  class: z.string().min(1, 'Class is required').optional(),
  status: z.string().min(1, 'Status is required').optional(),
  transport: z.string().optional(),
  hostelInfo: z.string().optional(),
}).refine(data => Object.keys(data).some(key => data[key] !== undefined && data[key] !== ''), {
  message: 'At least one field must be provided for edit request',
  path: ['_root'], // This targets the form as a whole
});

type EditRequestForm = z.infer<typeof editRequestSchema>;

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isPhotoModalOpen, onOpen: onPhotoModalOpen, onClose: onPhotoModalClose } = useDisclosure();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const { data: profileResponse, isLoading } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: () => profileAPI.getProfile(),
  });

  const profile: Profile = profileResponse?.data;

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

  // Set form default values when profile data loads
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        degree: profile.degree || '',
        class: profile.class || '',
        status: profile.status || '',
        transport: profile.transport || '',
        hostelInfo: profile.hostelInfo || '',
      });
    }
  }, [profile, reset]);

  const editRequestMutation = useMutation({
    mutationFn: (data: EditRequestForm) => profileAPI.requestEdit(data),
    onSuccess: () => {
      toast({
        title: 'Edit request submitted',
        description: 'Your profile edit request has been submitted for admin approval.',
        status: 'success',
        duration: 5000,
      });
      onClose();
      // Invalidate profile query to show pending status if implemented, or just refresh
      queryClient.invalidateQueries({ queryKey: ['profile'] });
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

  const uploadPhotoMutation = useMutation({
    mutationFn: (file: File) => profileAPI.uploadPhoto(file, (progressEvent: AxiosProgressEvent) => {
      if (progressEvent.total) {
        setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
      }
    }),
    onSuccess: () => {
      setUploadProgress(0);
      toast({
        title: 'Profile photo updated',
        description: 'Your profile photo has been updated successfully.',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] }); // Invalidate to refetch new photo URL
      onPhotoModalClose();
      setSelectedFile(null);
    },
    onError: (error: any) => {
      setUploadProgress(0);
      toast({
        title: 'Upload failed',
        description: error.response?.data?.error || 'Failed to upload profile photo',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleEditRequest = (data: EditRequestForm) => {
    // Filter out unchanged fields or empty strings if they are not meant to be sent
    const changedData: Partial<EditRequestForm> = {};
    if (data.name !== profile?.name) changedData.name = data.name;
    if (data.degree !== profile?.degree) changedData.degree = data.degree;
    if (data.class !== profile?.class) changedData.class = data.class;
    if (data.status !== profile?.status) changedData.status = data.status;
    if (data.transport !== profile?.transport) changedData.transport = data.transport;
    if (data.hostelInfo !== profile?.hostelInfo) changedData.hostelInfo = data.hostelInfo;

    if (Object.keys(changedData).length === 0) {
      toast({
        title: 'No Changes Detected',
        description: 'Please make changes to your profile before submitting an edit request.',
        status: 'info',
        duration: 3000,
      });
      onClose();
      return;
    }

    editRequestMutation.mutate(changedData);
  };

  const handlePhotoUpload = () => {
    if (selectedFile) {
      uploadPhotoMutation.mutate(selectedFile);
    } else {
      toast({
        title: 'No file selected',
        description: 'Please select an image file to upload.',
        status: 'warning',
        duration: 3000,
      });
    }
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
            <Skeleton height="200px" />
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
              <HStack>
                <Button
                  colorScheme="blue"
                  size="sm"
                  onClick={onPhotoModalOpen}
                  leftIcon={<FiUpload />}
                >
                  Upload Photo
                </Button>
                <Button
                  colorScheme="brand"
                  size="sm"
                  onClick={onOpen}
                >
                  Request Edit
                </Button>
              </HStack>
            </HStack>

            <Divider borderColor={borderColor} />

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
              <VStack align="start" spacing={4}>
                <Box>
                  <Text color="gray.400" fontSize="sm" mb={1}>
                    Profile Photo
                  </Text>
                  <Avatar
                    size="xl"
                    name={profile?.name || user?.email}
                    src={profile?.profilePhotoUrl ? `http://localhost:4000${profile.profilePhotoUrl}` : undefined}
                    bg="brand.500"
                  >
                    {profile?.profilePhotoUrl && <AvatarBadge boxSize="1.25em" bg="green.500" />}
                  </Avatar>
                </Box>
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
            <VStack spacing={4} as="form" id="profile-edit-form" onSubmit={handleSubmit(handleEditRequest)}>
              <FormControl isInvalid={!!errors.name}>
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
              <FormControl isInvalid={!!errors.degree}>
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
              <FormControl isInvalid={!!errors.class}>
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
              <FormControl isInvalid={!!errors.status}>
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
                <FormControl isInvalid={!!errors.transport}>
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
                <FormControl isInvalid={!!errors.hostelInfo}>
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
              {errors._root && (
                <Text color="red.400" fontSize="sm">
                  {errors._root.message}
                </Text>
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
              form="profile-edit-form"
              isLoading={editRequestMutation.isPending}
              onClick={handleSubmit(handleEditRequest)}
            >
              Submit Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Upload Photo Modal */}
      <Modal isOpen={isPhotoModalOpen} onClose={onPhotoModalClose} size="md">
        <ModalOverlay />
        <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
          <ModalHeader color="white">Upload Profile Photo</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color="gray.300">Select Image File</FormLabel>
                <Input
                  type="file"
                  accept="image/jpeg, image/png, image/jpg"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.400' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                        toast({
                          title: 'Invalid file type',
                          description: 'Only JPEG, PNG, or JPG image files are allowed.',
                          status: 'error',
                          duration: 4000,
                        });
                        setSelectedFile(null);
                        return;
                      }
                      if (file.size > 5 * 1024 * 1024) { // 5MB limit for photos
                        toast({
                          title: 'File too large',
                          description: 'File must be less than 5MB.',
                          status: 'error',
                          duration: 4000,
                        });
                        setSelectedFile(null);
                        return;
                      }
                      setSelectedFile(file);
                    }
                  }}
                />
                <Text color="gray.400" fontSize="xs" mt={1}>
                  Only JPEG/PNG/JPG files are allowed (max 5MB)
                </Text>
              </FormControl>
              {uploadProgress > 0 && (
                <Progress value={uploadProgress} size="sm" colorScheme="green" mt={2} />
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPhotoModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handlePhotoUpload}
              isLoading={uploadPhotoMutation.isPending}
              isDisabled={!selectedFile || uploadPhotoMutation.isPending || uploadProgress > 0}
            >
              Upload Photo
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default ProfilePage;