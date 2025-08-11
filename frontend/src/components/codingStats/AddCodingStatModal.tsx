import React, { useState, useEffect } from 'react';
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
  useToast,
  useColorModeValue,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UseMutationResult } from '@tanstack/react-query';

interface AddStatForm {
  platform: 'LEETCODE' | 'HACKERRANK';
  username: string;
  manualCount?: number;
}

interface AddCodingStatModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasLeetCode: boolean;
  hasHackerRank: boolean;
  submitLeetCodeMutation: UseMutationResult<any, Error, string, unknown>;
  submitHackerRankMutation: UseMutationResult<any, Error, { url: string; manualCount: number }, unknown>;
}

const addStatSchema = z.object({
  platform: z.enum(['LEETCODE', 'HACKERRANK'], { message: 'Platform is required' }),
  username: z.string().min(1, 'Username is required'),
  manualCount: z.number().int().min(0, 'Problems solved must be non-negative').optional(),
});

const AddCodingStatModal: React.FC<AddCodingStatModalProps> = ({
  isOpen,
  onClose,
  hasLeetCode,
  hasHackerRank,
  submitLeetCodeMutation,
  submitHackerRankMutation,
}) => {
  const toast = useToast();
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const [showManualCount, setShowManualCount] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm<AddStatForm>({
    resolver: zodResolver(addStatSchema),
  });

  const selectedPlatform = watch('platform');

  useEffect(() => {
    if (isOpen) {
      let defaultPlatform: 'LEETCODE' | 'HACKERRANK' | undefined = undefined;
      if (!hasLeetCode) {
        defaultPlatform = 'LEETCODE';
      } else if (!hasHackerRank) {
        defaultPlatform = 'HACKERRANK';
      }

      reset({
        platform: defaultPlatform,
        username: '',
        manualCount: undefined,
      });
      setShowManualCount(defaultPlatform === 'HACKERRANK');
    }
  }, [isOpen, hasLeetCode, hasHackerRank, reset]);

  const onSubmit = (data: AddStatForm) => {
    if (data.platform === 'LEETCODE') {
      const leetCodeUrl = `https://leetcode.com/u/${data.username}/`;
      submitLeetCodeMutation.mutate(leetCodeUrl);
    } else {
      if (data.manualCount === undefined || data.manualCount < 0) {
        setError('manualCount', { type: 'required', message: 'Problems solved is required for HackerRank.' });
        return;
      }
      const hackerRankUrl = `https://www.hackerrank.com/profile/${data.username}`;
      submitHackerRankMutation.mutate({ url: hackerRankUrl, manualCount: data.manualCount });
    }
  };

  const handleClose = () => {
    reset();
    setShowManualCount(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
        <ModalHeader color="white">Add Coding Statistics</ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody>
          <VStack spacing={4} as="form" id="add-stats-form" onSubmit={handleSubmit(onSubmit)}>
            <FormControl isInvalid={!!errors.platform} isRequired>
              <FormLabel color="gray.300">Platform</FormLabel>
              <Select
                bg="gray.700"
                borderColor="gray.600"
                color="white"
                {...register('platform')}
                onChange={(e) => {
                  setValue('platform', e.target.value as 'LEETCODE' | 'HACKERRANK');
                  setShowManualCount(e.target.value === 'HACKERRANK');
                  clearErrors('manualCount');
                }}
              >
                <option value="LEETCODE" disabled={hasLeetCode}>
                  LeetCode {hasLeetCode && '(Already Added)'}
                </option>
                <option value="HACKERRANK" disabled={hasHackerRank}>
                  HackerRank {hasHackerRank && '(Already Added)'}
                </option>
              </Select>
              <FormErrorMessage>{errors.platform?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.username} isRequired>
              <FormLabel color="gray.300">Username</FormLabel>
              <Input
                placeholder="Enter your username"
                bg="gray.700"
                borderColor="gray.600"
                color="white"
                _placeholder={{ color: 'gray.400' }}
                {...register('username')}
              />
              <FormErrorMessage>{errors.username?.message}</FormErrorMessage>
            </FormControl>

            {showManualCount && (
              <FormControl isInvalid={!!errors.manualCount} isRequired={selectedPlatform === 'HACKERRANK'}>
                <FormLabel color="gray.300">Problems Solved (Manual)</FormLabel>
                <Input
                  type="number"
                  placeholder="Enter number of problems solved"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.400' }}
                  {...register('manualCount', { valueAsNumber: true })}
                />
                <FormErrorMessage>{errors.manualCount?.message}</FormErrorMessage>
              </FormControl>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="brand"
            type="submit"
            form="add-stats-form"
            isLoading={submitLeetCodeMutation.isPending || submitHackerRankMutation.isPending}
          >
            Submit Statistics
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddCodingStatModal;