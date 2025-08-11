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
  HStack,
  Text,
  Heading,
  Badge,
  Box,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiCalendar, FiExternalLink, FiUsers, FiEdit, FiTrash2 } from 'react-icons/fi';
import { Event } from '../../types/event';
import { UseMutationResult } from '@tanstack/react-query';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEvent: Event | null;
  userRole: string | null;
  onAccept: (eventId: string) => void;
  acceptMutation: UseMutationResult<any, Error, string, unknown>;
  onEdit: (event: Event) => void; // New prop for edit
  onDelete: (eventId: string) => void; // New prop for delete
  deleteMutation: UseMutationResult<any, Error, string, unknown>; // New prop for delete mutation
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  selectedEvent,
  userRole,
  onAccept,
  acceptMutation,
  onEdit,
  onDelete,
  deleteMutation,
}) => {
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
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
          <Button variant="ghost" mr={3} onClick={onClose}>
            Close
          </Button>
          {selectedEvent && userRole === 'STUDENT' ? (
            selectedEvent.isParticipated ? (
              <Button colorScheme="green" isDisabled>
                Accepted
              </Button>
            ) : (
              <Button
                colorScheme="green"
                onClick={() => {
                  if (selectedEvent) {
                    onAccept(selectedEvent.id);
                    onClose();
                  }
                }}
                isLoading={acceptMutation.isPending}
              >
                Accept Event
              </Button>
            )
          ) : userRole === 'ADMIN' && selectedEvent && (
            <>
              <Button
                colorScheme="blue"
                mr={3}
                leftIcon={<FiEdit />}
                onClick={() => {
                  onEdit(selectedEvent);
                  onClose(); // Close details modal when opening edit modal
                }}
              >
                Edit
              </Button>
              <Button
                colorScheme="red"
                leftIcon={<FiTrash2 />}
                onClick={() => {
                  onDelete(selectedEvent.id);
                  onClose(); // Close details modal after triggering delete
                }}
                isLoading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EventDetailsModal;