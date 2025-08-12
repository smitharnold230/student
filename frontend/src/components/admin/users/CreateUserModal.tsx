import React from 'react';
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
  useColorModeValue,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UseMutationResult } from '@tanstack/react-query';

const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().refine(val => val === 'STUDENT' || val === 'ADMIN', { message: 'Role is required' }),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleCreateUserSubmit: (data: CreateUserForm) => void;
  createUserMutation: UseMutationResult<any, Error, CreateUserForm, unknown>;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  handleCreateUserSubmit,
  createUserMutation,
}) => {
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { email: '', password: '', role: 'STUDENT' },
  });

  const onSubmit = (data: CreateUserForm) => {
    handleCreateUserSubmit(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
        <ModalHeader color="white">Add New User</ModalHeader>
        <ModalCloseButton color="gray.400" />
        <ModalBody>
          <VStack spacing={4} as="form" id="create-user-form" onSubmit={handleSubmit(onSubmit)}>
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
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="green"
            type="submit"
            form="create-user-form"
            isLoading={createUserMutation.isPending}
          >
            Create User
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateUserModal;