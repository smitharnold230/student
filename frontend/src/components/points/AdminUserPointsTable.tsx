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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Skeleton,
} from '@chakra-ui/react';
import { FiEdit, FiRefreshCw } from 'react-icons/fi';
import { UserWithPoints } from '../../types/points'; // Assuming UserWithPoints is defined or will be
import { getStudentLevel } from '../../utils/points';

interface AdminUserPointsTableProps {
  users: UserWithPoints[];
  usersLoading: boolean;
  selectedUsers: string[];
  handleUserSelection: (userId: string) => void;
  handleSelectAll: () => void;
  handleClearSelection: () => void;
  onUpdateModalOpen: () => void;
  onResetModalOpen: () => void;
}

const AdminUserPointsTable: React.FC<AdminUserPointsTableProps> = ({
  users,
  usersLoading,
  selectedUsers,
  handleUserSelection,
  handleSelectAll,
  handleClearSelection,
  onUpdateModalOpen,
  onResetModalOpen,
}) => {
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  return (
    <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Heading size="md" color="white">
              User Management
            </Heading>
            <HStack spacing={2}>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={handleSelectAll}
                isDisabled={usersLoading || users.length === 0}
              >
                Select All
              </Button>
              <Button
                size="sm"
                colorScheme="gray"
                onClick={handleClearSelection}
                isDisabled={selectedUsers.length === 0}
              >
                Clear ({selectedUsers.length})
              </Button>
            </HStack>
          </HStack>

          {selectedUsers.length > 0 && (
            <HStack spacing={2}>
              <Button
                leftIcon={<FiEdit />}
                colorScheme="green"
                size="sm"
                onClick={onUpdateModalOpen}
              >
                Update Points ({selectedUsers.length})
              </Button>
              <Button
                leftIcon={<FiRefreshCw />}
                colorScheme="red"
                size="sm"
                onClick={onResetModalOpen}
              >
                Reset Points ({selectedUsers.length})
              </Button>
            </HStack>
          )}

          {usersLoading ? (
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
                    <Th color="gray.300" borderColor={borderColor} width="50px">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onChange={(e) => e.target.checked ? handleSelectAll() : handleClearSelection()}
                        style={{ cursor: 'pointer' }}
                      />
                    </Th>
                    <Th color="gray.300" borderColor={borderColor}>Student</Th>
                    <Th color="gray.300" borderColor={borderColor}>Class</Th>
                    <Th color="gray.300" borderColor={borderColor}>Batch</Th>
                    <Th color="gray.300" borderColor={borderColor}>Points</Th>
                    <Th color="gray.300" borderColor={borderColor}>Manual Adj.</Th>
                    <Th color="gray.300" borderColor={borderColor}>Level</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map((user: UserWithPoints) => (
                    <Tr key={user.id} _hover={{ bg: 'gray.700' }}>
                      <Td borderColor={borderColor}>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserSelection(user.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </Td>
                      <Td borderColor={borderColor}>
                        <VStack align="start" spacing={0}>
                          <Text color="white" fontWeight="medium">
                            {user.name}
                          </Text>
                          <Text color="gray.400" fontSize="sm">
                            {user.email}
                          </Text>
                        </VStack>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text color="gray.300">{user.class}</Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Badge colorScheme="blue" variant="subtle">
                          {user.batch}
                        </Badge>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text color="white" fontWeight="bold">
                          {user.points}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text color={user.manualAdjustment >= 0 ? 'green.300' : 'red.300'} fontWeight="bold">
                          {user.manualAdjustment}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Badge colorScheme="blue" variant="outline">
                          {getStudentLevel(user.points).level}
                        </Badge>
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

export default AdminUserPointsTable;