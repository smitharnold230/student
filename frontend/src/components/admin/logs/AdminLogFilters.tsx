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
  FormControl,
  FormLabel,
  Input,
  Select,
  Grid,
  Icon,
} from '@chakra-ui/react';
import { FiDownload, FiRefreshCw } from 'react-icons/fi';

interface AdminLogFiltersProps {
  filters: {
    method: string;
    statusCode: string;
    endpoint: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    method: string;
    statusCode: string;
    endpoint: string;
  }>>;
  handleRefresh: () => void;
  isLoading: boolean;
  handleExport: () => void;
  isExporting: boolean;
  cardBg: string;
  borderColor: string;
}

const AdminLogFilters: React.FC<AdminLogFiltersProps> = ({
  filters,
  setFilters,
  handleRefresh,
  isLoading,
  handleExport,
  isExporting,
  cardBg,
  borderColor,
}) => {
  return (
    <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Heading size="md" color="white">
              Filters
            </Heading>
            <HStack spacing={3}>
              <Button
                leftIcon={<FiRefreshCw />}
                colorScheme="brand"
                variant="outline"
                onClick={handleRefresh}
                isLoading={isLoading}
              >
                Refresh
              </Button>
              <Button
                leftIcon={<FiDownload />}
                colorScheme="brand"
                onClick={handleExport}
                isLoading={isExporting}
              >
                Export Logs
              </Button>
            </HStack>
          </HStack>
          
          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
            <FormControl>
              <FormLabel color="gray.300">HTTP Method</FormLabel>
              <Select
                placeholder="All methods"
                value={filters.method}
                onChange={(e) => setFilters({ ...filters, method: e.target.value })}
                bg="gray.700"
                borderColor="gray.600"
                color="white"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel color="gray.300">Status Code</FormLabel>
              <Select
                placeholder="All status codes"
                value={filters.statusCode}
                onChange={(e) => setFilters({ ...filters, statusCode: e.target.value })}
                bg="gray.700"
                borderColor="gray.600"
                color="white"
              >
                <option value="200">200 - OK</option>
                <option value="201">201 - Created</option>
                <option value="400">400 - Bad Request</option>
                <option value="401">401 - Unauthorized</option>
                <option value="404">404 - Not Found</option>
                <option value="500">500 - Server Error</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel color="gray.300">Endpoint</FormLabel>
              <Input
                placeholder="Filter by endpoint"
                value={filters.endpoint}
                onChange={(e) => setFilters({ ...filters, endpoint: e.target.value })}
                bg="gray.700"
                borderColor="gray.600"
                color="white"
                _placeholder={{ color: 'gray.400' }}
              />
            </FormControl>
          </Grid>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default AdminLogFilters;