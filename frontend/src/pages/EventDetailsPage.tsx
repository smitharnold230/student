import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { FiCalendar, FiExternalLink, FiUsers, FiArrowLeft, FiEdit, FiTrash2 } from 'react-icons/fi';
import { eventAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Event, UpdateEventData } from '../types/event';
import EventDetailsModal from '../components/events/EventDetailsModal'; // Reusing the modal for display logic
import EditEventModal from '../components/events/EditEventModal'; // Reusing the edit modal

const EventDetailsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const { data: eventResponse, isLoading, isError, error } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventAPI.getEventDetails(eventId!),
    enabled: !!eventId, // Only run query if eventId is available
  });

  const event: Event | undefined = eventResponse?.data;

  const acceptEventMutation = useMutation({
    mutationFn: (id: string) => eventAPI.acceptEvent(id),
    onSuccess: () => {
      toast({
        title: 'Event accepted',
        description: 'You have accepted this event. Certification deadline reminder has been set.',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to accept event.',
        status: 'error',
        duration: 3000,
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdateEventData> }) =>
      eventAPI.updateEvent(id, data),
    onSuccess: () => {
      toast({
        title: 'Event updated',
        description: 'The event has been updated successfully.',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      // Close edit modal if it was open
      setIsEditModalOpen(false);
    },
    onError: (err: any) => {
      toast({
        title: 'Update failed',
        description: err.response?.data?.error || 'Failed to update event',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => eventAPI.deleteEvent(id),
    onSuccess: () => {
      toast({
        title: 'Event deleted',
        description: 'The event has been deleted successfully.',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/events'); // Redirect to events list after deletion
    },
    onError: (err: any) => {
      toast({
        title: 'Deletion failed',
        description: err.response?.data?.error || 'Failed to delete event',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      if (eventId) {
        deleteEventMutation.mutate(eventId);
      }
    }
  };

  const getEventTypeColor = (type: string) => {
    return type === 'WORKSHOP' ? 'blue' : 'purple';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!eventId) {
    return (
      <VStack spacing={6} align="stretch">
        <Heading size="lg" color="white" mb={2}>
          Event Details
        </Heading>
        <Text color="gray.400">No event ID provided.</Text>
        <Button leftIcon={<FiArrowLeft />} onClick={() => navigate('/events')}>
          Back to Events
        </Button>
      </VStack>
    );
  }

  if (isLoading) {
    return (
      <VStack spacing={6} align="stretch">
        <Heading size="lg" color="white" mb={2}>
          Event Details
        </Heading>
        <Skeleton height="200px" />
        <Skeleton height="150px" />
      </VStack>
    );
  }

  if (isError || !event) {
    return (
      <VStack spacing={6} align="stretch">
        <Heading size="lg" color="white" mb={2}>
          Event Details
        </Heading>
        <Text color="red.400">Error loading event: {error?.message || 'Event not found'}</Text>
        <Button leftIcon={<FiArrowLeft />} onClick={() => navigate('/events')}>
          Back to Events
        </Button>
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            Event Details
          </Heading>
          <Text color="gray.400">
            Detailed information about the event
          </Text>
        </Box>
        <Button leftIcon={<FiArrowLeft />} onClick={() => navigate('/events')}>
          Back to Events
        </Button>
      </HStack>

      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between" alignItems="flex-start">
              <Box>
                <Heading size="md" color="white" mb={2}>
                  {event.name}
                </Heading>
                <Badge colorScheme={getEventTypeColor(event.type)} mb={3}>
                  {event.type}
                </Badge>
              </Box>
              {user?.role === 'ADMIN' && (
                <HStack>
                  <Button
                    size="sm"
                    leftIcon={<FiEdit />}
                    colorScheme="blue"
                    onClick={handleEditClick}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    leftIcon={<FiTrash2 />}
                    colorScheme="red"
                    onClick={handleDeleteClick}
                    isLoading={deleteEventMutation.isPending}
                  >
                    Delete
                  </Button>
                </HStack>
              )}
            </HStack>

            <Divider borderColor={borderColor} />

            <VStack spacing={3} align="stretch">
              <HStack spacing={2}>
                <Icon as={FiCalendar} color="gray.500" boxSize={4} />
                <Text color="gray.300">
                  <strong>Date:</strong> {formatDate(event.date)}
                </Text>
              </HStack>

              <HStack spacing={2}>
                <Icon as={FiUsers} color="gray.500" boxSize={4} />
                <Text color="gray.300">
                  <strong>Organizer:</strong> {event.organizer}
                </Text>
              </HStack>

              {event.url && (
                <HStack spacing={2}>
                  <Icon as={FiExternalLink} color="gray.500" boxSize={4} />
                  <Text color="gray.300">
                    <strong>Event URL:</strong>{' '}
                    <a href={event.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3182ce' }}>
                      {event.url}
                    </a>
                  </Text>
                </HStack>
              )}

              {event.link && (
                <HStack spacing={2}>
                  <Icon as={FiExternalLink} color="gray.500" boxSize={4} />
                  <Text color="gray.300">
                    <strong>Registration Link:</strong>{' '}
                    <a href={event.link} target="_blank" rel="noopener noreferrer" style={{ color: '#3182ce' }}>
                      {event.link}
                    </a>
                  </Text>
                </HStack>
              )}

              {event.certificationDeadline && (
                <HStack spacing={2}>
                  <Icon as={FiCalendar} color="orange.400" boxSize={4} />
                  <Text color="orange.400">
                    <strong>Certification Deadline:</strong> {formatDate(event.certificationDeadline)}
                  </Text>
                </HStack>
              )}
            </VStack>

            {user?.role === 'STUDENT' && (
              <Button
                colorScheme="green"
                onClick={() => acceptEventMutation.mutate(event.id)}
                isLoading={acceptEventMutation.isPending}
                isDisabled={event.isParticipated}
                mt={4}
              >
                {event.isParticipated ? 'Accepted' : 'Accept Event'}
              </Button>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Reusing the EditEventModal for admin edits */}
      {user?.role === 'ADMIN' && event && (
        <EditEventModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          eventToEdit={event}
          onUpdateEvent={(id, data) => updateEventMutation.mutate({ id, data })}
          updateEventMutation={updateEventMutation}
        />
      )}
    </VStack>
  );
};

export default EventDetailsPage;