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
  Select,
  Progress,
  useToast,
  useColorModeValue,
  Text,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosProgressEvent } from 'axios';
import { Event } from '../../types/event';
import { UseMutationResult } from '@tanstack/react-query';

interface UploadCertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: Event[];
  uploadMutation: UseMutationResult<
    any,
    Error,
    { eventId: string; file: File },
    unknown
  >;
  uploadProgress: number;
  setUploadProgress: React.Dispatch<React.SetStateAction<number>>;
}

const uploadCertificationSchema = z.object({
  eventId: z.string().min(1, 'Event is required'),
  file: z
    .any()
    .refine((file) => file instanceof File, 'File is required')
    .refine(
      (file) => file && file.type === 'application/pdf',
      'Only PDF files are allowed',
    )
    .refine(
      (file) => file && file.size <= 10 * 1024 * 1024,
      'File must be less than 10MB',
    ),
});

type UploadCertificationForm = z.infer<typeof uploadCertificationSchema>;

const UploadCertificationModal: React.FC<UploadCertificationModalProps> = ({
  isOpen,
  onClose,
  events,
  uploadMutation,
  uploadProgress,
  setUploadProgress,
}) => {
  const toast = useToast();
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<UploadCertificationForm>({
    resolver: zodResolver(uploadCertificationSchema),
    defaultValues: { eventId: '', file: undefined },
  });

  const onSubmit = (data: UploadCertificationForm) => {
    if (!data.file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    uploadMutation.mutate({ eventId: data.eventId, file: data.file });
  };

  const handleClose = () => {
    reset();
    setUploadProgress(0);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent bg={cardBg} border="1px solid" borderColor={borderColor}>
        <ModalHeader color="white">Upload Certification</ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody>
          <VStack
            spacing={4}
            as="form"
            id="upload-cert-form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <FormControl isInvalid={!!errors.eventId} isRequired>
              <FormLabel color="gray.300">Event</FormLabel>
              <Select
                placeholder="Select event"
                bg="gray.700"
                borderColor="gray.600"
                color="white"
                {...register('eventId')}
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.eventId?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.file} isRequired>
              <FormLabel color="gray.300">Certification PDF File</FormLabel>
              <Input
                type="file"
                accept=".pdf"
                bg="gray.700"
                borderColor="gray.600"
                color="white"
                _placeholder={{ color: 'gray.400' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.type !== 'application/pdf') {
                      toast({
                        title: 'Invalid file type',
                        description: 'Only PDF files are allowed.',
                        status: 'error',
                        duration: 4000,
                      });
                      // No need to setValue(undefined), reset() handles it on close
                      return;
                    }
                    if (file.size > 10 * 1024 * 1024) {
                      toast({
                        title: 'File too large',
                        description: 'File must be less than 10MB.',
                        status: 'error',
                        duration: 4000,
                      });
                      // No need to setValue(undefined), reset() handles it on close
                      return;
                    }
                    setValue('file', file);
                  }
                }}
              />
              <Text color="gray.400" fontSize="xs" mt={1}>
                Only PDF files are allowed (max 10MB)
              </Text>
              <FormErrorMessage>
                {String(errors.file?.message || '')}
              </FormErrorMessage>
            </FormControl>
            {uploadProgress > 0 && (
              <Progress
                value={uploadProgress}
                size="sm"
                colorScheme="green"
                mt={2}
              />
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="brand"
            type="submit"
            form="upload-cert-form"
            isLoading={uploadMutation.isPending}
            isDisabled={uploadMutation.isPending || uploadProgress > 0}
          >
            Upload Certification
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UploadCertificationModal;
