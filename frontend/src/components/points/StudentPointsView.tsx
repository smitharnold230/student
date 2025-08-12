import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';
import { PointBreakdown, PointRule } from '../../types/points';
import { getStudentLevel } from '../../utils/points';

// Import modular components
import StudentPointsSummaryCards from './StudentPointsSummaryCards';
import StudentDetailedBreakdown from './StudentDetailedBreakdown';
import PointRulesDisplay from './PointRulesDisplay';

interface StudentPointsViewProps {
  breakdown: PointBreakdown | undefined;
  rules: PointRule[];
}

const StudentPointsView: React.FC<StudentPointsViewProps> = ({ breakdown, rules }) => {
  const { level, nextLevelPoints, progressPercentage } = getStudentLevel(breakdown?.totalPoints || 0);

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="lg" color="white" mb={2}>
          My Points
        </Heading>
        <Text color="gray.400">
          Track your progress and point breakdown
        </Text>
      </Box>

      <StudentPointsSummaryCards
        breakdown={breakdown}
        level={level}
        nextLevelPoints={nextLevelPoints}
        progressPercentage={progressPercentage}
      />

      <StudentDetailedBreakdown breakdown={breakdown} rules={rules} />

      <PointRulesDisplay rules={rules} />
    </VStack>
  );
};

export default StudentPointsView;