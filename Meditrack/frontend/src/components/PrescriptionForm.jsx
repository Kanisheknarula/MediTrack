import React, { useState } from 'react';
import axios from 'axios';

// --- CHAKRA UI ---
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
  Text,
} from '@chakra-ui/react';

import { AddIcon, DeleteIcon } from '@chakra-ui/icons';


// =====================================================================
//  COMPONENT
// =====================================================================
const PrescriptionForm = ({ request, vetId, onClose , onCreated }) => {

  const [medicines, setMedicines] = useState([{ name: "", dosage: "" }]);
  const [withdrawalPeriodDays, setWithdrawalPeriodDays] = useState(7);
  const [notes, setNotes] = useState("");

  const [txHash, setTxHash] = useState(null);
  const toast = useToast();


  // ============================================================
  //   Medicine add/remove handlers
  // ============================================================
  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "" }]);
  };

  const handleRemoveMedicine = (index) => {
    const values = [...medicines];
    values.splice(index, 1);
    setMedicines(values);
  };

  const handleMedicineChange = (index, event) => {
    const values = [...medicines];
    values[index][event.target.name] = event.target.value;
    setMedicines(values);
  };


  // ============================================================
  //   SUBMIT HANDLER
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast({
          title: "Not Logged In",
          description: "Please login again.",
          status: "error",
          duration: 3000,
        });
        return;
      }

      const payload = {
        requestId: request._id,
        vetId: vetId,
        animalId: request.animalId._id,
        medicines: medicines,
        withdrawalPeriodDays: Number(withdrawalPeriodDays),
        notes,
      };

      const response = await axios.post(
        "http://localhost:5000/api/prescription/create",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Prescription Created!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setTxHash(response.data.txHash);

      if (onCreated) {
  onCreated();
}

      setTimeout(() => {
        onClose();
      }, 1200);

    } catch (error) {
      console.error(error);
      toast({
        title: "Error Creating Prescription",
        description: error.response?.data?.message || "Unexpected error",
        status: "error",
        duration: 5000,
      });
    }
  };


  // ============================================================
  //   UI FORM
  // ============================================================
  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      p={6}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="lg"
      maxW="xl"
      mx="auto"
    >
      <VStack spacing={6}>
        <Heading size="lg">Create Prescription</Heading>
        <Text fontSize="lg">
          For Animal: <strong>{request.animalId?.animalTagId}</strong>
        </Text>

        <Divider />

        {/* ---- Medicines Section ---- */}
        <VStack spacing={4} align="stretch" width="full">
          <Heading size="md">Medicines</Heading>

          {medicines.map((medicine, index) => (
            <HStack key={index} spacing={2}>
              <FormControl isRequired>
                <FormLabel>Medicine</FormLabel>
                <Input
                  name="name"
                  value={medicine.name}
                  onChange={(e) => handleMedicineChange(index, e)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Dosage</FormLabel>
                <Input
                  name="dosage"
                  value={medicine.dosage}
                  onChange={(e) => handleMedicineChange(index, e)}
                />
              </FormControl>

              {medicines.length > 1 && (
                <IconButton
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  onClick={() => handleRemoveMedicine(index)}
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
            Add Medicine
          </Button>
        </VStack>

        <Divider />

        {/* ---- Withdrawal Period ---- */}
        <FormControl isRequired>
          <FormLabel>Withdrawal Period (Days)</FormLabel>
          <NumberInput
            min={1}
            value={withdrawalPeriodDays}
            onChange={(v) => setWithdrawalPeriodDays(Number(v))}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        {/* ---- Notes ---- */}
        <FormControl>
          <FormLabel>Notes</FormLabel>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </FormControl>

        <HStack width="full" justify="flex-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button colorScheme="blue" type="submit">Submit</Button>
        </HStack>

        {/* ---- Blockchain Result ---- */}
        {txHash && (
          <Box mt={4} p={3} bg="green.50" borderRadius="md" width="100%">
            <Text fontWeight="bold">Blockchain TX Hash:</Text>
            <Text fontSize="sm" color="green.700">{txHash}</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default PrescriptionForm;
