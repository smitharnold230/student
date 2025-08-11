import React, { useState } from 'react';
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
  FormControl,
  FormLabel,
  Input,
  Progress,
  useToast,
  useColorModeValue,
  Text,
  Link,
  List,
  ListItem,
  ListIcon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  HStack,
  Badge,
  Heading, // Added missing import
  Icon, // Added missing import
} from '@chakra-ui/react';
import { UseMutationResult } from '@tanstack/react-query';
import { AxiosProgressEvent } from 'axios';
import { FiFileText, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';

interface BulkUserUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploadMutation: UseMutationResult<any, Error, File, unknown>;
  uploadProgress: number;
  setUploadProgress: React.Dispatch<React.SetStateAction<number>>;
}

interface UploadResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    email: string;
    reason: string;
  }>;
}

const BulkUserUploadModal: React.FC<BulkUserUploadModalProps> = ({
  isOpen,
  onClose,
  uploadMutation,
  uploadProgress,
  setUploadProgress,
}) => {
  const toast = useToast();
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv', // .csv
      ];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Only Excel (.xlsx, .xls) or CSV (.csv) files are allowed.',
          status: 'error',
          duration: 4000,
        });
        setSelectedFile(null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: 'File too large',
          description: 'File must be less than 10MB.',
          status: 'error',
          duration: 4000,
        });
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile, {
        onSuccess: (response) => {
          setUploadProgress(0);
          setUploadResult(response.data);
          toast({
            title: 'Bulk Upload Complete',
            description: `${response.data.successful} users added, ${response.data.failed} failed.`,
            status: response.data.failed > 0 ? 'warning' : 'success',
            duration: 5000,
            isClosable: true,
          });
        },
        onError: (error: any) => {
          setUploadProgress(0);
          setUploadResult(null);
          toast({
            title: 'Upload Failed',
            description: error.response?.data?.error || 'Failed to upload file',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        },
        onSettled: () => {
          // Invalidate users query to refresh the user list
          // queryClient.invalidateQueries({ queryKey: ['users'] }); // This should be done in the parent component
        },
      });
    } else {
      toast({
        title: 'No file selected',
        description: 'Please select an Excel or CSV file to upload.',
        status: 'warning',
        duration: 3000,
      });
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadResult(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
        <ModalHeader color="white">Bulk Upload Users</ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            <Alert status="info" variant="left-accent">
              <AlertIcon />
              <Box>
                <AlertTitle>File Format Instructions</AlertTitle>
                <AlertDescription fontSize="sm">
                  <Text mb={2}>
                    Please upload an Excel (.xlsx, .xls) or CSV (.csv) file with the following columns in the first row:
                  </Text>
                  <List spacing={1}>
                    <ListItem>
                      <ListIcon as={FiFileText} color="blue.300" />
                      <Text as="span" fontWeight="bold">email</Text>: (Required) User's email address.
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FiFileText} color="blue.300" />
                      <Text as="span" fontWeight="bold">password</Text>: (Required) User's password (min 6 characters).
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FiFileText} color="blue.300" />
                      <Text as="span" fontWeight="bold">role</Text>: (Optional) User's role ('STUDENT' or 'ADMIN'). Defaults to 'STUDENT'.
                    </ListItem>
                  </List>
                  <Text mt={2}>
                    <Link href="/path/to/sample_users.xlsx" isExternal color="brand.300">
                      Download Sample Template
                    </Link> (Placeholder link, replace with actual if available)
                  </Text>
                </AlertDescription>
              </Box>
            </Alert>

            <FormControl>
              <FormLabel color="gray.300">Select User File</FormLabel>
              <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                bg="gray.700"
                borderColor="gray.600"
                color="white"
                _placeholder={{ color: 'gray.400' }}
                onChange={handleFileChange}
              />
              <Text color="gray.400" fontSize="xs" mt={1}>
                Max file size: 10MB. Supported formats: .xlsx, .xls, .csv
              </Text>
            </FormControl>

            {uploadProgress > 0 && (
              <Progress value={uploadProgress} size="sm" colorScheme="green" mt={2} hasStripe isAnimated />
            )}

            {uploadResult && (
              <Box p={4} bg="gray.700" borderRadius="md" mt={4}>
                <Heading size="sm" color="white" mb={3}>Upload Summary</Heading>
                <HStack spacing={4} mb={3}>
                  <Text color="gray.300">Total Rows: <Badge colorScheme="blue">{uploadResult.total}</Badge></Text>
                  <Text color="gray.300">Successful: <Badge colorScheme="green">{uploadResult.successful}</Badge></Text>
                  <Text color="gray.300">Failed: <Badge colorScheme="red">{uploadResult.failed}</Badge></Text>
                </HStack>

                {uploadResult.failed > 0 && (
                  <Box mt={4}>
                    <Text color="red.300" fontWeight="semibold" mb={2}>Errors:</Text>
                    <VStack align="start" spacing={2} maxHeight="200px" overflowY="auto">
                      {uploadResult.errors.map((error, index) => (
                        <HStack key={index} align="start" spacing={2}>
                          <Icon as={FiXCircle} color="red.400" mt={1} />
                          <Text color="gray.300" fontSize="sm">
                            Row {error.row} (Email: {error.email || 'N/A'}): {error.reason}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Close
          </Button>
          <Button
            colorScheme="brand"
            onClick={handleUpload}
            isLoading={uploadMutation.isPending}
            isDisabled={!selectedFile || uploadMutation.isPending || uploadProgress > 0}
            leftIcon={<FiFileText />}
          >
            Upload Users
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BulkUserUploadModal;