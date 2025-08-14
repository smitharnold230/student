import React from 'react';
import {
  Box,
  VStack,
  Text,
  Card,
  CardBody,
  Grid,
  GridItem,
  Icon,
} from '@chakra-ui/react';
import { FiAlertCircle, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';

interface AdminLogSummaryStatsProps {
  totalRequests: number;
  successfulRequests: number;
  errorRequests: number;
  averageResponseTime: number;
  cardBg: string;
  borderColor: string;
  formatResponseTime: (time: number) => string;
}

const AdminLogSummaryStats: React.FC<AdminLogSummaryStatsProps> = ({
  totalRequests,
  successfulRequests,
  errorRequests,
  averageResponseTime,
  cardBg,
  borderColor,
  formatResponseTime,
}) => {
  return (
    <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={6}>
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={3}>
            <Icon as={FiCheckCircle} color="blue.500" boxSize={8} />
            <Text color="white" fontSize="2xl" fontWeight="bold">
              {totalRequests}
            </Text>
            <Text color="gray.400" fontSize="sm">
              Total Requests
            </Text>
          </VStack>
        </CardBody>
      </Card>

      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={3}>
            <Icon as={FiCheckCircle} color="green.500" boxSize={8} />
            <Text color="white" fontSize="2xl" fontWeight="bold">
              {successfulRequests}
            </Text>
            <Text color="gray.400" fontSize="sm">
              Successful
            </Text>
          </VStack>
        </CardBody>
      </Card>

      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={3}>
            <Icon as={FiAlertCircle} color="red.500" boxSize={8} />
            <Text color="white" fontSize="2xl" fontWeight="bold">
              {errorRequests}
            </Text>
            <Text color="gray.400" fontSize="sm">
              Errors
            </Text>
          </VStack>
        </CardBody>
      </Card>

      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={3}>
            <Icon as={FiRefreshCw} color="orange.500" boxSize={8} />
            <Text color="white" fontSize="2xl" fontWeight="bold">
              {formatResponseTime(averageResponseTime)}
            </Text>
            <Text color="gray.400" fontSize="sm">
              Avg Response Time
            </Text>
          </VStack>
        </CardBody>
      </Card>
    </Grid>
  );
};

export default AdminLogSummaryStats;
