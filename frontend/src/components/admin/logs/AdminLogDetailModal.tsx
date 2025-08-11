import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Textarea,
} from '@chakra-ui/react';

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

interface AdminLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLog: ApiLog | null;
  cardBg: string;
  borderColor: string;
  getStatusCodeColor: (statusCode: number) => string;
  getMethodColor: (method: string) => string;
  formatDate: (dateString: string) => string;
  formatResponseTime: (time: number) => string;
}

const AdminLogDetailModal: React.FC<AdminLogDetailModalProps> = ({
  isOpen,
  onClose,
  selectedLog,
  cardBg,
  borderColor,
  getStatusCodeColor,
  getMethodColor,
  formatDate,
  formatResponseTime,
}) => {
  return (
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
  );
};

export default AdminLogDetailModal;