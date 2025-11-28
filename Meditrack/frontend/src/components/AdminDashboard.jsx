// src/components/AdminDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Bar, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
  List,
  ListItem,
  ListIcon,
  Center,
  Select,
  useToast,
  Divider,
  Tooltip,
  IconButton,
} from "@chakra-ui/react";
import { MdLocationCity, MdPerson, MdRefresh, MdFileDownload, MdAssignment } from "react-icons/md";

/**
 * AdminDashboard — improved UI/UX with 'Generate Report' option
 *
 * - Generates a downloadable JSON report containing:
 *   - cityData (AMU)
 *   - medicine usage
 *   - professionals for selected city (if loaded)
 *   - totals and timestamp
 *
 * - Chart colors are red per request.
 */

export default function AdminDashboard({ user }) {
  const toast = useToast();

  // UI state
  const [activeTab, setActiveTab] = useState("dashboard");
  const PRIMARY = "#0EA5A4";
  const PRIMARY_HOVER = "#0b938f";

  // data state
  const [amuData, setAmuData] = useState(null); // chart-ready object
  const [cityData, setCityData] = useState([]); // raw city list
  const [medicineData, setMedicineData] = useState(null); // radar chart-ready object
  const [professionals, setProfessionals] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(false);

  // summary stats
  const [totalPrescriptions, setTotalPrescriptions] = useState(null);
  const [totalProfessionals, setTotalProfessionals] = useState(null);

  // --- Fetchers ---
  const fetchAmuByCity = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.get("/api/admin/amu-by-city");
      const data = res.data || [];

      const total = data.reduce((s, it) => s + (it.count || 0), 0);
      setTotalPrescriptions(total);
      setCityData(data);

      // RED bar chart dataset
      const chartData = {
        labels: data.map((d) => d.city),
        datasets: [
          {
            label: "Total Prescriptions",
            data: data.map((d) => d.count),
            backgroundColor: data.map(() => "rgba(255, 99, 132, 0.85)"),
            hoverBackgroundColor: data.map(() => "rgba(255, 40, 82, 0.95)"),
          },
        ],
      };
      setAmuData(chartData);
    } catch (err) {
      console.error("fetchAmuByCity:", err);
      setMessage("Could not fetch AMU stats.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicineUsage = async () => {
    try {
      const res = await axios.get("/api/admin/medicine-usage");
      const data = res.data || [];
      // RED radar chart
      const chartData = {
        labels: data.map((d) => d.medicine),
        datasets: [
          {
            label: "Usage Count",
            data: data.map((d) => d.count),
            backgroundColor: "rgba(255, 70, 70, 0.25)",
            borderColor: "rgba(255, 0, 0, 1)",
            pointBackgroundColor: "rgba(255, 0, 0, 0.9)",
            pointBorderColor: "#fff",
            pointHoverBorderColor: "rgba(255, 0, 0, 1)",
            fill: true,
          },
        ],
      };
      setMedicineData(chartData);
    } catch (err) {
      console.error("fetchMedicineUsage:", err);
    }
  };

  const fetchProfessionalsCount = async () => {
    try {
      const res = await axios.get("/api/admin/professionals/count");
      setTotalProfessionals(res.data?.count ?? null);
    } catch (err) {
      // optional endpoint
      // console.warn(err);
    }
  };

  useEffect(() => {
    fetchAmuByCity();
    fetchMedicineUsage();
    fetchProfessionalsCount();
    // eslint-disable-next-line
  }, []);

  // fetch professionals for a city
  const handleCityClick = async (cityName) => {
    setMessage("");
    setSelectedCity(cityName);
    setProfessionals([]);
    setIsLoadingProfessionals(true);
    try {
      const res = await axios.get(`/api/admin/professionals-by-city/${encodeURIComponent(cityName)}`);
      setProfessionals(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("handleCityClick:", err);
      setMessage("Could not fetch professionals for this city.");
      toast({ title: "Error", description: "Could not fetch professionals for this city.", status: "error" });
    } finally {
      setIsLoadingProfessionals(false);
    }
  };

  // export cities CSV (keeps existing)
  const handleExportCitiesCSV = () => {
    if (!cityData || !cityData.length) {
      toast({ title: "Nothing to export", status: "info" });
      return;
    }
    const rows = [["City", "PrescriptionCount"], ...cityData.map((r) => [r.city, r.count])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `amu_by_city_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: "CSV downloaded", status: "success" });
  };

  // --- NEW: Generate Report (JSON) ---
  const handleGenerateReport = () => {
    try {
      const report = {
        generatedAt: new Date().toISOString(),
        generatedBy: { id: user?._id || user?.id || "unknown", name: user?.name || "Admin" },
        totals: {
          totalPrescriptions: totalPrescriptions ?? 0,
          totalProfessionals: totalProfessionals ?? 0,
          cityCount: cityData.length,
          medicinesCount: medicineData?.labels?.length ?? 0,
        },
        cityData: cityData, // raw AMU per city
        medicineUsage: {
          labels: medicineData?.labels || [],
          datasets: medicineData?.datasets || [],
        },
        professionalsForSelectedCity: {
          city: selectedCity || null,
          professionals: professionals,
        },
      };

      const content = JSON.stringify(report, null, 2);
      const blob = new Blob([content], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `meditrack_report_${date}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Report generated", description: `Report downloaded (meditrack_report_${date}.json)`, status: "success" });
    } catch (err) {
      console.error("generateReport:", err);
      toast({ title: "Failed", description: "Could not generate report.", status: "error" });
    }
  };

  // helper computed lists
  const sortedCityData = useMemo(() => {
    return [...cityData].sort((a, b) => (b.count || 0) - (a.count || 0));
  }, [cityData]);

  const topCities = sortedCityData.slice(0, 5);
  const lowCities = [...sortedCityData].reverse().slice(0, 5);

  // Render content by tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <VStack spacing={6} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Card>
                <CardHeader>
                  <Stat>
                    <StatLabel fontSize="sm">Total Prescriptions</StatLabel>
                    <StatNumber fontSize="2xl">{totalPrescriptions ?? <Spinner size="sm" />}</StatNumber>
                    <StatHelpText>Area-wise aggregated</StatHelpText>
                  </Stat>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Stat>
                    <StatLabel fontSize="sm">Registered Professionals</StatLabel>
                    <StatNumber fontSize="2xl">{totalProfessionals ?? "—"}</StatNumber>
                    <StatHelpText>Doctors, Vets & Pharmacists</StatHelpText>
                  </Stat>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader display="flex" justifyContent="space-between" alignItems="center">
                  <Heading size="sm">Actions</Heading>
                  <HStack spacing={2}>
                    <Tooltip label="Refresh all data">
                      <IconButton
                        aria-label="Refresh"
                        icon={<MdRefresh />}
                        size="sm"
                        onClick={() => {
                          fetchAmuByCity();
                          fetchMedicineUsage();
                          fetchProfessionalsCount();
                          toast({ title: "Refreshing", status: "info", duration: 1000 });
                        }}
                      />
                    </Tooltip>

                    <Tooltip label="Export city CSV">
                      <IconButton aria-label="Export CSV" icon={<MdFileDownload />} size="sm" onClick={handleExportCitiesCSV} />
                    </Tooltip>

                    <Tooltip label="Generate full JSON report">
                      <IconButton aria-label="Generate Report" icon={<MdAssignment />} size="sm" onClick={handleGenerateReport} />
                    </Tooltip>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Text fontSize="sm" color="gray.600">Quick actions and exports for admins. Use the city list to view professionals.</Text>

                  <HStack mt={3} spacing={3}>
                    <Button leftIcon={<MdAssignment />} size="sm" onClick={handleGenerateReport}>
                      Generate Report
                    </Button>

                    <Button size="sm" onClick={handleExportCitiesCSV}>
                      Export Cities CSV
                    </Button>

                    <Button size="sm" onClick={() => { fetchAmuByCity(); toast({ title: "Refreshed", status: "success" }); }}>
                      Refresh Data
                    </Button>
                  </HStack>
                </CardBody>
              </Card>
            </SimpleGrid>

            <Card>
              <CardHeader>
                <Heading size="md">Area-wise AMU (Total Prescriptions)</Heading>
              </CardHeader>
              <CardBody>
                {amuData ? (
                  <Box style={{ height: 360 }}>
                    <Bar data={amuData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} />
                  </Box>
                ) : (
                  <Center p={6}>
                    <Spinner />
                    <Text ml={3}>Loading chart...</Text>
                  </Center>
                )}
              </CardBody>
            </Card>
          </VStack>
        );

      case "high-usage":
        return (
          <HStack align="start" spacing={6} alignItems="flex-start">
            <Card flex="1">
              <CardHeader>
                <Heading size="md">Top AMU Cities</Heading>
              </CardHeader>
              <CardBody>
                <Text fontSize="sm" color="gray.600" mb={3}>
                  Click a city to see registered professionals.
                </Text>

                <List spacing={3}>
                  {topCities.length ? (
                    topCities.map((c) => (
                      <ListItem
                        key={c.city}
                        onClick={() => handleCityClick(c.city)}
                        style={{
                          cursor: "pointer",
                          padding: 12,
                          borderRadius: 8,
                          background: selectedCity === c.city ? "rgba(255, 99, 132, 0.06)" : "transparent",
                        }}
                      >
                        <HStack justify="space-between">
                          <HStack>
                            <ListIcon as={MdLocationCity} color="gray.500" />
                            <Text fontWeight="semibold">{c.city}</Text>
                          </HStack>
                          <Text color="gray.600">Count: {c.count}</Text>
                        </HStack>
                      </ListItem>
                    ))
                  ) : (
                    <Text>No data</Text>
                  )}
                </List>
              </CardBody>
            </Card>

            <Card flex="1">
              <CardHeader>
                <Heading size="md">Professionals in {selectedCity || "..."}</Heading>
              </CardHeader>
              <CardBody>
                {isLoadingProfessionals ? (
                  <Center p={6}>
                    <Spinner />
                  </Center>
                ) : professionals.length ? (
                  <List spacing={3}>
                    {professionals.map((p) => (
                      <ListItem key={p._id}>
                        <ListIcon as={MdPerson} color="blue.500" />
                        <Text as="span" fontWeight="semibold">{p.name}</Text> <Text as="span" color="gray.600">({p.role})</Text>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Text color="gray.600">No professionals found (select a city).</Text>
                )}
              </CardBody>
            </Card>
          </HStack>
        );

      case "low-usage":
        return (
          <HStack align="start" spacing={6}>
            <Card flex="1">
              <CardHeader>
                <Heading size="md">Low AMU Cities (Opportunity)</Heading>
              </CardHeader>
              <CardBody>
                <List spacing={3}>
                  {lowCities.length ? (
                    lowCities.map((c) => (
                      <ListItem
                        key={c.city}
                        onClick={() => handleCityClick(c.city)}
                        style={{
                          cursor: "pointer",
                          padding: 12,
                          borderRadius: 8,
                          background: selectedCity === c.city ? "rgba(255, 99, 132, 0.04)" : "transparent",
                        }}
                      >
                        <HStack justify="space-between">
                          <HStack>
                            <ListIcon as={MdLocationCity} color="gray.500" />
                            <Text fontWeight="semibold">{c.city}</Text>
                          </HStack>
                          <Text color="gray.600">Count: {c.count}</Text>
                        </HStack>
                      </ListItem>
                    ))
                  ) : (
                    <Text color="gray.600">No data</Text>
                  )}
                </List>
              </CardBody>
            </Card>

            <Card flex="1">
              <CardHeader>
                <Heading size="md">Professionals</Heading>
              </CardHeader>
              <CardBody>
                {isLoadingProfessionals ? (
                  <Center p={6}><Spinner /></Center>
                ) : professionals.length ? (
                  <List spacing={3}>
                    {professionals.map((p) => (
                      <ListItem key={p._id}>
                        <ListIcon as={MdPerson} color="blue.500" />
                        <Text as="span" fontWeight="semibold">{p.name}</Text> <Text as="span" color="gray.600">({p.role})</Text>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Text color="gray.600">No professionals found (select a city)</Text>
                )}
              </CardBody>
            </Card>
          </HStack>
        );

      case "compare":
        return (
          <VStack spacing={6} align="stretch">
            <Card>
              <CardHeader>
                <Heading size="md">Medicine Usage Comparison</Heading>
              </CardHeader>
              <CardBody>
                {medicineData ? (
                  <Box style={{ height: 360 }}>
                    <Radar data={medicineData} options={{ maintainAspectRatio: false }} />
                  </Box>
                ) : (
                  <Center p={6}><Spinner /> <Text ml={3}>Loading medicine data...</Text></Center>
                )}
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <Heading size="md">Notes</Heading>
              </CardHeader>
              <CardBody>
                <Text fontSize="sm" color="gray.600">
                  Use this comparison to identify medicines with unusually high usage. Consider targeted training or audit in those areas.
                </Text>
              </CardBody>
            </Card>
          </VStack>
        );

      default:
        return null;
    }
  };

  return (
    <VStack spacing={6} align="stretch" p={6}>
      <HStack justify="space-between">
        <Heading size="lg">MediTrack — Admin Dashboard</Heading>
        <HStack spacing={3}>
          <Text color="gray.600" fontSize="sm">Welcome, {user?.name || "Admin"}</Text>
          <Button size="sm" bg={PRIMARY} _hover={{ bg: PRIMARY_HOVER }} color="white" onClick={() => { fetchAmuByCity(); toast({ title: "Refreshed", status: "success" }); }}>
            Refresh
          </Button>

          <Tooltip label="Generate full JSON report">
            <IconButton aria-label="Generate Report" icon={<MdAssignment />} size="sm" onClick={handleGenerateReport} />
          </Tooltip>
        </HStack>
      </HStack>

      <Divider />

      <HStack spacing={3} align="center">
        <Button variant={activeTab === "dashboard" ? "solid" : "ghost"} onClick={() => setActiveTab("dashboard")} bg={activeTab === "dashboard" ? PRIMARY : undefined} color={activeTab === "dashboard" ? "white" : undefined}>
          AMU Dashboard
        </Button>
        <Button variant={activeTab === "high-usage" ? "solid" : "ghost"} onClick={() => setActiveTab("high-usage")} bg={activeTab === "high-usage" ? PRIMARY : undefined} color={activeTab === "high-usage" ? "white" : undefined}>
          High AMU Areas
        </Button>
        <Button variant={activeTab === "low-usage" ? "solid" : "ghost"} onClick={() => setActiveTab("low-usage")} bg={activeTab === "low-usage" ? PRIMARY : undefined} color={activeTab === "low-usage" ? "white" : undefined}>
          Low AMU Areas
        </Button>
        <Button variant={activeTab === "compare" ? "solid" : "ghost"} onClick={() => setActiveTab("compare")} bg={activeTab === "compare" ? PRIMARY : undefined} color={activeTab === "compare" ? "white" : undefined}>
          Compare Medicines
        </Button>

        <Box marginLeft="auto" display="flex" alignItems="center" gap={3}>
          <Select size="sm" placeholder="Jump to city" onChange={(e) => handleCityClick(e.target.value)} width="220px">
            {cityData.map((c) => <option key={c.city} value={c.city}>{c.city} ({c.count})</option>)}
          </Select>

          <Button size="sm" onClick={handleExportCitiesCSV} leftIcon={<MdFileDownload />}>Export Cities</Button>
        </Box>
      </HStack>

      {message && <Text color="red.600">{message}</Text>}

      <Box>
        {renderTabContent()}
      </Box>
    </VStack>
  );
}


