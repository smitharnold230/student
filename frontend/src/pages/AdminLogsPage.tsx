import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  CardBody,
  Button,
  Badge,
  useToast,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Input,
  Icon,
  Skeleton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea,
  Grid,
} from '@chakra-ui/react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FiDownload, FiEye, FiFilter, FiRefreshCw, FiSearch, FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';
import { adminAPI } from '../services/api';

interface ApiLog {
  id: string;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  userAgent: string;
  requestBody?: string;
  responseBody?: string;
}

const AdminLogsPage: React.FC = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null);
  const [filters, setFilters] = useState({
    method: '',
    statusCode: '',
    endpoint: '',
  });
  
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const { data: logsResponse, isLoading, refetch } = useQuery({
    queryKey: ['adminLogs', filters],
    queryFn: () => adminAPI.getLogs(filters),
  });

  const logs: ApiLog[] = logsResponse?.data || [];

  const exportLogsMutation = useMutation({
    mutationFn: () => adminAPI.exportLogs(),
    onSuccess: () => {
      toast({
        title: 'Logs exported',
        description: 'API logs have been exported successfully.',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Export failed',
        description: error.response?.data?.error || 'Failed to export logs',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleViewLog = (log: ApiLog) => {
    setSelectedLog(log);
    onOpen();
  };

  const handleExport = () => {
    exportLogsMutation.mutate();
  };

  const handleRefresh = () => {
    refetch();
  };

  const getStatusCodeColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'green';
    if (statusCode >= 400 && statusCode < 500) return 'yellow';
    if (statusCode >= 500) return 'red';
    return 'gray';
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'blue';
      case 'POST':
        return 'green';
      case 'PUT':
        return 'orange';
      case 'DELETE':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatResponseTime = (time: number) => {
    return `${time}ms`;
  };

  const totalRequests = logs.length;
  const successfulRequests = logs.filter(log => log.statusCode >= 200 && log.statusCode < 300).length;
  const errorRequests = logs.filter(log => log.statusCode >= 400).length;
  const averageResponseTime = logs.length > 0 
    ? Math.round(logs.reduce((sum, log) => sum + log.responseTime, 0) / logs.length)
    : 0;

  if (isLoading) {
    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            API Logs
          </Heading>
          <Text color="gray.400">
            Monitor system API requests and responses
          </Text>
        </Box>
        
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4}>
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} height="60px" w="full" />
              ))}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            API Logs
          </Heading>
          <Text color="gray.400">
            Monitor system API requests and responses
          </Text>
        </Box>
        
        <HStack spacing={3}>
          <Button
            leftIcon={<FiRefreshCw />}
            colorScheme="brand"
            variant="outline"
            onClick={handleRefresh}
            isLoading={isLoading}
          >
            Refresh
          </Button>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="brand"
            onClick={handleExport}
            isLoading={exportLogsMutation.isPending}
          >
            Export Logs
          </Button>
        </HStack>
      </HStack>

      {/* Summary Stats */}
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

      {/* Filters */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="white">
              Filters
            </Heading>
            
            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
              <FormControl>
                <FormLabel color="gray.300">HTTP Method</FormLabel>
                <Select
                  placeholder="All methods"
                  value={filters.method}
                  onChange={(e) => setFilters({ ...filters, method: e.target.value })}
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color="gray.300">Status Code</FormLabel>
                <Select
                  placeholder="All status codes"
                  value={filters.statusCode}
                  onChange={(e) => setFilters({ ...filters, statusCode: e.target.value })}
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                >
                  <option value="200">200 - OK</option>
                  <option value="201">201 - Created</option>
                  <option value="400">400 - Bad Request</option>
                  <option value="401">401 - Unauthorized</option>
                  <option value="404">404 - Not Found</option>
                  <option value="500">500 - Server Error</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color="gray.300">Endpoint</FormLabel>
                <Input
                  placeholder="Filter by endpoint"
                  value={filters.endpoint}
                  onChange={(e) => setFilters({ ...filters, endpoint: e.target.value })}
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.400' }}
                />
              </FormControl>
            </Grid>
          </VStack>
        </CardBody>
      </Card>

      {/* Logs Table */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="white">
              API Requests ({logs.length})
            </Heading>
            
            {logs.length > 0 ? (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th color="gray.400">Method</Th>
                      <Th color="gray.400">Endpoint</Th>
                      <Th color="gray.400">Status</Th>
                      <Th color="gray.400">Response Time</Th>
                      <Th color="gray.400">User</Th>
                      <Th color="gray.400">Timestamp</Th>
                      <Th color="gray.400">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {logs.map((log) => (
                      <Tr key={log.id}>
                        <Td>
                          <Badge
                            colorScheme={getMethodColor(log.method)}
                            variant="subtle"
                            fontSize="xs"
                          >
                            {log.method}
                          </Badge>
                        </Td>
                        <Td color="white" fontSize="sm">
                          {log.endpoint}
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={getStatusCodeColor(log.statusCode)}
                            variant="subtle"
                            fontSize="xs"
                          >
                            {log.statusCode}
                          </Badge>
                        </Td>
                        <Td color="gray.300" fontSize="sm">
                          {formatResponseTime(log.responseTime)}
                        </Td>
                        <Td color="gray.300" fontSize="sm">
                          {log.userEmail || 'Anonymous'}
                        </Td>
                        <Td color="gray.300" fontSize="sm">
                          {formatDate(log.timestamp)}
                        </Td>
                        <Td>
                          <Button
                            size="xs"
                            colorScheme="brand"
                            variant="ghost"
                            onClick={() => handleViewLog(log)}
                          >
                            <Icon as={FiEye} />
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <VStack spacing={4}>
                <Icon as={FiSearch} color="gray.500" boxSize={12} />
                <Text color="gray.400" textAlign="center">
                  No logs found matching the current filters.
                </Text>
                <Text color="gray.500" fontSize="sm" textAlign="center">
                  Try adjusting your filters or check back later.
                </Text>
              </VStack>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Log Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
          <ModalHeader color="white">API Log Details</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            {selectedLog && (
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Badge
                    colorScheme={getMethodColor(selectedLog.method)}
                    variant="subtle"
                    fontSize="sm"
                  >
                    {selectedLog.method}
                  </Badge>
                  <Badge
                    colorScheme={getStatusCodeColor(selectedLog.statusCode)}
                    variant="subtle"
                    fontSize="sm"
                  >
                    {selectedLog.statusCode}
                  </Badge>
                </HStack>

                <Box>
                  <Text color="gray.400" fontSize="sm" mb={1}>
                    Endpoint
                  </Text>
                  <Text color="white" fontSize="sm">
                    {selectedLog.endpoint}
                  </Text>
                </Box>

                <Box>
                  <Text color="gray.400" fontSize="sm" mb={1}>
                    Response Time
                  </Text>
                  <Text color="white" fontSize="sm">
                    {formatResponseTime(selectedLog.responseTime)}
                  </Text>
                </Box>

                <Box>
                  <Text color="gray.400" fontSize="sm" mb={1}>
                    User
                  </Text>
                  <Text color="white" fontSize="sm">
                    {selectedLog.userEmail || 'Anonymous'}
                  </Text>
                </Box>

                <Box>
                  <Text color="gray.400" fontSize="sm" mb={1}>
                    IP Address
                  </Text>
                  <Text color="white" fontSize="sm">
                    {selectedLog.ipAddress}
                  </Text>
                </Box>

                <Box>
                  <Text color="gray.400" fontSize="sm" mb={1}>
                    User Agent
                  </Text>
                  <Text color="white" fontSize="sm">
                    {selectedLog.userAgent}
                  </Text>
                </Box>

                <Box>
                  <Text color="gray.400" fontSize="sm" mb={1}>
                    Timestamp
                  </Text>
                  <Text color="white" fontSize="sm">
                    {formatDate(selectedLog.timestamp)}
                  </Text>
                </Box>

                {selectedLog.requestBody && (
                  <Box>
                    <Text color="gray.400" fontSize="sm" mb={1}>
                      Request Body
                    </Text>
                    <Textarea
                      value={selectedLog.requestBody}
                      isReadOnly
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      fontSize="xs"
                      rows={4}
                    />
                  </Box>
                )}

                {selectedLog.responseBody && (
                  <Box>
                    <Text color="gray.400" fontSize="sm" mb={1}>
                      Response Body
                    </Text>
                    <Textarea
                      value={selectedLog.responseBody}
                      isReadOnly
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      fontSize="xs"
                      rows={4}
                    />
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default AdminLogsPage; 