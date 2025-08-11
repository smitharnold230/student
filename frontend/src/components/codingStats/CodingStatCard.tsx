import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Button,
  Badge,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FiTrash2 } from 'react-icons/fi';
import { UseMutationResult } from '@tanstack/react-query';

interface CodingStat {
  id: string;
  platform: 'LEETCODE' | 'HACKERRANK';
  url: string;
  problemsSolved: number;
  createdAt: string;
  updatedAt: string;
}

interface CodingStatCardProps {
  stat: CodingStat;
  userRole: string | null;
  onDeleteClick: (stat: CodingStat) => void;
  deleteMutationIsPending: boolean;
}

const CodingStatCard: React.FC<CodingStatCardProps> = ({
  stat,
  userRole,
  onDeleteClick,
  deleteMutationIsPending,
}) => {
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const getPlatformColor = (platform: string) => {
    return platform === 'LEETCODE' ? 'orange' : 'green';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <Card bg={cardBg} border="1px solid" borderColor={borderColor} h="full">
      <CardBody>
        <VStack spacing={4} align="stretch" position="relative" h="full">
          <HStack justify="space-between">
            <Badge
              colorScheme={getPlatformColor(stat.platform)}
              variant="subtle"
              fontSize="sm"
            >
              {stat.platform}
            </Badge>
            <Text color="gray.400" fontSize="xs">
              Last Updated: {formatDate(stat.updatedAt)}
            </Text>
          </HStack>

          <Box flex={1}>
            <Text color="white" fontSize="lg" fontWeight="bold" mb={1}>
              {stat.url.split('/').filter(Boolean).pop()}
            </Text>
            
            <VStack spacing={3} align="start">
              <HStack justify="space-between" w="full">
                <Text color="gray.400" fontSize="sm">Problems Solved</Text>
                <Text color="white" fontSize="sm">
                  {stat.problemsSolved}
                </Text>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text color="gray.400" fontSize="sm">Profile URL</Text>
                <Button
                  as="a"
                  href={stat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="xs"
                  variant="link"
                  colorScheme="brand"
                >
                  View Profile
                </Button>
              </HStack>
            </VStack>
          </Box>
          {userRole === 'STUDENT' && (
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              leftIcon={<FiTrash2 />}
              onClick={() => onDeleteClick(stat)}
              isLoading={deleteMutationIsPending}
              alignSelf="flex-end" // Align to bottom right
            >
              Remove
            </Button>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default CodingStatCard;