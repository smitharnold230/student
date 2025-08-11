import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { Notification } from '../types/notification';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export function useNotifications() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const socket = useRef<Socket | null>(null);
  const { user } = useAuthStore();

  const handleNewNotification = useCallback((notification: Notification) => {
    try {
      // Validate notification data
      if (!notification?.title || !notification?.message) {
        console.error('Invalid notification data received:', notification);
        return;
      }

      // Update notifications cache
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
        status: getNotificationStatus(notification.type),
        duration: 5000,
        isClosable: true,
        position: 'top-right',
        variant: 'left-accent'
      });
    } catch (error) {
      console.error('Error handling notification:', error);
      toast({
        title: 'Notification Error',
        description: 'Failed to process notification',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  }, [queryClient, toast]);

  useEffect(() => {
    if (!user) return; // Only connect if user is authenticated

    try {
      // Connect to socket
      socket.current = io(SOCKET_URL, {
        auth: { token: localStorage.getItem('token') },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      // Socket event handlers
      socket.current.on('connect', () => {
        console.log('Socket connected');
        if (user.id) {
          socket.current?.emit('join', user.id);
        }
      });

      socket.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to notification service. Retrying...',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      });

      socket.current.on('reconnect', (attemptNumber) => {
        console.log(`Socket reconnected after ${attemptNumber} attempts`);
        if (user.id) {
          socket.current?.emit('join', user.id);
        }
      });

      socket.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      socket.current.on('notification', handleNewNotification);
    } catch (error) {
      console.error('Error setting up socket connection:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to initialize notification service',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }

    // Cleanup on unmount
    return () => {
      try {
        if (socket.current) {
          socket.current.off('connect');
          socket.current.off('connect_error');
          socket.current.off('reconnect');
          socket.current.off('disconnect');
          socket.current.off('notification', handleNewNotification);
          socket.current.disconnect();
          socket.current = null;
        }
      } catch (error) {
        console.error('Error during socket cleanup:', error);
      }
    };
  }, [user, handleNewNotification, toast]);
}

function getNotificationStatus(type: Notification['type']): 'info' | 'warning' | 'error' | 'success' {
  try {
    switch (type?.toUpperCase()) {
      case 'WARNING':
        return 'warning';
      case 'ERROR':
        return 'error';
      case 'SUCCESS':
        return 'success';
      case 'SYSTEM':
      case 'INFO':
      default:
        return 'info';
    }
  } catch (error) {
    console.error('Error determining notification status:', error);
    return 'info';
  }
}