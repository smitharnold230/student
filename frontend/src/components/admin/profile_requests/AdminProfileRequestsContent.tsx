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
  FormControl,
  FormLabel,
  Textarea,
  Icon,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UseMutationResult } from '@tanstack/react-query';
import { FiUsers, FiCheck, FiX, FiEye, FiClock, FiUser } from 'react-icons/fi';

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

const adminNoteSchema = z.object({
  adminNote: z.string().max(500, 'Note too long').optional(),
});

type AdminNoteForm = z.infer<typeof adminNoteSchema>;

interface AdminProfileRequestsContentProps {
  requests: ProfileEditRequest[];
  selectedRequest: ProfileEditRequest | null;
  isModalOpen: boolean;
  onCloseModal: () => void;
  onViewRequest: (request: ProfileEditRequest) => void;
  approveRequestMutation: UseMutationResult<any, Error, { ticketId: string; status: 'APPROVED' | 'REJECTED'; adminNote?: string }, unknown>;
}

const AdminProfileRequestsContent: React.FC<AdminProfileRequestsContentProps> = ({
  requests,
  selectedRequest,
  isModalOpen,
  onCloseModal,
  onViewRequest,
  approveRequestMutation,
}) => {
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');
  const [actionStatus, setActionStatus] = React.useState<'APPROVED' | 'REJECTED' | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<AdminNoteForm>({
    resolver: zodResolver(adminNoteSchema),
    defaultValues: { adminNote: '' },
  });

  const currentAdminNote = watch('adminNote');

  React.useEffect(() => {
    if (selectedRequest) {
      reset({ adminNote: selectedRequest.adminNote || '' });
    }
  }, [selectedRequest, reset]);

  const handleApprove = () => {
    if (!selectedRequest) return;
    setActionStatus('APPROVED');
    approveRequestMutation.mutate({
      ticketId: selectedRequest.id,
      status: 'APPROVED',
      adminNote: (currentAdminNote ?? '').trim() || undefined,
    });
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    setActionStatus('REJECTED');
    approveRequestMutation.mutate({
      ticketId: selectedRequest.id,
      status: 'REJECTED',
      adminNote: (currentAdminNote ?? '').trim() || undefined,
    });
  };

  const handleCloseModal = () => {
    onCloseModal();
    reset({ adminNote: '' });
    setActionStatus(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'green';
      case 'REJECTED': return 'red';
      case 'PENDING': return 'yellow';
      default: return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
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
        {/* Other stats cards can be added here */}
      </Grid>

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
                          <Text color="white" fontWeight="medium">{request.userName || request.userEmail}</Text>
                          <Text color="gray.400" fontSize="xs">{request.userEmail}</Text>
                        </VStack>
                      </Td>
                      <Td><Text color="white" fontSize="sm">{getChangedFields(request.requestedData)}</Text></Td>
                      <Td><Badge colorScheme={getStatusColor(request.status)} variant="subtle" fontSize="xs">{request.status}</Badge></Td>
                      <Td><Text color="gray.400" fontSize="xs">{formatDate(request.createdAt)}</Text></Td>
                      <Td>
                        <Button size="xs" leftIcon={<FiEye />} colorScheme="blue" variant="outline" onClick={() => onViewRequest(request)}>
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
                <Text color="gray.400" textAlign="center">No profile edit requests found.</Text>
              </VStack>
            )}
          </VStack>
        </CardBody>
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="xl">
        <ModalOverlay />
        <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
          <ModalHeader color="white">Review Profile Edit Request</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            {selectedRequest && (
              <VStack spacing={6} align="stretch">
                <Box>
                  <Text color="gray.400" fontSize="sm" mb={2}>Student Information</Text>
                  <HStack spacing={4}>
                    <Icon as={FiUser} color="blue.500" boxSize={5} />
                    <VStack align="start" spacing={1}>
                      <Text color="white" fontWeight="medium">{selectedRequest.userName || 'Not provided'}</Text>
                      <Text color="gray.400" fontSize="sm">{selectedRequest.userEmail}</Text>
                    </VStack>
                  </HStack>
                </Box>
                <Box>
                  <Text color="gray.400" fontSize="sm" mb={3}>Requested Changes</Text>
                  <VStack spacing={3} align="stretch">
                    {Object.entries(selectedRequest.requestedData).map(([key, value]) => (
                      <HStack key={key} justify="space-between">
                        <Text color="gray.400" fontSize="sm" textTransform="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Text>
                        <Text color="white" fontSize="sm">{String(value)}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
                <FormControl isInvalid={!!errors.adminNote}>
                  <FormLabel color="gray.300">Admin Note (Optional)</FormLabel>
                  <Textarea
                    placeholder="Add a note for the student..."
                    {...register('adminNote')}
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    rows={3}
                  />
                  <FormErrorMessage>{errors.adminNote?.message}</FormErrorMessage>
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseModal}>Cancel</Button>
            {selectedRequest?.status === 'PENDING' && (
              <>
                <Button colorScheme="red" mr={3} onClick={handleSubmit(handleReject)} isLoading={approveRequestMutation.isPending} leftIcon={<FiX />}>Reject</Button>
                <Button colorScheme="green" onClick={handleSubmit(handleApprove)} isLoading={approveRequestMutation.isPending} leftIcon={<FiCheck />}>Approve</Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default AdminProfileRequestsContent;