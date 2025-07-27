import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  GridItem,
  VStack,
  HStack,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Heading,
  Badge,
  Progress,
  useColorModeValue,
  Button,
  Icon,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { FiUsers, FiAward, FiCode, FiCalendar, FiBarChart, FiTrendingUp } from 'react-icons/fi';
import { leaderboardAPI, profileAPI, eventAPI, codingStatsAPI, notificationAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';

interface MyRank {
  rank: number;
  points: number;
  totalStudents: number;
}

interface Profile {
  id: string;
  name: string;
  degree: string;
  class: string;
  status: string;
  transport: string;
  hostelInfo: string;
  batch: string;
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

interface CodingStat {
  id: string;
  platform: 'LEETCODE' | 'HACKERRANK';
  username: string;
  problemsSolved: number;
  totalProblems: number;
  rank: number;
  rating: number;
  lastUpdated: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  eventId?: string;
  deadline?: string;
  read: boolean;
  createdAt: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const { data: myRankResponse } = useQuery({
    queryKey: ['myRank'],
    queryFn: () => leaderboardAPI.getMyRank(),
  });

  const { data: profileResponse } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileAPI.getProfile(),
  });

  const { data: eventsResponse } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventAPI.getEvents(),
  });

  const { data: codingStatsResponse } = useQuery({
    queryKey: ['codingStats'],
    queryFn: () => codingStatsAPI.getStats(),
  });

  const { data: notificationsResponse } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationAPI.getNotifications(),
  });

  const myRank: MyRank = myRankResponse?.data;
  const profile: Profile = profileResponse?.data;
  const events: Event[] = eventsResponse?.data || [];
  const codingStats: CodingStat[] = codingStatsResponse?.data || [];
  const notifications: Notification[] = notificationsResponse?.data || [];

  const stats = [
    {
      label: 'My Rank',
      value: myRank?.rank || 'N/A',
      icon: FiBarChart,
      color: 'blue.500',
      helpText: `Out of ${myRank?.totalStudents || 0} students`,
    },
    {
      label: 'Total Points',
      value: myRank?.points || 0,
      icon: FiTrendingUp,
      color: 'green.500',
      helpText: 'Earned through activities',
    },
    {
      label: 'Events Attended',
      value: events.length,
      icon: FiCalendar,
      color: 'purple.500',
      helpText: 'Workshops and hackathons',
    },
    {
      label: 'Problems Solved',
      value: codingStats.reduce((sum, stat) => sum + (stat.problemsSolved || 0), 0),
      icon: FiCode,
      color: 'orange.500',
      helpText: 'LeetCode & HackerRank',
    },
  ];

  const quickActions = [
    {
      label: 'View Leaderboard',
      description: 'See your ranking among peers',
      icon: FiBarChart,
      color: 'blue',
      onClick: () => navigate('/leaderboard'),
    },
    {
      label: 'Manage Profile',
      description: 'Update your information',
      icon: FiUsers,
      color: 'green',
      onClick: () => navigate('/profile'),
    },
    {
      label: 'Browse Events',
      description: 'Find workshops and hackathons',
      icon: FiCalendar,
      color: 'purple',
      onClick: () => navigate('/events'),
    },
    {
      label: 'Coding Stats',
      description: 'Track your progress',
      icon: FiCode,
      color: 'orange',
      onClick: () => navigate('/coding-stats'),
    },
  ];

  const getProgressionLevel = (points: number) => {
    if (points >= 1000) return { level: 'Expert', color: 'purple', progress: 100 };
    if (points >= 750) return { level: 'Advanced', color: 'blue', progress: 75 };
    if (points >= 500) return { level: 'Intermediate', color: 'green', progress: 50 };
    if (points >= 250) return { level: 'Beginner', color: 'yellow', progress: 25 };
    return { level: 'Novice', color: 'gray', progress: 0 };
  };

  const progression = getProgressionLevel(myRank?.points || 0);

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="lg" color="white" mb={2}>
          Welcome back, {profile?.name || user?.email}!
        </Heading>
        <Text color="gray.400">
          Track your development progress and achievements
        </Text>
      </Box>

      {/* Stats Grid */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6}>
        {stats.map((stat, index) => (
          <GridItem key={index}>
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardBody>
                <VStack spacing={3}>
                  <Icon as={stat.icon} color={stat.color} boxSize={8} />
                  <Stat>
                    <StatLabel color="gray.400" fontSize="sm">
                      {stat.label}
                    </StatLabel>
                    <StatNumber color="white" fontSize="2xl" fontWeight="bold">
                      {stat.value}
                    </StatNumber>
                    <StatHelpText color="gray.500" fontSize="xs">
                      {stat.helpText}
                    </StatHelpText>
                  </Stat>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>

      {/* Progression Level */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Heading size="md" color="white">
                Your Progression
              </Heading>
              <Badge colorScheme={progression.color} variant="subtle" fontSize="sm">
                {progression.level}
              </Badge>
            </HStack>
            
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text color="gray.400" fontSize="sm">
                  Progress to next level
                </Text>
                <Text color="white" fontSize="sm">
                  {myRank?.points || 0} / 1000 points
                </Text>
              </HStack>
              <Progress
                value={progression.progress}
                colorScheme={progression.color}
                size="lg"
                borderRadius="full"
              />
            </Box>
          </VStack>
        </CardBody>
      </Card>

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

      {/* Notifications */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="white">
              Notifications
            </Heading>
            
            {notifications.length > 0 ? (
              <VStack spacing={3} align="stretch">
                {notifications.slice(0, 5).map((notification) => (
                  <HStack key={notification.id} spacing={4} p={3} bg="gray.700" borderRadius="md">
                    <Icon as={FiCalendar} color={notification.type === 'CERTIFICATION_REMINDER' ? 'orange.500' : 'blue.500'} boxSize={5} />
                    <VStack align="start" spacing={1} flex={1}>
                      <Text color="white" fontSize="sm" fontWeight="medium">
                        {notification.title}
                      </Text>
                      <Text color="gray.400" fontSize="xs">
                        {notification.message}
                      </Text>
                      {notification.deadline && (
                        <Text color="orange.400" fontSize="xs">
                          Deadline: {new Date(notification.deadline).toLocaleDateString()}
                        </Text>
                      )}
                    </VStack>
                    {!notification.read && (
                      <Badge colorScheme="red" variant="solid" fontSize="xs">
                        New
                      </Badge>
                    )}
                  </HStack>
                ))}
              </VStack>
            ) : (
              <VStack spacing={4}>
                <Icon as={FiCalendar} color="gray.500" boxSize={12} />
                <Text color="gray.400" textAlign="center">
                  No notifications at the moment.
                </Text>
              </VStack>
            )}
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
            
            {events.length > 0 ? (
              <VStack spacing={3} align="stretch">
                {events.slice(0, 3).map((event) => (
                  <HStack key={event.id} spacing={4} p={3} bg="gray.700" borderRadius="md">
                    <Icon as={FiCalendar} color="blue.500" boxSize={5} />
                    <VStack align="start" spacing={1} flex={1}>
                      <Text color="white" fontSize="sm" fontWeight="medium">
                        {event.name}
                      </Text>
                      <Text color="gray.400" fontSize="xs">
                        {new Date(event.date).toLocaleDateString()}
                      </Text>
                    </VStack>
                    <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                      {event.type}
                    </Badge>
                  </HStack>
                ))}
              </VStack>
            ) : (
              <VStack spacing={4}>
                <Icon as={FiCalendar} color="gray.500" boxSize={12} />
                <Text color="gray.400" textAlign="center">
                  No recent events attended.
                </Text>
                <Text color="gray.500" fontSize="sm" textAlign="center">
                  Participate in events to see your activity here!
                </Text>
              </VStack>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default DashboardPage; 