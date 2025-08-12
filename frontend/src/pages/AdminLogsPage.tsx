import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Heading,
  useToast,
  useColorModeValue,
  Skeleton,
} from '@chakra-ui/react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminAPI } from '../services/api';

// Import new modular component
import AdminLogsContent from '../components/admin/logs/AdminLogsContent';

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
      return response.data;
    },
  });

  const logs: ApiLog[] = logsResponse || [];

  const exportLogsMutation = useMutation({
    mutationFn: () => adminAPI.exportLogs(),
    onSuccess: (response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'api_logs_export.csv');
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
    <AdminLogsContent
      logs={logs}
      filters={filters}
      setFilters={setFilters}
      handleRefresh={handleRefresh}
      isLoading={isLoading}
      handleExport={handleExport}
      isExporting={exportLogsMutation.isPending}
      handleViewLog={handleViewLog}
      isDetailModalOpen={isDetailModalOpen}
      selectedLog={selectedLog}
      handleCloseDetailModal={handleCloseDetailModal}
    />
  );
};

export default AdminLogsPage;