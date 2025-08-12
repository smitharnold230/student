import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';

// Import modular components
import AdminLogSummaryStats from './AdminLogSummaryStats';
import AdminLogFilters from './AdminLogFilters';
import AdminLogTable from './AdminLogTable';
import AdminLogDetailModal from './AdminLogDetailModal';

interface ApiLog {
  id: string;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  userAgent: string;
  requestBody?: string;
  responseBody?: string;
}

interface AdminLogsContentProps {
  logs: ApiLog[];
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
  handleViewLog: (log: ApiLog) => void;
  isDetailModalOpen: boolean;
  selectedLog: ApiLog | null;
  handleCloseDetailModal: () => void;
}

const AdminLogsContent: React.FC<AdminLogsContentProps> = ({
  logs,
  filters,
  setFilters,
  handleRefresh,
  isLoading,
  handleExport,
  isExporting,
  handleViewLog,
  isDetailModalOpen,
  selectedLog,
  handleCloseDetailModal,
}) => {
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const getStatusCodeColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'green';
    if (statusCode >= 400 && statusCode < 500) return 'yellow';
    if (statusCode >= 500) return 'red';
    return 'gray';
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'blue';
      case 'POST':
        return 'green';
      case 'PUT':
        return 'orange';
      case 'DELETE':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatResponseTime = (time: number) => {
    return `${time}ms`;
  };

  const totalRequests = logs.length;
  const successfulRequests = logs.filter(log => log.statusCode >= 200 && log.statusCode < 300).length;
  const errorRequests = logs.filter(log => log.statusCode >= 400).length;
  const averageResponseTime = logs.length > 0 
    ? Math.round(logs.reduce((sum, log) => sum + log.responseTime, 0) / logs.length)
    : 0;

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            API Logs
          </Heading>
          <Text color="gray.400">
            Monitor system API requests and responses
          </Text>
        </Box>
      </HStack>

      <AdminLogSummaryStats
        totalRequests={totalRequests}
        successfulRequests={successfulRequests}
        errorRequests={errorRequests}
        averageResponseTime={averageResponseTime}
        cardBg={cardBg}
        borderColor={borderColor}
        formatResponseTime={formatResponseTime}
      />

      <AdminLogFilters
        filters={filters}
        setFilters={setFilters}
        handleRefresh={handleRefresh}
        isLoading={isLoading}
        handleExport={handleExport}
        isExporting={isExporting}
        cardBg={cardBg}
        borderColor={borderColor}
      />

      <AdminLogTable
        logs={logs}
        handleViewLog={handleViewLog}
        getStatusCodeColor={getStatusCodeColor}
        getMethodColor={getMethodColor}
        formatDate={formatDate}
        formatResponseTime={formatResponseTime}
        cardBg={cardBg}
        borderColor={borderColor}
      />

      <AdminLogDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        selectedLog={selectedLog}
        cardBg={cardBg}
        borderColor={borderColor}
        getStatusCodeColor={getStatusCodeColor}
        getMethodColor={getMethodColor}
        formatDate={formatDate}
        formatResponseTime={formatResponseTime}
      />
    </VStack>
  );
};

export default AdminLogsContent;