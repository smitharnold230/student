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
  FormControl,
  FormLabel,
  Input,
  useToast,
  useColorModeValue,
  Grid,
  GridItem,
  Icon,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FiSettings, FiSave, FiAward, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { adminAPI } from '../services/api';

interface PointRule {
  key: string;
  value: number;
  description: string;
}

const AdminSettingsPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const [pointRules, setPointRules] = useState<PointRule[]>([
    { key: 'WORKSHOP_PARTICIPATION', value: 50, description: 'Points for workshop participation' },
    { key: 'HACKATHON_PARTICIPATION', value: 100, description: 'Points for hackathon participation' },
    { key: 'CERTIFICATION_APPROVED', value: 75, description: 'Points for approved certification' },
    { key: 'LEETCODE_SUBMISSION', value: 25, description: 'Points for LeetCode submission' },
    { key: 'HACKERRANK_SUBMISSION', value: 25, description: 'Points for HackerRank submission' },
  ]);

  const updatePointRuleMutation = useMutation({
    mutationFn: (rule: PointRule) => adminAPI.updatePointRule(rule.key, rule.value, rule.description),
    onSuccess: () => {
      toast({
        title: 'Point rule updated',
        description: 'The point rule has been updated successfully.',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['systemStats'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error.response?.data?.error || 'Failed to update point rule',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleUpdateRule = (rule: PointRule) => {
    updatePointRuleMutation.mutate(rule);
  };

  const handleRuleChange = (index: number, field: keyof PointRule, value: string | number) => {
    const updatedRules = [...pointRules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    setPointRules(updatedRules);
  };

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="lg" color="white" mb={2}>
          System Settings
        </Heading>
        <Text color="gray.400">
          Configure point rules and system parameters
        </Text>
      </Box>

      {/* Point Rules Configuration */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <HStack>
              <Icon as={FiAward} color="yellow.500" boxSize={6} />
              <Heading size="md" color="white">
                Point Rules Configuration
              </Heading>
            </HStack>
            
            <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
              {pointRules.map((rule, index) => (
                <GridItem key={rule.key}>
                  <Card bg="gray.700" border="1px solid" borderColor="gray.600">
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Text color="white" fontWeight="semibold" fontSize="sm">
                          {rule.description}
                        </Text>
                        
                        <FormControl>
                          <FormLabel color="gray.300" fontSize="sm">Points</FormLabel>
                          <Input
                            type="number"
                            value={rule.value}
                            onChange={(e) => handleRuleChange(index, 'value', parseInt(e.target.value) || 0)}
                            bg="gray.600"
                            borderColor="gray.500"
                            color="white"
                            size="sm"
                          />
                        </FormControl>
                        
                        <Button
                          size="sm"
                          colorScheme="brand"
                          onClick={() => handleUpdateRule(rule)}
                          isLoading={updatePointRuleMutation.isPending}
                          leftIcon={<FiSave />}
                        >
                          Update Rule
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                </GridItem>
              ))}
            </Grid>
          </VStack>
        </CardBody>
      </Card>

      {/* System Information */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack>
                <Icon as={FiSettings} color="blue.500" boxSize={6} />
                <Heading size="md" color="white">
                  System Information
                </Heading>
              </HStack>
              
              <VStack spacing={3} align="stretch">
                <Box>
                  <Text color="gray.400" fontSize="sm">API Version</Text>
                  <Text color="white" fontSize="md">v1.0.0</Text>
                </Box>
                
                <Box>
                  <Text color="gray.400" fontSize="sm">Database Status</Text>
                  <Text color="green.400" fontSize="md">Connected</Text>
                </Box>
                
                <Box>
                  <Text color="gray.400" fontSize="sm">Last Backup</Text>
                  <Text color="white" fontSize="md">2 hours ago</Text>
                </Box>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack>
                <Icon as={FiTrendingUp} color="green.500" boxSize={6} />
                <Heading size="md" color="white">
                  Performance Metrics
                </Heading>
              </HStack>
              
              <VStack spacing={3} align="stretch">
                <Box>
                  <Text color="gray.400" fontSize="sm">Average Response Time</Text>
                  <Text color="white" fontSize="md">125ms</Text>
                </Box>
                
                <Box>
                  <Text color="gray.400" fontSize="sm">Uptime</Text>
                  <Text color="green.400" fontSize="md">99.9%</Text>
                </Box>
                
                <Box>
                  <Text color="gray.400" fontSize="sm">Active Sessions</Text>
                  <Text color="white" fontSize="md">23</Text>
                </Box>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Quick Actions */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack>
              <Icon as={FiUsers} color="purple.500" boxSize={6} />
              <Heading size="md" color="white">
                Quick Actions
              </Heading>
            </HStack>
            
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <Button
                colorScheme="blue"
                variant="outline"
                size="lg"
                h="auto"
                p={4}
                flexDirection="column"
              >
                <Text fontSize="sm" fontWeight="bold">
                  Backup Database
                </Text>
                <Text fontSize="xs" color="gray.400">
                  Create system backup
                </Text>
              </Button>
              
              <Button
                colorScheme="green"
                variant="outline"
                size="lg"
                h="auto"
                p={4}
                flexDirection="column"
              >
                <Text fontSize="sm" fontWeight="bold">
                  Clear Cache
                </Text>
                <Text fontSize="xs" color="gray.400">
                  Refresh system cache
                </Text>
              </Button>
              
              <Button
                colorScheme="orange"
                variant="outline"
                size="lg"
                h="auto"
                p={4}
                flexDirection="column"
              >
                <Text fontSize="sm" fontWeight="bold">
                  System Health Check
                </Text>
                <Text fontSize="xs" color="gray.400">
                  Run diagnostics
                </Text>
              </Button>
              
              <Button
                colorScheme="purple"
                variant="outline"
                size="lg"
                h="auto"
                p={4}
                flexDirection="column"
              >
                <Text fontSize="sm" fontWeight="bold">
                  Update System
                </Text>
                <Text fontSize="xs" color="gray.400">
                  Check for updates
                </Text>
              </Button>
            </Grid>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default AdminSettingsPage; 