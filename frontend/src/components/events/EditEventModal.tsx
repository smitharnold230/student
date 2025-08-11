import React, { useEffect } from 'react';
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
import { Event, UpdateEventData } from '../../types/event';
import { UseMutationResult } from '@tanstack/react-query';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit: Event | null;
  onUpdateEvent: (eventId: string, data: Partial<UpdateEventData>) => void;
  updateEventMutation: UseMutationResult<any, Error, { eventId: string; data: Partial<UpdateEventData> }, unknown>;
}

const editEventSchema = z.object({
  name: z.string().min(1, 'Event name is required').optional(),
  type: z.enum(['WORKSHOP', 'HACKATHON'], { message: 'Event type is required' }).optional(),
  date: z.string().min(1, 'Date is required').optional(),
  organizer: z.string().min(1, 'Organizer is required').optional(),
  url: z.string().url('Invalid URL format').or(z.literal('')).optional(),
  link: z.string().url('Invalid URL format').or(z.literal('')).optional(),
  certificationDeadline: z.string().or(z.literal('')).optional(),
}).refine(data => Object.values(data).some(value => value !== undefined && value !== null && value !== ''), {
  message: 'At least one field must be provided for update',
  path: ['root'],
});

type EditEventForm = z.infer<typeof editEventSchema>;

// Helper to normalize values for comparison (empty string, null, undefined all treated as 'empty')
function normalizeValue<T>(val: T | null | undefined | ''): T | undefined {
  if (val === null || val === undefined || val === '') {
    return undefined;
  }
  return val;
}

const EditEventModal: React.FC<EditEventModalProps> = ({
  isOpen,
  onClose,
  eventToEdit,
  onUpdateEvent,
  updateEventMutation,
}) => {
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditEventForm>({
    resolver: zodResolver(editEventSchema),
  });

  useEffect(() => {
    if (eventToEdit) {
      reset({
        name: eventToEdit.name,
        type: eventToEdit.type,
        date: eventToEdit.date ? new Date(eventToEdit.date).toISOString().split('T')[0] : '', // Format for date input
        organizer: eventToEdit.organizer,
        url: eventToEdit.url || '',
        link: eventToEdit.link || '',
        certificationDeadline: eventToEdit.certificationDeadline ? new Date(eventToEdit.certificationDeadline).toISOString().split('T')[0] : '', // Format for date input
      });
    }
  }, [eventToEdit, reset]);

  const onSubmit = (data: EditEventForm) => {
    if (!eventToEdit) return;

    const formattedData: Partial<UpdateEventData> = {
      name: normalizeValue(data.name),
      type: data.type, // Directly use data.type, as Zod already ensures it's 'WORKSHOP' | 'HACKATHON' | undefined
      date: data.date ? new Date(data.date).toISOString() : null, // Send null if empty string
      organizer: normalizeValue(data.organizer),
      url: normalizeValue(data.url),
      link: normalizeValue(data.link),
      certificationDeadline: data.certificationDeadline ? new Date(data.certificationDeadline).toISOString() : null, // Send null if empty string
    };

    const changes: Partial<UpdateEventData> = {};
    for (const key in formattedData) {
      const typedKey = key as keyof UpdateEventData;

      const currentVal = formattedData[typedKey];
      const originalVal = (eventToEdit as any)[typedKey];

      // Normalize original value for comparison
      const normalizedOriginalVal = normalizeValue(originalVal);

      // Special handling for date and certificationDeadline to compare ISO strings
      if ((typedKey === 'date' || typedKey === 'certificationDeadline')) {
        const currentIso = currentVal ? new Date(currentVal as string).toISOString() : undefined;
        const originalIso = normalizedOriginalVal ? new Date(normalizedOriginalVal as string).toISOString() : undefined;
        if (currentIso !== originalIso) {
          changes[typedKey] = currentVal;
        }
      } else if (currentVal !== normalizedOriginalVal) {
        changes[typedKey] = currentVal;
      }
    }

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    onUpdateEvent(eventToEdit.id, changes);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
        <ModalHeader color="white">Edit Event</ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody>
          {eventToEdit && (
            <VStack spacing={4} as="form" id="edit-event-form" onSubmit={handleSubmit(onSubmit)}>
              <FormControl isInvalid={!!errors.name}>
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
              <FormControl isInvalid={!!errors.type}>
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
              <FormControl isInvalid={!!errors.date}>
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
              <FormControl isInvalid={!!errors.organizer}>
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
              <FormControl isInvalid={!!errors.url}>
                <FormLabel color="gray.300">Event URL</FormLabel>
                <Input
                  placeholder="Enter event URL (e.g., https://example.com/event)"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.400' }}
                  {...register('url')}
                />
                <FormErrorMessage>{errors.url?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.link}>
                <FormLabel color="gray.300">Registration Link</FormLabel>
                <Input
                  placeholder="Enter registration link (e.g., https://example.com/register)"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.400' }}
                  {...register('link')}
                />
                <FormErrorMessage>{errors.link?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.certificationDeadline}>
                <FormLabel color="gray.300">Certification Deadline</FormLabel>
                <Input
                  type="date"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  {...register('certificationDeadline')}
                />
                <FormErrorMessage>{errors.certificationDeadline?.message}</FormErrorMessage>
              </FormControl>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="brand"
            type="submit"
            form="edit-event-form"
            isLoading={updateEventMutation.isPending}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditEventModal;