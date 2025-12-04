// src/components/FarmerDashboard.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import api from '../api/api';
import RequestManager from "./RequestManager";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  SimpleGrid,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Badge,
  useToast,
  VisuallyHidden,
  Card,
  CardHeader,
  CardBody,
} from "@chakra-ui/react";
import { MdSearch, MdContentCopy, MdLocalHospital, MdPets, MdRefresh } from "react-icons/md";

/**
 * FarmerDashboard — updated colors to match screenshot (primary teal/green).
 * Primary color used across CTAs: GREEN = "#0EA5A4" with hover darker.
 */

export default function FarmerDashboard({ user, token }) {
  const toast = useToast();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const requestManagerAnchorRef = useRef(null);

  // color matching screenshot (teal/green)
  const GREEN = "#0EA5A4";
  const GREEN_HOVER = "#0b938f";

  // determine farmer id robustly
  const farmerId = useMemo(() => user?.userId || user?.id || user?._id || null, [user]);

  // robust fetch function: tries several likely endpoints
const fetchMyAnimals = async () => {
    setLoading(true);
    try {
      if (!farmerId) {
        setAnimals([]);
        setLoading(false);
        return;
      }

      const candidates = [
        `/api/animals/my-animals/${farmerId}`,
        `/api/animals/farmer/${farmerId}`,
        `/api/animals?farmerId=${farmerId}`
      ];

      let response = null;
      for (const url of candidates) {
        try {
          response = await api.get(url);
          // Stop if we get a valid response object
          if (response && response.data) break;
        } catch (err) {
          response = null; 
        }
      }

      // 1. SAFETY CHECK: If no response or data is null/undefined
      if (!response || !response.data) {
        setAnimals([]);
        setLoading(false);
        return;
      }

      // 2. ROBUST PARSING: Handle Array, Object with .animals, or Object with .items
      let rawData = [];
      if (Array.isArray(response.data)) {
        rawData = response.data;
      } else if (response.data.animals && Array.isArray(response.data.animals)) {
        rawData = response.data.animals;
      } else if (response.data.items && Array.isArray(response.data.items)) {
        rawData = response.data.items;
      }

      // 3. NORMALIZE: Ensure we don't crash on null values inside the array
      const normalized = rawData.map((a) => {
        if (!a) return null; // Skip null entries
        return {
          _id: a._id || a.id || `temp-${Math.random()}`,
          animalTagId: a.animalTagId || "Unknown",
          type: a.type || "",
          breed: a.breed || "",
          age: a.age || null,
          weight: a.weight || null,
          groupName: a.groupName || "",
          raw: a
        };
      }).filter(Boolean); // Remove nulls

      setAnimals(normalized);

    } catch (err) {
      console.error("fetchMyAnimals error:", err);
      toast({ title: "Error", description: "Could not load animals.", status: "error", duration: 4000 });
      setAnimals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (farmerId) fetchMyAnimals();
    // eslint-disable-next-line
  }, [farmerId]);

  // filtered list by query
  const filtered = useMemo(() => {
    if (!query.trim()) return animals;
    const q = query.trim().toLowerCase();
    return animals.filter(a =>
      (a.animalTagId && a.animalTagId.toLowerCase().includes(q)) ||
      (a.breed && a.breed.toLowerCase().includes(q)) ||
      (a.type && a.type.toLowerCase().includes(q))
    );
  }, [animals, query]);

  // copy tag helper
  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: "Tag copied to clipboard", status: "success", duration: 1500 });
    } catch {
      toast({ title: "Copy failed", description: "Try long-press to copy", status: "warning", duration: 2000 });
    }
  };

  // when farmer taps Request treatment on a card, dispatch event and scroll to RequestManager
  const openRequestFor = (animal) => {
    window.dispatchEvent(new CustomEvent("open-request-for-animal", { detail: animal }));
    // scroll to request manager anchor if present
    setTimeout(() => {
      const el = document.getElementById("request-manager-anchor");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    toast({ title: "Request", description: `Request form opened for ${animal.animalTagId}`, status: "info", duration: 1500 });
  };

  // view prescription (dispatch event with animal id)
  const viewPrescriptionFor = (animal) => {
    window.dispatchEvent(new CustomEvent("view-prescription-for-animal", { detail: { animalId: animal._id } }));
    setTimeout(() => {
      const el = document.getElementById("request-manager-anchor");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  // view bill (dispatch event)
  const viewBillFor = (animal) => {
    window.dispatchEvent(new CustomEvent("view-bill-for-animal", { detail: { animalId: animal._id } }));
    setTimeout(() => {
      const el = document.getElementById("request-manager-anchor");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  return (
    <VStack spacing={8} align="stretch">
      <Heading size="lg">Farmer Dashboard</Heading>

      <HStack justify="space-between" align="center">
        <Box>
          <Text fontSize="md" color="gray.600">Animals registered to you — quick actions below</Text>
        </Box>

        <HStack spacing={3}>
          <Button leftIcon={<MdRefresh />} size="sm" onClick={fetchMyAnimals}>Refresh</Button>
        </HStack>
      </HStack>

      <Card className="glass-card">
        <CardHeader display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="md">My Animals <Badge ml={3} colorScheme="green">{animals.length}</Badge></Heading>
          <Text fontSize="sm" color="gray.500">{loading ? <Spinner size="xs" /> : `${filtered.length} shown`}</Text>
        </CardHeader>

        <CardBody>
          {loading ? (
            <Spinner />
          ) : animals.length === 0 ? (
            <Box py={8} textAlign="center">
              <Text fontSize="lg" mb={3}>No animals registered to your account</Text>
              <Text color="gray.600" mb={4}>A Registrar can add animals for you. Use the menu to request assistance.</Text>
              <Button
                bg={GREEN}
                _hover={{ bg: GREEN_HOVER }}
                color="white"
                size="lg"
                borderRadius="12px"
                onClick={() => window.dispatchEvent(new Event("open-side-menu"))}
              >
                Open Menu / Call Help
              </Button>
            </Box>
          ) : filtered.length === 0 ? (
            <Box py={8} textAlign="center">
              <Text>No animals match your search.</Text>
              <Button mt={3} size="sm" onClick={() => setQuery("")}>Clear search</Button>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {filtered.map((animal) => (
                <Box
                  key={animal._id}
                  p={5}
                  borderRadius="12px"
                  bg="white"
                  boxShadow="sm"
                  role="group"
                  aria-label={`Animal ${animal.animalTagId}`}
                >
                  <HStack align="start">
                    <Box>
                      <Heading size="md" display="flex" alignItems="center">
                        <MdPets color={GREEN} style={{ marginRight: 8 }} />
                        <span style={{ letterSpacing: 0.6 }}>{animal.animalTagId}</span>
                      </Heading>
                      <Text color="gray.600" mt={1}>{animal.type} • {animal.breed || "—"}</Text>
                      <Text color="gray.500" fontSize="sm" mt={1}>
                        {animal.age ? `${animal.age} yrs` : "Age —"} · {animal.weight ? `${animal.weight} kg` : "Weight —"}
                      </Text>
                    </Box>

                    <Box marginLeft="auto" textAlign="right">
                      <Badge colorScheme="purple" fontSize="sm" px={2} py={1}>
                        {animal.groupName || "No group"}
                      </Badge>
                    </Box>
                  </HStack>

                  <HStack mt={4} spacing={3}>
                    <Button size="sm" leftIcon={<MdContentCopy />} onClick={() => handleCopy(animal.animalTagId)}>Copy Tag</Button>

                    <Button
                      size="large"
                      bg={GREEN}
                      _hover={{ bg: GREEN_HOVER }}
                      color="white"
                      leftIcon={<MdLocalHospital />}
                      onClick={() => openRequestFor(animal)}
                    >
                    Request treatment
                    </Button>

                    <Button size="big" variant="outline" onClick={() => {
                      const el = document.getElementById("request-manager-anchor");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      toast({ title: "Scroll", description: "Scroll down to Requests to view prescriptions & bills.", status: "info", duration: 1800 });
                    }}>
                     
                    </Button>
                  </HStack>

                  <HStack mt={3} spacing={3}>
                    <Button size="sm" colorScheme="teal" onClick={() => viewPrescriptionFor(animal)}>
                      View Prescription
                    </Button>
                    <Button size="sm" bg={GREEN} _hover={{ bg: GREEN_HOVER }} color="white" onClick={() => viewBillFor(animal)}>
                      View Bill
                    </Button>
                  </HStack>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </CardBody>
      </Card>

      {/* Request manager is placed below and receives animals & user */}
      <Box id="request-manager-anchor" ref={requestManagerAnchorRef}>
        <RequestManager user={user} token={token} animals={animals} primaryColor={GREEN} primaryHover={GREEN_HOVER} />
      </Box>
    </VStack>
  );
}




