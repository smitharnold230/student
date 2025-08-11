import React, { useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
  useColorModeValue,
  Text,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UseMutationResult } from '@tanstack/react-query';
import { Profile } from '../../types/profile';
import { User } from '../../store/authStore';

// Updated schema to match backend's profile.editRequest
const editRequestSchema = z.object({
  name: z.string().min(1, 'Full name is required').optional(),
  degree: z.string().min(1, 'Degree is required').optional(),
  class: z.string().min(1, 'Class is required').optional(),
  status: z.string().min(1, 'Status is required').optional(),
  transport: z.string().optional(),
  hostelInfo: z.string().optional(),
}).refine(data => Object.values(data).some(value => value !== undefined && value !== null && value !== ''), {
  message: 'At least one field must be provided for edit request',
  path: ['root'],
});

type EditRequestForm = z.infer<typeof editRequestSchema>;

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  user: User | null;
  editRequestMutation: UseMutationResult<any, Error, Partial<EditRequestForm>, unknown>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  user,
  editRequestMutation,
}) => {
  const toast = useToast();
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

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

  const onSubmit = (data: EditRequestForm) => {
    const changedData: Partial<EditRequestForm> = {};
    if (data.name !== profile?.name) changedData.name = data.name;
    if (user?.role === 'STUDENT') {
      if (data.degree !== profile?.degree) changedData.degree = data.degree;
      if (data.class !== profile?.class) changedData.class = data.class;
      if (data.status !== profile?.status) changedData.status = data.status;
      if (data.transport !== profile?.transport) changedData.transport = data.transport;
      if (data.hostelInfo !== profile?.hostelInfo) changedData.hostelInfo = data.hostelInfo;
    }

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
        <ModalHeader color="white">Request Profile Edit</ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody>
          <VStack spacing={4} as="form" id="profile-edit-form" onSubmit={handleSubmit(onSubmit)}>
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
            {user?.role === 'STUDENT' && (
              <>
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
              </>
            )}
            {errors.root && (
              <Text color="red.400" fontSize="sm">
                {errors.root.message}
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
          >
            Submit Request
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditProfileModal;