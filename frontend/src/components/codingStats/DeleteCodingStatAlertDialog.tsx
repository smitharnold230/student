import React from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { UseMutationResult } from '@tanstack/react-query';

interface CodingStat {
  id: string;
  platform: 'LEETCODE' | 'HACKERRANK';
  url: string;
  problemsSolved: number;
  createdAt: string;
  updatedAt: string;
}

interface DeleteCodingStatAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  statToDelete: CodingStat | null;
  onConfirmDelete: () => void;
  deleteMutationIsPending: boolean;
  cancelRef: React.RefObject<HTMLButtonElement>;
}

const DeleteCodingStatAlertDialog: React.FC<DeleteCodingStatAlertDialogProps> = ({
  isOpen,
  onClose,
  statToDelete,
  onConfirmDelete,
  deleteMutationIsPending,
  cancelRef,
}) => {
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent bg={cardBg} border="1px solid" borderColor={borderColor}>
          <AlertDialogHeader fontSize="lg" fontWeight="bold" color="white">
            Remove {statToDelete?.platform} Profile
          </AlertDialogHeader>

          <AlertDialogBody color="gray.300">
            Are you sure you want to remove your {statToDelete?.platform} profile? This action cannot be undone and will affect your total points.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={onConfirmDelete} ml={3} isLoading={deleteMutationIsPending}>
              Remove
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default DeleteCodingStatAlertDialog;