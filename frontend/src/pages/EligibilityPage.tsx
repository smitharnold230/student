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
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FiCheckCircle, 
  FiXCircle, 
  FiUsers, 
  FiAward, 
  FiCode, 
  FiCalendar,
  FiSettings,
  FiUserCheck,
  FiUserX
} from 'react-icons/fi';
import { eligibilityAPI, profileAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';

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

const BATCHES = ['PRODUCT', 'SERVICE_A', 'SERVICE_B', 'SERVICE_C1', 'SERVICE_C2', 'SERVICE_C3'];

const EligibilityPage: React.FC = () => {
  const { user } = useAuthStore();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string>('SERVICE_C3');
  const [isAutoAssign, setIsAutoAssign] = useState<boolean>(true);

  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  // Get all students for admin view
  const { data: studentsResponse, isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => profileAPI.getAllStudents(),
    enabled: user?.role === 'ADMIN',
  });

  const students: Student[] = studentsResponse?.data?.data || [];

  // Check eligibility for current user (student view)
  const { data: eligibilityResponse, isLoading: eligibilityLoading } = useQuery({
    queryKey: ['eligibility'],
    queryFn: () => eligibilityAPI.checkEligibility(),
    enabled: user?.role === 'STUDENT',
  });

  const eligibility: EligibilityData = eligibilityResponse?.data || {
    eligible: false,
    workshops: 0,
    hackathons: 0,
    leetcode: 0,
  };

  // Assign batch mutation
  const assignBatchMutation = useMutation({
    mutationFn: (data: { userId: string; batch: string; auto: boolean }) =>
      eligibilityAPI.assignBatch(data.userId, data.batch, data.auto),
    onSuccess: () => {
      toast({
        title: 'Batch Assigned',
        description: 'Student batch has been assigned successfully.',
        status: 'success',
        duration: 3000,
      });
      onClose();
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Assignment Failed',
        description: error.response?.data?.error || 'Failed to assign batch',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleAssignBatch = () => {
    if (!selectedStudent) return;
    
    assignBatchMutation.mutate({
      userId: selectedStudent.id,
      batch: selectedBatch,
      auto: isAutoAssign,
    });
  };

  const getEligibilityColor = (eligible: boolean) => {
    return eligible ? 'green' : 'red';
  };

  const getEligibilityIcon = (eligible: boolean) => {
    return eligible ? FiCheckCircle : FiXCircle;
  };

  const getBatchColor = (batch: string) => {
    switch (batch) {
      case 'PRODUCT': return 'purple';
      case 'SERVICE_A': return 'blue';
      case 'SERVICE_B': return 'green';
      case 'SERVICE_C1': return 'yellow';
      case 'SERVICE_C2': return 'orange';
      case 'SERVICE_C3': return 'gray';
      default: return 'gray';
    }
  };

  const getProgressPercentage = (current: number, required: number) => {
    return Math.min(100, (current / required) * 100);
  };

  // Student View
  if (user?.role === 'STUDENT') {
    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            Eligibility Check
          </Heading>
          <Text color="gray.400">
            Check your eligibility for batch assignment
          </Text>
        </Box>

        {eligibilityLoading ? (
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4}>
                <Skeleton height="60px" width="full" />
                <Skeleton height="60px" width="full" />
                <Skeleton height="60px" width="full" />
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <VStack spacing={6}>
            {/* Eligibility Status */}
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardBody>
                <VStack spacing={4}>
                  <HStack spacing={4}>
                    <Icon 
                      as={getEligibilityIcon(eligibility.eligible)} 
                      color={getEligibilityColor(eligibility.eligible)} 
                      boxSize={8} 
                    />
                    <VStack align="start" spacing={1}>
                      <Heading size="md" color="white">
                        {eligibility.eligible ? 'Eligible' : 'Not Eligible'}
                      </Heading>
                      <Text color="gray.400">
                        {eligibility.eligible 
                          ? 'You meet all requirements for batch assignment'
                          : 'You need to meet more requirements'
                        }
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Requirements Breakdown */}
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardBody>
                <VStack spacing={6}>
                  <Heading size="md" color="white">Requirements Progress</Heading>
                  
                  {/* Workshops */}
                  <VStack spacing={2} align="stretch" width="full">
                    <HStack justify="space-between">
                      <HStack spacing={3}>
                        <Icon as={FiCalendar} color="blue.400" />
                        <Text color="white">Workshops Attended</Text>
                      </HStack>
                      <Badge colorScheme={eligibility.workshops >= 2 ? 'green' : 'red'}>
                        {eligibility.workshops}/2
                      </Badge>
                    </HStack>
                    <Progress 
                      value={getProgressPercentage(eligibility.workshops, 2)} 
                      colorScheme={eligibility.workshops >= 2 ? 'green' : 'red'}
                    />
                  </VStack>

                  {/* Hackathons */}
                  <VStack spacing={2} align="stretch" width="full">
                    <HStack justify="space-between">
                      <HStack spacing={3}>
                        <Icon as={FiAward} color="purple.400" />
                        <Text color="white">Hackathons Attended</Text>
                      </HStack>
                      <Badge colorScheme={eligibility.hackathons >= 2 ? 'green' : 'red'}>
                        {eligibility.hackathons}/2
                      </Badge>
                    </HStack>
                    <Progress 
                      value={getProgressPercentage(eligibility.hackathons, 2)} 
                      colorScheme={eligibility.hackathons >= 2 ? 'green' : 'red'}
                    />
                  </VStack>

                  {/* LeetCode Problems */}
                  <VStack spacing={2} align="stretch" width="full">
                    <HStack justify="space-between">
                      <HStack spacing={3}>
                        <Icon as={FiCode} color="orange.400" />
                        <Text color="white">LeetCode Problems Solved</Text>
                      </HStack>
                      <Badge colorScheme={eligibility.leetcode >= 200 ? 'green' : 'red'}>
                        {eligibility.leetcode}/200
                      </Badge>
                    </HStack>
                    <Progress 
                      value={getProgressPercentage(eligibility.leetcode, 200)} 
                      colorScheme={eligibility.leetcode >= 200 ? 'green' : 'red'}
                    />
                  </VStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Requirements Info */}
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardBody>
                <VStack spacing={4}>
                  <Heading size="md" color="white">Requirements</Heading>
                  <Alert status="info">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Batch Assignment Requirements</AlertTitle>
                      <AlertDescription>
                        To be eligible for batch assignment, you need:
                        • At least 2 workshops attended
                        • At least 2 hackathons attended  
                        • At least 200 LeetCode problems solved
                      </AlertDescription>
                    </Box>
                  </Alert>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        )}
      </VStack>
    );
  }

  // Admin View
  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="lg" color="white" mb={2}>
          Eligibility Management
        </Heading>
        <Text color="gray.400">
          Manage student eligibility and batch assignments
        </Text>
      </Box>

      {/* Stats Cards */}
      <HStack spacing={6} wrap="wrap">
        <Card bg={cardBg} border="1px solid" borderColor={borderColor} minW="200px">
          <CardBody>
            <HStack spacing={3}>
              <Box p={2} borderRadius="lg" bg="blue.500" color="white">
                <FiUsers size={20} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text color="gray.400" fontSize="sm">
                  Total Students
                </Text>
                <Text color="white" fontSize="xl" fontWeight="bold">
                  {students.length}
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderColor} minW="200px">
          <CardBody>
            <HStack spacing={3}>
              <Box p={2} borderRadius="lg" bg="green.500" color="white">
                <FiUserCheck size={20} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text color="gray.400" fontSize="sm">
                  Eligible Students
                </Text>
                <Text color="white" fontSize="xl" fontWeight="bold">
                  {students.filter(s => s.eligibility?.eligible).length}
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderColor} minW="200px">
          <CardBody>
            <HStack spacing={3}>
              <Box p={2} borderRadius="lg" bg="red.500" color="white">
                <FiUserX size={20} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text color="gray.400" fontSize="sm">
                  Not Eligible
                </Text>
                <Text color="white" fontSize="xl" fontWeight="bold">
                  {students.filter(s => !s.eligibility?.eligible).length}
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      </HStack>

      {/* Students Table */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Heading size="md" color="white">Student Eligibility</Heading>
              <Button
                leftIcon={<FiSettings />}
                colorScheme="blue"
                onClick={() => {
                  // Check eligibility for all students
                  students.forEach(student => {
                    // This would need to be implemented in the backend
                    console.log('Checking eligibility for:', student.name);
                  });
                }}
              >
                Check All Eligibility
              </Button>
            </HStack>

            {studentsLoading ? (
              <VStack spacing={4}>
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} height="60px" width="full" />
                ))}
              </VStack>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th color="white">Student</Th>
                      <Th color="white">Class</Th>
                      <Th color="white">Current Batch</Th>
                      <Th color="white">Eligibility</Th>
                      <Th color="white">Requirements</Th>
                      <Th color="white">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {students.map((student) => (
                      <Tr key={student.id} _hover={{ bg: 'gray.700' }}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text color="white" fontWeight="bold">
                              {student.name}
                            </Text>
                            <Text color="gray.400" fontSize="sm">
                              {student.email}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Text color="white">{student.class}</Text>
                        </Td>
                        <Td>
                          <Badge colorScheme={getBatchColor(student.batch)}>
                            {student.batch}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Icon 
                              as={getEligibilityIcon(student.eligibility?.eligible || false)} 
                              color={getEligibilityColor(student.eligibility?.eligible || false)} 
                            />
                            <Badge colorScheme={getEligibilityColor(student.eligibility?.eligible || false)}>
                              {student.eligibility?.eligible ? 'Eligible' : 'Not Eligible'}
                            </Badge>
                          </HStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text color="gray.400" fontSize="sm">
                              W: {student.eligibility?.workshops || 0}/2
                            </Text>
                            <Text color="gray.400" fontSize="sm">
                              H: {student.eligibility?.hackathons || 0}/2
                            </Text>
                            <Text color="gray.400" fontSize="sm">
                              LC: {student.eligibility?.leetcode || 0}/200
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() => {
                              setSelectedStudent(student);
                              onOpen();
                            }}
                          >
                            Assign Batch
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Assign Batch Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
          <ModalHeader color="white">Assign Batch</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <VStack spacing={4}>
              <Text color="white">
                Assigning batch for: <strong>{selectedStudent?.name}</strong>
              </Text>
              
              <FormControl>
                <FormLabel color="white">Batch</FormLabel>
                <Select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  bg="gray.700"
                  color="white"
                  borderColor={borderColor}
                >
                  {BATCHES.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color="white">Assignment Type</FormLabel>
                <Select
                  value={isAutoAssign ? 'auto' : 'manual'}
                  onChange={(e) => setIsAutoAssign(e.target.value === 'auto')}
                  bg="gray.700"
                  color="white"
                  borderColor={borderColor}
                >
                  <option value="auto">Automatic (Check Eligibility)</option>
                  <option value="manual">Manual (Force Assignment)</option>
                </Select>
              </FormControl>

              {selectedStudent?.eligibility && (
                <Alert status={selectedStudent.eligibility.eligible ? 'success' : 'warning'}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>
                      {selectedStudent.eligibility.eligible ? 'Eligible' : 'Not Eligible'}
                    </AlertTitle>
                    <AlertDescription>
                      Workshops: {selectedStudent.eligibility.workshops}/2, 
                      Hackathons: {selectedStudent.eligibility.hackathons}/2, 
                      LeetCode: {selectedStudent.eligibility.leetcode}/200
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} color="white">
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleAssignBatch}
              isLoading={assignBatchMutation.isPending}
            >
              Assign Batch
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default EligibilityPage; 