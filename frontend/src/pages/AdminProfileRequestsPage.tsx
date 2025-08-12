import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Heading,
  useToast,
  useDisclosure,
  Skeleton,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileAPI } from '../services/api';
import AdminProfileRequestsContent from '../components/admin/profile_requests/AdminProfileRequestsContent';

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

  const { data: requestsResponse, isLoading } = useQuery({
    queryKey: ['profileRequests'],
    queryFn: () => profileAPI.getPendingRequests(),
  });

  const requests: ProfileEditRequest[] = requestsResponse?.data || [];

  const approveRequestMutation = useMutation({
    mutationFn: ({ ticketId, status, adminNote }: { ticketId: string; status: 'APPROVED' | 'REJECTED'; adminNote?: string }) =>
      profileAPI.approveRequest(ticketId, status, adminNote),
    onSuccess: (data, variables) => {
      toast({
        title: 'Request processed',
        description: `Profile edit request has been ${variables.status.toLowerCase()}.`,
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['profileRequests'] });
      onClose();
      setSelectedRequest(null);
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
    onOpen();
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
        <Skeleton height="120px" />
        <Skeleton height="300px" />
      </VStack>
    );
  }

  return (
    <AdminProfileRequestsContent
      requests={requests}
      selectedRequest={selectedRequest}
      isModalOpen={isOpen}
      onCloseModal={onClose}
      onViewRequest={handleViewRequest}
      approveRequestMutation={approveRequestMutation}
    />
  );
};

export default AdminProfileRequestsPage;