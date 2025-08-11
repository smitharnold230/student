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
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiCode, FiTrendingUp, FiAward, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { codingStatsAPI } from '../services/api';

interface CodingStat {
  id: string;
  platform: 'LEETCODE' | 'HACKERRANK';
  username: string;
  problemsSolved: number;
  totalProblems: number;
  rank: number;
  rating: number;
  lastUpdated: string;
}

interface CreateStatData {
  platform: 'LEETCODE' | 'HACKERRANK';
  username: string;
}

const CodingStatsPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [createStatData, setCreateStatData] = useState<CreateStatData>({
    platform: 'LEETCODE',
    username: '',
  });
  
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const { data: statsResponse, isLoading } = useQuery({
    queryKey: ['codingStats'],
    queryFn: () => codingStatsAPI.getStats(),
  });

  const stats: CodingStat[] = statsResponse?.data || [];

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
      setCreateStatData({
        platform: 'LEETCODE',
        username: '',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to submit LeetCode stats',
        description: error.response?.data?.error || 'Failed to submit LeetCode statistics',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const submitHackerRankMutation = useMutation({
    mutationFn: (url: string) => codingStatsAPI.submitHackerRank(url),
    onSuccess: () => {
      toast({
        title: 'HackerRank stats submitted',
        description: 'Your HackerRank statistics have been submitted successfully.',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['codingStats'] });
      onClose();
      setCreateStatData({
        platform: 'LEETCODE',
        username: '',
      });
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

  const handleSubmitStats = () => {
    if (createStatData.platform === 'LEETCODE') {
      // For LeetCode, we need to provide a profile URL
      const leetCodeUrl = `https://leetcode.com/${createStatData.username}`;
      submitLeetCodeMutation.mutate(leetCodeUrl);
    } else {
      // For HackerRank, we need to provide a profile URL
      const hackerRankUrl = `https://hackerrank.com/${createStatData.username}`;
      submitHackerRankMutation.mutate(hackerRankUrl);
    }
  };

  const getPlatformColor = (platform: string) => {
    return platform === 'LEETCODE' ? 'orange' : 'green';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 2000) return 'purple';
    if (rating >= 1500) return 'red';
    if (rating >= 1200) return 'orange';
    if (rating >= 800) return 'yellow';
    return 'gray';
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
  const averageRating = stats && stats.length > 0 
    ? Math.round(stats.reduce((sum, stat) => sum + (stat.rating || 0), 0) / stats.length)
    : 0;

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
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
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
                <Icon as={FiTrendingUp} color="green.500" boxSize={8} />
                <Stat>
                  <StatLabel color="gray.400" fontSize="sm">Average Rating</StatLabel>
                  <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                    {averageRating}
                  </StatNumber>
                  <StatHelpText color="gray.500" fontSize="xs">
                    Combined rating
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
                      {formatDate(stat.lastUpdated)}
                    </Text>
                  </HStack>

                  <Box>
                    <Text color="white" fontSize="lg" fontWeight="bold" mb={1}>
                      {stat.username}
                    </Text>
                    
                    <VStack spacing={3} align="start">
                      <Box w="full">
                        <HStack justify="space-between" mb={1}>
                          <Text color="gray.400" fontSize="sm">Problems Solved</Text>
                          <Text color="white" fontSize="sm">
                            {stat.problemsSolved} / {stat.totalProblems}
                          </Text>
                        </HStack>
                        <Progress
                          value={stat.totalProblems > 0 ? (stat.problemsSolved / stat.totalProblems) * 100 : 0}
                          colorScheme="brand"
                          size="sm"
                        />
                      </Box>

                      <HStack justify="space-between" w="full">
                        <Text color="gray.400" fontSize="sm">Rank</Text>
                        <Text color="white" fontSize="sm">
                          #{stat.rank?.toLocaleString() || 'N/A'}
                        </Text>
                      </HStack>

                      <HStack justify="space-between" w="full">
                        <Text color="gray.400" fontSize="sm">Rating</Text>
                        <Badge
                          colorScheme={getRatingColor(stat.rating)}
                          variant="subtle"
                          fontSize="sm"
                        >
                          {stat.rating}
                        </Badge>
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
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
          <ModalHeader color="white">Add Coding Statistics</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color="gray.300">Platform</FormLabel>
                <Select
                  value={createStatData.platform}
                  onChange={(e) => setCreateStatData({ ...createStatData, platform: e.target.value as 'LEETCODE' | 'HACKERRANK' })}
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                >
                  <option value="LEETCODE">LeetCode</option>
                  <option value="HACKERRANK">HackerRank</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="gray.300">Username</FormLabel>
                <Input
                  placeholder="Enter your username"
                  value={createStatData.username}
                  onChange={(e) => setCreateStatData({ ...createStatData, username: e.target.value })}
                  bg="gray.700"
                  borderColor="gray.600"
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
              colorScheme="brand"
              onClick={handleSubmitStats}
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