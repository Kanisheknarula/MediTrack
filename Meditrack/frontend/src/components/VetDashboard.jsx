import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PrescriptionForm from './PrescriptionForm'; // This will be the next file we style

// --- NEW CHAKRA IMPORTS ---
import {
  Box,
  Button,
  Heading,
  VStack,
  useToast, // Better than setMessage
  Card,
  CardHeader,
  CardBody,
  Text,
  HStack, // Horizontal Stack
  Spacer, // Puts space between items
  Alert,
  AlertIcon,
  List,
  ListItem,
  ListIcon,
  // --- For the new Decline & Prescriptions Modal ---
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure, // Hook to open/close modal
  Textarea,
  FormControl,
  FormLabel,
  Divider,
  Stack,
  Badge,
} from '@chakra-ui/react';
import { MdCheckCircle, MdBlock, MdAssignment, MdDescription } from 'react-icons/md';
// --- END NEW IMPORTS ---

const VetDashboard = ({ user, token }) => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null); 
  const toast = useToast(); // Use toast for messages

  // --- NEW STATE FOR MODAL ---
  const { isOpen, onOpen, onClose } = useDisclosure(); // Controls the decline modal
  const { isOpen: prescOpen, onOpen: openPrescModal, onClose: closePrescModal } = useDisclosure(); // Prescriptions modal
  const [currentDeclineId, setCurrentDeclineId] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  // --- END NEW STATE ---

  // --- PRESCRIPTIONS STATE ---
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  // --- END PRESCRIPTIONS STATE ---

  // --- 1. FUNCTION: Get all requests for the dashboard ---
  const fetchAllRequests = async () => {
    try {
      const [pendingRes, acceptedRes] = await Promise.all([
        axios.get('/api/requests/pending'),
        axios.get(`/api/requests/my-accepted/${user.userId}`)
      ]);
      
      setPendingRequests(pendingRes.data || []);
      setAcceptedRequests(acceptedRes.data || []);
      
    } catch (error) {
      toast({
        title: 'Error fetching requests',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if(user?.userId) {
      fetchAllRequests();
      fetchPrescriptions(); // fetch prescriptions at load as well
    }
    // eslint-disable-next-line
  }, [user?.userId]);
  
  // --- 2. FUNCTION: Accept a request ---
  const handleAccept = async (request) => {
    try {
      await axios.post(
        '/api/requests/accept',
        { requestId: request._id, vetId: user.userId }
      );
      toast({
        title: 'Request Accepted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchAllRequests(); // Refresh both lists
    } catch (error) {
      toast({
        title: 'Error accepting request',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // --- 3. FUNCTION: Decline a request (now opens modal) ---
  const openDeclineModal = (requestId) => {
    setCurrentDeclineId(requestId);
    setDeclineReason('');
    onOpen(); // Opens the modal
  };

  // --- 4. FUNCTION: Submit the decline ---
  const submitDecline = async () => {
    if (!declineReason) {
      toast({
        title: 'Reason is required',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.post(
        '/api/requests/decline',
        { requestId: currentDeclineId, reason: declineReason }
      );
      toast({
        title: 'Request Declined',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      fetchAllRequests(); // Refresh both lists
      onClose(); // Close the modal
    } catch (error) {
      toast({
        title: 'Error declining request',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // --- 5. PRESCRIPTIONS: fetch list of prescriptions by this vet ---
  // tries /api/prescriptions/by-vet/:id and falls back to /api/prescriptions/vet/:id
  const fetchPrescriptions = async () => {
    if (!user?.userId) return;
    setLoadingPrescriptions(true);
    try {
      let res;
      try {
        res = await axios.get(`/api/prescriptions/by-vet/${user.userId}`);
      } catch (err) {
        // fallback
        res = await axios.get(`/api/prescriptions/vet/${user.userId}`);
      }
      setPrescriptions(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('fetchPrescriptions error', error);
      setPrescriptions([]);
      toast({
        title: 'Could not load prescriptions',
        description: error.response?.data?.message || error.message,
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  // --- 6. RENDER LOGIC ---
  
  // If the vet has clicked "Prescribe", show the form
  if (selectedRequest) {
    return (
      <PrescriptionForm
        request={selectedRequest}
        vetId={user.userId}
        onClose={() => {
          setSelectedRequest(null); // Close the form
          fetchAllRequests(); // Refresh all lists
          fetchPrescriptions(); // refresh prescriptions after writing one
        }}
      />
    );
  }

  // Otherwise, show the normal dashboard
  return (
    <VStack spacing={8} align="stretch">
      <Heading size="lg">Veterinarian Dashboard</Heading>
      
      {/* --- PENDING REQUESTS LIST --- */}
      <Card variant="outline">
        <CardHeader>
          <Heading size="md">Pending Treatment Requests ({pendingRequests.length})</Heading>
        </CardHeader>
        <CardBody>
          <Button onClick={fetchAllRequests} mb={4}>Refresh List</Button>
          
          {pendingRequests.length > 0 ? (
            <List spacing={4}>
              {pendingRequests.map(req => (
                <ListItem key={req._id} borderWidth="1px" borderRadius="md" p={4} boxShadow="sm">
                  <Heading size="sm">Animal: {req.animalId?.animalTagId} ({req.animalId?.type})</Heading>
                  <Text>Farmer: {req.farmerId?.name} ({req.farmerId?.phone})</Text>
                  <Text>Problem: {req.problemDescription}</Text>
                  <HStack mt={4}>
                    <Button onClick={() => handleAccept(req)} colorScheme="green" leftIcon={<MdCheckCircle />}>
                      Accept
                    </Button>
                    <Button onClick={() => openDeclineModal(req._id)} colorScheme="red" leftIcon={<MdBlock />}>
                      Decline
                    </Button>
                    <Button onClick={() => setSelectedRequest(req)} colorScheme="blue" leftIcon={<MdAssignment />}>
                      Prescribe
                    </Button>
                  </HStack>
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert status="info">
              <AlertIcon />
              There are no pending requests.
            </Alert>
          )}
        </CardBody>
      </Card>
      
      {/* --- ACCEPTED REQUESTS LIST --- */}
      <Card variant="outline">
        <CardHeader>
          <Heading size="md">My Accepted Cases ({acceptedRequests.length})</Heading>
        </CardHeader>
        <CardBody>
          {acceptedRequests.length > 0 ? (
            <List spacing={4}>
              {acceptedRequests.map(req => (
                <ListItem key={req._id} borderWidth="1px" borderRadius="md" p={4} boxShadow="sm">
                  <HStack>
                    <Box>
                      <Heading size="sm">Animal: {req.animalId?.animalTagId}</Heading>
                      <Text>Farmer: {req.farmerId?.name}</Text>
                      <Text>Problem: {req.problemDescription}</Text>
                    </Box>
                    <Spacer />
                    <Button onClick={() => setSelectedRequest(req)} colorScheme="blue" leftIcon={<MdAssignment />}>
                      Write Prescription
                    </Button>
                  </HStack>
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert status="info">
              <AlertIcon />
              You have no accepted requests.
            </Alert>
          )}
        </CardBody>
      </Card>

      {/* --- DIVIDER & Prescriptions Card --- */}
      <Divider />

     

      {/* --- PRESCRIPTIONS MODAL --- */}
      <Modal isOpen={prescOpen} onClose={closePrescModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Prescriptions by {user?.name || 'You'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {loadingPrescriptions ? (
              <Text>Loading…</Text>
            ) : prescriptions.length === 0 ? (
              <Alert status="info"><AlertIcon />No prescriptions found.</Alert>
            ) : (
              <VStack spacing={4} align="stretch">
                {prescriptions.map((p) => (
                  <Card key={p._id || p.id} borderWidth="1px" borderRadius="md" p={3}>
                    <HStack justify="space-between" align="start">
                      <Box>
                        <HStack>
                          <Heading size="sm">{p.animal?.animalTagId || p.animalTagId || 'Animal'}</Heading>
                          <Badge colorScheme="green">{new Date(p.createdAt || p.date || p.timestamp || Date.now()).toLocaleDateString()}</Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600" mt={2}>{p.notes || p.description || '—'}</Text>

                        {/* Medicines list (safe check) */}
                        {Array.isArray(p.medicines) && p.medicines.length > 0 && (
                          <Stack mt={2} spacing={1}>
                            {p.medicines.map((m, i) => (
                              <HStack key={i}>
                                <ListIcon as={MdCheckCircle} />
                                <Text fontSize="sm">{m.name || m.medicinename || m}</Text>
                                <Text fontSize="xs" color="gray.500"> — {m.dosage || m.instructions || ''}</Text>
                              </HStack>
                            ))}
                          </Stack>
                        )}
                      </Box>

                      <VStack>
                        {/* If the prescription has an attached image, show a small link or badge */}
                        {p.photo && <Badge colorScheme="purple">Photo</Badge>}
                        <Button size="sm" onClick={() => {
                          // simple view details -> open the PrescriptionForm with data if you want
                          // For now show toast and close modal and open prescription form for read-only
                          setSelectedRequest(p.request || p); // attempt to let user view in PrescriptionForm if it supports
                          closePrescModal();
                        }}>Open</Button>
                      </VStack>
                    </HStack>
                  </Card>
                ))}
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={closePrescModal}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* --- DECLINE REASON MODAL --- */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Decline Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Please provide a reason for declining:</FormLabel>
              <Textarea 
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g., Not in my service area, case requires specialist..."
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={submitDecline}>
              Submit Decline
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </VStack>
  );
};

export default VetDashboard;
