import React from 'react';
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Icon,
} from '@chakra-ui/react';
import { FiEye, FiSearch } from 'react-icons/fi';

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

interface AdminLogTableProps {
  logs: ApiLog[];
  handleViewLog: (log: ApiLog) => void;
  getStatusCodeColor: (statusCode: number) => string;
  getMethodColor: (method: string) => string;
  formatDate: (dateString: string) => string;
  formatResponseTime: (time: number) => string;
  cardBg: string;
  borderColor: string;
}

const AdminLogTable: React.FC<AdminLogTableProps> = ({
  logs,
  handleViewLog,
  getStatusCodeColor,
  getMethodColor,
  formatDate,
  formatResponseTime,
  cardBg,
  borderColor,
}) => {
  return (
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
  );
};

export default AdminLogTable;
