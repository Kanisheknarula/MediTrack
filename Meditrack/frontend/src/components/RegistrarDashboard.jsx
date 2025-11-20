import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Heading,
  VStack,
  useToast,
  Grid,
  GridItem, // We'll keep this import just in case, but won't use it
  Text
} from '@chakra-ui/react';

const RegistrarDashboard = ({ user }) => {
  const [farmers, setFarmers] = useState([]); // To hold the list of farmers
  const [formData, setFormData] = useState({
    ownerId: '', // The selected farmer's ID
    animalTagId: '',
    type: 'Cow', // Default value
    breed: '',
    age: '',
    weight: '',
    groupName: ''
  });
  const toast = useToast();

  // 1. Fetch the list of farmers when the component loads
  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        // We use the new API route we just deployed
        const response = await axios.get('/api/registrar/all-farmers');
        setFarmers(response.data);
        // Set the default farmer in the form
        if (response.data.length > 0) {
          setFormData((prev) => ({ ...prev, ownerId: response.data[0]._id }));
        }
      } catch (error) {
        toast({
          title: 'Error fetching farmers',
          description: error.response?.data?.message || 'Could not load farmer list.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
    fetchFarmers();
  }, [toast]);

  // 2. Handle changes in the form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Handle submitting the new animal
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Use the new API route to add the animal
      const response = await axios.post('/api/registrar/add-animal', formData);

      toast({
        title: 'Animal Added Successfully!',
        description: `${formData.animalTagId} has been added for the selected farmer.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Clear the form (but keep the selected farmer)
      setFormData((prev) => ({
        ...prev,
        animalTagId: '',
        breed: '',
        age: '',
        weight: '',
        groupName: ''
      }));

    } catch (error) {
      toast({
        title: 'Error adding animal',
        description: error.response?.data?.message || 'Could not add animal.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} p={6} borderWidth={1} borderRadius="lg" boxShadow="lg">
      <VStack spacing={6}>
        <Heading size="lg">Registrar Dashboard</Heading>
        <Text>Add a new animal for a registered farmer.</Text>

        <FormControl isRequired>
          <FormLabel>Select Farmer</FormLabel>
          <Select name="ownerId" value={formData.ownerId} onChange={handleChange}>
            {farmers.length > 0 ? (
              farmers.map((farmer) => (
                <option key={farmer._id} value={farmer._id}>
                  {farmer.name}
                </option>
              ))
            ) : (
              <option disabled>Loading farmers...</option>
            )}
          </Select>
        </FormControl>

        {/* --- THIS IS THE CORRECTED GRID --- */}
        {/* We use a simpler "repeat(2, 1fr)" syntax */}
        {/* And we removed the <GridItem> wrapper for simplicity */}
        
        <Grid templateColumns="repeat(2, 1fr)" gap={6} width="full">
          
          <FormControl isRequired>
            <FormLabel>Animal Tag ID</FormLabel>
            <Input name="animalTagId" value={formData.animalTagId} onChange={handleChange} />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Animal Type</FormLabel>
            <Select name="type" value={formData.type} onChange={handleChange}>
              <option value="Cow">Cow</option>
              <option value="Buffalo">Buffalo</option>
              <option value="Goat">Goat</option>
              <option value="Other">Other</option>
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel>Breed</FormLabel>
            <Input name="breed" value={formData.breed} onChange={handleChange} />
          </FormControl>
          
          <FormControl>
            <FormLabel>Age (years)</FormLabel>
            <Input type="number" name="age" value={formData.age} onChange={handleChange} />
          </FormControl>
          
          <FormControl>
            <FormLabel>Weight (kg)</FormLabel>
            <Input type="number" name="weight" value={formData.weight} onChange={handleChange} />
          </FormControl>
          
          <FormControl>
            <FormLabel>Group Name (e.g., "Shed A")</FormLabel>
            <Input name="groupName" value={formData.groupName} onChange={handleChange} />
          </FormControl>

        </Grid>
        {/* --- END OF CORRECTED GRID --- */}


        <Button type="submit" colorScheme="blue" size="lg" width="full">
          Add Animal
        </Button>
      </VStack>
    </Box>
  );
};

export default RegistrarDashboard;