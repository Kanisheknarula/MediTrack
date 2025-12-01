import React, { useState, useEffect } from 'react';
import api from '../api/api';
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

  const [recentBills, setRecentBills] = useState([]);
const [loadingRecentBills, setLoadingRecentBills] = useState(false);


  // --- 1. FUNCTION: Get all new (unbilled) prescriptions ---
  const fetchNewPrescriptions = async () => {
    try {
      const response = await api.get(
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

  useEffect(() => {
  const fetchRecentBills = async () => {
    try {
      setLoadingRecentBills(true);
      const token = localStorage.getItem("token");

      const res = await api.get("/api/pharmacist/bills/recent?limit=5", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setRecentBills(res.data.bills);
      }
    } catch (err) {
      console.error("Error loading recent bills:", err);
    } finally {
      setLoadingRecentBills(false);
    }
  };

  fetchRecentBills();
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

      {/* ================== Recent Bills ================== */}
<Box mt={10} w="100%">
  <Heading size="md" mb={4}>
    Recent Bills (Your last 5)
  </Heading>

  {loadingRecentBills ? (
    <Text>Loading...</Text>
  ) : recentBills.length === 0 ? (
    <Text color="gray.500">No bills generated yet.</Text>
  ) : (
    <VStack align="stretch" spacing={3}>
      {recentBills.map((bill) => (
        <Box
          key={bill._id}
          p={4}
          borderWidth="1px"
          borderRadius="lg"
          bg="gray.50"
        >
          <HStack justify="space-between">
            <Text fontWeight="bold">
              Bill #{bill._id.slice(-6)}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {new Date(bill.createdAt).toLocaleString()}
            </Text>
          </HStack>

          {bill.prescriptionId?.animalId && (
            <Text fontSize="sm" mt={1}>
              Animal:{" "}
              {bill.prescriptionId.animalId.animalTagId ||
                bill.prescriptionId.animalId._id}
            </Text>
          )}

          {bill.totalAmount != null && (
            <Text fontSize="sm" mt={1}>
              Total Amount: ₹{bill.totalAmount}
            </Text>
          )}

          {bill.farmerName && (
            <Text fontSize="sm" mt={1}>
              Farmer: {bill.farmerName}
            </Text>
          )}
        </Box>
      ))}
    </VStack>
  )}
</Box>

    </VStack>
  );
};

export default PharmacistDashboard;