import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  useToast,
  useColorModeValue,
  Skeleton,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eligibilityAPI, profileAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';

// Import new modular components
import EligibilityStudentView from '../components/eligibility/EligibilityStudentView';
import EligibilityAdminView from '../components/eligibility/EligibilityAdminView';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi'; // Import actual icon components

interface EligibilityData {
  eligible: boolean;
  workshops: number;
  hackathons: number;
  leetcode: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  batch: string;
  eligibility?: EligibilityData;
}

const BATCHES = [
  'PRODUCT',
  'SERVICE_A',
  'SERVICE_B',
  'SERVICE_C1',
  'SERVICE_C2',
  'SERVICE_C3',
];

const EligibilityPage: React.FC = () => {
  const { user } = useAuthStore();
  const toast = useToast();
  const queryClient = useQueryClient();

  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  // Helper functions (kept here as they are used by both views or passed down)
  const getEligibilityColor = (eligible: boolean) => {
    return eligible ? 'green' : 'red';
  };

  const getEligibilityIcon = (eligible: boolean) => {
    return eligible ? FiCheckCircle : FiXCircle; // Return actual icon components
  };

  const getBatchColor = (batch: string) => {
    switch (batch) {
      case 'PRODUCT':
        return 'purple';
      case 'SERVICE_A':
        return 'blue';
      case 'SERVICE_B':
        return 'green';
      case 'SERVICE_C1':
        return 'yellow';
      case 'SERVICE_C2':
        return 'orange';
      case 'SERVICE_C3':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getProgressPercentage = (current: number, required: number) => {
    return Math.min(100, (current / required) * 100);
  };

  // Admin Queries & Mutations
  const {
    data: studentsResponse,
    isLoading: studentsLoading,
    refetch: refetchStudents,
  } = useQuery({
    queryKey: ['students'],
    queryFn: () => profileAPI.getAllStudents(),
    enabled: user?.role === 'ADMIN',
  });

  const students: Student[] = studentsResponse?.data?.data || [];

  const assignBatchMutation = useMutation({
    mutationFn: (data: { userId: string; batch: string; auto: boolean }) =>
      eligibilityAPI.assignBatch(data.userId, data.batch, data.auto),
    // onSuccess and onError handled in EligibilityAdminView
  });

  const assignAllEligibleBatchesMutation = useMutation({
    mutationFn: () => eligibilityAPI.assignAllEligibleBatches(),
    // onSuccess and onError handled in EligibilityAdminView
  });

  // Student Queries
  const { data: eligibilityResponse, isLoading: eligibilityLoading } = useQuery(
    {
      queryKey: ['eligibility'],
      queryFn: () => eligibilityAPI.checkEligibility(),
      enabled: user?.role === 'STUDENT',
    },
  );

  const eligibility: EligibilityData = eligibilityResponse?.data || {
    eligible: false,
    workshops: 0,
    hackathons: 0,
    leetcode: 0,
  };

  const isLoading =
    user?.role === 'STUDENT' ? eligibilityLoading : studentsLoading;

  if (isLoading) {
    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            Eligibility
          </Heading>
          <Text color="gray.400">Loading eligibility data...</Text>
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

  if (user?.role === 'ADMIN') {
    return (
      <EligibilityAdminView
        students={students}
        studentsLoading={studentsLoading}
        refetchStudents={refetchStudents}
        assignAllEligibleBatchesMutation={assignAllEligibleBatchesMutation}
        assignBatchMutation={assignBatchMutation}
        cardBg={cardBg}
        borderColor={borderColor}
        getEligibilityColor={getEligibilityColor}
        getEligibilityIcon={getEligibilityIcon}
        getBatchColor={getBatchColor}
        BATCHES={BATCHES}
      />
    );
  }

  return (
    <EligibilityStudentView
      eligibility={eligibility}
      isLoading={eligibilityLoading}
      cardBg={cardBg}
      borderColor={borderColor}
      getEligibilityColor={getEligibilityColor}
      getEligibilityIcon={getEligibilityIcon}
      getProgressPercentage={getProgressPercentage}
    />
  );
};

export default EligibilityPage;
