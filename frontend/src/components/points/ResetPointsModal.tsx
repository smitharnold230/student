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
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

interface ResetPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsersCount: number;
  resetForm: { reason: string };
  setResetForm: React.Dispatch<React.SetStateAction<{ reason: string }>>;
  handleResetPoints: () => void;
  isResetting: boolean;
}

const ResetPointsModal: React.FC<ResetPointsModalProps> = ({
  isOpen,
  onClose,
  selectedUsersCount,
  resetForm,
  setResetForm,
  handleResetPoints,
  isResetting,
}) => {
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
        <ModalHeader color="white">Reset Points</ModalHeader>
        <ModalCloseButton color="gray.400" />
        <ModalBody>
          <VStack spacing={4}>
            <Text color="gray.300" textAlign="center">
              This will reset points to 0 for {selectedUsersCount} selected user(s).
            </Text>
            <FormControl>
              <FormLabel color="gray.300">Reason</FormLabel>
              <Input
                value={resetForm.reason}
                onChange={(e) => setResetForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Enter reason for points reset"
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
            colorScheme="red"
            onClick={handleResetPoints}
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