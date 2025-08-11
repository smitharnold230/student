import React from 'react';
import {
  Box,
  VStack,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Grid,
  GridItem,
  Icon,
} from '@chakra-ui/react';
import { 
  FiUsers, 
  FiCalendar, 
  FiAward, 
  FiTrendingUp,
  FiBarChart,
  FiCheckCircle
} from 'react-icons/fi';

interface SystemStats {
  totalStudents: number;
  totalEvents: number;
  pendingCertifications: number;
  activeUsers: number;
  totalPoints: number;
  averagePoints: number;
}

interface AdminOverviewStatsProps {
  systemStats: SystemStats;
  cardBg: string;
  borderColor: string;
}

const AdminOverviewStats: React.FC<AdminOverviewStatsProps> = ({ systemStats, cardBg, borderColor }) => {
  return (
    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
      <GridItem>
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={3}>
              <Icon as={FiUsers} color="blue.500" boxSize={8} />
              <Stat>
                <StatLabel color="gray.400" fontSize="sm">Total Students</StatLabel>
                <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                  {systemStats.totalStudents}
                </StatNumber>
                <StatHelpText color="gray.500" fontSize="xs">
                  Enrolled students
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
              <Icon as={FiCalendar} color="green.500" boxSize={8} />
              <Stat>
                <StatLabel color="gray.400" fontSize="sm">Total Events</StatLabel>
                <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                  {systemStats.totalEvents}
                </StatNumber>
                <StatHelpText color="gray.500" fontSize="xs">
                  Workshops & hackathons
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
                <StatLabel color="gray.400" fontSize="sm">Pending Certifications</StatLabel>
                <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                  {systemStats.pendingCertifications}
                </StatNumber>
                <StatHelpText color="gray.500" fontSize="xs">
                  Awaiting verification
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
              <Icon as={FiTrendingUp} color="orange.500" boxSize={8} />
              <Stat>
                <StatLabel color="gray.400" fontSize="sm">Total Points</StatLabel>
                <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                  {systemStats.totalPoints.toLocaleString()}
                </StatNumber>
                <StatHelpText color="gray.500" fontSize="xs">
                  System-wide points
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
              <Icon as={FiBarChart} color="cyan.500" boxSize={8} />
              <Stat>
                <StatLabel color="gray.400" fontSize="sm">Average Points</StatLabel>
                <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                  {systemStats.averagePoints}
                </StatNumber>
                <StatHelpText color="gray.500" fontSize="xs">
                  Per student
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
              <Icon as={FiCheckCircle} color="green.500" boxSize={8} />
              <Stat>
                <StatLabel color="gray.400" fontSize="sm">Active Users</StatLabel>
                <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                  {systemStats.activeUsers}
                </StatNumber>
                <StatHelpText color="gray.500" fontSize="xs">
                  This week
                </StatHelpText>
              </Stat>
            </VStack>
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default AdminOverviewStats;