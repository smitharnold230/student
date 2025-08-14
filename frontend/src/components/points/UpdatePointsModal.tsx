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
  useColorModeValue,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define the Zod schema for the form
const updatePointsSchema = z.object({
  pointsToAdd: z
    .number()
    .int('Points must be an integer')
    .min(-1000, 'Points adjustment too large')
    .max(1000, 'Points adjustment too large'),
  reason: z
    .string()
    .trim()
    .min(1, 'Reason is required')
    .max(200, 'Reason too long'), // Added .trim()
});

type UpdatePointsForm = z.infer<typeof updatePointsSchema>;

interface UpdatePointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsersCount: number;
  handleUpdatePoints: (data: UpdatePointsForm) => void; // Modified to pass validated data
  isUpdating: boolean;
  initialPointsToAdd: number; // New prop to pass initial value
  initialReason: string; // New prop to pass initial value
}

const UpdatePointsModal: React.FC<UpdatePointsModalProps> = ({
  isOpen,
  onClose,
  selectedUsersCount,
  handleUpdatePoints,
  isUpdating,
  initialPointsToAdd,
  initialReason,
}) => {
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdatePointsForm>({
    resolver: zodResolver(updatePointsSchema),
    defaultValues: {
      pointsToAdd: 0,
      reason: '',
    },
  });

  // Reset form fields when modal opens or initial values change
  useEffect(() => {
    if (isOpen) {
      reset({
        pointsToAdd: initialPointsToAdd,
        reason: initialReason,
      });
    }
  }, [isOpen, initialPointsToAdd, initialReason, reset]);

  const onSubmit = (data: UpdatePointsForm) => {
    // Explicitly trim the reason before passing, although Zod schema also has .trim()
    const trimmedData = {
      ...data,
      reason: data.reason.trim(),
    };
    handleUpdatePoints(trimmedData);
  };

  const handleClose = () => {
    reset(); // Reset form fields on close
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
        <ModalHeader color="white">Update Points</ModalHeader>
        <ModalCloseButton color="gray.400" />
        <ModalBody>
          <VStack
            spacing={4}
            as="form"
            id="update-points-form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <FormControl isInvalid={!!errors.pointsToAdd} isRequired>
              <FormLabel color="gray.300">Points to Add/Subtract</FormLabel>
              <Input
                type="number"
                placeholder="Enter points (use negative for subtraction)"
                bg="gray.700"
                borderColor={borderColor}
                color="white"
                _placeholder={{ color: 'gray.400' }}
                {...register('pointsToAdd', { valueAsNumber: true })} // Ensure value is number
              />
              <FormErrorMessage>{errors.pointsToAdd?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.reason} isRequired>
              <FormLabel color="gray.300">Reason</FormLabel>
              <Input
                placeholder="Enter reason for points update"
                bg="gray.700"
                borderColor={borderColor}
                color="white"
                _placeholder={{ color: 'gray.400' }}
                {...register('reason')}
                required // Add HTML5 required attribute for immediate feedback
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
            colorScheme="green"
            type="submit"
            form="update-points-form" // Link button to form
            isLoading={isUpdating}
          >
            Update Points
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdatePointsModal;
