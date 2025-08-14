import React from 'react';
import {
  Box,
  Grid,
  GridItem,
  VStack,
  Text,
  Heading,
  Skeleton,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import {
  leaderboardAPI,
  profileAPI,
  eventAPI,
  codingStatsAPI,
  notificationAPI,
  adminAPI,
} from '../services/api';
import { useAuthStore } from '../store/authStore';
import DashboardContent from '../components/dashboard/DashboardContent'; // Import the new component

// Interfaces are now defined in DashboardContent, but we need them here for typing the fetched data
interface MyRank {
  rank: number | null;
  points: number | null;
  totalStudents: number | null;
  message?: string;
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
  profilePhotoUrl?: string;
}

interface Event {
  id: string;
  name: string;
  type: 'WORKSHOP' | 'HACKATHON';
  date: string;
}

interface CodingStat {
  id: string;
  platform: 'LEETCODE' | 'HACKERRANK';
  problemsSolved: number;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  deadline?: string;
  read: boolean;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  const { data: myRankResponse, isLoading: myRankLoading } = useQuery({
    queryKey: ['myRank'],
    queryFn: () => leaderboardAPI.getMyRank(),
  });

  const { data: profileResponse, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileAPI.getProfile(),
  });

  const { data: eventsResponse, isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventAPI.getEvents(),
  });

  const { data: codingStatsResponse, isLoading: codingStatsLoading } = useQuery(
    {
      queryKey: ['codingStats'],
      queryFn: () => codingStatsAPI.getStats(),
    },
  );

  const { data: notificationsResponse, isLoading: notificationsLoading } =
    useQuery({
      queryKey: ['notifications'],
      queryFn: () => notificationAPI.getNotifications(),
    });

  const myRank: MyRank = myRankResponse?.data;
  const profile: Profile | undefined = profileResponse?.data;
  const events: Event[] = eventsResponse?.data || [];
  const codingStats: CodingStat[] = codingStatsResponse?.data || [];
  const notifications: Notification[] = notificationsResponse?.data || [];

  const isLoading =
    myRankLoading ||
    profileLoading ||
    eventsLoading ||
    codingStatsLoading ||
    notificationsLoading;

  if (isLoading) {
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
        <Grid
          templateColumns={{
            base: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          }}
          gap={6}
        >
          {[...Array(4)].map((_, i) => (
            <GridItem key={i}>
              <Skeleton height="120px" />
            </GridItem>
          ))}
        </Grid>
        <Skeleton height="150px" />
        <Skeleton height="200px" />
        <Skeleton height="250px" />
        <Skeleton height="200px" />
      </VStack>
    );
  }

  return (
    <DashboardContent
      user={user}
      myRank={myRank}
      profile={profile!}
      events={events}
      codingStats={codingStats}
      notifications={notifications}
    />
  );
};

export default DashboardPage;
