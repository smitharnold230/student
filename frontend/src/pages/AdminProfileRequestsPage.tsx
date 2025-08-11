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
  Icon,
  Skeleton,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiUsers, FiCheck, FiX, FiEye, FiClock, FiUser } from 'react-icons/fi';
import { profileAPI } from '../services/api';

interface ProfileEditRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  requestedData: {
    name?: string;
    degree?: string;
    class?: string;
    status?: string;
    transport?: string;
    hostelInfo?: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  adminNote?: string;
}

const AdminProfileRequestsPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRequest, setSelectedRequest] = useState<ProfileEditRequest | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionStatus, setActionStatus] = useState<'APPROVED' | 'REJECTED' | null>(null);
  
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const { data: requestsResponse, isLoading } = useQuery({
    queryKey: ['profileRequests'],
    queryFn: () => profileAPI.getPendingRequests(),
  });

  const requests: ProfileEditRequest[] = requestsResponse?.data || [];

  const approveRequestMutation = useMutation({
    mutationFn: ({ ticketId, status, adminNote }: { ticketId: string; status: 'APPROVED' | 'REJECTED'; adminNote?: string }) =>
      profileAPI.approveRequest(ticketId, status, adminNote),
    onSuccess: () => {
      toast({
        title: 'Request processed',
        description: `Profile edit request has been ${actionStatus?.toLowerCase()}.`,
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['profileRequests'] });
      onClose();
      setSelectedRequest(null);
      setAdminNote('');
      setActionStatus(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Action failed',
        description: error.response?.data?.error || 'Failed to process request',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleViewRequest = (request: ProfileEditRequest) => {
    setSelectedRequest(request);
    setAdminNote('');
    setActionStatus(null);
    onOpen();
  };

  const handleApprove = () => {
    if (!selectedRequest) return;
    setActionStatus('APPROVED');
    approveRequestMutation.mutate({
      ticketId: selectedRequest.id,
      status: 'APPROVED',
      adminNote: adminNote.trim() || undefined,
    });
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    setActionStatus('REJECTED');
    approveRequestMutation.mutate({
      ticketId: selectedRequest.id,
      status: 'REJECTED',
      adminNote: adminNote.trim() || undefined,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'green';
      case 'REJECTED':
        return 'red';
      case 'PENDING':
        return 'yellow';
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
    });
  };

  const getChangedFields = (requestedData: any) => {
    const fields = [];
    if (requestedData.name) fields.push('Name');
    if (requestedData.degree) fields.push('Degree');
    if (requestedData.class) fields.push('Class');
    if (requestedData.status) fields.push('Status');
    if (requestedData.transport) fields.push('Transport');
    if (requestedData.hostelInfo) fields.push('Hostel Info');
    return fields.join(', ');
  };

  if (isLoading) {
    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            Profile Edit Requests
          </Heading>
          <Text color="gray.400">
            Review and manage student profile edit requests
          </Text>
        </Box>
        
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height="60px" width="full" />
              ))}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="lg" color="white" mb={2}>
          Profile Edit Requests
        </Heading>
        <Text color="gray.400">
          Review and manage student profile edit requests
        </Text>
      </Box>

      {/* Summary Stats */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={3}>
              <Icon as={FiClock} color="yellow.500" boxSize={8} />
              <Stat>
                <StatLabel color="gray.400" fontSize="sm">Pending Requests</StatLabel>
                <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                  {requests.filter(r => r.status === 'PENDING').length}
                </StatNumber>
                <StatHelpText color="gray.500" fontSize="xs">
                  Awaiting review
                </StatHelpText>
              </Stat>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={3}>
              <Icon as={FiCheck} color="green.500" boxSize={8} />
              <Stat>
                <StatLabel color="gray.400" fontSize="sm">Approved</StatLabel>
                <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                  {requests.filter(r => r.status === 'APPROVED').length}
                </StatNumber>
                <StatHelpText color="gray.500" fontSize="xs">
                  This month
                </StatHelpText>
              </Stat>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={3}>
              <Icon as={FiX} color="red.500" boxSize={8} />
              <Stat>
                <StatLabel color="gray.400" fontSize="sm">Rejected</StatLabel>
                <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                  {requests.filter(r => r.status === 'REJECTED').length}
                </StatNumber>
                <StatHelpText color="gray.500" fontSize="xs">
                  This month
                </StatHelpText>
              </Stat>
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Requests Table */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="white">
              All Requests
            </Heading>
            
            {requests.length > 0 ? (
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th color="gray.400">Student</Th>
                    <Th color="gray.400">Changes Requested</Th>
                    <Th color="gray.400">Status</Th>
                    <Th color="gray.400">Submitted</Th>
                    <Th color="gray.400">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {requests.map((request) => (
                    <Tr key={request.id}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text color="white" fontWeight="medium">
                            {request.userName || request.userEmail}
                          </Text>
                          <Text color="gray.400" fontSize="xs">
                            {request.userEmail}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text color="white" fontSize="sm">
                          {getChangedFields(request.requestedData)}
                        </Text>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={getStatusColor(request.status)}
                          variant="subtle"
                          fontSize="xs"
                        >
                          {request.status}
                        </Badge>
                      </Td>
                      <Td>
                        <Text color="gray.400" fontSize="xs">
                          {formatDate(request.createdAt)}
                        </Text>
                      </Td>
                      <Td>
                        <Button
                          size="xs"
                          leftIcon={<FiEye />}
                          colorScheme="blue"
                          variant="outline"
                          onClick={() => handleViewRequest(request)}
                        >
                          Review
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <VStack spacing={4}>
                <Icon as={FiUsers} color="gray.500" boxSize={12} />
                <Text color="gray.400" textAlign="center">
                  No profile edit requests found.
                </Text>
                <Text color="gray.500" fontSize="sm" textAlign="center">
                  Students will appear here when they submit edit requests.
                </Text>
              </VStack>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Review Request Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
          <ModalHeader color="white">Review Profile Edit Request</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            {selectedRequest && (
              <VStack spacing={6} align="stretch">
                {/* Student Info */}
                <Box>
                  <Text color="gray.400" fontSize="sm" mb={2}>Student Information</Text>
                  <HStack spacing={4}>
                    <Icon as={FiUser} color="blue.500" boxSize={5} />
                    <VStack align="start" spacing={1}>
                      <Text color="white" fontWeight="medium">
                        {selectedRequest.userName || 'Not provided'}
                      </Text>
                      <Text color="gray.400" fontSize="sm">
                        {selectedRequest.userEmail}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                {/* Requested Changes */}
                <Box>
                  <Text color="gray.400" fontSize="sm" mb={3}>Requested Changes</Text>
                  <VStack spacing={3} align="stretch">
                    {selectedRequest.requestedData.name && (
                      <HStack justify="space-between">
                        <Text color="gray.400" fontSize="sm">Name</Text>
                        <Text color="white" fontSize="sm">{selectedRequest.requestedData.name}</Text>
                      </HStack>
                    )}
                    {selectedRequest.requestedData.degree && (
                      <HStack justify="space-between">
                        <Text color="gray.400" fontSize="sm">Degree</Text>
                        <Text color="white" fontSize="sm">{selectedRequest.requestedData.degree}</Text>
                      </HStack>
                    )}
                    {selectedRequest.requestedData.class && (
                      <HStack justify="space-between">
                        <Text color="gray.400" fontSize="sm">Class</Text>
                        <Text color="white" fontSize="sm">{selectedRequest.requestedData.class}</Text>
                      </HStack>
                    )}
                    {selectedRequest.requestedData.status && (
                      <HStack justify="space-between">
                        <Text color="gray.400" fontSize="sm">Status</Text>
                        <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                          {selectedRequest.requestedData.status}
                        </Badge>
                      </HStack>
                    )}
                    {selectedRequest.requestedData.transport && (
                      <HStack justify="space-between">
                        <Text color="gray.400" fontSize="sm">Transport</Text>
                        <Text color="white" fontSize="sm">{selectedRequest.requestedData.transport}</Text>
                      </HStack>
                    )}
                    {selectedRequest.requestedData.hostelInfo && (
                      <HStack justify="space-between">
                        <Text color="gray.400" fontSize="sm">Hostel Info</Text>
                        <Text color="white" fontSize="sm">{selectedRequest.requestedData.hostelInfo}</Text>
                      </HStack>
                    )}
                  </VStack>
                </Box>

                {/* Admin Note */}
                <FormControl>
                  <FormLabel color="gray.300">Admin Note (Optional)</FormLabel>
                  <Textarea
                    placeholder="Add a note for the student..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _placeholder={{ color: 'gray.400' }}
                    rows={3}
                  />
                </FormControl>

                {/* Request Info */}
                <Box>
                  <Text color="gray.400" fontSize="sm" mb={2}>Request Information</Text>
                  <VStack spacing={2} align="start">
                    <Text color="gray.400" fontSize="xs">
                      Submitted: {formatDate(selectedRequest.createdAt)}
                    </Text>
                    <Text color="gray.400" fontSize="xs">
                      Status: <Badge colorScheme={getStatusColor(selectedRequest.status)} variant="subtle" fontSize="xs">
                        {selectedRequest.status}
                      </Badge>
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            {selectedRequest?.status === 'PENDING' && (
              <>
                <Button
                  colorScheme="red"
                  mr={3}
                  onClick={handleReject}
                  isLoading={approveRequestMutation.isPending}
                  leftIcon={<FiX />}
                >
                  Reject
                </Button>
                <Button
                  colorScheme="green"
                  onClick={handleApprove}
                  isLoading={approveRequestMutation.isPending}
                  leftIcon={<FiCheck />}
                >
                  Approve
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default AdminProfileRequestsPage; 