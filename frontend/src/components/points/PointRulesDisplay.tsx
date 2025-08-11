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
  useColorModeValue,
  Grid,
} from '@chakra-ui/react';
import { PointRule } from '../../types/points'; // Assuming PointRule is defined

interface PointRulesDisplayProps {
  rules: PointRule[];
}

const PointRulesDisplay: React.FC<PointRulesDisplayProps> = ({ rules }) => {
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  return (
    <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Heading size="md" color="white">
            Point Rules
          </Heading>
          
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
            {rules.map((rule: PointRule) => (
              <Box key={rule.key} p={3} bg="gray.700" borderRadius="md">
                <HStack justify="space-between" mb={2}>
                  <Text color="white" fontSize="sm" fontWeight="medium">
                    {rule.description}
                  </Text>
                  <Badge colorScheme="green" variant="subtle">
                    +{rule.value} pts
                  </Badge>
                </HStack>
              </Box>
            ))}
          </Grid>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default PointRulesDisplay;