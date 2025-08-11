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
  Icon,
  Input,
} from '@chakra-ui/react';
import { FiSettings, FiSearch } from 'react-icons/fi';

interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  batch: string;
  eligibility?: {
    eligible: boolean;
    workshops: number;
    hackathons: number;
    leetcode: number;
  };
}

interface AdminEligibilityTableProps {
  filteredStudents: Student[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAssignBatchClick: (student: Student) => void;
  refetchStudents: () => void;
  cardBg: string;
  borderColor: string;
  getEligibilityColor: (eligible: boolean) => string;
  getEligibilityIcon: (eligible: boolean) => React.ElementType;
  getBatchColor: (batch: string) => string;
}

const AdminEligibilityTable: React.FC<AdminEligibilityTableProps> = ({
  filteredStudents,
  isLoading,
  searchTerm,
  setSearchTerm,
  onAssignBatchClick,
  refetchStudents,
  cardBg,
  borderColor,
  getEligibilityColor,
  getEligibilityIcon,
  getBatchColor,
}) => {
  return (
    <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Heading size="md" color="white">Student Eligibility</Heading>
            <HStack>
              <Input
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="gray.700"
                borderColor="gray.600"
                color="white"
                _placeholder={{ color: 'gray.400' }}
                width="250px"
                leftElement={<Icon as={FiSearch} color="gray.400" ml={2} />}
              />
              <Button
                leftIcon={<FiSettings />}
                colorScheme="blue"
                onClick={() => {
                  refetchStudents();
                  // A toast message for refresh will be handled by the parent component
                }}
              >
                Refresh Eligibility Data
              </Button>
            </HStack>
          </HStack>

          {isLoading ? (
            <VStack spacing={4}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height="60px" width="full" />
              ))}
            </VStack>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th color="white">Student</Th>
                    <Th color="white">Class</Th>
                    <Th color="white">Current Batch</Th>
                    <Th color="white">Eligibility</Th>
                    <Th color="white">Requirements</Th>
                    <Th color="white">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredStudents.map((student) => (
                    <Tr key={student.id} _hover={{ bg: 'gray.700' }}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text color="white" fontWeight="bold">
                            {student.name}
                          </Text>
                          <Text color="gray.400" fontSize="sm">
                            {student.email}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text color="white">{student.class}</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={getBatchColor(student.batch)}>
                          {student.batch || 'N/A'}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Icon
                            as={getEligibilityIcon(student.eligibility?.eligible || false)}
                            color={getEligibilityColor(student.eligibility?.eligible || false)}
                          />
                          <Badge colorScheme={getEligibilityColor(student.eligibility?.eligible || false)}>
                            {student.eligibility?.eligible ? 'Eligible' : 'Not Eligible'}
                          </Badge>
                        </HStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text color="gray.400" fontSize="sm">
                            W: {student.eligibility?.workshops || 0}/2
                          </Text>
                          <Text color="gray.400" fontSize="sm">
                            H: {student.eligibility?.hackathons || 0}/2
                          </Text>
                          <Text color="gray.400" fontSize="sm">
                            LC: {student.eligibility?.leetcode || 0}/200
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => onAssignBatchClick(student)}
                        >
                          Assign Batch
                        </Button>
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

export default AdminEligibilityTable;