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
  useToast,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Grid,
  GridItem,
  Icon,
  Skeleton,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Corrected import statement
import { FiCalendar, FiPlus } from 'react-icons/fi';
import { eventAPI, notificationAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { AxiosProgressEvent } from 'axios';
import { Event, CreateEventData, UpdateEventData } from '../types/event';
import EventCard from '../components/events/EventCard';
import CreateEventModal from '../components/events/CreateEventModal';
import EventDetailsModal from '../components/events/EventDetailsModal';
import EditEventModal from '../components/events/EditEventModal';

const EventsPage: React.FC = () => {
  const { user } = useAuthStore();
  const toast = useToast();
  const queryClient = useQueryClient();
  
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  const { isOpen: isDetailsModalOpen, onOpen: onDetailsModalOpen, onClose: onDetailsModalClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const { data: eventsResponse, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventAPI.getEvents(),
  });

  const events: Event[] = eventsResponse?.data || [];

  const createEventMutation = useMutation({
    mutationFn: (data: CreateEventData) => eventAPI.createEvent(data),
    onSuccess: () => {
      toast({
        title: 'Event created',
        description: 'The event has been created successfully.',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onCreateModalClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Event creation failed',
        description: error.response?.data?.error || 'Failed to create event',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const acceptEventMutation = useMutation({
    mutationFn: (eventId: string) => eventAPI.acceptEvent(eventId),
    onSuccess: (data, eventId) => {
      toast({
        title: 'Event accepted',
        description: 'You have accepted this event. Certification deadline reminder has been set.',
        status: 'success',
        duration: 3000,
      });
      
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to accept event.',
        status: 'error',
        duration: 3000,
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: Partial<UpdateEventData> }) =>
      eventAPI.updateEvent(eventId, data),
    onSuccess: () => {
      toast({
        title: 'Event updated',
        description: 'The event has been updated successfully.',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onEditModalClose();
      setEventToEdit(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error.response?.data?.error || 'Failed to update event',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (eventId: string) => eventAPI.deleteEvent(eventId),
    onSuccess: () => {
      toast({
        title: 'Event deleted',
        description: 'The event has been deleted successfully.',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Deletion failed',
        description: error.response?.data?.error || 'Failed to delete event',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    onDetailsModalOpen();
  };

  const handleAcceptEvent = (eventId: string) => {
    acceptEventMutation.mutate(eventId);
  };

  const handleEditEvent = (event: Event) => {
    setEventToEdit(event);
    onEditModalOpen();
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      deleteEventMutation.mutate(eventId);
    }
  };

  if (isLoading) {
    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            Events
          </Heading>
          <Text color="gray.400">
            View and participate in workshops and hackathons
          </Text>
        </Box>
        
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
          {[...Array(6)].map((_, i) => (
            <GridItem key={i}>
              <Skeleton height="200px" />
            </GridItem>
          ))}
        </Grid>
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            Events
          </Heading>
          <Text color="gray.400">
            View and participate in workshops and hackathons
          </Text>
        </Box>
        
        {user?.role === 'ADMIN' && (
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brand"
            onClick={onCreateModalOpen}
          >
            Create Event
          </Button>
        )}
      </HStack>

      {/* Events Grid */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
        {events.map((event) => (
          <GridItem key={event.id}>
            <EventCard
              event={event}
              userRole={user?.role || null}
              onView={handleViewEvent}
              onAccept={handleAcceptEvent}
              acceptMutation={acceptEventMutation}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              deleteMutation={deleteEventMutation}
            />
          </GridItem>
        ))}
      </Grid>

      {events.length === 0 && (
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4}>
              <Icon as={FiCalendar} color="gray.500" boxSize={12} />
              <Text color="gray.400" textAlign="center">
                No events available at the moment.
              </Text>
              {user?.role === 'ADMIN' && (
                <Text color="gray.500" fontSize="sm" textAlign="center">
                  Create your first event to get started!
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>
      )}

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={onCreateModalClose}
        onCreateEvent={createEventMutation.mutate}
        createEventMutation={createEventMutation}
      />

      <EventDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={onDetailsModalClose}
        selectedEvent={selectedEvent}
        userRole={user?.role || null}
        onAccept={handleAcceptEvent}
        acceptMutation={acceptEventMutation}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
        deleteMutation={deleteEventMutation}
      />

      {/* New Edit Event Modal */}
      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={onEditModalClose}
        eventToEdit={eventToEdit}
        onUpdateEvent={(eventId: string, data: Partial<UpdateEventData>) => updateEventMutation.mutate({ eventId, data })}
        updateEventMutation={updateEventMutation}
      />
    </VStack>
  );
};

export default EventsPage;