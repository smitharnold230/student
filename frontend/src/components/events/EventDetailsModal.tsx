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
import { FiCalendar, FiExternalLink, FiUsers } from 'react-icons/fi';
import { Event } from '../../types/event';
import { UseMutationResult } from '@tanstack/react-query';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEvent: Event | null;
  userRole: string | null;
  onAccept: (eventId: string) => void;
  acceptMutation: UseMutationResult<any, Error, string, unknown>;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  selectedEvent,
  userRole,
  onAccept,
  acceptMutation,
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
          {userRole === 'STUDENT' && (
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
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EventDetailsModal;