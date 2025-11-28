import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Select,
  Textarea,
  VStack,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Text,
  Alert,
  AlertIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tag // We'll use this to show the status
} from '@chakra-ui/react';

// We get 'user', 'token', and the 'animals' list as props
const RequestManager = ({ user, token, animals }) => {
  const [myRequests, setMyRequests] = useState([]);
  const toast = useToast();

  // State for the new request form
  const [requestForm, setRequestForm] = useState({
    animalId: '', // This will hold the ID of the selected animal
    problemDescription: ''
  });

  // --- 1. FUNCTION: Get all of this farmer's past requests ---
  const fetchMyRequests = async () => {
    try {
      const response = await axios.get(
        `/api/requests/my-requests/${user.userId}`
      );
      setMyRequests(response.data);
    } catch (error) {
      toast({
        title: 'Could not fetch requests',
        description: error.response?.data?.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Run 'fetchMyRequests' once when the component loads
  useEffect(() => {
    if (user.userId) {
      fetchMyRequests();
    }
  }, [user.userId]);

  // Handle changes in the new request form
  const handleFormChange = (e) => {
    setRequestForm({
      ...requestForm,
      [e.target.name]: e.target.value
    });
  };

  // --- 2. FUNCTION: Submit a new treatment request ---
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!requestForm.animalId) {
      toast({
        title: 'Please select an animal.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.post(
        '/api/requests/create',
        {
          farmerId: user.userId,
          animalId: requestForm.animalId,
          problemDescription: requestForm.problemDescription
        }
      );

      toast({
        title: 'Request Submitted!',
        description: response.data.message,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setRequestForm({ animalId: '', problemDescription: '' }); // Clear form
      fetchMyRequests(); // Refresh the list of requests

    } catch (error) {
      toast({
        title: 'Error submitting request',
        description: error.response?.data?.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Helper to determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'yellow';
      case 'Accepted':
        return 'blue';
      case 'Completed':
        return 'green';
      case 'Declined':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <VStack spacing={8} align="stretch">
      {/* --- NEW REQUEST FORM --- */}
      <Card variant="outline" as="form" onSubmit={handleSubmitRequest}>
        <CardHeader>
          <Heading size="md">Request Treatment for an Animal</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Select Animal</FormLabel>
              <Select
                name="animalId"
                value={requestForm.animalId}
                onChange={handleFormChange}
                placeholder="-- Please select an animal --"
              >
                {/* We map over the 'animals' prop to create the dropdown */}
                {animals.map(animal => (
                  <option key={animal._id} value={animal._id}>
                    {animal.animalTagId} ({animal.type})
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Describe the Problem</FormLabel>
              <Textarea
                name="problemDescription"
                value={requestForm.problemDescription}
                onChange={handleFormChange}
                placeholder="Describe the animal's symptoms..."
              />
            </FormControl>

            <Button
              bg="#16A34A"
              _hover={{ bg: "#15803D" }}
              color="white"
              size="lg"
              borderRadius="12px"
              type="submit"
            >
              
              Submit Request
            </Button>

          </VStack>
        </CardBody>
      </Card>

      {/* --- PAST REQUESTS LIST --- */}
      <Card variant="outline">
        <CardHeader>
          <Heading size="md">My Treatment Requests</Heading>
        </CardHeader>
        <CardBody>
          <Button onClick={fetchMyRequests} mb={4}>Refresh List</Button>

          {myRequests.length > 0 ? (
            <Accordion allowToggle>
              {myRequests.map(req => (
                <AccordionItem key={req._id}>
                  <h2>
                    {/* --- THIS IS THE FIXED LINE --- */}
                    <AccordionButton color="gray.800">
                      <Box flex="1" textAlign="left">
                        <Text fontWeight="bold">Animal: {req.animalId?.animalTagId || 'N/A'}</Text>
                      </Box>
                      <Tag colorScheme={getStatusColor(req.status)}>{req.status}</Tag>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <Text><strong>Problem:</strong> {req.problemDescription}</Text>

                    {req.status === 'Declined' && (
                      <Text color="red.600"><strong>Reason:</strong> {req.declineReason}</Text>
                    )}

                    {req.status === 'Completed' && req.prescriptionId && (
                      <Box mt={4} p={3} bg="gray.50" borderRadius="md">
                        <Heading size="sm" mb={2}>Treatment Details</Heading>
                        <Text><strong>Vet:</strong> {req.vetId?.name || 'N/A'}</Text>
                        <Text><strong>Medicines:</strong></Text>
                        <VStack align="start" pl={4}>
                          {req.prescriptionId.medicines.map((med, i) => (
                            <Text key={i}>- {med.name} ({med.dosage})</Text>
                          ))}
                        </VStack>
                        <Text><strong>Notes:</strong> {req.prescriptionId.notes || 'None'}</Text>
                        <Text fontWeight="bold">
                          Withdrawal Period: {req.prescriptionId.withdrawalPeriodDays} days
                        </Text>

                        {req.prescriptionId.billId ? (
                          <Text color="green.600" fontWeight="bold">
                            Bill Total: {req.prescriptionId.billId.totalAmount}
                          </Text>
                        ) : (
                          <Text color="orange.600" fontStyle="italic">
                            Bill not yet generated.
                          </Text>
                        )}
                      </Box>
                    )}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <Alert status="info">
              <AlertIcon />
              You have no treatment requests.
            </Alert>
          )}
        </CardBody>
      </Card>
    </VStack>
  );
};

export default RequestManager;