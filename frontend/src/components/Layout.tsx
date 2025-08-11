import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Icon,
  useColorModeValue,
  useDisclosure,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Avatar,
  AvatarBadge,
} from '@chakra-ui/react';
import {
  FiHome,
  FiUser,
  FiCalendar,
  FiCode,
  FiAward,
  FiBell,
  FiSettings,
  FiMenu,
  FiLogOut,
  FiBarChart,
  FiFileText,
  FiUsers,
  FiTrendingUp,
  FiCheckCircle
} from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { profileAPI } from '../services/api';
import { Profile } from '../types/profile'; // Import Profile type
import { AxiosResponse } from 'axios'; // Import AxiosResponse

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: FiHome, path: '/dashboard' },
  { label: 'Leaderboard', icon: FiBarChart, path: '/leaderboard' },
  { label: 'Profile', icon: FiUser, path: '/profile' },
  { label: 'Events', icon: FiCalendar, path: '/events' },
  { label: 'Coding Stats', icon: FiCode, path: '/coding-stats' },
  { label: 'Certifications', icon: FiAward, path: '/certifications' },
  { label: 'Points', icon: FiTrendingUp, path: '/points' },
  { label: 'Eligibility', icon: FiCheckCircle, path: '/eligibility' },
  { label: 'Notifications', icon: FiBell, path: '/notifications' },
  { label: 'Admin Dashboard', icon: FiSettings, path: '/admin', roles: ['ADMIN'] },
  { label: 'Point Rules', icon: FiTrendingUp, path: '/admin/point-rules', roles: ['ADMIN'] },
  { label: 'User Management', icon: FiUsers, path: '/admin/users', roles: ['ADMIN'] },
  { label: 'Profile Requests', icon: FiUsers, path: '/admin/profile-requests', roles: ['ADMIN'] },
  { label: 'Admin Logs', icon: FiFileText, path: '/admin/logs', roles: ['ADMIN'] },
];

const Layout: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  
  const sidebarBg = useColorModeValue('gray.800', 'gray.900');
  const sidebarBorder = useColorModeValue('gray.700', 'gray.600');
  const hoverBg = useColorModeValue('gray.700', 'gray.600');

  // Correctly type useQuery to expect AxiosResponse<Profile>
  const { data: profileResponse } = useQuery<AxiosResponse<Profile>>({
    queryKey: ['profile'],
    queryFn: () => profileAPI.getProfile(),
    enabled: !!user, // Only fetch if user is logged in
  });

  // Access the actual profile data from profileResponse.data
  const profile: Profile | undefined = profileResponse?.data;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(
    item => !item.roles || (user && item.roles.includes(user.role))
  );

  const NavItemComponent: React.FC<{ item: NavItem }> = ({ item }) => {
    const isActive = location.pathname === item.path;
    const bg = isActive ? 'brand.500' : 'transparent';
    const color = isActive ? 'white' : 'gray.300';

    return (
      <Box
        as="button"
        w="full"
        p={3}
        borderRadius="lg"
        bg={bg}
        color={color}
        _hover={{ bg: isActive ? 'brand.600' : hoverBg }}
        transition="all 0.2s"
        onClick={() => navigate(item.path)}
        textAlign="left"
      >
        <HStack spacing={3}>
          <Icon as={item.icon} boxSize={5} />
          <Text fontWeight={isActive ? 'semibold' : 'medium'}>
            {item.label}
          </Text>
        </HStack>
      </Box>
    );
  };

  const SidebarContent = () => (
    <VStack spacing={0} h="full" w="full">
      {/* Header */}
      <Box w="full" p={6} borderBottom="1px solid" borderColor={sidebarBorder}>
        <HStack spacing={3}>
          <Avatar size="md" name={profile?.name || user?.email} src={profile?.profilePhotoUrl ? `http://localhost:4000${profile.profilePhotoUrl}` : undefined} bg="brand.500">
            {profile?.profilePhotoUrl && <AvatarBadge boxSize="1em" bg="green.500" />}
          </Avatar>
          <VStack spacing={0} align="start" flex={1}>
            <Text fontSize="sm" fontWeight="semibold" color="white">
              {profile?.name || user?.email}
            </Text>
            <Text fontSize="xs" color="gray.400" textTransform="capitalize">
              {user?.role}
            </Text>
          </VStack>
        </HStack>
      </Box>

      {/* Navigation */}
      <VStack spacing={2} p={4} flex={1} w="full" overflowY="auto">
        {filteredNavItems.map((item) => (
          <NavItemComponent key={item.path} item={item} />
        ))}
      </VStack>

      {/* Footer */}
      <Box w="full" p={4} borderTop="1px solid" borderColor={sidebarBorder}>
        <Box
          as="button"
          w="full"
          p={3}
          borderRadius="lg"
          color="gray.300"
          _hover={{ bg: hoverBg }}
          transition="all 0.2s"
          onClick={handleLogout}
        >
          <HStack spacing={3}>
            <Icon as={FiLogOut} boxSize={5} />
            <Text>Logout</Text>
          </HStack>
        </Box>
      </Box>
    </VStack>
  );

  return (
    <Flex h="100vh">
      {/* Desktop Sidebar */}
      <Box
        display={{ base: 'none', md: 'block' }}
        w="280px"
        bg={sidebarBg}
        borderRight="1px solid"
        borderColor={sidebarBorder}
      >
        <SidebarContent />
      </Box>

      {/* Mobile Sidebar */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={sidebarBg} borderRight="1px solid" borderColor={sidebarBorder}>
          <DrawerCloseButton color="white" />
          <DrawerHeader borderBottom="1px solid" borderColor={sidebarBorder}>
            <Text color="white">SDMS</Text>
          </DrawerHeader>
          <DrawerBody p={0}>
            <SidebarContent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Box flex={1} overflow="auto">
        {/* Mobile Header */}
        <Box
          display={{ base: 'flex', md: 'none' }}
          p={4}
          bg={sidebarBg}
          borderBottom="1px solid"
          borderColor={sidebarBorder}
          alignItems="center"
          justifyContent="space-between"
        >
          <Text fontSize="lg" fontWeight="semibold" color="white">
            SDMS
          </Text>
          <IconButton
            aria-label="Open menu"
            icon={<FiMenu />}
            variant="ghost"
            color="white"
            onClick={onOpen}
          />
        </Box>

        {/* Page Content */}
        <Box p={6}>
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};

export default Layout;