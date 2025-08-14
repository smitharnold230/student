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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Icon,
  Skeleton,
  Avatar,
} from '@chakra-ui/react';
import { FiTrash2 } from 'react-icons/fi';
import { UseMutationResult } from '@tanstack/react-query';

interface User {
  id: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  createdAt: string;
  Profile?: {
    name: string;
    class: string;
    batch: string;
    status: string;
  };
}

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  handleDeleteUser: (userId: string, email: string) => void;
  deleteUserMutation: UseMutationResult<any, Error, string, unknown>;
  cardBg: string;
  borderColor: string;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  handleDeleteUser,
  deleteUserMutation,
  cardBg,
  borderColor,
}) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'red';
      case 'STUDENT':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'INACTIVE':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Heading size="md" color="white">
            Users
          </Heading>

          {isLoading ? (
            <VStack spacing={4}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height="60px" />
              ))}
            </VStack>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th color="gray.300" borderColor={borderColor}>
                      User
                    </Th>
                    <Th color="gray.300" borderColor={borderColor}>
                      Role
                    </Th>
                    <Th color="gray.300" borderColor={borderColor}>
                      Profile
                    </Th>
                    <Th color="gray.300" borderColor={borderColor}>
                      Status
                    </Th>
                    <Th color="gray.300" borderColor={borderColor}>
                      Created
                    </Th>
                    <Th color="gray.300" borderColor={borderColor}>
                      Actions
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map((user) => (
                    <Tr key={user.id} _hover={{ bg: 'gray.700' }}>
                      <Td borderColor={borderColor}>
                        <HStack spacing={3}>
                          <Avatar size="sm" name={user.email} bg="brand.500" />
                          <VStack align="start" spacing={0}>
                            <Text color="white" fontWeight="medium">
                              {user.email}
                            </Text>
                            <Text color="gray.400" fontSize="sm">
                              ID: {user.id.slice(0, 8)}...
                            </Text>
                          </VStack>
                        </HStack>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Badge
                          colorScheme={getRoleColor(user.role)}
                          variant="subtle"
                        >
                          {user.role}
                        </Badge>
                      </Td>
                      <Td borderColor={borderColor}>
                        <VStack align="start" spacing={0}>
                          <Text color="white" fontSize="sm">
                            {user.Profile?.name || 'Not set'}
                          </Text>
                          <Text color="gray.400" fontSize="xs">
                            {user.Profile?.class || 'No class'}
                          </Text>
                          <Text color="gray.400" fontSize="xs">
                            {user.Profile?.batch || 'No batch'}
                          </Text>
                        </VStack>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Badge
                          colorScheme={getStatusColor(
                            user.Profile?.status || '',
                          )}
                          variant="subtle"
                        >
                          {user.Profile?.status || 'Not set'}
                        </Badge>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text color="gray.300" fontSize="sm">
                          {formatDate(user.createdAt)}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            leftIcon={<Icon as={FiTrash2} />}
                            onClick={() =>
                              handleDeleteUser(user.id, user.email)
                            }
                            isLoading={deleteUserMutation.isPending}
                          >
                            Delete
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default UserTable;
