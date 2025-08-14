import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  useToast,
  useDisclosure,
} from '@chakra-ui/react';
import { UseMutationResult } from '@tanstack/react-query';
import { FiRefreshCw } from 'react-icons/fi';
import AdminEligibilityStats from './AdminEligibilityStats';
import AdminEligibilityTable from './AdminEligibilityTable';
import AssignBatchModal from './AssignBatchModal';

interface EligibilityData {
  eligible: boolean;
  workshops: number;
  hackathons: number;
  leetcode: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  batch: string;
  eligibility?: EligibilityData;
}

interface EligibilityAdminViewProps {
  students: Student[];
  studentsLoading: boolean;
  refetchStudents: () => void;
  assignAllEligibleBatchesMutation: UseMutationResult<
    any,
    Error,
    void,
    unknown
  >;
  assignBatchMutation: UseMutationResult<
    any,
    Error,
    { userId: string; batch: string; auto: boolean },
    unknown
  >;
  cardBg: string;
  borderColor: string;
  getEligibilityColor: (eligible: boolean) => string;
  getEligibilityIcon: (eligible: boolean) => React.ElementType;
  getBatchColor: (batch: string) => string;
  BATCHES: string[];
}

const EligibilityAdminView: React.FC<EligibilityAdminViewProps> = ({
  students,
  studentsLoading,
  refetchStudents,
  assignAllEligibleBatchesMutation,
  assignBatchMutation,
  cardBg,
  borderColor,
  getEligibilityColor,
  getEligibilityIcon,
  getBatchColor,
  BATCHES,
}) => {
  const toast = useToast();
  const {
    isOpen: isAssignModalOpen,
    onOpen: onAssignModalOpen,
    onClose: onAssignModalClose,
  } = useDisclosure();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string>('SERVICE_C3');
  const [isAutoAssign, setIsAutoAssign] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAssignBatchClick = (student: Student) => {
    setSelectedStudent(student);
    setSelectedBatch(student.batch || 'SERVICE_C3'); // Pre-fill with current batch or default
    setIsAutoAssign(true); // Default to auto-assign
    onAssignModalOpen();
  };

  const handleAssignBatch = () => {
    if (!selectedStudent) return;

    assignBatchMutation.mutate(
      {
        userId: selectedStudent.id,
        batch: selectedBatch,
        auto: isAutoAssign,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Batch Assigned',
            description: 'Student batch has been assigned successfully.',
            status: 'success',
            duration: 3000,
          });
          onAssignModalClose();
          refetchStudents(); // Refetch students to update table
        },
        onError: (error: any) => {
          toast({
            title: 'Assignment Failed',
            description:
              error.response?.data?.error || 'Failed to assign batch',
            status: 'error',
            duration: 5000,
          });
        },
      },
    );
  };

  const handleAssignAllEligible = () => {
    assignAllEligibleBatchesMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: 'Batch Assignment Triggered',
          description:
            'Batch assignment process for all eligible students has been initiated.',
          status: 'success',
          duration: 5000,
        });
        refetchStudents();
      },
      onError: (error: any) => {
        toast({
          title: 'Batch Assignment Failed',
          description:
            error.response?.data?.error || 'Failed to trigger batch assignment',
          status: 'error',
          duration: 5000,
        });
      },
    });
  };

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            Eligibility Management
          </Heading>
          <Text color="gray.400">
            Manage student eligibility and batch assignments
          </Text>
        </Box>
        <Button
          leftIcon={<FiRefreshCw />}
          colorScheme="brand"
          onClick={handleAssignAllEligible}
          isLoading={assignAllEligibleBatchesMutation.isPending}
        >
          Assign All Eligible Batches
        </Button>
      </HStack>

      <AdminEligibilityStats
        students={students}
        cardBg={cardBg}
        borderColor={borderColor}
      />

      <AdminEligibilityTable
        filteredStudents={filteredStudents}
        isLoading={studentsLoading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAssignBatchClick={handleAssignBatchClick}
        refetchStudents={refetchStudents}
        cardBg={cardBg}
        borderColor={borderColor}
        getEligibilityColor={getEligibilityColor}
        getEligibilityIcon={getEligibilityIcon}
        getBatchColor={getBatchColor}
      />

      <AssignBatchModal
        isOpen={isAssignModalOpen}
        onClose={onAssignModalClose}
        selectedStudent={selectedStudent}
        selectedBatch={selectedBatch}
        setSelectedBatch={setSelectedBatch}
        isAutoAssign={isAutoAssign}
        setIsAutoAssign={setIsAutoAssign}
        handleAssignBatch={handleAssignBatch}
        isAssigning={assignBatchMutation.isPending}
        cardBg={cardBg}
        borderColor={borderColor}
        BATCHES={BATCHES}
      />
    </VStack>
  );
};

export default EligibilityAdminView;
