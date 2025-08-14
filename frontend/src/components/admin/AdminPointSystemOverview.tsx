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
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';

interface UserWithPoints {
  id: string;
  name: string;
  email: string;
  class: string;
  batch: string;
  points: number;
  profileId: string;
}

interface PointStatistics {
  totalUsers: number;
  totalPoints: number;
  averagePoints: number;
  topPerformers: UserWithPoints[];
}

interface AdminPointSystemOverviewProps {
  pointStats: PointStatistics;
  cardBg: string;
  borderColor: string;
}

const AdminPointSystemOverview: React.FC<AdminPointSystemOverviewProps> = ({
  pointStats,
  cardBg,
  borderColor,
}) => {
  return (
    <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Heading size="md" color="white">
            Point System Overview
          </Heading>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
            <Stat>
              <StatLabel color="gray.400" fontSize="sm">
                Total Users
              </StatLabel>
              <StatNumber color="white" fontSize="xl">
                {pointStats.totalUsers || 0}
              </StatNumber>
              <StatHelpText color="gray.500" fontSize="xs">
                With point records
              </StatHelpText>
            </Stat>

            <Stat>
              <StatLabel color="gray.400" fontSize="sm">
                Total Points
              </StatLabel>
              <StatNumber color="white" fontSize="xl">
                {pointStats.totalPoints || 0}
              </StatNumber>
              <StatHelpText color="gray.500" fontSize="xs">
                System-wide total
              </StatHelpText>
            </Stat>

            <Stat>
              <StatLabel color="gray.400" fontSize="sm">
                Average Points
              </StatLabel>
              <StatNumber color="white" fontSize="xl">
                {pointStats.averagePoints || 0}
              </StatNumber>
              <StatHelpText color="gray.500" fontSize="xs">
                Per user
              </StatHelpText>
            </Stat>
          </Grid>

          <VStack spacing={3} align="stretch">
            <Text color="white" fontSize="sm" fontWeight="medium">
              Points Overview
            </Text>
            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
              gap={3}
            >
              <HStack
                justify="space-between"
                p={2}
                bg="gray.700"
                borderRadius="md"
              >
                <Text color="white" fontSize="sm">
                  Total Users
                </Text>
                <Badge colorScheme="blue" fontSize="sm">
                  {pointStats.totalUsers || 0}
                </Badge>
              </HStack>
              <HStack
                justify="space-between"
                p={2}
                bg="gray.700"
                borderRadius="md"
              >
                <Text color="white" fontSize="sm">
                  Average Points
                </Text>
                <Badge colorScheme="green" fontSize="sm">
                  {Math.round(pointStats.averagePoints || 0)}
                </Badge>
              </HStack>
            </Grid>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default AdminPointSystemOverview;
