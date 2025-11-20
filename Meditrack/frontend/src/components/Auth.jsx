import React, { useState } from 'react';
import axios from 'axios';

// 1. Import Chakra components
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Heading,
  VStack,
  Text,
  useToast, // This is for showing success/error messages
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@chakra-ui/react';

const Auth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    city: '',
    role: 'Farmer',
  });
  const [message, setMessage] = useState('');
  const toast = useToast(); // Initialize the toast hook

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin
      ? { phone: formData.phone, password: formData.password }
      : formData;

    try {
      const response = await axios.post(endpoint, payload);

      if (isLogin) {
        onLoginSuccess(response.data); // This logs you in
        toast({
          title: 'Login Successful.',
          description: `Welcome back, ${response.data.user.name}!`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // This is for registration
        toast({
          title: 'Registration Successful.',
          description: "You can now log in with your new account.",
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setIsLogin(true); // Flip to login tab
        setFormData({ name: '', phone: '', password: '', role: 'Farmer', city: '' });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'An error occurred.';
      // Show error toast
      toast({
        title: 'Error',
        description: errorMsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    // 2. Use Chakra components for layout
    <Box maxW="md" mx="auto" p={6} borderWidth={1} borderRadius="lg" boxShadow="lg">
      <Tabs isFitted variant="enclosed" onChange={(index) => setIsLogin(index === 0)}>
        <TabList mb="1em">
          <Tab>Login</Tab>
          <Tab>Register</Tab>
        </TabList>
        <TabPanels>
          {/* LOGIN PANEL */}
          <TabPanel>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <Heading size="lg">Login</Heading>
                <FormControl isRequired>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="Your phone number"
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    name="password"
                    placeholder="Your password"
                    onChange={handleChange}
                  />
                </FormControl>
                <Button type="submit" colorScheme="blue" width="full">
                  Login
                </Button>
              </VStack>
            </form>
          </TabPanel>

          {/* REGISTER PANEL */}
          <TabPanel>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <Heading size="lg">Register</Heading>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>City</FormLabel>
                  <Input
                    type="text"
                    name="city"
                    placeholder="Your city (e.g., Pune)"
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="Your phone number"
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>I am a:</FormLabel>
                  <Select name="role" onChange={handleChange} defaultValue="Farmer">
                    <option value="Farmer">Farmer</option>
                    <option value="Vet">Veterinarian</option>
                    <option value="Pharmacist">Pharmacist</option>
                    <option value="Manager">Livestock Manager</option>
                    <option value="Admin">Admin</option>
                    <option value="Registrar">Registrar</option>
                  </Select>
                </FormControl>
                <Button type="submit" colorScheme="green" width="full">
                  Register
                </Button>
              </VStack>
            </form>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Auth;