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
  Skeleton,
} from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FiSettings, FiSave, FiAward, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { adminAPI } from '../services/api';

interface PointRule {
  id: string;
  key: string;
  value: number;
  description: string;
}

const AdminSettingsPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const { data: rulesResponse, isLoading: rulesLoading } = useQuery({
    queryKey: ['pointRules'],
    queryFn: () => adminAPI.getPointRules(),
  });

  const [pointRules, setPointRules] = useState<PointRule[]>([]);

  React.useEffect(() => {
    // Correctly access the 'data' property from the response
    if (rulesResponse?.data?.data) {
      setPointRules(rulesResponse.data.data);
    }
  }, [rulesResponse]);

  const updatePointRuleMutation = useMutation({
    mutationFn: (rule: PointRule) => adminAPI.updatePointRule(rule.key, rule.value, rule.description),
    onSuccess: () => {
      toast({
        title: 'Point rule updated',
        description: 'The point rule has been updated successfully.',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['pointRules'] });
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

  if (rulesLoading) {
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
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height="100px" w="full" />
              ))}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="lg" color="white" mb={2}>
          System Settings
        </Heading>
        <Text color="gray.400">
          Configure point values for different activities and achievements
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

      {/* Quick Actions - Placeholder for future admin actions */}
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
                isDisabled // Placeholder, not yet implemented
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
                isDisabled // Placeholder, not yet implemented
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
                isDisabled // Placeholder, not yet implemented
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
                isDisabled // Placeholder, not yet implemented
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