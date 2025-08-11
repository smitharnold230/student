import React from 'react';
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
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FiCalendar, FiExternalLink, FiUsers, FiEdit, FiTrash2 } from 'react-icons/fi';
import { Event } from '../../types/event';
import { UseMutationResult } from '@tanstack/react-query';

interface EventCardProps {
  event: Event;
  userRole: string | null;
  onView: (event: Event) => void;
  onAccept: (eventId: string) => void;
  acceptMutation: UseMutationResult<any, Error, string, unknown>;
  onEdit: (event: Event) => void; // New prop for edit
  onDelete: (eventId: string) => void; // New prop for delete
  deleteMutation: UseMutationResult<any, Error, string, unknown>; // New prop for delete mutation
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  userRole,
  onView,
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
                onClick={() => onView(event)}
              >
                View
              </Button>
              {userRole === 'STUDENT' ? (
                event.isParticipated ? (
                  <Button
                    colorScheme="green"
                    size="sm"
                    flex={1}
                    isDisabled
                  >
                    Accepted
                  </Button>
                ) : (
                  <Button
                    colorScheme="green"
                    size="sm"
                    flex={1}
                    onClick={() => onAccept(event.id)}
                    isLoading={acceptMutation.isPending}
                  >
                    Accept
                  </Button>
                )
              ) : userRole === 'ADMIN' && (
                <>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    flex={1}
                    leftIcon={<FiEdit />}
                    onClick={() => onEdit(event)}
                  >
                    Edit
                  </Button>
                  <Button
                    colorScheme="red"
                    size="sm"
                    flex={1}
                    leftIcon={<FiTrash2 />}
                    onClick={() => onDelete(event.id)}
                    isLoading={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                </>
              )}
            </HStack>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default EventCard;