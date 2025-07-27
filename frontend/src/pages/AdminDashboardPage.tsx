import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  useColorModeValue,
  Grid,
  GridItem,
  Icon,
  Skeleton,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { 
  FiUsers, 
  FiCalendar, 
  FiAward, 
  FiBarChart, 
  FiSettings, 
  FiDownload,
  FiTrendingUp,
  FiAlertCircle,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi';
import { adminAPI, leaderboardAPI, eventAPI, profileAPI } from '../services/api';

interface SystemStats {
  totalStudents: number;
  totalEvents: number;
  pendingCertifications: number;
  activeUsers: number;
  totalPoints: number;
  averagePoints: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: string;
}

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const { data: leaderboardResponse } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => leaderboardAPI.getLeaderboard(),
  });

  const { data: eventsResponse } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventAPI.getEvents(),
  });

  const { data: systemStatsResponse } = useQuery({
    queryKey: ['systemStats'],
    queryFn: () => adminAPI.getSystemStats(),
  });

  const { data: recentActivityResponse } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: () => adminAPI.getRecentActivity(),
  });

  const { data: profileRequestsResponse } = useQuery({
    queryKey: ['profileRequests'],
    queryFn: () => profileAPI.getPendingRequests(),
  });

  // Use real data from API responses
  const systemStats: SystemStats = systemStatsResponse?.data || {
    totalStudents: 0,
    totalEvents: 0,
    pendingCertifications: 0,
    activeUsers: 0,
    totalPoints: 0,
    averagePoints: 0,
  };

  const recentActivities: RecentActivity[] = recentActivityResponse?.data || [];
  const events = eventsResponse?.data || [];
  const leaderboard = leaderboardResponse?.data || [];
  const profileRequests: any[] = profileRequestsResponse?.data || [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'CERTIFICATION':
        return FiAward;
      case 'EVENT':
        return FiCalendar;
      case 'PROFILE':
        return FiUsers;
      case 'POINTS':
        return FiTrendingUp;
      default:
        return FiAlertCircle;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'CERTIFICATION':
        return 'purple';
      case 'EVENT':
        return 'blue';
      case 'PROFILE':
        return 'green';
      case 'POINTS':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'green';
      case 'PENDING':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const quickActions = [
    {
      label: 'Manage Events',
      description: 'Create & edit events',
      icon: FiCalendar,
      color: 'blue',
      onClick: () => navigate('/events'),
    },
    {
      label: 'Verify Certifications',
      description: 'Review submissions',
      icon: FiAward,
      color: 'purple',
      onClick: () => navigate('/certifications'),
    },
    {
      label: 'Profile Requests',
      description: 'Review edit requests',
      icon: FiUsers,
      color: 'cyan',
      onClick: () => navigate('/admin/profile-requests'),
    },
    {
      label: 'Export Data',
      description: 'Download reports',
      icon: FiDownload,
      color: 'green',
      onClick: () => navigate('/admin/logs'),
    },
    {
      label: 'System Settings',
      description: 'Configure points & rules',
      icon: FiSettings,
      color: 'orange',
      onClick: () => navigate('/admin/settings'),
    },
  ];

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="lg" color="white" mb={2}>
          Admin Dashboard
        </Heading>
        <Text color="gray.400">
          Monitor system activity and manage student development
        </Text>
      </Box>

      {/* System Overview Stats */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
        <GridItem>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={3}>
                <Icon as={FiUsers} color="blue.500" boxSize={8} />
                <Stat>
                  <StatLabel color="gray.400" fontSize="sm">Total Students</StatLabel>
                  <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                    {systemStats.totalStudents}
                  </StatNumber>
                  <StatHelpText color="gray.500" fontSize="xs">
                    Enrolled students
                  </StatHelpText>
                </Stat>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={3}>
                <Icon as={FiCalendar} color="green.500" boxSize={8} />
                <Stat>
                  <StatLabel color="gray.400" fontSize="sm">Total Events</StatLabel>
                  <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                    {systemStats.totalEvents}
                  </StatNumber>
                  <StatHelpText color="gray.500" fontSize="xs">
                    Workshops & hackathons
                  </StatHelpText>
                </Stat>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={3}>
                <Icon as={FiAward} color="purple.500" boxSize={8} />
                <Stat>
                  <StatLabel color="gray.400" fontSize="sm">Pending Certifications</StatLabel>
                  <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                    {systemStats.pendingCertifications}
                  </StatNumber>
                  <StatHelpText color="gray.500" fontSize="xs">
                    Awaiting verification
                  </StatHelpText>
                </Stat>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={3}>
                <Icon as={FiTrendingUp} color="orange.500" boxSize={8} />
                <Stat>
                  <StatLabel color="gray.400" fontSize="sm">Total Points</StatLabel>
                  <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                    {systemStats.totalPoints.toLocaleString()}
                  </StatNumber>
                  <StatHelpText color="gray.500" fontSize="xs">
                    System-wide points
                  </StatHelpText>
                </Stat>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={3}>
                <Icon as={FiBarChart} color="cyan.500" boxSize={8} />
                <Stat>
                  <StatLabel color="gray.400" fontSize="sm">Average Points</StatLabel>
                  <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                    {systemStats.averagePoints}
                  </StatNumber>
                  <StatHelpText color="gray.500" fontSize="xs">
                    Per student
                  </StatHelpText>
                </Stat>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={3}>
                <Icon as={FiCheckCircle} color="green.500" boxSize={8} />
                <Stat>
                  <StatLabel color="gray.400" fontSize="sm">Active Users</StatLabel>
                  <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                    {systemStats.activeUsers}
                  </StatNumber>
                  <StatHelpText color="gray.500" fontSize="xs">
                    This week
                  </StatHelpText>
                </Stat>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Quick Actions */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="white">
              Quick Actions
            </Heading>
            
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  leftIcon={<Icon as={action.icon} />}
                  colorScheme={action.color}
                  variant="outline"
                  size="lg"
                  h="auto"
                  p={4}
                  flexDirection="column"
                  onClick={action.onClick}
                >
                  <Text fontSize="sm" fontWeight="bold">
                    {action.label}
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    {action.description}
                  </Text>
                </Button>
              ))}
            </Grid>
          </VStack>
        </CardBody>
      </Card>

      {/* Recent Activity */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="white">
              Recent Activity
            </Heading>
            
            {recentActivities.length > 0 ? (
              <VStack spacing={3} align="stretch">
                {recentActivities.map((activity) => (
                  <HStack key={activity.id} spacing={4} p={3} bg="gray.700" borderRadius="md">
                    <Icon
                      as={getActivityIcon(activity.type)}
                      color={`${getActivityColor(activity.type)}.500`}
                      boxSize={5}
                    />
                    
                    <VStack align="start" spacing={1} flex={1}>
                      <Text color="white" fontSize="sm" fontWeight="medium">
                        {activity.description}
                      </Text>
                      <Text color="gray.400" fontSize="xs">
                        {formatDate(activity.timestamp)}
                      </Text>
                    </VStack>
                    
                    <Badge
                      colorScheme={getStatusColor(activity.status)}
                      variant="subtle"
                      fontSize="xs"
                    >
                      {activity.status}
                    </Badge>
                  </HStack>
                ))}
              </VStack>
            ) : (
              <VStack spacing={4}>
                <Icon as={FiClock} color="gray.500" boxSize={12} />
                <Text color="gray.400" textAlign="center">
                  No recent activity to display.
                </Text>
                <Text color="gray.500" fontSize="sm" textAlign="center">
                  Activity will appear here as users interact with the system.
                </Text>
              </VStack>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* System Health */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md" color="white">
                System Health
              </Heading>
              
              <VStack spacing={3} align="stretch">
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text color="gray.400" fontSize="sm">Database</Text>
                    <Badge colorScheme="green" variant="subtle" fontSize="xs">
                      Healthy
                    </Badge>
                  </HStack>
                  <Progress value={95} colorScheme="green" size="sm" />
                </Box>
                
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text color="gray.400" fontSize="sm">API Performance</Text>
                    <Badge colorScheme="green" variant="subtle" fontSize="xs">
                      Optimal
                    </Badge>
                  </HStack>
                  <Progress value={88} colorScheme="green" size="sm" />
                </Box>
                
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text color="gray.400" fontSize="sm">Storage</Text>
                    <Badge colorScheme="yellow" variant="subtle" fontSize="xs">
                      Moderate
                    </Badge>
                  </HStack>
                  <Progress value={65} colorScheme="yellow" size="sm" />
                </Box>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md" color="white">
                Alerts & Notifications
              </Heading>
              
                              <VStack spacing={3} align="stretch">
                  {systemStats.pendingCertifications > 0 && (
                    <HStack spacing={3} p={3} bg="yellow.900" borderRadius="md">
                      <Icon as={FiAlertCircle} color="yellow.500" boxSize={5} />
                      <VStack align="start" spacing={1}>
                        <Text color="white" fontSize="sm" fontWeight="medium">
                          {systemStats.pendingCertifications} pending certifications
                        </Text>
                        <Text color="yellow.200" fontSize="xs">
                          Requires attention
                        </Text>
                      </VStack>
                    </HStack>
                  )}
                  
                  {profileRequests.filter(r => r.status === 'PENDING').length > 0 && (
                    <HStack spacing={3} p={3} bg="blue.900" borderRadius="md">
                      <Icon as={FiUsers} color="blue.500" boxSize={5} />
                      <VStack align="start" spacing={1}>
                        <Text color="white" fontSize="sm" fontWeight="medium">
                          {profileRequests.filter(r => r.status === 'PENDING').length} pending profile requests
                        </Text>
                        <Text color="blue.200" fontSize="xs">
                          Review student edit requests
                        </Text>
                      </VStack>
                    </HStack>
                  )}
                
                <HStack spacing={3} p={3} bg="blue.900" borderRadius="md">
                  <Icon as={FiClock} color="blue.500" boxSize={5} />
                  <VStack align="start" spacing={1}>
                    <Text color="white" fontSize="sm" fontWeight="medium">
                      Weekly report due
                    </Text>
                    <Text color="blue.200" fontSize="xs">
                      Generate by Friday
                    </Text>
                  </VStack>
                </HStack>
                
                <HStack spacing={3} p={3} bg="green.900" borderRadius="md">
                  <Icon as={FiCheckCircle} color="green.500" boxSize={5} />
                  <VStack align="start" spacing={1}>
                    <Text color="white" fontSize="sm" fontWeight="medium">
                      System backup completed
                    </Text>
                    <Text color="green.200" fontSize="xs">
                      All data secured
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </Grid>
    </VStack>
  );
};

export default AdminDashboardPage; 