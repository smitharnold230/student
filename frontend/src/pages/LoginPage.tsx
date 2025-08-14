import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Card,
  CardBody,
  Heading,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'STUDENT' | 'ADMIN';
  };
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useAuthStore();
  const [isSignup, setIsSignup] = useState(false);

  const cardBg = useColorModeValue('gray.800', 'gray.900');
  const borderColor = useColorModeValue('gray.700', 'gray.600');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) => authAPI.login(data.email, data.password),
    onSuccess: (response: { data: LoginResponse }) => {
      const { token, user } = response.data;
      login(user, token);
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
      });
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: 'Login failed',
        description: error.response?.data?.error || 'Invalid credentials',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: (data: LoginForm & { role: 'STUDENT' | 'ADMIN' }) =>
      authAPI.signup(data.email, data.password, data.role),
    onSuccess: () => {
      toast({
        title: 'Account created',
        description: 'Please login with your credentials',
        status: 'success',
        duration: 5000,
      });
      setIsSignup(false);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Signup failed',
        description: error.response?.data?.error || 'Failed to create account',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const onSubmit = (data: LoginForm) => {
    if (isSignup) {
      signupMutation.mutate({ ...data, role: 'STUDENT' });
    } else {
      loginMutation.mutate(data);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.900" px={4}>
      <Card
        maxW="400px"
        w="full"
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        shadow="xl"
      >
        <CardBody p={8}>
          <VStack spacing={6}>
            {/* Header */}
            <VStack spacing={2}>
              <Heading size="lg" color="white">
                SDMS
              </Heading>
              <Text color="gray.400" textAlign="center">
                Student Development Management System
              </Text>
            </VStack>

            <Divider borderColor={borderColor} />

            {/* Form */}
            <Box as="form" w="full" onSubmit={handleSubmit(onSubmit)}>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel color="gray.300">Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _placeholder={{ color: 'gray.400' }}
                    _focus={{
                      borderColor: 'brand.500',
                      boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                    }}
                    {...register('email')}
                  />
                  <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                  <FormLabel color="gray.300">Password</FormLabel>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _placeholder={{ color: 'gray.400' }}
                    _focus={{
                      borderColor: 'brand.500',
                      boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                    }}
                    {...register('password')}
                  />
                  <FormErrorMessage>
                    {errors.password?.message}
                  </FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  w="full"
                  size="lg"
                  isLoading={
                    loginMutation.isPending || signupMutation.isPending
                  }
                  loadingText={
                    isSignup ? 'Creating account...' : 'Signing in...'
                  }
                >
                  {isSignup ? 'Create Account' : 'Sign In'}
                </Button>
              </VStack>
            </Box>

            <Divider borderColor={borderColor} />

            {/* Toggle */}
            <HStack spacing={1}>
              <Text color="gray.400">
                {isSignup
                  ? 'Already have an account?'
                  : "Don't have an account?"}
              </Text>
              <Button
                variant="link"
                color="brand.400"
                onClick={() => {
                  setIsSignup(!isSignup);
                  reset();
                }}
              >
                {isSignup ? 'Sign In' : 'Sign Up'}
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </Flex>
  );
};

export default LoginPage;
