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
  useToast,
  useColorModeValue,
  useDisclosure,
  Grid,
  GridItem,
  Icon,
  Skeleton,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiAward, FiUpload, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { certificationAPI, eventAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { AxiosProgressEvent } from 'axios';
import { Event } from '../types/event';
import { Certification } from '../types/certification';
import UploadCertificationModal from '../components/certifications/UploadCertificationModal';
import CertificationTable from '../components/certifications/CertificationTable';

const CertificationsPage: React.FC = () => {
  const { user } = useAuthStore();
  const toast = useToast();
  const queryClient = useQueryClient();
  const {
    isOpen: isUploadModalOpen,
    onOpen: onUploadModalOpen,
    onClose: onUploadModalClose,
  } = useDisclosure();
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const { data: certificationsResponse, isLoading } = useQuery({
    queryKey: ['certifications'],
    queryFn: () =>
      user?.role === 'ADMIN'
        ? certificationAPI.getPending()
        : certificationAPI.getUserCertifications(),
  });

  const { data: eventsResponse } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventAPI.getEvents(),
  });

  const certifications: Certification[] = certificationsResponse?.data || [];
  const events: Event[] = eventsResponse?.data || [];

  const uploadCertificationMutation = useMutation({
    mutationFn: (data: { eventId: string; file: File }) => {
      return certificationAPI.upload(
        data.eventId,
        data.file,
        (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(
              Math.round((progressEvent.loaded * 100) / progressEvent.total),
            );
          }
        },
      );
    },
    onSuccess: () => {
      setUploadProgress(0);
      toast({
        title: 'Certification uploaded',
        description: 'Your certification has been uploaded successfully.',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['certifications'] });
      onUploadModalClose();
    },
    onError: (error: any) => {
      setUploadProgress(0);
      toast({
        title: 'Upload failed',
        description:
          error.response?.data?.error || 'Failed to upload certification',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const verifyCertificationMutation = useMutation({
    mutationFn: ({
      submissionId,
      status,
    }: {
      submissionId: string;
      status: string;
    }) => certificationAPI.verify(submissionId, status),
    onSuccess: () => {
      toast({
        title: 'Certification verified',
        description: 'The certification has been verified successfully.',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['certifications'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Verification failed',
        description:
          error.response?.data?.error || 'Failed to verify certification',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleVerify = (
    submissionId: string,
    status: 'APPROVED' | 'REJECTED',
  ) => {
    verifyCertificationMutation.mutate({ submissionId, status });
  };

  const pendingCount = certifications.filter(
    (cert) => cert.status === 'PENDING',
  ).length;
  const approvedCount = certifications.filter(
    (cert) => cert.status === 'APPROVED',
  ).length;
  const rejectedCount = certifications.filter(
    (cert) => cert.status === 'REJECTED',
  ).length;

  if (isLoading) {
    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            Certifications
          </Heading>
          <Text color="gray.400">
            Upload and manage your event certifications
          </Text>
        </Box>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
          {[...Array(3)].map((_, i) => (
            <GridItem key={i}>
              <Skeleton height="120px" />
            </GridItem>
          ))}
        </Grid>
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            Certifications
          </Heading>
          <Text color="gray.400">
            Upload and manage your event certifications
          </Text>
        </Box>

        {user?.role === 'STUDENT' && (
          <Button
            leftIcon={<FiUpload />}
            colorScheme="brand"
            onClick={onUploadModalOpen}
          >
            Upload Certification
          </Button>
        )}
      </HStack>

      {/* Summary Stats */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
        <GridItem>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={3}>
                <Icon as={FiClock} color="yellow.500" boxSize={8} />
                <Text color="white" fontSize="2xl" fontWeight="bold">
                  {pendingCount}
                </Text>
                <Text color="gray.400" fontSize="sm">
                  Pending
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={3}>
                <Icon as={FiCheck} color="green.500" boxSize={8} />
                <Text color="white" fontSize="2xl" fontWeight="bold">
                  {approvedCount}
                </Text>
                <Text color="gray.400" fontSize="sm">
                  Approved
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={3}>
                <Icon as={FiX} color="red.500" boxSize={8} />
                <Text color="white" fontSize="2xl" fontWeight="bold">
                  {rejectedCount}
                </Text>
                <Text color="gray.400" fontSize="sm">
                  Rejected
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Certifications Table */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <CertificationTable
            certifications={certifications}
            userRole={user?.role || null}
            onVerify={handleVerify}
            verifyMutation={verifyCertificationMutation}
          />
        </CardBody>
      </Card>

      <UploadCertificationModal
        isOpen={isUploadModalOpen}
        onClose={onUploadModalClose}
        events={events}
        uploadMutation={uploadCertificationMutation}
        uploadProgress={uploadProgress}
        setUploadProgress={setUploadProgress}
      />
    </VStack>
  );
};

export default CertificationsPage;
