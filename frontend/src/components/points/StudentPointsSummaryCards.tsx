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
  Badge,
  Progress,
  useColorModeValue,
  Grid,
  GridItem,
  Icon,
} from '@chakra-ui/react';
import { FiCalendar, FiCode, FiCheckCircle, FiStar } from 'react-icons/fi';
import { PointBreakdown } from '../../types/points';

interface StudentPointsSummaryCardsProps {
  breakdown: PointBreakdown | undefined;
  level: string;
  nextLevelPoints: number;
  progressPercentage: number;
}

const StudentPointsSummaryCards: React.FC<StudentPointsSummaryCardsProps> = ({
  breakdown,
  level,
  nextLevelPoints,
  progressPercentage,
}) => {
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  return (
    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
      <GridItem>
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="md" color="white" fontWeight="bold">
                  Total Points
                </Text>
                <Badge
                  colorScheme="green"
                  variant="subtle"
                  fontSize="lg"
                >
                  {breakdown?.totalPoints || 0} pts
                </Badge>
              </HStack>
              
              <Stat>
                <StatNumber color="white" fontSize="4xl" fontWeight="bold">
                  {breakdown?.totalPoints || 0}
                </StatNumber>
                <StatHelpText color="gray.400">
                  Total points earned
                </StatHelpText>
              </Stat>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text color="gray.400" fontSize="sm">
                    Current Level: <Text as="span" fontWeight="bold" color="white">{level}</Text>
                  </Text>
                  <Text color="white" fontSize="sm">
                    {breakdown?.totalPoints || 0} / {nextLevelPoints === Infinity ? 'Max' : nextLevelPoints} points
                  </Text>
                </HStack>
                <Progress
                  value={progressPercentage}
                  colorScheme="green"
                  size="lg"
                  borderRadius="full"
                />
                {nextLevelPoints !== Infinity && (
                  <Text color="gray.500" fontSize="xs" mt={1}>
                    {nextLevelPoints - (breakdown?.totalPoints || 0)} points to reach next level
                  </Text>
                )}
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </GridItem>

      <GridItem>
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="md" color="white" fontWeight="bold">
                Quick Stats
              </Text>
              
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <Box textAlign="center">
                  <Icon as={FiCalendar} color="blue.500" boxSize={6} mb={2} />
                  <Text color="white" fontSize="lg" fontWeight="bold">
                    {breakdown?.breakdown?.workshops?.count || 0}
                  </Text>
                  <Text color="gray.400" fontSize="sm">
                    Workshops
                  </Text>
                </Box>
                
                <Box textAlign="center">
                  <Icon as={FiCode} color="purple.500" boxSize={6} mb={2} />
                  <Text color="white" fontSize="lg" fontWeight="bold">
                    {breakdown?.breakdown?.hackathons?.count || 0}
                  </Text>
                  <Text color="gray.400" fontSize="sm">
                    Hackathons
                  </Text>
                </Box>
                
                <Box textAlign="center">
                  <Icon as={FiCheckCircle} color="green.500" boxSize={6} mb={2} />
                  <Text color="white" fontSize="lg" fontWeight="bold">
                    {breakdown?.breakdown?.certifications?.count || 0}
                  </Text>
                  <Text color="gray.400" fontSize="sm">
                    Certifications
                  </Text>
                </Box>
                
                <Box textAlign="center">
                  <Icon as={FiStar} color="yellow.500" boxSize={6} mb={2} />
                  <Text color="white" fontSize="lg" fontWeight="bold">
                    {breakdown?.breakdown?.bonuses?.totalPoints || 0}
                  </Text>
                  <Text color="gray.400" fontSize="sm">
                    Bonus Points
                  </Text>
                </Box>
              </Grid>
            </VStack>
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default StudentPointsSummaryCards;