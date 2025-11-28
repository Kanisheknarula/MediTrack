// frontend/src/components/VetDashboard.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import PrescriptionForm from "./PrescriptionForm";

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
  ListItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";

import { MdCheckCircle, MdBlock, MdAssignment } from "react-icons/md";

const VetDashboard = ({ user }) => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [currentDeclineId, setCurrentDeclineId] = useState(null);
  const [declineReason, setDeclineReason] = useState("");

  // ---------------- Fetch pending + accepted requests ----------------
  const fetchAllRequests = async () => {
    try {
      const [pendingRes, acceptedRes] = await Promise.all([
        axios.get("/api/requests/pending"),
        axios.get(`/api/requests/my-accepted/${user.userId}`),
      ]);

      setPendingRequests(pendingRes.data || []);
      setAcceptedRequests(acceptedRes.data || []);
    } catch (error) {
      toast({
        title: "Error fetching requests",
        description: error.response?.data?.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (user.userId) fetchAllRequests();
  }, [user.userId]);

  // ---------------- Fetch Recent Prescriptions ----------------
  const refreshRecentPrescriptions = async () => {
    try {
      setLoadingRecent(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "/api/prescription/vet/recent?limit=5",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ❗ FIX: backend returns "data", not "prescriptions"
      setRecentPrescriptions(res.data.prescriptions || []);
    } catch (error) {
      console.error("Recent prescription error:", error.message);
      setRecentPrescriptions([]);
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    refreshRecentPrescriptions();
  }, []);

  // ---------------- Accept Request ----------------
  const handleAccept = async (req) => {
    try {
      await axios.post("/api/requests/accept", {
        requestId: req._id,
        vetId: user.userId,
      });

      toast({ title: "Request Accepted", status: "success", duration: 3000 });
      fetchAllRequests();
    } catch (err) {
      toast({
        title: "Error accepting request",
        description: err.response?.data?.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // ---------------- Decline request ----------------
  const openDeclineModal = (id) => {
    setCurrentDeclineId(id);
    setDeclineReason("");
    onOpen();
  };

  const submitDecline = async () => {
    if (!declineReason) {
      toast({ title: "Reason required", status: "warning", duration: 3000 });
      return;
    }

    try {
      await axios.post("/api/requests/decline", {
        requestId: currentDeclineId,
        reason: declineReason,
      });

      toast({ title: "Request Declined", status: "info", duration: 3000 });
      fetchAllRequests();
      onClose();
    } catch (err) {
      toast({
        title: "Error declining request",
        description: err.response?.data?.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // ---------------- If Writing Prescription ----------------
  if (selectedRequest) {
    return (
      <PrescriptionForm
        request={selectedRequest}
        vetId={user.userId}
        onClose={() => setSelectedRequest(null)}
        onCreated={() => {
          fetchAllRequests();          // remove from accepted instantly
          refreshRecentPrescriptions(); // update recent list instantly
        }}
      />
    );
  }

  // ---------------- UI ----------------
  return (
    <VStack spacing={8} align="stretch">
      <Heading size="lg">Veterinarian Dashboard</Heading>

      {/* Pending Requests */}
      <Card variant="outline">
        <CardHeader>
          <Heading size="md">
            Pending Treatment Requests ({pendingRequests.length})
          </Heading>
        </CardHeader>
        <CardBody>
          <Button onClick={fetchAllRequests} mb={4}>
            Refresh List
          </Button>

          {pendingRequests.length ? (
            <List spacing={4}>
              {pendingRequests.map((req) => (
                <ListItem
                  key={req._id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                >
                  <Heading size="sm">
                    Animal: {req.animalId?.animalTagId} ({req.animalId?.type})
                  </Heading>
                  <Text>Farmer: {req.farmerId?.name}</Text>
                  <Text>Problem: {req.problemDescription}</Text>

                  <HStack mt={4}>
                    <Button
                      colorScheme="green"
                      leftIcon={<MdCheckCircle />}
                      onClick={() => handleAccept(req)}
                    >
                      Accept
                    </Button>
                    <Button
                      colorScheme="red"
                      leftIcon={<MdBlock />}
                      onClick={() => openDeclineModal(req._id)}
                    >
                      Decline
                    </Button>
                  </HStack>
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert status="info">
              <AlertIcon />
              No pending requests.
            </Alert>
          )}
        </CardBody>
      </Card>

      {/* Accepted Requests */}
      <Card variant="outline">
        <CardHeader>
          <Heading size="md">
            My Accepted Cases ({acceptedRequests.length})
          </Heading>
        </CardHeader>
        <CardBody>
          {acceptedRequests.length ? (
            <List spacing={4}>
              {acceptedRequests.map((req) => (
                <ListItem
                  key={req._id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                >
                  <HStack>
                    <Box>
                      <Heading size="sm">
                        Animal: {req.animalId?.animalTagId}
                      </Heading>
                      <Text>Farmer: {req.farmerId?.name}</Text>
                      <Text>Problem: {req.problemDescription}</Text>
                    </Box>
                    <Spacer />
                    <Button
                      colorScheme="blue"
                      leftIcon={<MdAssignment />}
                      onClick={() => setSelectedRequest(req)}
                    >
                      Write Prescription
                    </Button>
                  </HStack>
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert status="info">
              <AlertIcon />
              No accepted cases.
            </Alert>
          )}
        </CardBody>
      </Card>

      {/* Recent Prescriptions */}
      <Box mt={10}>
        <Heading size="md" mb={4}>
          Recent Prescriptions (Last 5)
        </Heading>

        {loadingRecent ? (
          <Text>Loading...</Text>
        ) : recentPrescriptions.length === 0 ? (
          <Text color="gray.500">No prescriptions created yet.</Text>
        ) : (
          <VStack spacing={3} align="stretch">
            {recentPrescriptions.map((p) => (
              <Box
                key={p._id}
                p={4}
                borderWidth="1px"
                borderRadius="lg"
                bg="gray.50"
              >
                <Text fontWeight="bold">
                  Animal: {p.animalId?.animalTagId || "Unknown"}
                </Text>
                <Text fontSize="sm">
                  Medicines:{" "}
                  {p.medicines
                    .map((m) => `${m.name} (${m.dosage})`)
                    .join(", ")}
                </Text>
              </Box>
            ))}
          </VStack>
        )}
      </Box>

      {/* Decline Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Decline Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Reason</FormLabel>
              <Textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={submitDecline}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default VetDashboard;
