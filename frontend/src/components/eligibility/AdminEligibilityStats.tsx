import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FiUsers, FiUserCheck, FiUserX } from 'react-icons/fi';

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

interface AdminEligibilityStatsProps {
  students: Student[];
  cardBg: string;
  borderColor: string;
}

const AdminEligibilityStats: React.FC<AdminEligibilityStatsProps> = ({
  students,
  cardBg,
  borderColor,
}) => {
  return (
    <HStack spacing={6} wrap="wrap">
      <Card
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        minW="200px"
      >
        <CardBody>
          <HStack spacing={3}>
            <Box p={2} borderRadius="lg" bg="blue.500" color="white">
              <FiUsers size={20} />
            </Box>
            <VStack align="start" spacing={0}>
              <Text color="gray.400" fontSize="sm">
                Total Students
              </Text>
              <Text color="white" fontSize="xl" fontWeight="bold">
                {students.length}
              </Text>
            </VStack>
          </HStack>
        </CardBody>
      </Card>

      <Card
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        minW="200px"
      >
        <CardBody>
          <HStack spacing={3}>
            <Box p={2} borderRadius="lg" bg="green.500" color="white">
              <FiUserCheck size={20} />
            </Box>
            <VStack align="start" spacing={0}>
              <Text color="gray.400" fontSize="sm">
                Eligible Students
              </Text>
              <Text color="white" fontSize="xl" fontWeight="bold">
                {students.filter((s) => s.eligibility?.eligible).length}
              </Text>
            </VStack>
          </HStack>
        </CardBody>
      </Card>

      <Card
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        minW="200px"
      >
        <CardBody>
          <HStack spacing={3}>
            <Box p={2} borderRadius="lg" bg="red.500" color="white">
              <FiUserX size={20} />
            </Box>
            <VStack align="start" spacing={0}>
              <Text color="gray.400" fontSize="sm">
                Not Eligible
              </Text>
              <Text color="white" fontSize="xl" fontWeight="bold">
                {students.filter((s) => !s.eligibility?.eligible).length}
              </Text>
            </VStack>
          </HStack>
        </CardBody>
      </Card>
    </HStack>
  );
};

export default AdminEligibilityStats;
