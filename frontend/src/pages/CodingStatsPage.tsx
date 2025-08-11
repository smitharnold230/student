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
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiCode, FiTrendingUp, FiAward, FiPlus } from 'react-icons/fi';
import { codingStatsAPI } from '../services/api';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showManualCount, setShowManualCount] = useState(false);
  
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const { data: statsResponse, isLoading } = useQuery({
    queryKey: ['codingStats'],
    queryFn: () => codingStatsAPI.getStats(),
  });

  const stats: CodingStat[] = statsResponse?.data || [];

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
    defaultValues: {
      platform: 'LEETCODE',
      username: '',
      manualCount: undefined,
    },
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
      onClose();
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
      onClose();
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

  const handleModalClose = () => {
    reset();
    setShowManualCount(false);
    onClose();
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
  // Removed averageRating and totalProblems as they are not consistently available from backend
  // For a professional app, only display data that is reliably provided by the API.

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
        
        <Button
          leftIcon={<FiPlus />}
          colorScheme="brand"
          onClick={onOpen}
        >
          Add Stats
        </Button>
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
                <VStack spacing={4} align="stretch">
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
      <Modal isOpen={isOpen} onClose={handleModalClose} size="lg">
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
                  <option value="LEETCODE">LeetCode</option>
                  <option value="HACKERRANK">HackerRank</option>
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
            <Button variant="ghost" mr={3} onClick={handleModalClose}>
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
    </VStack>
  );
};

export default CodingStatsPage;