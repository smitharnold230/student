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
  Text,
  useColorModeValue,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface ResetPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsersCount: number;
  resetForm: { reason: string }; // Keep this for initial value, but form will manage state
  setResetForm: React.Dispatch<React.SetStateAction<{ reason: string }>>; // Keep for external state sync
  handleResetPoints: (reason: string) => void; // Modified to pass reason directly
  isResetting: boolean;
}

const resetPointsSchema = z.object({
  reason: z.string().min(1, 'Reason is required').max(200, 'Reason too long'),
});

type ResetPointsForm = z.infer<typeof resetPointsSchema>;

const ResetPointsModal: React.FC<ResetPointsModalProps> = ({
  isOpen,
  onClose,
  selectedUsersCount,
  resetForm, // Used for initial value
  setResetForm, // Used for external state sync on close
  handleResetPoints,
  isResetting,
}) => {
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ResetPointsForm>({
    resolver: zodResolver(resetPointsSchema),
    defaultValues: {
      reason: '',
    },
  });

  // Sync external state to form on open
  useEffect(() => {
    if (isOpen) {
      reset({ reason: resetForm.reason });
    }
  }, [isOpen, resetForm.reason, reset]);

  const onSubmit = (data: ResetPointsForm) => {
    handleResetPoints(data.reason);
  };

  const handleClose = () => {
    reset(); // Reset form fields
    setResetForm({ reason: '' }); // Clear external state
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
        <ModalHeader color="white">Reset Points</ModalHeader>
        <ModalCloseButton color="gray.400" />
        <ModalBody>
          <VStack spacing={4} as="form" id="reset-points-form" onSubmit={handleSubmit(onSubmit)}>
            <Text color="gray.300" textAlign="center">
              This will reset points to 0 for {selectedUsersCount} selected user(s).
            </Text>
            <FormControl isInvalid={!!errors.reason} isRequired>
              <FormLabel color="gray.300">Reason</FormLabel>
              <Input
                placeholder="Enter reason for points reset"
                bg="gray.700"
                borderColor={borderColor}
                color="white"
                _placeholder={{ color: 'gray.400' }}
                {...register('reason')}
              />
              <FormErrorMessage>{errors.reason?.message}</FormErrorMessage>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="red"
            type="submit"
            form="reset-points-form"
            isLoading={isResetting}
          >
            Reset Points
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ResetPointsModal;