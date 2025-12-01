import React, { useState } from 'react';
import api from '../api/api';

// --- NEW CHAKRA IMPORTS ---
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  HStack,
  useToast,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Spinner,
  Center
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
// --- END NEW IMPORTS ---

const ManagerDashboard = ({ user, token }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState(null); // Will hold the server response
  const [error, setError] = useState(''); // For errors
  const [isLoading, setIsLoading] = useState(false); // For loading spinner
  const toast = useToast();

  // --- 1. FUNCTION: Check the animal's MRL status ---
  const handleCheckStatus = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null); // Clear old results

    if (!searchQuery) {
      setError('Please enter an Animal Tag ID.');
      return;
    }

    setIsLoading(true); // Show spinner
    try {
      const response = await api.get(
        `/api/manager/check-animal/${searchQuery.toUpperCase()}`
      );
      setResult(response.data); // Save the entire response
    } catch (err) {
      // This will catch 404 "Not Found" errors
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setIsLoading(false); // Hide spinner
    }
  };

  // --- 2. RENDER LOGIC ---
  return (
    <Box maxW="lg" mx="auto" p={6} borderWidth={1} borderRadius="lg" boxShadow="lg">
      <VStack spacing={6}>
        <Heading size="lg">Livestock Manager Dashboard</Heading>
        <Text>Check an animal's MRL (withdrawal) status before purchasing.</Text>

        {/* --- MRL CHECKER FORM --- */}
        <Box as="form" onSubmit={handleCheckStatus} width="full">
          <VStack>
            <FormControl>
              <FormLabel><strong>Enter Animal Tag ID</strong></FormLabel>
              <HStack>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="e.g., COW-101"
                  size="lg"
                />
                <Button 
                  type="submit" 
                  colorScheme="blue" 
                  leftIcon={<SearchIcon />} 
                  size="lg"
                  isLoading={isLoading}
                >
                  Check
                </Button>
              </HStack>
            </FormControl>
          </VStack>
        </Box>

        {/* --- RESULTS AREA --- */}
        <Box width="full">
          <Heading size="md" mb={4}>Check Result</Heading>

          {/* Show loading spinner */}
          {isLoading && (
            <Center h="100px">
              <Spinner size="xl" />
            </Center>
          )}

          {/* Show error message */}
          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
              <CloseButton onClick={() => setError('')} position="absolute" right="8px" top="8px" />
            </Alert>
          )}

          {/* Show the result */}
          {result && (
            <Alert
              status={result.safeToBuy ? 'success' : 'error'}
              variant="solid"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              height="200px"
              borderRadius="md"
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="2xl">
                {result.message}
              </AlertTitle>
              <AlertDescription maxWidth="sm">
                <Text>Tag ID: {result.animalTagId}</Text>
                <Text>Type: {result.type}</Text>
                {/* Show the date only if it's not safe */}
                {!result.safeToBuy && (
                  <Text fontWeight="bold">
                    Safe to buy AFTER: {new Date(result.withdrawalEndDate).toLocaleString()}
                  </Text>
                )}
              </AlertDescription>
            </Alert>
          )}

        </Box>
      </VStack>
    </Box>
  );
};

export default ManagerDashboard;