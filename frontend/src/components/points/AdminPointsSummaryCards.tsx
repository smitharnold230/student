import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  useColorModeValue,
  Grid,
  GridItem,
  Icon,
} from '@chakra-ui/react';
import { FiAward, FiTrendingUp, FiCode, FiStar } from 'react-icons/fi';
import { PointStatistics } from '../../types/points'; // Assuming PointStatistics is defined or will be

interface AdminPointsSummaryCardsProps {
  statistics: PointStatistics | undefined;
}

const AdminPointsSummaryCards: React.FC<AdminPointsSummaryCardsProps> = ({ statistics }) => {
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  return (
    <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={6}>
      <GridItem>
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={3}>
              <Icon as={FiTrendingUp} color="blue.500" boxSize={8} />
              <Stat>
                <StatLabel color="gray.400" fontSize="sm">Total Users</StatLabel>
                <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                  {statistics?.totalUsers || 0}
                </StatNumber>
                <StatHelpText color="gray.500" fontSize="xs">
                  Active students
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
              <Icon as={FiAward} color="green.500" boxSize={8} />
              <Stat>
                <StatLabel color="gray.400" fontSize="sm">Total Points</StatLabel>
                <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                  {statistics?.totalPoints?.toLocaleString() || 0}
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
              <Icon as={FiCode} color="purple.500" boxSize={8} />
              <Stat>
                <StatLabel color="gray.400" fontSize="sm">Average Points</StatLabel>
                <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                  {statistics?.averagePoints || 0}
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
              <Icon as={FiStar} color="yellow.500" boxSize={8} />
              <Stat>
                <StatLabel color="gray.400" fontSize="sm">Top Score</StatLabel>
                <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                  {statistics?.topPerformers?.[0]?.points || 0}
                </StatNumber>
                <StatHelpText color="gray.500" fontSize="xs">
                  Highest points
                </StatHelpText>
              </Stat>
            </VStack>
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default AdminPointsSummaryCards;