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
  Divider,
  useColorModeValue,
  Grid,
  Avatar,
  AvatarBadge,
} from '@chakra-ui/react';
import { FiUpload } from 'react-icons/fi';
import { Profile } from '../../types/profile';
import { User } from '../../store/authStore'; // Assuming User type is available or defined here

interface ProfileInfoCardProps {
  profile: Profile;
  user: User | null;
  onOpenEditModal: () => void;
  onOpenPhotoModal: () => void;
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  profile,
  user,
  onOpenEditModal,
  onOpenPhotoModal,
}) => {
  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const getStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'dayscholar':
        return 'blue';
      case 'hosteller':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getBatchColor = (batch: string | undefined) => {
    if (!batch) return 'gray';
    if (batch.includes('PRODUCT')) return 'purple';
    if (batch.includes('SERVICE_A')) return 'blue';
    if (batch.includes('SERVICE_B')) return 'cyan';
    if (batch.includes('SERVICE_C')) return 'teal';
    return 'gray';
  };

  return (
    <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between">
            <Heading size="md" color="white">
              Personal Information
            </Heading>
            <HStack>
              <Button
                colorScheme="blue"
                size="sm"
                onClick={onOpenPhotoModal}
                leftIcon={<FiUpload />}
              >
                Upload Photo
              </Button>
              <Button colorScheme="brand" size="sm" onClick={onOpenEditModal}>
                Request Edit
              </Button>
            </HStack>
          </HStack>

          <Divider borderColor={borderColor} />

          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
            <VStack align="start" spacing={4}>
              <Box>
                <Text color="gray.400" fontSize="sm" mb={1}>
                  Profile Photo
                </Text>
                <Avatar
                  size="xl"
                  name={profile?.name || user?.email}
                  src={profile?.profilePhotoUrl ? `http://localhost:4000${profile.profilePhotoUrl}` : undefined}
                  bg="brand.500"
                >
                  {profile?.profilePhotoUrl && <AvatarBadge boxSize="1.25em" bg="green.500" />}
                </Avatar>
              </Box>
              <Box>
                <Text color="gray.400" fontSize="sm" mb={1}>
                  Full Name
                </Text>
                <Text color="white" fontSize="md">
                  {profile?.name || 'Not set'}
                </Text>
              </Box>

              <Box>
                <Text color="gray.400" fontSize="sm" mb={1}>
                  Email
                </Text>
                <Text color="white" fontSize="md">
                  {user?.email}
                </Text>
              </Box>

              {user?.role === 'STUDENT' && (
                <>
                  <Box>
                    <Text color="gray.400" fontSize="sm" mb={1}>
                      Degree
                    </Text>
                    <Text color="white" fontSize="md">
                      {profile?.degree || 'Not set'}
                    </Text>
                  </Box>

                  <Box>
                    <Text color="gray.400" fontSize="sm" mb={1}>
                      Class
                    </Text>
                    <Text color="white" fontSize="md">
                      {profile?.class || 'Not set'}
                    </Text>
                  </Box>
                </>
              )}
            </VStack>

            <VStack align="start" spacing={4}>
              {user?.role === 'STUDENT' && (
                <>
                  <Box>
                    <Text color="gray.400" fontSize="sm" mb={1}>
                      Status
                    </Text>
                    <Badge
                      colorScheme={getStatusColor(profile?.status)}
                      variant="subtle"
                      fontSize="sm"
                    >
                      {profile?.status || 'Not set'}
                    </Badge>
                  </Box>

                  <Box>
                    <Text color="gray.400" fontSize="sm" mb={1}>
                      Transport
                    </Text>
                    <Text color="white" fontSize="md">
                      {profile?.transport || 'Not set'}
                    </Text>
                  </Box>

                  <Box>
                    <Text color="gray.400" fontSize="sm" mb={1}>
                      Hostel Info
                    </Text>
                    <Text color="white" fontSize="md">
                      {profile?.hostelInfo || 'Not set'}
                    </Text>
                  </Box>

                  <Box>
                    <Text color="gray.400" fontSize="sm" mb={1}>
                      Current Batch
                    </Text>
                    <Badge
                      colorScheme={getBatchColor(profile?.batch)}
                      variant="subtle"
                      fontSize="sm"
                    >
                      {profile?.batch || 'Not Assigned'}
                    </Badge>
                  </Box>
                </>
              )}
            </VStack>
          </Grid>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default ProfileInfoCard;