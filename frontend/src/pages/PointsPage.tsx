import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  CardBody,
  Badge,
  useColorModeValue,
  Grid,
  GridItem,
  Icon,
  Skeleton,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider,
  Button,
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
  Input,
  Select,
  useToast,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiAward, FiTrendingUp, FiCode, FiCalendar, FiCheckCircle, FiStar, FiEdit, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { pointsAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';

interface PointBreakdown {
  totalPoints: number;
  breakdown: {
    workshops?: {
      count: number;
      points: number;
      events: string[];
    };
    hackathons?: {
      count: number;
      points: number;
      events: string[];
    };
    certifications?: {
      count: number;
      points: number;
      certifications: string[];
    };
    coding?: {
      totalPoints: number;
      breakdown: {
        leetcode?: {
          problemsSolved: number;
          basePoints: number;
          bonusPoints: number;
          totalPoints: number;
        };
        hackerrank?: {
          problemsSolved: number;
          basePoints: number;
          bonusPoints: number;
          totalPoints: number;
        };
      };
    };
    bonuses?: {
      totalPoints: number;
      breakdown: {
        firstWorkshop?: number;
        firstHackathon?: number;
        certificationStreak?: number;
      };
    };
  };
  profileId: string;
  manualAdjustment: number;
}

interface UserWithPoints {
  id: string;
  name: string;
  email: string;
  class: string;
  batch: string;
  points: number;
  profileId: string;
  manualAdjustment: number;
}

interface PointStatistics {
  totalUsers: number;
  totalPoints: number;
  averagePoints: number;
  topPerformers: UserWithPoints[];
}

interface PointRule {
  id: string;
  key: string;
  value: number;
  description: string;
}

// Admin Points View Component
const AdminPointsView: React.FC<{ 
  statistics: PointStatistics | undefined; 
  onUpdateAllPoints: () => void;
}> = ({ statistics, onUpdateAllPoints }) => {
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');
  const toast = useToast();
  const queryClient = useQueryClient();

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { isOpen: isUpdateModalOpen, onOpen: onUpdateModalOpen, onClose: onUpdateModalClose } = useDisclosure();
  const { isOpen: isResetModalOpen, onOpen: onResetModalOpen, onClose: onResetModalClose } = useDisclosure();
  const [updateForm, setUpdateForm] = useState({ pointsToAdd: 0, reason: '' });
  const [resetForm, setResetForm] = useState({ reason: '' });

  const { data: usersResponse, isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => pointsAPI.getAllUsers(),
  });

  const users: UserWithPoints[] = usersResponse?.data?.data || [];

  const updateUsersMutation = useMutation({
    mutationFn: (data: { userIds: string[]; pointsToAdd: number; reason: string }) =>
      pointsAPI.updateUserPoints(data.userIds, data.pointsToAdd, data.reason),
    onSuccess: (response) => {
      toast({
        title: 'Points Updated',
        description: `Successfully updated points for ${response.data.data.length} users`,
        status: 'success',
        duration: 3000,
      });
      onUpdateModalClose();
      setUpdateForm({ pointsToAdd: 0, reason: '' });
      setSelectedUsers([]);
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['pointStatistics'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.response?.data?.error || 'Failed to update points',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const resetUsersMutation = useMutation({
    mutationFn: (data: { userIds: string[]; reason: string }) =>
      pointsAPI.resetUserPoints(data.userIds, data.reason),
    onSuccess: (response) => {
      toast({
        title: 'Points Reset',
        description: `Successfully reset points for ${response.data.data.length} users`,
        status: 'success',
        duration: 3000,
      });
      onResetModalClose();
      setResetForm({ reason: '' });
      setSelectedUsers([]);
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['pointStatistics'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Reset Failed',
        description: error.response?.data?.error || 'Failed to reset points',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(users.map((user: UserWithPoints) => user.id));
  };

  const handleClearSelection = () => {
    setSelectedUsers([]);
  };

  const handleUpdatePoints = () => {
    if (selectedUsers.length === 0) {
      toast({
        title: 'No Users Selected',
        description: 'Please select at least one user',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (!updateForm.reason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for the points update',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    updateUsersMutation.mutate({
      userIds: selectedUsers,
      pointsToAdd: updateForm.pointsToAdd,
      reason: updateForm.reason,
    });
  };

  const handleResetPoints = () => {
    if (selectedUsers.length === 0) {
      toast({
        title: 'No Users Selected',
        description: 'Please select at least one user',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (!resetForm.reason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for the points reset',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    resetUsersMutation.mutate({
      userIds: selectedUsers,
      reason: resetForm.reason,
    });
  };

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            Points Management
          </Heading>
          <Text color="gray.400">
            Manage all users' points
          </Text>
        </Box>
        
        <Button
          leftIcon={<FiRefreshCw />}
          colorScheme="brand"
          onClick={onUpdateAllPoints}
          isLoading={false} // Add actual loading state if available
        >
          Update All Points
        </Button>
      </HStack>

      {/* Statistics Overview */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={6}>
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={3}>
              <Icon as={FiTrendingUp} color="blue.500" boxSize={8} />
              <Stat>
                <StatLabel color="gray.400" fontSize="sm">Total Users</StatLabel>
                <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                  {statistics?.totalUsers || 0}
                </StatNumber>
                <StatHelpText color="gray.500" fontSize="xs">
                  Active students
                </StatHelpText>
              </Stat>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={3}>
              <Icon as={FiAward} color="green.500" boxSize={8} />
              <Stat>
                <StatLabel color="gray.400" fontSize="sm">Total Points</StatLabel>
                <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                  {statistics?.totalPoints?.toLocaleString() || 0}
                </StatNumber>
                <StatHelpText color="gray.500" fontSize="xs">
                  System-wide points
                </StatHelpText>
              </Stat>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={3}>
              <Icon as={FiCode} color="purple.500" boxSize={8} />
              <Stat>
                <StatLabel color="gray.400" fontSize="sm">Average Points</StatLabel>
                <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                  {statistics?.averagePoints || 0}
                </StatNumber>
                <StatHelpText color="gray.500" fontSize="xs">
                  Per student
                </StatHelpText>
              </Stat>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={3}>
              <Icon as={FiStar} color="yellow.500" boxSize={8} />
              <Stat>
                <StatLabel color="gray.400" fontSize="sm">Top Score</StatLabel>
                <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                  {statistics?.topPerformers?.[0]?.points || 0}
                </StatNumber>
                <StatHelpText color="gray.500" fontSize="xs">
                  Highest points
                </StatHelpText>
              </Stat>
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* User Management */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Heading size="md" color="white">
                User Management
              </Heading>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={handleSelectAll}
                  isDisabled={usersLoading || users.length === 0}
                >
                  Select All
                </Button>
                <Button
                  size="sm"
                  colorScheme="gray"
                  onClick={handleClearSelection}
                  isDisabled={selectedUsers.length === 0}
                >
                  Clear ({selectedUsers.length})
                </Button>
              </HStack>
            </HStack>

            {selectedUsers.length > 0 && (
              <HStack spacing={2}>
                <Button
                  leftIcon={<FiEdit />}
                  colorScheme="green"
                  size="sm"
                  onClick={onUpdateModalOpen}
                >
                  Update Points ({selectedUsers.length})
                </Button>
                <Button
                  leftIcon={<FiRefreshCw />}
                  colorScheme="red"
                  size="sm"
                  onClick={onResetModalOpen}
                >
                  Reset Points ({selectedUsers.length})
                </Button>
              </HStack>
            )}

            {usersLoading ? (
              <VStack spacing={4}>
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} height="60px" />
                ))}
              </VStack>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th color="gray.300" borderColor={borderColor} width="50px">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === users.length && users.length > 0}
                          onChange={(e) => e.target.checked ? handleSelectAll() : handleClearSelection()}
                          style={{ cursor: 'pointer' }}
                        />
                      </Th>
                      <Th color="gray.300" borderColor={borderColor}>Student</Th>
                      <Th color="gray.300" borderColor={borderColor}>Class</Th>
                      <Th color="gray.300" borderColor={borderColor}>Batch</Th>
                      <Th color="gray.300" borderColor={borderColor}>Points</Th>
                      <Th color="gray.300" borderColor={borderColor}>Manual Adj.</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {users.map((user: UserWithPoints) => (
                      <Tr key={user.id} _hover={{ bg: 'gray.700' }}>
                        <Td borderColor={borderColor}>
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleUserSelection(user.id)}
                            style={{ cursor: 'pointer' }}
                          />
                        </Td>
                        <Td borderColor={borderColor}>
                          <VStack align="start" spacing={0}>
                            <Text color="white" fontWeight="medium">
                              {user.name}
                            </Text>
                            <Text color="gray.400" fontSize="sm">
                              {user.email}
                            </Text>
                          </VStack>
                        </Td>
                        <Td borderColor={borderColor}>
                          <Text color="gray.300">{user.class}</Text>
                        </Td>
                        <Td borderColor={borderColor}>
                          <Badge colorScheme="blue" variant="subtle">
                            {user.batch}
                          </Badge>
                        </Td>
                        <Td borderColor={borderColor}>
                          <Text color="white" fontWeight="bold">
                            {user.points}
                          </Text>
                        </Td>
                        <Td borderColor={borderColor}>
                          <Text color={user.manualAdjustment >= 0 ? 'green.300' : 'red.300'} fontWeight="bold">
                            {user.manualAdjustment}
                          </Text>
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

      {/* Update Points Modal */}
      <Modal isOpen={isUpdateModalOpen} onClose={onUpdateModalClose}>
        <ModalOverlay />
        <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
          <ModalHeader color="white">Update Points</ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color="gray.300">Points to Add/Subtract</FormLabel>
                <Input
                  type="number"
                  value={updateForm.pointsToAdd}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, pointsToAdd: parseInt(e.target.value) || 0 }))}
                  placeholder="Enter points (use negative for subtraction)"
                  bg="gray.700"
                  borderColor={borderColor}
                  color="white"
                  _placeholder={{ color: 'gray.400' }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color="gray.300">Reason</FormLabel>
                <Input
                  value={updateForm.reason}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Enter reason for points update"
                  bg="gray.700"
                  borderColor={borderColor}
                  color="white"
                  _placeholder={{ color: 'gray.400' }}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onUpdateModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleUpdatePoints}
              isLoading={updateUsersMutation.isPending}
            >
              Update Points
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reset Points Modal */}
      <Modal isOpen={isResetModalOpen} onClose={onResetModalClose}>
        <ModalOverlay />
        <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
          <ModalHeader color="white">Reset Points</ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody>
            <VStack spacing={4}>
              <Text color="gray.300" textAlign="center">
                This will reset points to 0 for {selectedUsers.length} selected user(s).
              </Text>
              <FormControl>
                <FormLabel color="gray.300">Reason</FormLabel>
                <Input
                  value={resetForm.reason}
                  onChange={(e) => setResetForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Enter reason for points reset"
                  bg="gray.700"
                  borderColor={borderColor}
                  color="white"
                  _placeholder={{ color: 'gray.400' }}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onResetModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleResetPoints}
              isLoading={resetUsersMutation.isPending}
            >
              Reset Points
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

// Student Points View Component
const StudentPointsView: React.FC<{ breakdown: PointBreakdown | undefined; rules: PointRule[] }> = ({ breakdown, rules }) => {
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="lg" color="white" mb={2}>
          My Points
        </Heading>
        <Text color="gray.400">
          Track your progress and point breakdown
        </Text>
      </Box>

      {/* Total Points and Progression */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Heading size="md" color="white">
                  Total Points
                </Heading>
                <Badge
                  colorScheme="green"
                  variant="subtle"
                  fontSize="lg"
                >
                  {breakdown?.totalPoints || 0} pts
                </Badge>
              </HStack>
              
              <Stat>
                <StatNumber color="white" fontSize="4xl" fontWeight="bold">
                  {breakdown?.totalPoints || 0}
                </StatNumber>
                <StatHelpText color="gray.400">
                  Total points earned
                </StatHelpText>
              </Stat>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text color="gray.400" fontSize="sm">
                    Current Points
                  </Text>
                  <Text color="white" fontSize="sm">
                    {breakdown?.totalPoints || 0} points
                  </Text>
                </HStack>
                <Progress
                  value={Math.min(100, ((breakdown?.totalPoints || 0) / 1000) * 100)}
                  colorScheme="green"
                  size="lg"
                  borderRadius="full"
                />
              </Box>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md" color="white">
                Quick Stats
              </Heading>
              
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <Box textAlign="center">
                  <Icon as={FiCalendar} color="blue.500" boxSize={6} mb={2} />
                  <Text color="white" fontSize="lg" fontWeight="bold">
                    {breakdown?.breakdown?.workshops?.count || 0}
                  </Text>
                  <Text color="gray.400" fontSize="sm">
                    Workshops
                  </Text>
                </Box>
                
                <Box textAlign="center">
                  <Icon as={FiCode} color="purple.500" boxSize={6} mb={2} />
                  <Text color="white" fontSize="lg" fontWeight="bold">
                    {breakdown?.breakdown?.hackathons?.count || 0}
                  </Text>
                  <Text color="gray.400" fontSize="sm">
                    Hackathons
                  </Text>
                </Box>
                
                <Box textAlign="center">
                  <Icon as={FiCheckCircle} color="green.500" boxSize={6} mb={2} />
                  <Text color="white" fontSize="lg" fontWeight="bold">
                    {breakdown?.breakdown?.certifications?.count || 0}
                  </Text>
                  <Text color="gray.400" fontSize="sm">
                    Certifications
                  </Text>
                </Box>
                
                <Box textAlign="center">
                  <Icon as={FiStar} color="yellow.500" boxSize={6} mb={2} />
                  <Text color="white" fontSize="lg" fontWeight="bold">
                    {breakdown?.breakdown?.bonuses?.totalPoints || 0}
                  </Text>
                  <Text color="gray.400" fontSize="sm">
                    Bonus Points
                  </Text>
                </Box>
              </Grid>
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Detailed Breakdown */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="white">
              Detailed Breakdown
            </Heading>
            
            <Accordion allowToggle>
              {/* Workshops */}
              {breakdown?.breakdown?.workshops && (
                <AccordionItem borderColor={borderColor}>
                  <AccordionButton>
                    <HStack flex="1" justify="space-between">
                      <HStack>
                        <Icon as={FiCalendar} color="blue.500" />
                        <Text color="white" fontWeight="medium">
                          Workshops ({breakdown.breakdown.workshops.count})
                        </Text>
                      </HStack>
                      <HStack>
                        <Text color="green.400" fontWeight="bold">
                          +{breakdown.breakdown.workshops.points} pts
                        </Text>
                        <AccordionIcon color="gray.400" />
                      </HStack>
                    </HStack>
                  </AccordionButton>
                  <AccordionPanel>
                    <VStack align="stretch" spacing={2}>
                      {breakdown.breakdown.workshops.events.map((event, index) => (
                        <HStack key={index} justify="space-between" p={2} bg="gray.700" borderRadius="md">
                          <Text color="white" fontSize="sm">{event}</Text>
                          <Badge colorScheme="blue" variant="subtle">+{rules.find(r => r.key === 'WORKSHOP_PARTICIPATION')?.value || 50} pts</Badge>
                        </HStack>
                      ))}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              )}

              {/* Hackathons */}
              {breakdown?.breakdown?.hackathons && (
                <AccordionItem borderColor={borderColor}>
                  <AccordionButton>
                    <HStack flex="1" justify="space-between">
                      <HStack>
                        <Icon as={FiCode} color="purple.500" />
                        <Text color="white" fontWeight="medium">
                          Hackathons ({breakdown.breakdown.hackathons.count})
                        </Text>
                      </HStack>
                      <HStack>
                        <Text color="green.400" fontWeight="bold">
                          +{breakdown.breakdown.hackathons.points} pts
                        </Text>
                        <AccordionIcon color="gray.400" />
                      </HStack>
                    </HStack>
                  </AccordionButton>
                  <AccordionPanel>
                    <VStack align="stretch" spacing={2}>
                      {breakdown.breakdown.hackathons.events.map((event, index) => (
                        <HStack key={index} justify="space-between" p={2} bg="gray.700" borderRadius="md">
                          <Text color="white" fontSize="sm">{event}</Text>
                          <Badge colorScheme="purple" variant="subtle">+{rules.find(r => r.key === 'HACKATHON_PARTICIPATION')?.value || 100} pts</Badge>
                        </HStack>
                      ))}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              )}

              {/* Certifications */}
              {breakdown?.breakdown?.certifications && (
                <AccordionItem borderColor={borderColor}>
                  <AccordionButton>
                    <HStack flex="1" justify="space-between">
                      <HStack>
                        <Icon as={FiCheckCircle} color="green.500" />
                        <Text color="white" fontWeight="medium">
                          Certifications ({breakdown.breakdown.certifications.count})
                        </Text>
                      </HStack>
                      <HStack>
                        <Text color="green.400" fontWeight="bold">
                          +{breakdown.breakdown.certifications.points} pts
                        </Text>
                        <AccordionIcon color="gray.400" />
                      </HStack>
                    </HStack>
                  </AccordionButton>
                  <AccordionPanel>
                    <VStack align="stretch" spacing={2}>
                      {breakdown.breakdown.certifications.certifications.map((cert, index) => (
                        <HStack key={index} justify="space-between" p={2} bg="gray.700" borderRadius="md">
                          <Text color="white" fontSize="sm">{cert}</Text>
                          <Badge colorScheme="green" variant="subtle">+{rules.find(r => r.key === 'CERTIFICATION_APPROVED')?.value || 75} pts</Badge>
                        </HStack>
                      ))}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              )}

              {/* Coding Platforms */}
              {breakdown?.breakdown?.coding && (
                <AccordionItem borderColor={borderColor}>
                  <AccordionButton>
                    <HStack flex="1" justify="space-between">
                      <HStack>
                        <Icon as={FiTrendingUp} color="orange.500" />
                        <Text color="white" fontWeight="medium">
                          Coding Platforms
                        </Text>
                      </HStack>
                      <HStack>
                        <Text color="green.400" fontWeight="bold">
                          +{breakdown.breakdown.coding.totalPoints} pts
                        </Text>
                        <AccordionIcon color="gray.400" />
                      </HStack>
                    </HStack>
                  </AccordionButton>
                  <AccordionPanel>
                    <VStack align="stretch" spacing={3}>
                      {breakdown.breakdown.coding.breakdown.leetcode && (
                        <Box p={3} bg="gray.700" borderRadius="md">
                          <HStack justify="space-between" mb={2}>
                            <Text color="white" fontWeight="medium">LeetCode</Text>
                            <Badge colorScheme="orange" variant="subtle">
                              +{breakdown.breakdown.coding.breakdown.leetcode.totalPoints} pts
                            </Badge>
                          </HStack>
                          <VStack align="stretch" spacing={1}>
                            <HStack justify="space-between">
                              <Text color="gray.400" fontSize="sm">Problems Solved</Text>
                              <Text color="white" fontSize="sm">
                                {breakdown.breakdown.coding.breakdown.leetcode.problemsSolved}
                              </Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text color="gray.400" fontSize="sm">Base Points</Text>
                              <Text color="white" fontSize="sm">
                                +{breakdown.breakdown.coding.breakdown.leetcode.basePoints}
                              </Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text color="gray.400" fontSize="sm">Bonus Points</Text>
                              <Text color="white" fontSize="sm">
                                +{breakdown.breakdown.coding.breakdown.leetcode.bonusPoints}
                              </Text>
                            </HStack>
                          </VStack>
                        </Box>
                      )}
                      
                      {breakdown.breakdown.coding.breakdown.hackerrank && (
                        <Box p={3} bg="gray.700" borderRadius="md">
                          <HStack justify="space-between" mb={2}>
                            <Text color="white" fontWeight="medium">HackerRank</Text>
                            <Badge colorScheme="orange" variant="subtle">
                              +{breakdown.breakdown.coding.breakdown.hackerrank.totalPoints} pts
                            </Badge>
                          </HStack>
                          <VStack align="stretch" spacing={1}>
                            <HStack justify="space-between">
                              <Text color="gray.400" fontSize="sm">Problems Solved</Text>
                              <Text color="white" fontSize="sm">
                                {breakdown.breakdown.coding.breakdown.hackerrank.problemsSolved}
                              </Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text color="gray.400" fontSize="sm">Base Points</Text>
                              <Text color="white" fontSize="sm">
                                +{breakdown.breakdown.coding.breakdown.hackerrank.basePoints}
                              </Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text color="gray.400" fontSize="sm">Bonus Points</Text>
                              <Text color="white" fontSize="sm">
                                +{breakdown.breakdown.coding.breakdown.hackerrank.bonusPoints}
                              </Text>
                            </HStack>
                          </VStack>
                        </Box>
                      )}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              )}

              {/* Bonuses */}
              {breakdown?.breakdown?.bonuses && breakdown.breakdown.bonuses.totalPoints > 0 && (
                <AccordionItem borderColor={borderColor}>
                  <AccordionButton>
                    <HStack flex="1" justify="space-between">
                      <HStack>
                        <Icon as={FiStar} color="yellow.500" />
                        <Text color="white" fontWeight="medium">
                          Bonus Points
                        </Text>
                      </HStack>
                      <HStack>
                        <Text color="green.400" fontWeight="bold">
                          +{breakdown.breakdown.bonuses.totalPoints} pts
                        </Text>
                        <AccordionIcon color="gray.400" />
                      </HStack>
                    </HStack>
                  </AccordionButton>
                  <AccordionPanel>
                    <VStack align="stretch" spacing={2}>
                      {breakdown.breakdown.bonuses.breakdown.firstWorkshop && (
                        <HStack justify="space-between" p={2} bg="gray.700" borderRadius="md">
                          <Text color="white" fontSize="sm">First Workshop Bonus</Text>
                          <Badge colorScheme="yellow" variant="subtle">
                            +{breakdown.breakdown.bonuses.breakdown.firstWorkshop} pts
                          </Badge>
                        </HStack>
                      )}
                      {breakdown.breakdown.bonuses.breakdown.firstHackathon && (
                        <HStack justify="space-between" p={2} bg="gray.700" borderRadius="md">
                          <Text color="white" fontSize="sm">First Hackathon Bonus</Text>
                          <Badge colorScheme="yellow" variant="subtle">
                            +{breakdown.breakdown.bonuses.breakdown.firstHackathon} pts
                          </Badge>
                        </HStack>
                      )}
                      {breakdown.breakdown.bonuses.breakdown.certificationStreak && (
                        <HStack justify="space-between" p={2} bg="gray.700" borderRadius="md">
                          <Text color="white" fontSize="sm">Certification Streak Bonus</Text>
                          <Badge colorScheme="yellow" variant="subtle">
                            +{breakdown.breakdown.bonuses.breakdown.certificationStreak} pts
                          </Badge>
                        </HStack>
                      )}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              )}
              {breakdown?.manualAdjustment !== 0 && (
                <AccordionItem borderColor={borderColor}>
                  <AccordionButton>
                    <HStack flex="1" justify="space-between">
                      <HStack>
                        <Icon as={FiEdit} color="blue.500" />
                        <Text color="white" fontWeight="medium">
                          Manual Adjustments
                        </Text>
                      </HStack>
                      <HStack>
                        <Text color={breakdown.manualAdjustment >= 0 ? 'green.400' : 'red.400'} fontWeight="bold">
                          {breakdown.manualAdjustment >= 0 ? '+' : ''}{breakdown.manualAdjustment} pts
                        </Text>
                        <AccordionIcon color="gray.400" />
                      </HStack>
                    </HStack>
                  </AccordionButton>
                  <AccordionPanel>
                    <Text color="gray.400" fontSize="sm">
                      Points manually adjusted by an administrator.
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
              )}
            </Accordion>
          </VStack>
        </CardBody>
      </Card>

      {/* Point Rules */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="white">
              Point Rules
            </Heading>
            
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              {rules.map((rule: PointRule) => (
                <Box key={rule.key} p={3} bg="gray.700" borderRadius="md">
                  <HStack justify="space-between" mb={2}>
                    <Text color="white" fontSize="sm" fontWeight="medium">
                      {rule.description}
                    </Text>
                    <Badge colorScheme="green" variant="subtle">
                      +{rule.value} pts
                    </Badge>
                  </HStack>
                </Box>
              ))}
            </Grid>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

const PointsPage: React.FC = () => {
  const { user } = useAuthStore();
  const toast = useToast();
  const queryClient = useQueryClient();
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  // Student queries
  const { data: breakdownResponse, isLoading: breakdownLoading } = useQuery({
    queryKey: ['pointBreakdown'],
    queryFn: () => pointsAPI.getMyBreakdown(),
    enabled: user?.role === 'STUDENT',
  });

  const { data: rulesResponse, isLoading: rulesLoading } = useQuery({
    queryKey: ['pointRules'],
    queryFn: () => pointsAPI.getPointRules(),
  });

  // Admin queries
  const { data: statisticsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ['pointStatistics'],
    queryFn: () => pointsAPI.getPointStatistics(),
    enabled: user?.role === 'ADMIN',
  });

  const breakdown: PointBreakdown = breakdownResponse?.data?.data;
  const rules: PointRule[] = rulesResponse?.data?.data || [];
  const statistics: PointStatistics = statisticsResponse?.data?.data;

  const updateAllPointsMutation = useMutation({
    mutationFn: () => pointsAPI.updateAllUserPoints(),
    onSuccess: () => {
      toast({
        title: 'Points Updated',
        description: 'All user points have been recalculated successfully.',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['pointStatistics'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] }); // Invalidate all users for admin view
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.response?.data?.error || 'Failed to update points',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleUpdateAllPoints = () => {
    updateAllPointsMutation.mutate();
  };

  const isLoading = user?.role === 'STUDENT' ? (breakdownLoading || rulesLoading) : (statsLoading || rulesLoading);

  if (isLoading) {
    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            {user?.role === 'ADMIN' ? 'Points Management' : 'My Points'}
          </Heading>
          <Text color="gray.400">
            {user?.role === 'ADMIN' ? 'Manage all users\' points' : 'Track your progress and point breakdown'}
          </Text>
        </Box>
        
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
          {[...Array(4)].map((_, i) => (
            <GridItem key={i}>
              <Skeleton height="200px" />
            </GridItem>
          ))}
        </Grid>
      </VStack>
    );
  }

  if (user?.role === 'ADMIN') {
    return <AdminPointsView statistics={statistics} onUpdateAllPoints={handleUpdateAllPoints} />;
  }

  return <StudentPointsView breakdown={breakdown} rules={rules} />;
};

export default PointsPage;