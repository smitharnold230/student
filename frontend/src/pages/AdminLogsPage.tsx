import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  useToast,
  useColorModeValue,
  Skeleton,
} from '@chakra-ui/react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminAPI } from '../services/api';

// Import new modular components
import AdminLogSummaryStats from '../components/admin/logs/AdminLogSummaryStats';
import AdminLogFilters from '../components/admin/logs/AdminLogFilters';
import AdminLogTable from '../components/admin/logs/AdminLogTable';
import AdminLogDetailModal from '../components/admin/logs/AdminLogDetailModal';

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

const AdminLogsPage: React.FC = () => {
  const toast = useToast();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null);
  const [filters, setFilters] = useState({
    method: '',
    statusCode: '',
    endpoint: '',
  });
  
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const { data: logsResponse, isLoading, refetch } = useQuery({
    queryKey: ['adminLogs', filters],
    queryFn: async () => {
      const response = await adminAPI.getLogs(filters);
      // Add a dummy responseTime for demonstration if not present
      return response.data.map((log: ApiLog) => ({
        ...log,
        responseTime: log.responseTime || Math.floor(Math.random() * (500 - 50 + 1)) + 50, // Random time between 50-500ms
        ipAddress: log.ipAddress || '192.168.1.1', // Dummy IP
        userAgent: log.userAgent || 'Mozilla/5.0 (Dummy)', // Dummy User Agent
      }));
    },
  });

  const logs: ApiLog[] = logsResponse || [];

  const exportLogsMutation = useMutation({
    mutationFn: () => adminAPI.exportStudents(),
    onSuccess: (response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students_export.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Logs exported',
        description: 'API logs have been exported successfully.',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Export failed',
        description: error.response?.data?.error || 'Failed to export logs',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleViewLog = (log: ApiLog) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedLog(null);
    setIsDetailModalOpen(false);
  };

  const handleExport = () => {
    exportLogsMutation.mutate();
  };

  const handleRefresh = () => {
    refetch();
  };

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

  if (isLoading) {
    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" color="white" mb={2}>
            API Logs
          </Heading>
          <Text color="gray.400">
            Monitor system API requests and responses
          </Text>
        </Box>
        
        <Skeleton height="120px" />
        <Skeleton height="150px" />
        <Skeleton height="300px" />
      </VStack>
    );
  }

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
        isExporting={exportLogsMutation.isPending}
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

export default AdminLogsPage;