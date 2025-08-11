import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  CardBody,
  Badge,
  Grid,
  Icon,
} from '@chakra-ui/react';
import { FiUsers, FiCalendar } from 'react-icons/fi';

interface UserWithPoints {
  id: string;
  name: string;
  email: string;
  class: string;
  batch: string;
  points: number;
  profileId: string;
}

interface PointStatistics {
  totalUsers: number;
  totalPoints: number;
  averagePoints: number;
  topPerformers: UserWithPoints[];
}

interface ProfileRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  requestedData: any;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  adminNote?: string;
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

interface AdminUserActivityOverviewProps {
  pointStats: PointStatistics;
  profileRequests: ProfileRequest[];
  events: Event[];
  systemStats: { pendingCertifications: number };
  cardBg: string;
  borderColor: string;
}

const AdminUserActivityOverview: React.FC<AdminUserActivityOverviewProps> = ({
  pointStats,
  profileRequests,
  events,
  systemStats,
  cardBg,
  borderColor,
}) => {
  return (
    <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Heading size="md" color="white">
            User Activity Overview
          </Heading>
          
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
            <VStack spacing={3} align="stretch">
              <Text color="white" fontSize="sm" fontWeight="medium">
                Top Performers
              </Text>
              {pointStats.topPerformers.length > 0 ? (
                pointStats.topPerformers.slice(0, 5).map((user: UserWithPoints, index: number) => (
                  <HStack key={user.id} justify="space-between" p={2} bg="gray.700" borderRadius="md">
                    <HStack spacing={3}>
                      <Badge colorScheme="yellow" fontSize="xs">#{index + 1}</Badge>
                      <VStack align="start" spacing={0}>
                        <Text color="white" fontSize="sm" fontWeight="medium">
                          {user.name}
                        </Text>
                        <Text color="gray.400" fontSize="xs">
                          {user.email}
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge colorScheme="green" fontSize="sm">
                      {user.points} pts
                    </Badge>
                  </HStack>
                ))
              ) : (
                <Text color="gray.400" fontSize="sm">No top performers yet.</Text>
              )}
            </VStack>
            
            <VStack spacing={3} align="stretch">
              <Text color="white" fontSize="sm" fontWeight="medium">
                Recent Activity
              </Text>
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between" p={2} bg="gray.700" borderRadius="md">
                  <Text color="gray.400" fontSize="sm">Profile Requests</Text>
                  <Badge colorScheme="orange" fontSize="sm">
                    {profileRequests.filter(r => r.status === 'PENDING').length}
                  </Badge>
                </HStack>
                <HStack justify="space-between" p={2} bg="gray.700" borderRadius="md">
                    <Text color="gray.400" fontSize="sm">Active Events</Text>
                    <Badge colorScheme="blue" fontSize="sm">
                      {events.filter((e: any) => new Date(e.date) > new Date()).length}
                    </Badge>
                  </HStack>
                <HStack justify="space-between" p={2} bg="gray.700" borderRadius="md">
                  <Text color="gray.400" fontSize="sm">Pending Certifications</Text>
                  <Badge colorScheme="red" fontSize="sm">
                    {systemStats.pendingCertifications}
                  </Badge>
                </HStack>
              </VStack>
            </VStack>
          </Grid>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default AdminUserActivityOverview;