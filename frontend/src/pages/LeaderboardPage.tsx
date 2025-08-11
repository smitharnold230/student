import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Avatar,
  Card,
  CardBody,
  Heading,
  useColorModeValue,
  Skeleton,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { FiAward, FiTrendingUp } from 'react-icons/fi';
import { leaderboardAPI } from '../services/api';
import { getStudentLevel } from '../utils/points'; // Import the utility

interface LeaderboardStudent {
  id: string; // Assuming ID is available from profile
  rank: number;
  name: string;
  email: string;
  class: string;
  batch: string;
  points: number;
}

const LeaderboardPage: React.FC = () => {
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const { data: leaderboardResponse, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => leaderboardAPI.getLeaderboard(),
  });

  const leaderboard: LeaderboardStudent[] = leaderboardResponse?.data || [];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const getBatchColor = (batch: string) => {
    if (!batch) return 'gray';
    switch (batch) {
      case 'PRODUCT': return 'purple';
      case 'SERVICE_A': return 'blue';
      case 'SERVICE_B': return 'green';
      case 'SERVICE_C1': return 'yellow';
      case 'SERVICE_C2': return 'orange';
      case 'SERVICE_C3': return 'gray';
      default: return 'gray';
    }
  };

  if (isLoading) {
    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            Leaderboard
          </Heading>
          <Text color="gray.400">
            Student rankings based on performance and achievements
          </Text>
        </Box>
        
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4}>
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} height="60px" width="full" />
              ))}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <Heading size="lg" color="white" mb={2}>
          Leaderboard
        </Heading>
        <Text color="gray.400">
          Student rankings based on performance and achievements
        </Text>
      </Box>

      {/* Stats Cards */}
      <HStack spacing={6} wrap="wrap">
        <Card bg={cardBg} border="1px solid" borderColor={borderColor} minW="200px">
          <CardBody>
            <HStack spacing={3}>
              <Box p={2} borderRadius="lg" bg="brand.500" color="white">
                <FiAward size={20} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text color="gray.400" fontSize="sm">
                  Total Students
                </Text>
                <Text color="white" fontSize="xl" fontWeight="bold">
                  {leaderboard.length}
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderColor} minW="200px">
          <CardBody>
            <HStack spacing={3}>
              <Box p={2} borderRadius="lg" bg="green.500" color="white">
                <FiTrendingUp size={20} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text color="gray.400" fontSize="sm">
                  Top Score
                </Text>
                <Text color="white" fontSize="xl" fontWeight="bold">
                  {leaderboard[0]?.points || 0}
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      </HStack>

      {/* Leaderboard Table */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th color="gray.300" borderColor={borderColor}>Rank</Th>
                  <Th color="gray.300" borderColor={borderColor}>Student</Th>
                  <Th color="gray.300" borderColor={borderColor}>Class</Th>
                  <Th color="gray.300" borderColor={borderColor}>Batch</Th>
                  <Th color="gray.300" borderColor={borderColor}>Points</Th>
                  <Th color="gray.300" borderColor={borderColor}>Level</Th>
                  <Th color="gray.300" borderColor={borderColor}>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {leaderboard.map((student, index) => (
                  <Tr key={student.id} _hover={{ bg: 'gray.700' }}>
                    <Td borderColor={borderColor}>
                      <HStack spacing={2}>
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          color={index < 3 ? 'yellow.400' : 'gray.400'}
                        >
                          {getRankIcon(student.rank)}
                        </Text>
                      </HStack>
                    </Td>
                    <Td borderColor={borderColor}>
                      <HStack spacing={3}>
                        <Avatar
                          size="sm"
                          name={student.name}
                          bg="brand.500"
                        />
                        <VStack align="start" spacing={0}>
                          <Text color="white" fontWeight="medium">
                            {student.name || 'N/A'}
                          </Text>
                          <Text color="gray.400" fontSize="sm">
                            {student.email}
                          </Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text color="gray.300">
                        {student.class || 'N/A'}
                      </Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Badge
                        colorScheme={getBatchColor(student.batch)}
                        variant="subtle"
                      >
                        {student.batch || 'Not Assigned'}
                      </Badge>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text color="white" fontWeight="bold">
                        {student.points}
                      </Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Badge colorScheme="blue" variant="outline">
                        {getStudentLevel(student.points).level}
                      </Badge>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Badge
                        colorScheme="blue"
                        variant="subtle"
                      >
                        Active
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default LeaderboardPage;