import React, { useState, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  useToast,
  useColorModeValue,
  useDisclosure,
  Grid,
  GridItem,
  Icon,
  Skeleton,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiCode, FiPlus } from 'react-icons/fi';
import { codingStatsAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';

// Import new modular components
import CodingStatsSummary from '../components/codingStats/CodingStatsSummary';
import CodingStatCard from '../components/codingStats/CodingStatCard';
import AddCodingStatModal from '../components/codingStats/AddCodingStatModal';
import DeleteCodingStatAlertDialog from '../components/codingStats/DeleteCodingStatAlertDialog';

interface CodingStat {
  id: string;
  platform: 'LEETCODE' | 'HACKERRANK';
  url: string;
  problemsSolved: number;
  createdAt: string;
  updatedAt: string;
}

const CodingStatsPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onClose: onAddModalClose } = useDisclosure();
  const { isOpen: isConfirmDeleteOpen, onOpen: onConfirmDeleteOpen, onClose: onConfirmDeleteClose } = useDisclosure();
  const [statToDelete, setStatToDelete] = useState<CodingStat | null>(null);
  const { user } = useAuthStore();
  
  const cancelRef = useRef<HTMLButtonElement>(null);

  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const { data: statsResponse, isLoading } = useQuery({
    queryKey: ['codingStats'],
    queryFn: () => codingStatsAPI.getStats(),
  });

  const stats: CodingStat[] = statsResponse?.data || [];
  const hasLeetCode = stats.some(s => s.platform === 'LEETCODE');
  const hasHackerRank = stats.some(s => s.platform === 'HACKERRANK');

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
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to submit LeetCode statistics';
      toast({
        title: 'Failed to submit LeetCode stats',
        description: errorMessage,
        status: 'error',
        duration: 5000,
      });
      // Note: The 'needManual' logic is now handled within AddCodingStatModal if needed.
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

  const handleDeleteClick = (stat: CodingStat) => {
    setStatToDelete(stat);
    onConfirmDeleteOpen();
  };

  const handleConfirmDelete = () => {
    if (statToDelete) {
      deleteStatMutation.mutate(statToDelete.platform);
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
        
        {user?.role === 'STUDENT' && (
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brand"
            onClick={onAddModalOpen}
            isDisabled={hasLeetCode && hasHackerRank}
          >
            Add Stats
          </Button>
        )}
      </HStack>

      <CodingStatsSummary
        totalProblemsSolved={totalProblemsSolved}
        activePlatformsCount={stats?.length || 0}
      />

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
        {stats?.map((stat) => (
          <GridItem key={stat.id}>
            <CodingStatCard
              stat={stat}
              userRole={user?.role || null}
              onDeleteClick={handleDeleteClick}
              deleteMutationIsPending={deleteStatMutation.isPending}
            />
          </GridItem>
        ))}
      </Grid>

      {(!stats || stats.length === 0) && (
        <Box bg={cardBg} border="1px solid" borderColor={borderColor} p={6} borderRadius="lg">
          <VStack spacing={4}>
            <Icon as={FiCode} color="gray.500" boxSize={12} />
            <Text color="gray.400" textAlign="center">
              No coding statistics available.
            </Text>
            <Text color="gray.500" fontSize="sm" textAlign="center">
              Add your LeetCode or HackerRank statistics to get started!
            </Text>
          </VStack>
        </Box>
      )}

      <AddCodingStatModal
        isOpen={isAddModalOpen}
        onClose={onAddModalClose}
        hasLeetCode={hasLeetCode}
        hasHackerRank={hasHackerRank}
        submitLeetCodeMutation={submitLeetCodeMutation}
        submitHackerRankMutation={submitHackerRankMutation}
      />

      <DeleteCodingStatAlertDialog
        isOpen={isConfirmDeleteOpen}
        onClose={onConfirmDeleteClose}
        statToDelete={statToDelete}
        onConfirmDelete={handleConfirmDelete}
        deleteMutationIsPending={deleteStatMutation.isPending}
        cancelRef={cancelRef}
      />
    </VStack>
  );
};

export default CodingStatsPage;