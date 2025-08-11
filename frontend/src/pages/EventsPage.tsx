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
  Badge,
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
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Grid,
  GridItem,
  Icon,
  Skeleton,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiCalendar, FiMapPin, FiUsers, FiPlus, FiExternalLink } from 'react-icons/fi';
import { eventAPI, notificationAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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

interface CreateEventData {
  name: string;
  type: 'WORKSHOP' | 'HACKATHON';
  date: string;
  organizer: string;
  url: string;
  link: string;
  certificationDeadline?: string;
}

interface FormattedEventData {
  name: string;
  type: 'WORKSHOP' | 'HACKATHON';
  date: string | null;
  organizer: string;
  url: string;
  link: string;
  certificationDeadline?: string | null;
}

const createEventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  type: z.string().refine(val => val === 'WORKSHOP' || val === 'HACKATHON', { message: 'Event type is required' }),
  date: z.string().min(1, 'Date is required'),
  organizer: z.string().min(1, 'Organizer is required'),
  url: z.string().optional(),
  link: z.string().optional(),
  certificationDeadline: z.string().optional(),
});

type CreateEventForm = z.infer<typeof createEventSchema>;

const EventsPage: React.FC = () => {
  const { user } = useAuthStore();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [createEventData, setCreateEventData] = useState<CreateEventData>({
    name: '',
    type: 'WORKSHOP',
    date: '',
    organizer: '',
    url: '',
    link: '',
  });
  
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const { data: eventsResponse, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventAPI.getEvents(),
  });

  const events: Event[] = eventsResponse?.data || [];

  const participateMutation = useMutation({
    mutationFn: (eventId: string) => eventAPI.participate(eventId),
    onSuccess: () => {
      toast({
        title: 'Participation recorded',
        description: 'You have successfully registered for this event.',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Participation failed',
        description: error.response?.data?.error || 'Failed to register for event',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const createEventMutation = useMutation({
    mutationFn: (data: FormattedEventData) => eventAPI.createEvent(data),
    onSuccess: () => {
      toast({
        title: 'Event created',
        description: 'The event has been created successfully.',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onClose();
      setCreateEventData({
        name: '',
        type: 'WORKSHOP',
        date: '',
        organizer: '',
        url: '',
        link: '',
      });
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateEventForm>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: '',
      type: 'WORKSHOP',
      date: '',
      organizer: '',
      url: '',
      link: '',
      certificationDeadline: '',
    },
  });

  const handleCreateEvent = (data: CreateEventForm) => {
    // Format dates to ISO string for backend
    const formattedData = {
      ...data,
      type: data.type as 'WORKSHOP' | 'HACKATHON',
      url: data.url || '',
      link: data.link || '',
      date: data.date ? new Date(data.date).toISOString() : null,
      certificationDeadline: data.certificationDeadline ? new Date(data.certificationDeadline).toISOString() : null,
    };
    createEventMutation.mutate(formattedData);
  };

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    onDetailsOpen();
  };

  const handleAcceptEvent = (eventId: string) => {
    acceptEventMutation.mutate(eventId);
  };

  const getEventTypeColor = (type: string) => {
    return type === 'WORKSHOP' ? 'blue' : 'purple';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
            onClick={onOpen}
          >
            Create Event
          </Button>
        )}
      </HStack>

      {/* Events Grid */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
        {events.map((event) => (
          <GridItem key={event.id}>
            <Card bg={cardBg} border="1px solid" borderColor={borderColor} h="full">
              <CardBody>
                <VStack spacing={4} align="stretch" h="full">
                  <HStack justify="space-between">
                    <Badge
                      colorScheme={getEventTypeColor(event.type)}
                      variant="subtle"
                      fontSize="sm"
                    >
                      {event.type}
                    </Badge>
                    <Icon as={FiCalendar} color="gray.400" />
                  </HStack>

                  <Box flex={1}>
                    <Heading size="md" color="white" mb={2}>
                      {event.name}
                    </Heading>
                    <Text color="gray.400" fontSize="sm" mb={3}>
                      {event.organizer}
                    </Text>
                    
                    <VStack spacing={2} align="start">
                      <HStack spacing={2}>
                        <Icon as={FiCalendar} color="gray.500" boxSize={4} />
                        <Text color="gray.300" fontSize="sm">
                          {formatDate(event.date)}
                        </Text>
                      </HStack>
                      
                      {event.url && (
                        <HStack spacing={2}>
                          <Icon as={FiExternalLink} color="gray.500" boxSize={4} />
                          <Text color="gray.300" fontSize="sm">
                            {event.url}
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </Box>

                  <VStack spacing={2}>
                    {event.certificationDeadline && (
                      <Text color="orange.400" fontSize="xs" textAlign="center">
                        Certifications due: {formatDate(event.certificationDeadline)}
                      </Text>
                    )}
                    
                    <HStack spacing={2} w="full">
                      <Button
                        colorScheme="blue"
                        size="sm"
                        flex={1}
                        onClick={() => handleViewEvent(event)}
                      >
                        View
                      </Button>
                      {user?.role === 'STUDENT' && (
                        <Button
                          colorScheme="green"
                          size="sm"
                          flex={1}
                          onClick={() => handleAcceptEvent(event.id)}
                          isLoading={acceptEventMutation.isPending}
                        >
                          Accept
                        </Button>
                      )}
                    </HStack>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
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

      {/* Create Event Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
          <ModalHeader color="white">Create New Event</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <VStack spacing={4} as="form" onSubmit={handleSubmit(handleCreateEvent)}>
              <FormControl isInvalid={!!errors.name} isRequired>
                <FormLabel color="gray.300">Event Name</FormLabel>
                <Input
                  placeholder="Enter event name"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.400' }}
                  {...register('name')}
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.type} isRequired>
                <FormLabel color="gray.300">Event Type</FormLabel>
                <Select
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  {...register('type')}
                >
                  <option value="WORKSHOP">Workshop</option>
                  <option value="HACKATHON">Hackathon</option>
                </Select>
                <FormErrorMessage>{errors.type?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.date} isRequired>
                <FormLabel color="gray.300">Date</FormLabel>
                <Input
                  type="date"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  {...register('date')}
                />
                <FormErrorMessage>{errors.date?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.organizer} isRequired>
                <FormLabel color="gray.300">Organizer</FormLabel>
                <Input
                  placeholder="Enter organizer name"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.400' }}
                  {...register('organizer')}
                />
                <FormErrorMessage>{errors.organizer?.message}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel color="gray.300">Event URL</FormLabel>
                <Input
                  placeholder="Enter event URL"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.400' }}
                  {...register('url')}
                />
              </FormControl>
              <FormControl>
                <FormLabel color="gray.300">Registration Link</FormLabel>
                <Input
                  placeholder="Enter registration link"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.400' }}
                  {...register('link')}
                />
              </FormControl>
              <FormControl>
                <FormLabel color="gray.300">Certification Deadline</FormLabel>
                <Input
                  type="date"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  {...register('certificationDeadline')}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              type="submit"
              form="form"
              isLoading={createEventMutation.isPending}
              onClick={handleSubmit(handleCreateEvent)}
            >
              Create Event
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Event Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
          <ModalHeader color="white">Event Details</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            {selectedEvent && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Heading size="md" color="white" mb={2}>
                    {selectedEvent.name}
                  </Heading>
                  <Badge colorScheme={getEventTypeColor(selectedEvent.type)} mb={3}>
                    {selectedEvent.type}
                  </Badge>
                </Box>

                <VStack spacing={3} align="stretch">
                  <HStack spacing={2}>
                    <Icon as={FiCalendar} color="gray.500" boxSize={4} />
                    <Text color="gray.300">
                      <strong>Date:</strong> {formatDate(selectedEvent.date)}
                    </Text>
                  </HStack>

                  <HStack spacing={2}>
                    <Icon as={FiUsers} color="gray.500" boxSize={4} />
                    <Text color="gray.300">
                      <strong>Organizer:</strong> {selectedEvent.organizer}
                    </Text>
                  </HStack>

                  {selectedEvent.url && (
                    <HStack spacing={2}>
                      <Icon as={FiExternalLink} color="gray.500" boxSize={4} />
                      <Text color="gray.300">
                        <strong>Event URL:</strong>{' '}
                        <a href={selectedEvent.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3182ce' }}>
                          {selectedEvent.url}
                        </a>
                      </Text>
                    </HStack>
                  )}

                  {selectedEvent.link && (
                    <HStack spacing={2}>
                      <Icon as={FiExternalLink} color="gray.500" boxSize={4} />
                      <Text color="gray.300">
                        <strong>Registration Link:</strong>{' '}
                        <a href={selectedEvent.link} target="_blank" rel="noopener noreferrer" style={{ color: '#3182ce' }}>
                          {selectedEvent.link}
                        </a>
                      </Text>
                    </HStack>
                  )}

                  {selectedEvent.certificationDeadline && (
                    <HStack spacing={2}>
                      <Icon as={FiCalendar} color="orange.400" boxSize={4} />
                      <Text color="orange.400">
                        <strong>Certification Deadline:</strong> {formatDate(selectedEvent.certificationDeadline)}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDetailsClose}>
              Close
            </Button>
            {user?.role === 'STUDENT' && (
              <Button
                colorScheme="green"
                onClick={() => {
                  if (selectedEvent) {
                    handleAcceptEvent(selectedEvent.id);
                    onDetailsClose();
                  }
                }}
                isLoading={acceptEventMutation.isPending}
              >
                Accept Event
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default EventsPage;