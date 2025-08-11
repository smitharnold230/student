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
  useColorModeValue,
} from '@chakra-ui/react';

interface UpdatePointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsersCount: number;
  updateForm: { pointsToAdd: number; reason: string };
  setUpdateForm: React.Dispatch<React.SetStateAction<{ pointsToAdd: number; reason: string }>>;
  handleUpdatePoints: () => void;
  isUpdating: boolean;
}

const UpdatePointsModal: React.FC<UpdatePointsModalProps> = ({
  isOpen,
  onClose,
  selectedUsersCount,
  updateForm,
  setUpdateForm,
  handleUpdatePoints,
  isUpdating,
}) => {
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
        <ModalHeader color="white">Update Points</ModalHeader>
        <ModalCloseButton color="gray.400" />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel color="gray.300">Points to Add/Subtract</FormLabel>
              <Input
                type="number"
                value={updateForm.pointsToAdd}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, pointsToAdd: parseInt(e.target.value) || 0 }))}
                placeholder="Enter points (use negative for subtraction)"
                bg="gray.700"
                borderColor={borderColor}
                color="white"
                _placeholder={{ color: 'gray.400' }}
              />
            </FormControl>
            <FormControl>
              <FormLabel color="gray.300">Reason</FormLabel>
              <Input
                value={updateForm.reason}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Enter reason for points update"
                bg="gray.700"
                borderColor={borderColor}
                color="white"
                _placeholder={{ color: 'gray.400' }}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="green"
            onClick={handleUpdatePoints}
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