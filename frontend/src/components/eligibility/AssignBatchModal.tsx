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
  Select,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box, // Added missing import
} from '@chakra-ui/react';
import { UseMutationResult } from '@tanstack/react-query';

interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  batch: string;
  eligibility?: {
    eligible: boolean;
    workshops: number;
    hackathons: number;
    leetcode: number;
  };
}

interface AssignBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStudent: Student | null;
  selectedBatch: string;
  setSelectedBatch: React.Dispatch<React.SetStateAction<string>>;
  isAutoAssign: boolean;
  setIsAutoAssign: React.Dispatch<React.SetStateAction<boolean>>;
  handleAssignBatch: () => void;
  isAssigning: boolean;
  cardBg: string;
  borderColor: string;
  BATCHES: string[];
}

const AssignBatchModal: React.FC<AssignBatchModalProps> = ({
  isOpen,
  onClose,
  selectedStudent,
  selectedBatch,
  setSelectedBatch,
  isAutoAssign,
  setIsAutoAssign,
  handleAssignBatch,
  isAssigning,
  cardBg,
  borderColor,
  BATCHES,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
        <ModalHeader color="white">Assign Batch</ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody>
          <VStack spacing={4}>
            <Text color="white">
              Assigning batch for: <strong>{selectedStudent?.name}</strong>
            </Text>

            <FormControl>
              <FormLabel color="white">Batch</FormLabel>
              <Select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                bg="gray.700"
                color="white"
                borderColor={borderColor}
              >
                {BATCHES.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel color="white">Assignment Type</FormLabel>
              <Select
                value={isAutoAssign ? 'auto' : 'manual'}
                onChange={(e) => setIsAutoAssign(e.target.value === 'auto')}
                bg="gray.700"
                color="white"
                borderColor={borderColor}
              >
                <option value="auto">Automatic (Check Eligibility)</option>
                <option value="manual">Manual (Force Assignment)</option>
              </Select>
            </FormControl>

            {selectedStudent?.eligibility && (
              <Alert status={selectedStudent.eligibility.eligible ? 'success' : 'warning'}>
                <AlertIcon />
                <Box>
                  <AlertTitle>
                    {selectedStudent.eligibility.eligible ? 'Eligible' : 'Not Eligible'}
                  </AlertTitle>
                  <AlertDescription>
                    Workshops: {selectedStudent.eligibility.workshops}/2,
                    Hackathons: {selectedStudent.eligibility.hackathons}/2,
                    LeetCode: {selectedStudent.eligibility.leetcode}/200
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} color="white">
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleAssignBatch}
            isLoading={isAssigning}
          >
            Assign Batch
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AssignBatchModal;