import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  CardBody,
  Badge,
  Progress,
  useColorModeValue,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
} from '@chakra-ui/react';
import { FiCheckCircle, FiXCircle, FiAward, FiCode, FiCalendar } from 'react-icons/fi';

interface EligibilityData {
  eligible: boolean;
  workshops: number;
  hackathons: number;
  leetcode: number;
}

interface EligibilityStudentViewProps {
  eligibility: EligibilityData | undefined;
  isLoading: boolean;
  cardBg: string;
  borderColor: string;
  getEligibilityColor: (eligible: boolean) => string;
  getEligibilityIcon: (eligible: boolean) => React.ElementType;
  getProgressPercentage: (current: number, required: number) => number;
}

const EligibilityStudentView: React.FC<EligibilityStudentViewProps> = ({
  eligibility,
  isLoading,
  cardBg,
  borderColor,
  getEligibilityColor,
  getEligibilityIcon,
  getProgressPercentage,
}) => {
  if (isLoading) {
    return (
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4}>
            <Skeleton height="60px" width="full" />
            <Skeleton height="60px" width="full" />
            <Skeleton height="60px" width="full" />
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <VStack spacing={6}>
      {/* Eligibility Status */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4}>
            <HStack spacing={4}>
              <Icon
                as={getEligibilityIcon(eligibility?.eligible || false)}
                color={getEligibilityColor(eligibility?.eligible || false)}
                boxSize={8}
              />
              <VStack align="start" spacing={1}>
                <Heading size="md" color="white">
                  {eligibility?.eligible ? 'Eligible' : 'Not Eligible'}
                </Heading>
                <Text color="gray.400">
                  {eligibility?.eligible
                    ? 'You meet all requirements for batch assignment'
                    : 'You need to meet more requirements'
                  }
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Requirements Breakdown */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={6}>
            <Heading size="md" color="white">Requirements Progress</Heading>

            {/* Workshops */}
            <VStack spacing={2} align="stretch" width="full">
              <HStack justify="space-between">
                <HStack spacing={3}>
                  <Icon as={FiCalendar} color="blue.400" />
                  <Text color="white">Workshops Attended</Text>
                </HStack>
                <Badge colorScheme={(eligibility?.workshops || 0) >= 2 ? 'green' : 'red'}>
                  {eligibility?.workshops || 0}/2
                </Badge>
              </HStack>
              <Progress
                value={getProgressPercentage(eligibility?.workshops || 0, 2)}
                colorScheme={(eligibility?.workshops || 0) >= 2 ? 'green' : 'red'}
              />
            </VStack>

            {/* Hackathons */}
            <VStack spacing={2} align="stretch" width="full">
              <HStack justify="space-between">
                <HStack spacing={3}>
                  <Icon as={FiAward} color="purple.400" />
                  <Text color="white">Hackathons Attended</Text>
                </HStack>
                <Badge colorScheme={(eligibility?.hackathons || 0) >= 2 ? 'green' : 'red'}>
                  {eligibility?.hackathons || 0}/2
                </Badge>
              </HStack>
              <Progress
                value={getProgressPercentage(eligibility?.hackathons || 0, 2)}
                colorScheme={(eligibility?.hackathons || 0) >= 2 ? 'green' : 'red'}
              />
            </VStack>

            {/* LeetCode Problems */}
            <VStack spacing={2} align="stretch" width="full">
              <HStack justify="space-between">
                <HStack spacing={3}>
                  <Icon as={FiCode} color="orange.400" />
                  <Text color="white">LeetCode Problems Solved</Text>
                </HStack>
                <Badge colorScheme={(eligibility?.leetcode || 0) >= 200 ? 'green' : 'red'}>
                  {eligibility?.leetcode || 0}/200
                </Badge>
              </HStack>
              <Progress
                value={getProgressPercentage(eligibility?.leetcode || 0, 200)}
                colorScheme={(eligibility?.leetcode || 0) >= 200 ? 'green' : 'red'}
              />
            </VStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Requirements Info */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4}>
            <Heading size="md" color="white">Requirements</Heading>
            <Alert status="info">
              <AlertIcon />
              <Box>
                <AlertTitle>Batch Assignment Requirements</AlertTitle>
                <AlertDescription>
                  To be eligible for batch assignment, you need:
                  • At least 2 workshops attended
                  • At least 2 hackathons attended
                  • At least 200 LeetCode problems solved
                </AlertDescription>
              </Box>
            </Alert>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default EligibilityStudentView;