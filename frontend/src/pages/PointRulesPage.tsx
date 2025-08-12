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
  Input,
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
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FiSettings, 
  FiEdit, 
  FiSave, 
  FiX, 
  FiCheck,
  FiTrendingUp,
  FiAward,
  FiCode,
  FiCalendar,
  FiUsers,
  FiStar
} from 'react-icons/fi';
import { adminAPI } from '../services/api';

interface PointRule {
  id: string;
  key: string;
  value: number;
  description: string;
}

interface EditingRule {
  id: string;
  key: string;
  value: number;
  description: string;
}

const PointRulesPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingRule, setEditingRule] = useState<EditingRule | null>(null);
  const [formData, setFormData] = useState({
    value: 0,
    description: '',
  });

  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  // Get point rules
  const { data: rulesResponse, isLoading: rulesLoading } = useQuery({
    queryKey: ['pointRules'],
    queryFn: () => adminAPI.getPointRules(),
  });

  // Correctly access the 'data' property from the response
  const rules: PointRule[] = (rulesResponse?.data?.data && Array.isArray(rulesResponse.data.data)) ? rulesResponse.data.data : [];

  // Update point rule mutation
  const updateRuleMutation = useMutation({
    mutationFn: (data: { key: string; value: number; description: string }) =>
      adminAPI.updatePointRule(data.key, data.value, data.description),
    onSuccess: () => {
      toast({
        title: 'Rule Updated',
        description: 'Point rule has been updated successfully.',
        status: 'success',
        duration: 3000,
      });
      onClose();
      queryClient.invalidateQueries({ queryKey: ['pointRules'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.response?.data?.error || 'Failed to update point rule',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleEditRule = (rule: PointRule) => {
    setEditingRule({
      id: rule.id,
      key: rule.key,
      value: rule.value,
      description: rule.description,
    });
    setFormData({
      value: rule.value,
      description: rule.description,
    });
    onOpen();
  };

  const handleSaveRule = () => {
    if (!editingRule) return;
    
    updateRuleMutation.mutate({
      key: editingRule.key,
      value: formData.value,
      description: formData.description,
    });
  };

  const getRuleCategory = (key: string) => {
    if (key.includes('WORKSHOP')) return 'Events';
    if (key.includes('HACKATHON')) return 'Events';
    if (key.includes('CERTIFICATION')) return 'Certifications';
    if (key.includes('LEETCODE')) return 'Coding';
    if (key.includes('HACKERRANK')) return 'Coding';
    if (key.includes('BONUS')) return 'Bonuses';
    return 'Other';
  };

  const getRuleIcon = (key: string) => {
    if (key.includes('WORKSHOP')) return FiCalendar;
    if (key.includes('HACKATHON')) return FiAward;
    if (key.includes('CERTIFICATION')) return FiCheck;
    if (key.includes('LEETCODE')) return FiCode;
    if (key.includes('HACKERRANK')) return FiCode;
    if (key.includes('BONUS')) return FiStar;
    return FiSettings;
  };

  const getRuleColor = (key: string) => {
    if (key.includes('WORKSHOP')) return 'blue';
    if (key.includes('HACKATHON')) return 'purple';
    if (key.includes('CERTIFICATION')) return 'green';
    if (key.includes('LEETCODE')) return 'orange';
    if (key.includes('HACKERRANK')) return 'red';
    if (key.includes('BONUS')) return 'yellow';
    return 'gray';
  };

  const categories = {
    Events: rules.filter(rule => getRuleCategory(rule.key) === 'Events'),
    Certifications: rules.filter(rule => getRuleCategory(rule.key) === 'Certifications'),
    Coding: rules.filter(rule => getRuleCategory(rule.key) === 'Coding'),
    Bonuses: rules.filter(rule => getRuleCategory(rule.key) === 'Bonuses'),
    Other: rules.filter(rule => getRuleCategory(rule.key) === 'Other'),
  };

  const totalPoints = rules.reduce((sum, rule) => sum + rule.value, 0);
  const averagePoints = rules.length > 0 ? Math.round(totalPoints / rules.length) : 0;

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="lg" color="white" mb={2}>
          Point Rules Management
        </Heading>
        <Text color="gray.400">
          Configure point values for different activities and achievements
        </Text>
      </Box>

      {/* Stats Cards */}
      <HStack spacing={6} wrap="wrap">
        <Card bg={cardBg} border="1px solid" borderColor={borderColor} minW="200px">
          <CardBody>
            <HStack spacing={3}>
              <Box p={2} borderRadius="lg" bg="blue.500" color="white">
                <FiSettings size={20} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text color="gray.400" fontSize="sm">
                  Total Rules
                </Text>
                <Text color="white" fontSize="xl" fontWeight="bold">
                  {rules.length}
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderColor} minW="200px">
          <CardBody>
            <HStack spacing={3}>
              <Box p={2} borderRadius="lg" bg="green.500" color="white">
                <FiTrendingUp size={20} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text color="gray.400" fontSize="sm">
                  Total Points
                </Text>
                <Text color="white" fontSize="xl" fontWeight="bold">
                  {totalPoints}
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderColor} minW="200px">
          <CardBody>
            <HStack spacing={3}>
              <Box p={2} borderRadius="lg" bg="purple.500" color="white">
                <FiUsers size={20} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text color="gray.400" fontSize="sm">
                  Average Points
                </Text>
                <Text color="white" fontSize="xl" fontWeight="bold">
                  {averagePoints}
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      </HStack>

      {/* Rules by Category */}
      {rulesLoading ? (
        <VStack spacing={4}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} height="200px" width="full" />
          ))}
        </VStack>
      ) : (
        <VStack spacing={6}>
          {Object.entries(categories).map(([category, categoryRules]) => {
            if (categoryRules.length === 0) return null;
            
            return (
              <Card key={category} bg={cardBg} border="1px solid" borderColor={borderColor}>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" color="white">
                      {category}
                    </Heading>
                    
                    <Box overflowX="auto">
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th color="white">Rule</Th>
                            <Th color="white">Description</Th>
                            <Th color="white">Points</Th>
                            <Th color="white">Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {categoryRules.map((rule) => {
                            const IconComponent = getRuleIcon(rule.key);
                            const color = getRuleColor(rule.key);
                            
                            return (
                              <Tr key={rule.id} _hover={{ bg: 'gray.700' }}>
                                <Td>
                                  <HStack spacing={3}>
                                    <Icon as={IconComponent} color={`${color}.400`} />
                                    <VStack align="start" spacing={1}>
                                      <Text color="white" fontWeight="bold">
                                        {rule.key.replace(/_/g, ' ')}
                                      </Text>
                                      <Badge colorScheme={color} size="sm">
                                        {category}
                                      </Badge>
                                    </VStack>
                                  </HStack>
                                </Td>
                                <Td>
                                  <Text color="gray.400" fontSize="sm">
                                    {rule.description}
                                  </Text>
                                </Td>
                                <Td>
                                  <Badge colorScheme="green" fontSize="md">
                                    {rule.value} pts
                                  </Badge>
                                </Td>
                                <Td>
                                  <Button
                                    size="sm"
                                    colorScheme="blue"
                                    leftIcon={<FiEdit />}
                                    onClick={() => handleEditRule(rule)}
                                  >
                                    Edit
                                  </Button>
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            );
          })}
        </VStack>
      )}

      {/* Edit Rule Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
          <ModalHeader color="white">Edit Point Rule</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <VStack spacing={4}>
              {editingRule && (
                <>
                  <Alert status="info">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Rule: {editingRule.key.replace(/_/g, ' ')}</AlertTitle>
                      <AlertDescription>
                        Current value: {editingRule.value} points
                      </AlertDescription>
                    </Box>
                  </Alert>

                  <FormControl>
                    <FormLabel color="white">Points Value</FormLabel>
                    <Input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
                      bg="gray.700"
                      color="white"
                      borderColor={borderColor}
                      _focus={{ borderColor: 'blue.400' }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="white">Description</FormLabel>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      bg="gray.700"
                      color="white"
                      borderColor={borderColor}
                      _placeholder={{ color: 'gray.400' }}
                      rows={3}
                    />
                  </FormControl>

                  <Divider />

                  <Alert status="warning">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Important</AlertTitle>
                      <AlertDescription>
                        Changing point values will affect all students' point calculations. 
                        Consider the impact on existing achievements.
                      </AlertDescription>
                    </Box>
                  </Alert>
                </>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} color="white">
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSaveRule}
              isLoading={updateRuleMutation.isPending}
              leftIcon={<FiSave />}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default PointRulesPage;