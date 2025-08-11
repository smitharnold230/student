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
  Input,
  Select,
  Grid,
  GridItem,
  Icon,
  Skeleton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  FormErrorMessage,
  Progress,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiAward, FiUpload, FiCheck, FiX, FiClock, FiPlus } from 'react-icons/fi';
import { certificationAPI, eventAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosProgressEvent } from 'axios';

interface Certification {
  id: string;
  eventId: string;
  fileUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string; // Renamed from submittedAt for consistency
  updatedAt: string; // Added for consistency
  verifiedById?: string; // Added for consistency
  // For admin view, these come from includes
  Profile?: {
    name: string;
    class: string;
    batch: string;
    userId: string;
    User?: {
      email: string;
    };
  };
  Event?: {
    name: string;
  };
}

interface Event {
  id: string;
  name: string;
  type: 'WORKSHOP' | 'HACKATHON';
  date: string;
  organizer: string;
  url: string;
  link: string;
  certificationDeadline?: string;
}

const uploadCertificationSchema = z.object({
  eventId: z.string().min(1, 'Event is required'),
  file: z
    .any()
    .refine((file) => file instanceof File, 'File is required')
    .refine((file) => file && file.type === 'application/pdf', 'Only PDF files are allowed')
    .refine((file) => file && file.size <= 10 * 1024 * 1024, 'File must be less than 10MB'),
});

type UploadCertificationForm = z.infer<typeof uploadCertificationSchema>;

