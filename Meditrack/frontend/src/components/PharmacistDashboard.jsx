import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BillingForm from './BillingForm'; // <-- This form will also be styled

// --- NEW CHAKRA IMPORTS ---
import {
  Box,
  Button,
  Heading,
  VStack,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Text,
  HStack,
  Spacer,
  Alert,
  AlertIcon,
  List,
  ListItem
} from '@chakra-ui/react';
import { MdMonetizationOn } from 'react-icons/md'; // Icon for billing
// --- END NEW IMPORTS ---

const PharmacistDashboard = ({ user, token }) => {
  const [newPrescriptions, setNewPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const toast = useToast(); // Use toast for messages

  // --- 1. FUNCTION: Get all new (unbilled) prescriptions ---
  const fetchNewPrescriptions = async () => {
    try {
      const response = await axios.get(
        '/api/pharmacist/new-prescriptions'
      );
      setNewPrescriptions(response.data);
    } catch (error) {
      toast({
        title: 'Error fetching prescriptions',
        description: error.response?.data?.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchNewPrescriptions();
  }, []);

  // --- 2. RENDER LOGIC ---

  // IF a prescription is selected, show the BillingForm
  if (selectedPrescription) {
    return (
      <BillingForm
        prescription={selectedPrescription}
        pharmacistId={user.userId}
        onClose={() => {
          setSelectedPrescription(null); // Close the form
          fetchNewPrescriptions(); // Refresh the prescription list
        }}
      />
    );
  }

  // Otherwise, show the main dashboard list
  return (
    <VStack spacing={8} align="stretch">
      <Heading size="lg">Pharmacist Dashboard</Heading>
      
      <Card variant="outline">
        <CardHeader>
          <Heading size="md">New Prescriptions (Ready to Bill)</Heading>
        </CardHeader>
        <CardBody>
          <Button onClick={fetchNewPrescriptions} mb={4}>Refresh List</Button>
          
          {newPrescriptions.length > 0 ? (
            <List spacing={4}>
              {newPrescriptions.map(pres => (
                <ListItem key={pres._id} borderWidth="1px" borderRadius="md" p={4} boxShadow="sm">
                  <HStack>
                    <Box>
                      <Heading size="sm">Animal: {pres.animalId?.animalTagId || 'Unknown Animal'}</Heading>
                      <Text>Vet: {pres.vetId?.name || 'Unknown Vet'}</Text>
                      <Text fontWeight="bold" mt={2}>Medicines:</Text>
                      <List styleType="disc" pl={6}>
                        {pres.medicines.map((med, index) => (
                          <ListItem key={index}>{med.name} ({med.dosage})</ListItem>
                        ))}
                      </List>
                    </Box>
                    <Spacer />
                    <Button 
                      onClick={() => setSelectedPrescription(pres)}
                      colorScheme="green"
                      leftIcon={<MdMonetizationOn />}
                    >
                      Create Bill
                    </Button>
                  </HStack>
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert status="info">
              <AlertIcon />
              There are no new prescriptions to bill.
            </Alert>
          )}
        </CardBody>
      </Card>
    </VStack>
  );
};

export default PharmacistDashboard;