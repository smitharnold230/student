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
import { useQuery, useMutation, useQueryClient } => eventAPI.createEvent(data), // Using CreateEventData
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
    mutationFn: ({ eventId, data }: { eventId: string; data: Partial<UpdateEventData> }) => // Using UpdateEventData
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
              onEdit={handleEditEvent} // Pass edit handler
              onDelete={handleDeleteEvent} // Pass delete handler
              deleteMutation={deleteEventMutation} // Pass delete mutation
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
        onEdit={handleEditEvent} // Pass edit handler
        onDelete={handleDeleteEvent} // Pass delete handler
        deleteMutation={deleteEventMutation} // Pass delete mutation
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