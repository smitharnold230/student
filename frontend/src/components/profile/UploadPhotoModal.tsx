import React from 'react';
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
} from '@chakra-ui/react';
import { UseMutationResult } from '@tanstack/react-query';
import { AxiosProgressEvent } from 'axios';

interface UploadPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFile: File | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
  uploadProgress: number;
  setUploadProgress: React.Dispatch<React.SetStateAction<number>>;
  uploadPhotoMutation: UseMutationResult<any, Error, File, unknown>;
}

const UploadPhotoModal: React.FC<UploadPhotoModalProps> = ({
  isOpen,
  onClose,
  selectedFile,
  setSelectedFile,
  uploadProgress,
  setUploadProgress,
  uploadPhotoMutation,
}) => {
  const toast = useToast();
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const handlePhotoUpload = () => {
    if (selectedFile) {
      uploadPhotoMutation.mutate(selectedFile);
    } else {
      toast({
        title: 'No file selected',
        description: 'Please select an image file to upload.',
        status: 'warning',
        duration: 3000,
      });
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
        <ModalHeader color="white">Upload Profile Photo</ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel color="gray.300">Select Image File</FormLabel>
              <Input
                type="file"
                accept="image/jpeg, image/png, image/jpg"
                bg="gray.700"
                borderColor="gray.600"
                color="white"
                _placeholder={{ color: 'gray.400' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                      toast({
                        title: 'Invalid file type',
                        description: 'Only JPEG, PNG, or JPG image files are allowed.',
                        status: 'error',
                        duration: 4000,
                      });
                      setSelectedFile(null);
                      return;
                    }
                    if (file.size > 5 * 1024 * 1024) { // 5MB limit for photos
                      toast({
                        title: 'File too large',
                        description: 'File must be less than 5MB.',
                        status: 'error',
                        duration: 4000,
                      });
                      setSelectedFile(null);
                      return;
                    }
                    setSelectedFile(file);
                  }
                }}
              />
              <Text color="gray.400" fontSize="xs" mt={1}>
                Only JPEG/PNG/JPG files are allowed (max 5MB)
              </Text>
            </FormControl>
            {uploadProgress > 0 && (
              <Progress value={uploadProgress} size="sm" colorScheme="green" mt={2} />
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="brand"
            onClick={handlePhotoUpload}
            isLoading={uploadPhotoMutation.isPending}
            isDisabled={!selectedFile || uploadPhotoMutation.isPending || uploadProgress > 0}
          >
            Upload Photo
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UploadPhotoModal;