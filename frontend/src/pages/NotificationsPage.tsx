import React from 'react';
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
  Icon,
  Skeleton,
  Divider,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiBell, FiCheck, FiAlertCircle, FiInfo, FiClock } from 'react-icons/fi';
import { notificationAPI } from '../services/api';
import { useNotifications } from '../hooks/useNotifications';
import { Notification } from '../types/notification';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const NotificationsPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate(); // Initialize useNavigate
  
  // Initialize real-time notifications
  useNotifications();
  
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const { data: notificationsResponse, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationAPI.getNotifications(),
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true,
  });

  const notifications: Notification[] = notificationsResponse?.data || [];

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationAPI.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to mark as read',
        description: error.response?.data?.error || 'Failed to update notification',
        status: 'error',
        duration: 3000,
      });
    },
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return FiCheck;
      case 'WARNING':
        return FiAlertCircle;
      case 'ERROR':
        return FiAlertCircle;
      case 'INFO':
      default:
        return FiInfo;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'green';
      case 'WARNING':
        return 'yellow';
      case 'ERROR':
        return 'red';
      case 'INFO':
      default:
        return 'blue';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;
  const totalCount = notifications.length;

  if (isLoading) {
    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            Notifications
          </Heading>
          <Text color="gray.400">
            Stay updated with your latest activities
          </Text>
        </Box>
        
        <VStack spacing={4}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} height="100px" w="full" />
          ))}
        </VStack>
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            Notifications
          </Heading>
          <Text color="gray.400">
            Stay updated with your latest activities
          </Text>
        </Box>
        
        <HStack spacing={3}>
          <Badge colorScheme="brand" variant="subtle">
            {unreadCount} unread
          </Badge>
          <Badge colorScheme="gray" variant="subtle">
            {totalCount} total
          </Badge>
        </HStack>
      </HStack>

      {/* Notifications List */}
      <VStack spacing={4} align="stretch">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              bg={cardBg}
              border="1px solid"
              borderColor={notification.read ? borderColor : 'brand.500'}
              opacity={notification.read ? 0.7 : 1}
              transition="all 0.2s"
              _hover={{ opacity: 1 }}
            >
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <HStack spacing={3}>
                      <Icon
                        as={getNotificationIcon(notification.type)}
                        color={`${getNotificationColor(notification.type)}.500`}
                        boxSize={5}
                      />
                      <VStack align="start" spacing={1}>
                        <Text color="white" fontWeight="semibold">
                          {notification.title}
                        </Text>
                        <Text color="gray.400" fontSize="sm">
                          {notification.message}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    <VStack align="end" spacing={2}>
                      <HStack spacing={2}>
                        <Badge
                          colorScheme={getNotificationColor(notification.type)}
                          variant="subtle"
                          fontSize="xs"
                        >
                          {notification.type}
                        </Badge>
                        {!notification.read && (
                          <Badge colorScheme="brand" variant="solid" fontSize="xs">
                            NEW
                          </Badge>
                        )}
                      </HStack>
                      
                      <HStack spacing={2}>
                        <Text color="gray.500" fontSize="xs">
                          <Icon as={FiClock} mr={1} />
                          {formatDate(notification.createdAt)}
                        </Text>
                        
                        {!notification.read && (
                          <Button
                            size="xs"
                            colorScheme="brand"
                            variant="ghost"
                            onClick={() => handleMarkAsRead(notification.id)}
                            isLoading={markAsReadMutation.isPending}
                          >
                            Mark as read
                          </Button>
                        )}
                      </HStack>
                    </VStack>
                  </HStack>

                  {notification.eventId && (
                    <>
                      <Divider borderColor={borderColor} />
                      <Button
                        size="sm"
                        colorScheme="brand"
                        variant="outline"
                        onClick={() => navigate(`/events/${notification.eventId}`)} // Changed to navigate
                      >
                        View Event Details
                      </Button>
                    </>
                  )}
                </VStack>
              </CardBody>
            </Card>
          ))
        ) : (
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4}>
                <Icon as={FiBell} color="gray.500" boxSize={12} />
                <Text color="gray.400" textAlign="center">
                  No notifications yet.
                </Text>
                <Text color="gray.500" fontSize="sm" textAlign="center">
                  You'll see notifications here when you have updates.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>


    </VStack>
  );
};

export default NotificationsPage;