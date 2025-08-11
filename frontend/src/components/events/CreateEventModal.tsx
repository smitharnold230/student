import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  useColorModeValue,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedEventData } from '../../types/event';
import { UseMutationResult } from '@tanstack/react-query';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (data: FormattedEventData) => void;
  createEventMutation: UseMutationResult<any, Error, FormattedEventData, unknown>;
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

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onCreateEvent,
  createEventMutation,
}) => {
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

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

  const onSubmit = (data: CreateEventForm) => {
    const formattedData: FormattedEventData = {
      ...data,
      type: data.type as 'WORKSHOP' | 'HACKATHON',
      url: data.url || '',
      link: data.link || '',
      date: data.date ? new Date(data.date).toISOString() : null,
      certificationDeadline: data.certificationDeadline ? new Date(data.certificationDeadline).toISOString() : null,
    };
    onCreateEvent(formattedData);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
        <ModalHeader color="white">Create New Event</ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody>
          <VStack spacing={4} as="form" id="create-event-form" onSubmit={handleSubmit(onSubmit)}>
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
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="brand"
            type="submit"
            form="create-event-form"
            isLoading={createEventMutation.isPending}
          >
            Create Event
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateEventModal;