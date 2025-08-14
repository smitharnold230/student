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
  Icon,
} from '@chakra-ui/react';
import { FiCode, FiAward } from 'react-icons/fi';

interface CodingStatsSummaryProps {
  totalProblemsSolved: number;
  activePlatformsCount: number;
}

const CodingStatsSummary: React.FC<CodingStatsSummaryProps> = ({
  totalProblemsSolved,
  activePlatformsCount,
}) => {
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  return (
    <HStack spacing={6} wrap="wrap">
      <Card
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        minW="200px"
      >
        <CardBody>
          <VStack spacing={3}>
            <Icon as={FiCode} color="brand.500" boxSize={8} />
            <Stat>
              <StatLabel color="gray.400" fontSize="sm">
                Total Problems Solved
              </StatLabel>
              <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                {totalProblemsSolved}
              </StatNumber>
              <StatHelpText color="gray.500" fontSize="xs">
                Across all platforms
              </StatHelpText>
            </Stat>
          </VStack>
        </CardBody>
      </Card>

      <Card
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        minW="200px"
      >
        <CardBody>
          <VStack spacing={3}>
            <Icon as={FiAward} color="purple.500" boxSize={8} />
            <Stat>
              <StatLabel color="gray.400" fontSize="sm">
                Active Platforms
              </StatLabel>
              <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                {activePlatformsCount}
              </StatNumber>
              <StatHelpText color="gray.500" fontSize="xs">
                Connected accounts
              </StatHelpText>
            </Stat>
          </VStack>
        </CardBody>
      </Card>
    </HStack>
  );
};

export default CodingStatsSummary;
