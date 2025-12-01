import React, { useState, useEffect } from 'react';
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
  Divider,
  useToast,
  NumberInput,
  NumberInputField,
  Text
} from '@chakra-ui/react';
// --- END NEW IMPORTS ---

const BillingForm = ({ prescription, pharmacistId, onClose }) => {
  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const toast = useToast();

  // This 'useEffect' runs once to set up the form
  useEffect(() => {
    const initialItems = prescription.medicines.map(med => ({
      name: med.name,
      dosage: med.dosage,
      price: '' // Default price is empty
    }));
    setItems(initialItems);
  }, [prescription]);

  // This 'useEffect' automatically calculates the total price
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
    setTotalAmount(total);
  }, [items]); // Recalculate whenever 'items' changes

  // This updates the price for a specific medicine
  const handlePriceChange = (index, valueAsString, valueAsNumber) => {
    const newItems = [...items];
    newItems[index].price = valueAsString; // Keep as string for the input
    setItems(newItems);
  };

  // --- 2. FUNCTION: Submit the bill to the backend ---
  const handleSubmitBill = async (e) => {
    e.preventDefault();

    // Check if all prices are filled
    if (items.some(item => !item.price || Number(item.price) <= 0)) {
      toast({
        title: 'Invalid Price',
        description: 'All medicines must have a price greater than 0.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await api.post(
        '/api/pharmacist/create-bill',
        {
          prescriptionId: prescription._id,
          pharmacistId: pharmacistId,
          items: items.map(item => ({ ...item, price: Number(item.price) })), // Send price as number
          totalAmount: totalAmount
        }
      );
      toast({
        title: 'Bill Created Successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setTimeout(() => {
        onClose(); // Close this form
      }, 1000);
    } catch (error) {
      toast({
        title: 'Error Creating Bill',
        description: error.response?.data?.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box 
      as="form" 
      onSubmit={handleSubmitBill} 
      p={6} 
      borderWidth={1} 
      borderRadius="lg" 
      boxShadow="lg"
      maxW="md" // Set a max width for the form
      mx="auto"   // Center it
    >
      <VStack spacing={6}>
        <Heading size="lg">Create Bill</Heading>
        <Text fontSize="lg">For Animal: <strong>{prescription.animalId?.animalTagId}</strong></Text>

        <Divider />

        <VStack spacing={4} align="stretch" width="full">
          <Heading size="md">Medicines</Heading>
          {items.map((item, index) => (
            <HStack key={index} justify="space-between">
              <Box>
                <Text fontWeight="bold">{item.name}</Text>
                <Text fontSize="sm">Dosage: {item.dosage}</Text>
              </Box>
              <FormControl maxW="120px" isRequired>
                <FormLabel fontSize="sm">Price:</FormLabel>
                <NumberInput 
                  value={item.price}
                  onChange={(valStr, valNum) => handlePriceChange(index, valStr, valNum)}
                  min={0}
                >
                  <NumberInputField placeholder="0.00" />
                </NumberInput>
              </FormControl>
            </HStack>
          ))}
        </VStack>
        
        <Divider />
        
        <HStack width="full" justify="space-between">
          <Heading size="md">Total Amount:</Heading>
          <Heading size="lg" color="green.600">{totalAmount.toFixed(2)}</Heading>
        </HStack>
        
        <HStack width="full" justify="flex-end">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" colorScheme="green">Submit Bill</Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default BillingForm;