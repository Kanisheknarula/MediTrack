import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RequestManager from './RequestManager'; // This is your existing component
import {
  Box,
  Heading,
  Text,
  Icon, // <-- This is the fix (was ListIcon, List, ListItem)
  useToast,
  VStack,
  Card,
  CardHeader,
  CardBody,
  Button,
  SimpleGrid
} from '@chakra-ui/react';
import { MdPets } from 'react-icons/md'; // A nice icon for the animal list

// We get the 'user' and 'token' props from App.jsx
const FarmerDashboard = ({ user, token }) => {
  const [animals, setAnimals] = useState([]); // To store the farmer's animals
  const [message, setMessage] = useState('');
  const toast = useToast();

  // --- 1. FUNCTION: Get all of this farmer's animals ---
  const fetchMyAnimals = async () => {
    try {
      const response = await axios.get(
        `/api/animals/my-animals/${user.userId}`
      );
      setAnimals(response.data);
    } catch (error) { 
      toast({
        title: 'Error fetching animals',
        description: error.response?.data?.message || 'Could not load your animals.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } 
  };

  // Run 'fetchMyAnimals' once when the component loads
  useEffect(() => {
    fetchMyAnimals();
  }, [user.userId]);

  return (
    <VStack spacing={8} align="stretch">
      <Heading size="lg">Farmer Dashboard</Heading>
      
      {/* --- SECTION 1: MY ANIMALS --- */}
      <Card variant="outline">
        <CardHeader>
          <Heading size="md">My Animals ({animals.length})</Heading>
        </CardHeader>
        <CardBody>
          <Button onClick={fetchMyAnimals} mb={4}>Refresh Animal List</Button>
          {message && <Text color="red.500">{message}</Text>}
          
          {animals.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {animals.map(animal => (
                <Box key={animal._id} p={4} borderWidth={1} borderRadius="md" boxShadow="sm">
                  <Heading size="sm" display="flex" alignItems="center">
                    {/* --- THIS IS THE FIXED LINE --- */}
                    <Icon as={MdPets} color="green.500" m="0" mr="2" />
                    {animal.animalTagId}
                  </Heading>
                  <Text>Type: {animal.type}</Text>
                  <Text>Breed: {animal.breed}</Text>
                  {animal.age && <Text>Age: {animal.age} years</Text>}
                  {animal.weight && <Text>Weight: {animal.weight} kg</Text>}
                </Box>
              ))}
            </SimpleGrid>
          ) : (
            <Text>You have no animals registered. A Registrar can add them for you.</Text>
          )}
        </CardBody>
      </Card>

      {/* --- SECTION 2: REQUEST MANAGER (Contains both new requests and past requests) --- */}
      <RequestManager user={user} token={token} animals={animals} />
    </VStack>
  );
};

export default FarmerDashboard;