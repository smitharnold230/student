import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Heading,
  useToast,
  Skeleton,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { AxiosProgressEvent, AxiosResponse } from 'axios';
import { Profile } from '../types/profile';

// Import new modular components
import ProfileInfoCard from '../components/profile/ProfileInfoCard';
import EditProfileModal from '../components/profile/EditProfileModal';
import UploadPhotoModal from '../components/profile/UploadPhotoModal';

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const toast = useToast();
  const queryClient = useQueryClient();

  // State for modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Fetch profile data
  const { data: profileResponse, isLoading } = useQuery<AxiosResponse<Profile>>(
    {
      queryKey: ['profile'],
      queryFn: () => profileAPI.getProfile(),
    },
  );
  const profile: Profile | undefined = profileResponse?.data; // Changed to Profile | undefined

  // Mutations
  const editRequestMutation = useMutation({
    mutationFn: (data: any) => profileAPI.requestEdit(data),
    onSuccess: () => {
      toast({
        title: 'Edit request submitted',
        description:
          'Your profile edit request has been submitted for admin approval.',
        status: 'success',
        duration: 5000,
      });
      setIsEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Request failed',
        description:
          error.response?.data?.error || 'Failed to submit edit request',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<Profile>) => profileAPI.updateProfile(data),
    onSuccess: () => {
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
        status: 'success',
        duration: 3000,
      });
      setIsEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error.response?.data?.error || 'Failed to update profile',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: (file: File) =>
      profileAPI.uploadPhoto(file, (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          setUploadProgress(
            Math.round((progressEvent.loaded * 100) / progressEvent.total),
          );
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
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsPhotoModalOpen(false);
      setSelectedFile(null);
    },
    onError: (error: any) => {
      setUploadProgress(0);
      toast({
        title: 'Upload failed',
        description:
          error.response?.data?.error || 'Failed to upload profile photo',
        status: 'error',
        duration: 5000,
      });
    },
  });

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

        <Card bg="gray.800" border="1px solid" borderColor="gray.700">
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

      <ProfileInfoCard
        profile={profile}
        user={user}
        onOpenEditModal={() => setIsEditModalOpen(true)}
        onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
      />

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        userRole={user?.role || null}
        editRequestMutation={editRequestMutation}
        updateProfileMutation={updateProfileMutation}
      />

      <UploadPhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        uploadProgress={uploadProgress}
        setUploadProgress={setUploadProgress}
        uploadPhotoMutation={uploadPhotoMutation}
      />
    </VStack>
  );
};

export default ProfilePage;
