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
  const { user, token } = useAuthStore(); // Get token from auth store

  const handleNewNotification = useCallback((notification: Notification) => {
    try {
      if (!notification?.title || !notification?.message) {
        console.error('Invalid notification data received:', notification);
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['notifications'] });

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
    if (!user || !token) {
      // Disconnect if user logs out or token is gone
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
      return;
    }

    // Only connect if socket is not already connected or is null
    if (!socket.current || !socket.current.connected) {
      try {
        socket.current = io(SOCKET_URL, {
          auth: { token: token }, // Use token from Zustand store
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000
        });

        socket.current.on('connect', () => {
          if (user.id) {
            socket.current?.emit('join', user.id); // Standardized room name
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
    }

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
  }, [user, token, handleNewNotification, toast]);
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
      case 'INFO':
      case 'CERTIFICATION_REMINDER':
      case 'POINTS_UPDATE':
      case 'POINTS_RESET':
      default:
        return 'info';
    }
  } catch (error) {
    console.error('Error determining notification status:', error);
    return 'info';
  }
}