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
  Grid,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { FiAlertCircle, FiCheckCircle, FiClock, FiUsers } from 'react-icons/fi';

interface ProfileRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  requestedData: any;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  adminNote?: string;
}

interface AdminSystemHealthAndAlertsProps {
  systemStats: { pendingCertifications: number };
  profileRequests: ProfileRequest[];
  cardBg: string;
  borderColor: string;
}

const AdminSystemHealthAndAlerts: React.FC<AdminSystemHealthAndAlertsProps> = ({
  systemStats,
  profileRequests,
  cardBg,
  borderColor,
}) => {
  return (
    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="white">
              System Health
            </Heading>

            <VStack spacing={3} align="stretch">
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text color="gray.400" fontSize="sm">
                    Database
                  </Text>
                  <Badge colorScheme="green" variant="subtle" fontSize="xs">
                    Healthy
                  </Badge>
                </HStack>
                <Progress value={95} colorScheme="green" size="sm" />
              </Box>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text color="gray.400" fontSize="sm">
                    API Performance
                  </Text>
                  <Badge colorScheme="green" variant="subtle" fontSize="xs">
                    Optimal
                  </Badge>
                </HStack>
                <Progress value={88} colorScheme="green" size="sm" />
              </Box>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text color="gray.400" fontSize="sm">
                    Storage
                  </Text>
                  <Badge colorScheme="yellow" variant="subtle" fontSize="xs">
                    Moderate
                  </Badge>
                </HStack>
                <Progress value={65} colorScheme="yellow" size="sm" />
              </Box>
            </VStack>
          </VStack>
        </CardBody>
      </Card>

      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="white">
              Alerts & Notifications
            </Heading>

            <VStack spacing={3} align="stretch">
              {systemStats.pendingCertifications > 0 && (
                <HStack spacing={3} p={3} bg="yellow.900" borderRadius="md">
                  <Icon as={FiAlertCircle} color="yellow.500" boxSize={5} />
                  <VStack align="start" spacing={1}>
                    <Text color="white" fontSize="sm" fontWeight="medium">
                      {systemStats.pendingCertifications} pending certifications
                    </Text>
                    <Text color="yellow.200" fontSize="xs">
                      Requires attention
                    </Text>
                  </VStack>
                </HStack>
              )}

              {profileRequests.filter((r) => r.status === 'PENDING').length >
                0 && (
                <HStack spacing={3} p={3} bg="blue.900" borderRadius="md">
                  <Icon as={FiUsers} color="blue.500" boxSize={5} />
                  <VStack align="start" spacing={1}>
                    <Text color="white" fontSize="sm" fontWeight="medium">
                      {
                        profileRequests.filter((r) => r.status === 'PENDING')
                          .length
                      }{' '}
                      pending profile requests
                    </Text>
                    <Text color="blue.200" fontSize="xs">
                      Review student edit requests
                    </Text>
                  </VStack>
                </HStack>
              )}

              <HStack spacing={3} p={3} bg="blue.900" borderRadius="md">
                <Icon as={FiClock} color="blue.500" boxSize={5} />
                <VStack align="start" spacing={1}>
                  <Text color="white" fontSize="sm" fontWeight="medium">
                    Weekly report due
                  </Text>
                  <Text color="blue.200" fontSize="xs">
                    Generate by Friday
                  </Text>
                </VStack>
              </HStack>

              <HStack spacing={3} p={3} bg="green.900" borderRadius="md">
                <Icon as={FiCheckCircle} color="green.500" boxSize={5} />
                <VStack align="start" spacing={1}>
                  <Text color="white" fontSize="sm" fontWeight="medium">
                    System backup completed
                  </Text>
                  <Text color="green.200" fontSize="xs">
                    All data secured
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    </Grid>
  );
};

export default AdminSystemHealthAndAlerts;
