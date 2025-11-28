// src/components/RegistrarDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Box, Button, FormControl, FormLabel, Heading, Input, Select,
  VStack, useToast, SimpleGrid, Text, HStack, Divider, Badge, Stack,
  Skeleton, Icon, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, useDisclosure, Spinner
} from "@chakra-ui/react";
import { MdOutlinePets, MdCheckCircle, MdCameraAlt, MdSave, MdDelete } from "react-icons/md";

/**
 * RegistrarDashboard — updated to prepend newly added animals into Recent animals list immediately.
 * - Ensures no duplicate entries (by _id or animalTagId).
 * - Keeps previous features: editable farmer name/phone, save farmer info, scanner, remove action.
 *
 * References: original Registrar & Public Dashboard styles.  :contentReference[oaicite:3]{index=3}
 */

const RegistrarDashboard = ({ user }) => {
  const toast = useToast();

  const [farmers, setFarmers] = useState([]);
  const [loadingFarmers, setLoadingFarmers] = useState(true);

  const [formData, setFormData] = useState({
    ownerId: "",
    ownerName: "",
    ownerPhone: "",
    animalTagId: "",
    type: "Cow",
    breed: "",
    age: "",
    weight: "",
    groupName: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [recentAnimals, setRecentAnimals] = useState([]);
  const [lastAdded, setLastAdded] = useState(null);

  // Scanner modal controls
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [scannerLoading, setScannerLoading] = useState(false);
  const scannerRef = useRef(null); // hold Html5Qrcode instance

  // Load farmers on mount
  useEffect(() => {
    let mounted = true;
    const fetchFarmers = async () => {
      try {
        setLoadingFarmers(true);
        const res = await axios.get("/api/registrar/all-farmers");
        if (!mounted) return;
        setFarmers(res.data || []);
        if (res.data && res.data.length > 0) {
          const first = res.data[0];
          setFormData((p) => ({
            ...p,
            ownerId: first._id,
            ownerName: first.name || "",
            ownerPhone: first.phone || ""
          }));
          fetchRecentAnimals(first._id);
        }
      } catch (err) {
        toast({
          title: "Could not load farmers",
          description: err?.response?.data?.message || "Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true
        });
      } finally {
        setLoadingFarmers(false);
      }
    };
    fetchFarmers();
    return () => { mounted = false; stopScannerIfAny(); };
    // eslint-disable-next-line
  }, []);

  const stopScannerIfAny = async () => {
    try {
      if (scannerRef.current && typeof scannerRef.current.stop === "function") {
        await scannerRef.current.stop();
      }
      if (scannerRef.current && typeof scannerRef.current.clear === "function") {
        scannerRef.current.clear();
      }
      scannerRef.current = null;
    } catch (e) {
      // ignore
    }
  };

  // Fetch recent animals for a farmer
  const fetchRecentAnimals = async (farmerId) => {
    if (!farmerId) {
      setRecentAnimals([]);
      return;
    }
    try {
      const res = await axios.get(`/api/registrar/farmer-animals/${farmerId}`);
      setRecentAnimals(res.data || []);
    } catch (err) {
      setRecentAnimals([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));

    // if selecting a different farmer, prefill ownerName & ownerPhone from DB + refresh recent animals
    if (name === "ownerId") {
      const f = farmers.find((x) => x._id === value);
      setFormData((p) => ({ ...p, ownerId: value, ownerName: f?.name || "", ownerPhone: f?.phone || "" }));
      fetchRecentAnimals(value);
    }
  };

  const validate = () => {
    if (!formData.ownerId) {
      toast({ title: "Select a farmer", status: "warning", duration: 2500, isClosable: true });
      return false;
    }
    if (!formData.animalTagId || !formData.animalTagId.trim()) {
      toast({ title: "Animal Tag ID required", status: "warning", duration: 2500, isClosable: true });
      return false;
    }
    return true;
  };

  // helper to ensure uniqueness in recent list (by _id or animalTagId)
  const uniquePrepend = (list, item) => {
    if (!item) return list;
    const exists = list.some(x => (item._id && x._id && x._id === item._id) || (x.animalTagId && item.animalTagId && x.animalTagId === item.animalTagId));
    if (exists) {
      // move existing to the front
      const filtered = list.filter(x => !((item._id && x._id && x._id === item._id) || (x.animalTagId && item.animalTagId && x.animalTagId === item.animalTagId)));
      return [item, ...filtered];
    }
    return [item, ...list];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const payload = {
        ownerId: formData.ownerId,
        ownerName: formData.ownerName?.trim() || undefined,
        ownerPhone: formData.ownerPhone?.trim() || undefined,
        animalTagId: formData.animalTagId.trim(),
        type: formData.type,
        breed: formData.breed || undefined,
        age: formData.age ? Number(formData.age) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        groupName: formData.groupName || undefined
      };

      const res = await axios.post("/api/registrar/add-animal", payload);

      toast({
        title: "Animal added",
        description: `${payload.animalTagId} has been added.`,
        status: "success",
        duration: 3500,
        isClosable: true
      });

      // build a best-effort animal object to show in recent list
      const newAnimal = res.data && (res.data._id || res.data.animalTagId)
        ? res.data
        : {
            _id: res.data?._id || `temp-${Date.now()}`,
            animalTagId: payload.animalTagId,
            type: payload.type,
            breed: payload.breed || "",
            age: payload.age || null,
            groupName: payload.groupName || ""
          };

      // prepend to recent list without duplicates
      setRecentAnimals((prev) => uniquePrepend(prev, newAnimal));

      setFormData((p) => ({
        ...p,
        animalTagId: "",
        breed: "",
        age: "",
        weight: "",
        groupName: ""
      }));

      setLastAdded(newAnimal);

    } catch (err) {
      toast({
        title: "Error adding animal",
        description: err?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Save farmer info explicitly to DB
  const handleSaveFarmer = async () => {
    if (!formData.ownerId) {
      toast({ title: "Select a farmer first", status: "warning", duration: 2500, isClosable: true });
      return;
    }
    if (!formData.ownerName?.trim() && !formData.ownerPhone?.trim()) {
      toast({ title: "Nothing to save", status: "info", duration: 2000, isClosable: true });
      return;
    }

    try {
      const payload = {
        name: formData.ownerName?.trim(),
        phone: formData.ownerPhone?.trim()
      };
      // NOTE: Backend endpoint assumed. Change path if your API differs.
      await axios.put(`/api/registrar/update-farmer/${formData.ownerId}`, payload);

      toast({
        title: "Farmer info saved",
        description: "Name and phone updated.",
        status: "success",
        duration: 3000,
        isClosable: true
      });

      // Update local farmers array so UI reflects change
      setFarmers((prev) => prev.map(f => (f._id === formData.ownerId ? { ...f, name: payload.name || f.name, phone: payload.phone || f.phone } : f)));

    } catch (err) {
      toast({
        title: "Could not save farmer",
        description: err?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true
      });
    }
  };

  const handleRemoveAnimal = async (animalId) => {
    if (!animalId) return;
    const ok = window.confirm("Remove this animal? This action cannot be undone.");
    if (!ok) return;

    try {
      await axios.delete(`/api/registrar/remove-animal/${animalId}`);
      toast({ title: "Removed", description: "Animal removed successfully.", status: "success", duration: 2500, isClosable: true });
      // remove locally
      setRecentAnimals((prev) => prev.filter(a => !(a._id && a._id === animalId)));
    } catch (err) {
      toast({ title: "Could not remove", description: err?.response?.data?.message || "Try again.", status: "error", duration: 3000, isClosable: true });
    }
  };

  const selectedFarmer = farmers.find((f) => f._id === formData.ownerId);

  /* ---------- Camera / scan logic using html5-qrcode (dynamically loaded) ---------- */
  const startScanner = async () => {
    setScannerLoading(true);
    try {
      if (!window.Html5Qrcode) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://unpkg.com/html5-qrcode@2.3.8/minified/html5-qrcode.min.js";
          s.async = true;
          s.onload = () => resolve(s);
          s.onerror = reject;
          document.body.appendChild(s);
        });
      }

      onOpen();
      await new Promise((r) => setTimeout(r, 250));
      const Html5Qrcode = window.Html5Qrcode;
      const readerId = "html5qr-reader";
      if (scannerRef.current && typeof scannerRef.current.stop === "function") {
        await scannerRef.current.stop();
        scannerRef.current = null;
      }

      const html5Qrcode = new Html5Qrcode(readerId, /* verbose= */ false);
      scannerRef.current = html5Qrcode;

      const config = { fps: 10, qrbox: { width: 260, height: 160 }, supportedScanTypes: 0 };

      await html5Qrcode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          setFormData((p) => ({ ...p, animalTagId: decodedText }));
          toast({
            title: "Scanned",
            description: `Scanned value saved to Tag ID.`,
            status: "success",
            duration: 2500,
            isClosable: true
          });
          stopScannerIfAny();
          onClose();
        },
        () => {}
      );

    } catch (err) {
      console.error("Scanner failed to start:", err);
      toast({
        title: "Camera unavailable",
        description: "Could not access camera. You can type the Tag ID manually.",
        status: "warning",
        duration: 3500,
        isClosable: true
      });
      onOpen();
    } finally {
      setScannerLoading(false);
    }
  };

  const stopAndCloseScanner = async () => {
    await stopScannerIfAny();
    onClose();
  };

  return (
    <Box maxW="980px" mx="auto" p={{ base: 4, md: 6 }}>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between" alignItems="center">
          <Heading as="h1" size="lg" display="flex" alignItems="center" gap={3}>
            <Icon as={MdOutlinePets} boxSize={6} /> Registrar Dashboard
          </Heading>
          <Badge colorScheme="purple" fontSize="md">Quick Add</Badge>
        </HStack>

        <Text fontSize="md" color="gray.600">Add a new animal record for a registered farmer. You may edit the farmer name & phone below and save explicitly.</Text>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Left: Form */}
          <Box as="form" onSubmit={handleSubmit} className="glass-card" p={6} borderRadius="14px">
            <VStack spacing={5} align="stretch">

              <FormControl isRequired>
                <FormLabel fontSize="lg">Select Farmer</FormLabel>
                {loadingFarmers ? (
                  <Skeleton height="48px" />
                ) : (
                  <Select
                    name="ownerId"
                    value={formData.ownerId}
                    onChange={handleChange}
                    size="lg"
                    className="big-input"
                    aria-label="Select farmer"
                  >
                    {farmers.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name} — {f.city || ""}
                      </option>
                    ))}
                  </Select>
                )}
                <Text fontSize="sm" color="gray.500" mt={2}>
                  Selected: {selectedFarmer?.name || "—"} • {selectedFarmer?.phone || "phone not available"}
                </Text>
              </FormControl>

              {/* Editable Farmer Name */}
              <FormControl>
                <FormLabel fontSize="lg">Farmer name (editable)</FormLabel>
                <Input
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="Type or correct farmer name"
                  size="lg"
                  className="big-input"
                  aria-label="Farmer display name"
                />
              </FormControl>

              {/* Editable Farmer Phone */}
              <FormControl>
                <FormLabel fontSize="lg">Farmer phone (editable)</FormLabel>
                <Input
                  name="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={handleChange}
                  placeholder="e.g., +91-98765-43210"
                  size="lg"
                  className="big-input"
                  aria-label="Farmer phone"
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Press <strong>Farmer info</strong> to update the database.
                </Text>
                <HStack mt={3} spacing={3}>
                  <Button size="md" leftIcon={<MdSave />} colorScheme="teal" onClick={handleSaveFarmer}>
                    Farmer info
                  </Button>
                  <Button size="md" variant="ghost" onClick={() => {
                    const f = farmers.find((x) => x._id === formData.ownerId);
                    setFormData((p) => ({ ...p, ownerName: f?.name || "", ownerPhone: f?.phone || "" }));
                    toast({ title: "Restored", status: "info", duration: 1500, isClosable: true });
                  }}>
                    Restore
                  </Button>
                </HStack>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="lg">Animal Tag ID</FormLabel>
                <HStack spacing={3}>
                  <Input
                    name="animalTagId"
                    value={formData.animalTagId}
                    onChange={handleChange}
                    placeholder="e.g., COW-101"
                    size="lg"
                    className="big-input"
                    aria-label="Animal Tag ID"
                  />
                  <Button
                    leftIcon={<MdCameraAlt />}
                    colorScheme="teal"
                    size="lg"
                    onClick={startScanner}
                    aria-label="Scan animal tag"
                    title="Scan tag with camera"
                  >
                    Scan
                  </Button>
                </HStack>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Use Scan for QR or barcode that contains the tag. If camera not available, type it.
                </Text>
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="lg">Animal Type</FormLabel>
                  <Select name="type" value={formData.type} onChange={handleChange} size="lg" className="big-input">
                    <option value="Cow">Cow</option>
                    <option value="Buffalo">Buffalo</option>
                    <option value="Goat">Goat</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="lg">Breed</FormLabel>
                  <Input name="breed" value={formData.breed} onChange={handleChange} size="lg" placeholder="Optional" />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <FormControl>
                  <FormLabel>Age (yrs)</FormLabel>
                  <Input type="number" name="age" value={formData.age} onChange={handleChange} size="lg" min={0} />
                </FormControl>

                <FormControl>
                  <FormLabel>Weight (kg)</FormLabel>
                  <Input type="number" name="weight" value={formData.weight} onChange={handleChange} size="lg" min={0} />
                </FormControl>

                <FormControl>
                  <FormLabel>Group (shed)</FormLabel>
                  <Input name="groupName" value={formData.groupName} onChange={handleChange} size="lg" placeholder='e.g., "Shed A"' />
                </FormControl>
              </SimpleGrid>

              <Divider />

              <Stack direction="row" spacing={3}>
                <Button
                  type="submit"
                  colorScheme="teal"
                  size="lg"
                  isLoading={submitting}
                  flex="1"
                  isDisabled={!formData.ownerId || !formData.animalTagId.trim()}
                >
                  Add Animal
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setFormData((p) => ({ ...p, animalTagId: "", breed: "", age: "", weight: "", groupName: "" }));
                  }}
                >
                  Clear
                </Button>
              </Stack>

              {lastAdded && (
                <Box mt={2} p={3} bg="green.50" borderRadius="md">
                  <HStack justify="space-between">
                    <HStack gap={3}>
                      <Icon as={MdCheckCircle} boxSize={5} color="green.600" />
                      <Box>
                        <Text fontWeight="bold">Added: {lastAdded.animalTagId}</Text>
                        <Text fontSize="sm" color="gray.600">{lastAdded.type}</Text>
                      </Box>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">Owner: {formData.ownerName || selectedFarmer?.name || "—"}</Text>
                  </HStack>
                </Box>
              )}
            </VStack>
          </Box>

          {/* Right: Recent animals */}
          <Box className="glass-card" p={6} borderRadius="14px">
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Recent animals</Heading>
              <Text fontSize="sm" color="gray.600">Quick list of recently added animals for the selected farmer.</Text>

              {loadingFarmers ? (
                <>
                  <Skeleton height="56px" />
                  <Skeleton height="56px" />
                </>
              ) : recentAnimals.length > 0 ? (
                recentAnimals.map((a) => (
                  <HStack key={a._id || a.animalTagId} p={3} borderRadius="md" bg="white" boxShadow="sm" spacing={4} alignItems="center">
                    <Box>
                      <Text fontWeight="bold" fontSize="md">{a.animalTagId}</Text>
                      <Text fontSize="sm" color="gray.600">{a.type} • {a.breed || "—"}</Text>
                    </Box>

                    <Box ml="auto" textAlign="right" mr={3}>
                      <Text fontSize="sm" color="gray.600">{a.age ? `${a.age} yrs` : "—"}</Text>
                      <Text fontSize="sm" color="green.600">{a.groupName || ""}</Text>
                    </Box>

                    <Button
                      leftIcon={<MdDelete />}
                      colorScheme="red"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveAnimal(a._id)}
                      aria-label={`Remove ${a.animalTagId}`}
                    >
                      Remove
                    </Button>
                  </HStack>
                ))
              ) : (
                <Text color="gray.600">No animals available for the selected farmer.</Text>
              )}

              <Button onClick={() => fetchRecentAnimals(formData.ownerId)} size="md" variant="ghost" mt={2}>
                Refresh list
              </Button>
            </VStack>
          </Box>
        </SimpleGrid>

        {/* Scanner Modal */}
        <Modal isOpen={isOpen} onClose={stopAndCloseScanner} size="lg" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Scan Tag (camera)</ModalHeader>
            <ModalBody>
              <Box>
                <Text mb={2} color="gray.600">Point your phone camera at QR / barcode. Scanned value will auto-fill the Tag ID field.</Text>
                <Box id="html5qr-reader" width="100%" height="320px" bg="gray.50" borderRadius="8px" display="flex" alignItems="center" justifyContent="center">
                  {scannerLoading ? <Spinner /> : <Text color="gray.400">Camera view will appear here.</Text>}
                </Box>
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={stopAndCloseScanner}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

      </VStack>
    </Box>
  );
};

export default RegistrarDashboard;




