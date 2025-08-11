import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Icon,
} from '@chakra-ui/react';
import { FiAward, FiCheck, FiX } from 'react-icons/fi';
import { Certification } from '../../types/certification';
import { UseMutationResult } from '@tanstack/react-query';

interface CertificationTableProps {
  certifications: Certification[];
  userRole: string | null;
  onVerify: (submissionId: string, status: 'APPROVED' | 'REJECTED') => void;
  verifyMutation: UseMutationResult<any, Error, { submissionId: string; status: string }, unknown>;
}

const CertificationTable: React.FC<CertificationTableProps> = ({
  certifications,
  userRole,
  onVerify,
  verifyMutation,
}) => {
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

  return (
    <VStack spacing={4} align="stretch">
      <Heading size="md" color="white">
        {userRole === 'ADMIN' ? 'Pending Verifications' : 'My Certifications'}
      </Heading>

      {certifications.length > 0 ? (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th color="gray.400">Event</Th>
              {userRole === 'ADMIN' && <Th color="gray.400">Student</Th>}
              <Th color="gray.400">File</Th>
              <Th color="gray.400">Status</Th>
              <Th color="gray.400">Submitted</Th>
              {userRole === 'ADMIN' && <Th color="gray.400">Actions</Th>}
            </Tr>
          </Thead>
          <Tbody>
            {certifications.map((cert) => (
              <Tr key={cert.id}>
                <Td color="white">{cert.Event?.name || 'N/A'}</Td>
                {userRole === 'ADMIN' && (
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
                {userRole === 'ADMIN' && cert.status === 'PENDING' && (
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        size="xs"
                        colorScheme="green"
                        onClick={() => onVerify(cert.id, 'APPROVED')}
                        isLoading={verifyMutation.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        size="xs"
                        colorScheme="red"
                        onClick={() => onVerify(cert.id, 'REJECTED')}
                        isLoading={verifyMutation.isPending}
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
            {userRole === 'ADMIN' 
              ? 'No pending certifications to verify.'
              : 'No certifications uploaded yet.'
            }
          </Text>
          {userRole === 'STUDENT' && (
            <Text color="gray.500" fontSize="sm" textAlign="center">
              Upload your first certification to get started!
            </Text>
          )}
        </VStack>
      )}
    </VStack>
  );
};

export default CertificationTable;