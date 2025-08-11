import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  CardBody,
  Button,
  Badge,
  useToast,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  Grid,
  GridItem,
  Icon,
  Skeleton,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  FormErrorMessage,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiCode, FiTrendingUp, FiAward, FiPlus, FiTrash2 } from 'react-icons/fi';
import { codingStatsAPI } from '../services/api';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../store/authStore'; // Import useAuthStore

interface CodingStat {
  id: string;
  platform: 'LEETCODE' | 'HACKERRANK';
  url: string; // This is the profile URL
  problemsSolved: number;
  createdAt: string; // Using createdAt from backend
  updatedAt: string; // Using updatedAt from backend
}

const addStatSchema = z.object({
  platform: z.enum(['LEETCODE', 'HACKERRANK'], { message: 'Platform is required' }),
  username: z.string().min(1, 'Username is required'),
  manualCount: z.number().int().min(0, 'Problems solved must be non-negative').optional(),
});

type AddStatForm = z.infer<typeof addStatSchema>;

const CodingStatsPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onClose: onAddModalClose } = useDisclosure();
  const { isOpen: isConfirmDeleteOpen, onOpen: onConfirmDeleteOpen, onClose: onConfirmDeleteClose } = useDisclosure();
  const [showManualCount, setShowManualCount] = useState(false);
  const [statToDelete, setStatToDelete] = useState<CodingStat | null>(null);
  const { user } = useAuthStore(); // Get user from auth store
  
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const { data: statsResponse, isLoading, refetch } = useQuery({
    queryKey: ['codingStats'],
    queryFn: () => codingStatsAPI.getStats(),
  });

  const stats: CodingStat[] = statsResponse?.data || [];
  const hasLeetCode = stats.some(s => s.platform === 'LEETCODE');
  const hasHackerRank = stats.some(s => s.platform === 'HACKERRANK');

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
    // Default values will be set dynamically in handleAddModalOpen
  });

  const selectedPlatform = watch('platform');

  const submitLeetCodeMutation = useMutation({
    mutationFn: (url: string) => codingStatsAPI.submitLeetCode(url),
    onSuccess: () => {
      toast({
        title: 'LeetCode stats submitted',
        description: 'Your LeetCode statistics have been submitted successfully.',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['codingStats'] });
      onAddModalClose();
      reset();
      setShowManualCount(false);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to submit LeetCode statistics';
      toast({
        title: 'Failed to submit LeetCode stats',
        description: errorMessage,
        status: 'error',
        duration: 5000,
      });
      if (error.response?.data?.needManual) {
        setShowManualCount(true);
        setError('manualCount', { type: 'manualRequired', message: 'Auto-fetch failed. Please enter problems solved manually.' });
      }
    },
  });

  const submitHackerRankMutation = useMutation({
    mutationFn: (data: { url: string; manualCount: number }) => codingStatsAPI.submitHackerRank(data.url, data.manualCount),
    onSuccess: () => {
      toast({
        title: 'HackerRank stats submitted',
        description: 'Your HackerRank statistics have been submitted successfully.',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['codingStats'] });
      onAddModalClose();
      reset();
      setShowManualCount(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to submit HackerRank stats',
        description: error.response?.data?.error || 'Failed to submit HackerRank statistics',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const deleteStatMutation = useMutation({
    mutationFn: (platform: 'LEETCODE' | 'HACKERRANK') => codingStatsAPI.deleteStat(platform),
    onSuccess: () => {
      toast({
        title: 'Profile Removed',
        description: 'Coding profile has been removed successfully.',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['codingStats'] });
      onConfirmDeleteClose();
      setStatToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Removal Failed',
        description: error.response?.data?.error || 'Failed to remove coding profile',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleSubmitStats = (data: AddStatForm) => {
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

  const handleDeleteClick = (stat: CodingStat) => {
    setStatToDelete(stat);
    onConfirmDeleteOpen();
  };

  const handleConfirmDelete = () => {
    if (statToDelete) {
      deleteStatMutation.mutate(statToDelete.platform);
    }
  };

  const handleAddModalOpen = () => {
    let defaultPlatform: 'LEETCODE' | 'HACKERRANK' | '' = '';
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
    onAddModalOpen();
  };

  const handleAddModalClose = () => {
    reset();
    setShowManualCount(false);
    onAddModalClose();
  };

  const getPlatformColor = (platform: string) => {
    return platform === 'LEETCODE' ? 'orange' : 'green';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const totalProblemsSolved = stats?.reduce((sum, stat) => sum + (stat.problemsSolved || 0), 0) || 0;

  if (isLoading) {
    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            Coding Statistics
          </Heading>
          <Text color="gray.400">
            Track your progress on LeetCode and HackerRank
          </Text>
        </Box>
        
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
          {[...Array(4)].map((_, i) => (
            <GridItem key={i}>
              <Skeleton height="200px" />
            </GridItem>
          ))}
        </Grid>
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            Coding Statistics
          </Heading>
          <Text color="gray.400">
            Track your progress on LeetCode and HackerRank
          </Text>
        </Box>
        
        {user?.role === 'STUDENT' && ( // Only show for students
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brand"
            onClick={handleAddModalOpen}
            isDisabled={hasLeetCode && hasHackerRank} // Disable if both platforms are added
          >
            Add Stats
          </Button>
        )}
      </HStack>

      {/* Summary Stats */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
        <GridItem>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={3}>
                <Icon as={FiCode} color="brand.500" boxSize={8} />
                <Stat>
                  <StatLabel color="gray.400" fontSize="sm">Total Problems Solved</StatLabel>
                  <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                    {totalProblemsSolved}
                  </StatNumber>
                  <StatHelpText color="gray.500" fontSize="xs">
                    Across all platforms
                  </StatHelpText>
                </Stat>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={3}>
                <Icon as={FiAward} color="purple.500" boxSize={8} />
                <Stat>
                  <StatLabel color="gray.400" fontSize="sm">Active Platforms</StatLabel>
                  <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                    {stats?.length || 0}
                  </StatNumber>
                  <StatHelpText color="gray.500" fontSize="xs">
                    Connected accounts
                  </StatHelpText>
                </Stat>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Platform Stats */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
        {stats?.map((stat) => (
          <GridItem key={stat.id}>
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardBody>
                <VStack spacing={4} align="stretch" position="relative">
                  <HStack justify="space-between">
                    <Badge
                      colorScheme={getPlatformColor(stat.platform)}
                      variant="subtle"
                      fontSize="sm"
                    >
                      {stat.platform}
                    </Badge>
                    <Text color="gray.400" fontSize="xs">
                      Last Updated: {formatDate(stat.updatedAt)}
                    </Text>
                  </HStack>

                  <Box>
                    <Text color="white" fontSize="lg" fontWeight="bold" mb={1}>
                      {stat.url.split('/').filter(Boolean).pop()} {/* Display username from URL */}
                    </Text>
                    
                    <VStack spacing={3} align="start">
                      <HStack justify="space-between" w="full">
                        <Text color="gray.400" fontSize="sm">Problems Solved</Text>
                        <Text color="white" fontSize="sm">
                          {stat.problemsSolved}
                        </Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text color="gray.400" fontSize="sm">Profile URL</Text>
                        <Button
                          as="a"
                          href={stat.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="xs"
                          variant="link"
                          colorScheme="brand"
                        >
                          View Profile
                        </Button>
                      </HStack>
                    </VStack>
                  </Box>
                  {user?.role === 'STUDENT' && (
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      leftIcon={<FiTrash2 />}
                      onClick={() => handleDeleteClick(stat)}
                      isLoading={deleteStatMutation.isPending}
                      position="absolute"
                      bottom={4}
                      right={4}
                    >
                      Remove
                    </Button>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>

      {(!stats || stats.length === 0) && (
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4}>
              <Icon as={FiCode} color="gray.500" boxSize={12} />
              <Text color="gray.400" textAlign="center">
                No coding statistics available.
              </Text>
              <Text color="gray.500" fontSize="sm" textAlign="center">
                Add your LeetCode or HackerRank statistics to get started!
              </Text>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Add Stats Modal */}
      <Modal isOpen={isAddModalOpen} onClose={handleAddModalClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
          <ModalHeader color="white">Add Coding Statistics</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <VStack spacing={4} as="form" id="add-stats-form" onSubmit={handleSubmit(handleSubmitStats)}>
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
            <Button variant="ghost" mr={3} onClick={handleAddModalClose}>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isConfirmDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onConfirmDeleteClose}
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
              <Button ref={cancelRef} onClick={onConfirmDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3} isLoading={deleteStatMutation.isPending}>
                Remove
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};

export default CodingStatsPage;