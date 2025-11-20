import React, { useState } from 'react';
import axios from 'axios';

// --- NEW CHAKRA IMPORTS ---
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Textarea,
  VStack,
  HStack,
  IconButton,
  Divider,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons'; // Icons for buttons
// --- END NEW IMPORTS ---

// We get props: the 'request' to prescribe for, the 'vetId', and a function to 'onClose'
const PrescriptionForm = ({ request, vetId, onClose }) => {
  const [medicines, setMedicines] = useState([{ name: '', dosage: '' }]);
  const [withdrawalPeriodDays, setWithdrawalPeriodDays] = useState(7); // Default to 7
  const [notes, setNotes] = useState('');
  const toast = useToast(); // Use toast for messages

  // This lets the vet add more medicine fields
  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '' }]);
  };

  // --- NEW: Function to remove a medicine field ---
  const handleRemoveMedicine = (index) => {
    const values = [...medicines];
    values.splice(index, 1); // Remove the item at the given index
    setMedicines(values);
  };

  // This updates a specific medicine field when the vet types
  const handleMedicineChange = (index, event) => {
    const values = [...medicines];
    values[index][event.target.name] = event.target.value;
    setMedicines(values);
  };

  // This is the function that submits the prescription to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (withdrawalPeriodDays <= 0) {
      toast({
        title: 'Invalid Withdrawal Period',
        description: 'Withdrawal period must be greater than 0.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      await axios.post(
        '/api/prescriptions/create',
        {
          requestId: request._id,
          vetId: vetId,
          animalId: request.animalId._id,
          medicines: medicines,
          withdrawalPeriodDays: parseInt(withdrawalPeriodDays),
          notes: notes
        }
      );
      
      toast({
        title: 'Prescription Created!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Close the form after a short delay
      setTimeout(() => {
        onClose(); 
      }, 1000);

    } catch (error) {
      toast({
        title: 'Error Creating Prescription',
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
      onSubmit={handleSubmit} 
      p={6} 
      borderWidth={1} 
      borderRadius="lg" 
      boxShadow="lg"
      maxW="xl" // Set a max width for the form
      mx="auto"   // Center it
    >
      <VStack spacing={6}>
        <Heading size="lg">Create Prescription</Heading>
        <Text fontSize="lg">For Animal: <strong>{request.animalId?.animalTagId}</strong></Text>

        <Divider />

        {/* --- Medicines Section --- */}
        <VStack spacing={4} align="stretch" width="full">
          <Heading size="md">Medicines</Heading>
          {medicines.map((medicine, index) => (
            <HStack key={index} spacing={2}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Medicine Name</FormLabel>
                <Input
                  type="text"
                  name="name"
                  placeholder="e.g., Penicillin"
                  value={medicine.name}
                  onChange={e => handleMedicineChange(index, e)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Dosage</FormLabel>
                <Input
                  type="text"
                  name="dosage"
                  placeholder="e.g., 10ml"
                  value={medicine.dosage}
                  onChange={e => handleMedicineChange(index, e)}
                />
              </FormControl>
              {/* Only show remove button if there's more than one */}
              {medicines.length > 1 && (
                <IconButton
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => handleRemoveMedicine(index)}
                  alignSelf="flex-end"
                />
              )}
            </HStack>
          ))}
          <Button 
            type="button" 
            onClick={handleAddMedicine} 
            leftIcon={<AddIcon />} 
            colorScheme="green" 
            variant="outline"
            size="sm"
          >
            Add Another Medicine
          </Button>
        </VStack>
        
        <Divider />
        
        {/* --- Withdrawal Section (MRL) --- */}
        <FormControl isRequired>
          <FormLabel>Withdrawal Period (in days)</FormLabel>
          <NumberInput 
            value={withdrawalPeriodDays} 
            onChange={(valueString) => setWithdrawalPeriodDays(parseInt(valueString))} 
            min={1}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        
        {/* --- Notes Section --- */}
        <FormControl>
          <FormLabel>Notes for Farmer</FormLabel>
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g., Administer twice daily for 3 days."
          />
        </FormControl>
        
        <HStack width="full" justify="flex-end">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" colorScheme="blue">Submit Prescription</Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default PrescriptionForm;