const CertificationsPage: React.FC = () => {
  const { user } = useAuthStore();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const { data: certificationsResponse, isLoading } = useQuery({
    queryKey: ['certifications'],
    queryFn: () => user?.role === 'ADMIN' ? certificationAPI.getPending() : certificationAPI.getUserCertifications(),
  });

  const { data: eventsResponse } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventAPI.getEvents(),
  });

  const certifications: Certification[] = certificationsResponse?.data || [];
  const events: Event[] = eventsResponse?.data || [];

  const uploadCertificationMutation = useMutation({
    mutationFn: (data: UploadCertificationForm) => {
      if (!data.file) {
        throw new Error('Please select a file');
      }
      return certificationAPI.upload(data.eventId, data.file, (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      });
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
      onClose();
      reset();
    },
    onError: (error: any) => {
      setUploadProgress(0);
      toast({
        title: 'Upload failed',
        description: error.response?.data?.error || 'Failed to upload certification',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const verifyCertificationMutation = useMutation({
    mutationFn: ({ submissionId, status }: { submissionId: string; status: string }) =>
      certificationAPI.verify(submissionId, status),
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
        description: error.response?.data?.error || 'Failed to verify certification',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<UploadCertificationForm>({
    resolver: zodResolver(uploadCertificationSchema),
    defaultValues: { eventId: '', file: undefined },
  });

  const handleUpload = (data: UploadCertificationForm) => {
    uploadCertificationMutation.mutate(data);
  };

  const handleVerify = (submissionId: string, status: 'APPROVED' | 'REJECTED') => {
    verifyCertificationMutation.mutate({ submissionId, status });
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
    });
  };

  const pendingCount = certifications.filter(cert => cert.status === 'PENDING').length;
  const approvedCount = certifications.filter(cert => cert.status === 'APPROVED').length;
  const rejectedCount = certifications.filter(cert => cert.status === 'REJECTED').length;

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
            onClick={onOpen}
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
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="white">
              {user?.role === 'ADMIN' ? 'Pending Verifications' : 'My Certifications'}
            </Heading>

            {certifications.length > 0 ? (
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th color="gray.400">Event</Th>
                    {user?.role === 'ADMIN' && <Th color="gray.400">Student</Th>}
                    <Th color="gray.400">File</Th>
                    <Th color="gray.400">Status</Th>
                    <Th color="gray.400">Submitted</Th>
                    {user?.role === 'ADMIN' && <Th color="gray.400">Actions</Th>}
                  </Tr>
                </Thead>
                <Tbody>
                  {certifications.map((cert) => (
                    <Tr key={cert.id}>
                      <Td color="white">{cert.Event?.name || 'N/A'}</Td>
                      {user?.role === 'ADMIN' && (
                        <Td>
                          <VStack align="start" spacing={0}>
                            <Text color="white" fontWeight="medium">
                              {cert.Profile?.name || 'N/A'}
                            </Text>
                            <Text color="gray.400" fontSize="xs">
                              {cert.Profile?.User?.email || 'N/A'}
                            </Text>
                          </VStack>
                        </Td>
                      )}
                      <Td>
                        <Button
                          size="xs"
                          colorScheme="blue"
                          variant="outline"
                          onClick={() => window.open(`http://localhost:4000${cert.fileUrl}`, '_blank')}
                        >
                          View PDF
                        </Button>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={getStatusColor(cert.status)}
                          variant="subtle"
                          fontSize="sm"
                        >
                          {cert.status}
                        </Badge>
                      </Td>
                      <Td color="gray.300" fontSize="sm">
                        {formatDate(cert.createdAt)}
                      </Td>
                      {user?.role === 'ADMIN' && cert.status === 'PENDING' && (
                        <Td>
                          <HStack spacing={2}>
                            <Button
                              size="xs"
                              colorScheme="green"
                              onClick={() => handleVerify(cert.id, 'APPROVED')}
                              isLoading={verifyCertificationMutation.isPending}
                            >
                              Approve
                            </Button>
                            <Button
                              size="xs"
                              colorScheme="red"
                              onClick={() => handleVerify(cert.id, 'REJECTED')}
                              isLoading={verifyCertificationMutation.isPending}
                            >
                              Reject
                            </Button>
                          </HStack>
                        </Td>
                      )}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <VStack spacing={4}>
                <Icon as={FiAward} color="gray.500" boxSize={12} />
                <Text color="gray.400" textAlign="center">
                  {user?.role === 'ADMIN' 
                    ? 'No pending certifications to verify.'
                    : 'No certifications uploaded yet.'
                  }
                </Text>
                {user?.role === 'STUDENT' && (
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    Upload your first certification to get started!
                  </Text>
                )}
              </VStack>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Upload Certification Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
          <ModalHeader color="white">Upload Certification</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <VStack spacing={4} as="form" id="upload-cert-form" onSubmit={handleSubmit(handleUpload)}>
              <FormControl isInvalid={!!errors.eventId} isRequired>
                <FormLabel color="gray.300">Event</FormLabel>
                <Select
                  placeholder="Select event"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  {...register('eventId')}
                >
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.eventId?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.file} isRequired>
                <FormLabel color="gray.300">Certification PDF File</FormLabel>
                <Input
                  type="file"
                  accept=".pdf"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.400' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.type !== 'application/pdf') {
                        toast({
                          title: 'Invalid file type',
                          description: 'Only PDF files are allowed.',
                          status: 'error',
                          duration: 4000,
                        });
                        setValue('file', undefined);
                        return;
                      }
                      if (file.size > 10 * 1024 * 1024) {
                        toast({
                          title: 'File too large',
                          description: 'File must be less than 10MB.',
                          status: 'error',
                          duration: 4000,
                        });
                        setValue('file', undefined);
                        return;
                      }
                      setValue('file', file);
                    }
                  }}
                />
                <Text color="gray.400" fontSize="xs" mt={1}>
                  Only PDF files are allowed (max 10MB)
                </Text>
                <FormErrorMessage>{String(errors.file?.message || '')}</FormErrorMessage>
              </FormControl>
              {uploadProgress > 0 && (
                <Progress value={uploadProgress} size="sm" colorScheme="green" mt={2} />
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              type="submit"
              form="upload-cert-form"
              isLoading={uploadCertificationMutation.isPending}
              isDisabled={uploadCertificationMutation.isPending || uploadProgress > 0}
            >
              Upload Certification
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default CertificationsPage;