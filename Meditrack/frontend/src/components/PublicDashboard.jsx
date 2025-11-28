import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
// We need to register Chart.js components to avoid "canvas" errors in modern React
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Heading,
  Input,
  Spinner,
  Text,
  VStack,
  Alert,
  AlertIcon,
  Container,
  SimpleGrid,
  InputGroup,
  InputLeftElement,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PublicDashboard = () => {
  const [amuData, setAmuData] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // --- CONFIGURATION ---
  // 1. UPDATE THIS LINE: Replace this string with the actual endpoint for your NEW database.
  const NEW_DATABASE_ENDPOINT = '/api/admin/public-amu-report'; 
  
  // UI Theme Colors
  const cardBg = useColorModeValue('white', 'gray.700');
  const primaryColor = 'teal.500';
  const secondaryColor = 'teal.50';

  const fetchPublicAmuReport = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      // 2. We use the NEW_DATABASE_ENDPOINT here to ensure we get new data
      const response = await axios.get('/api/admin/public-amu-report');
      const data = response.data;

      // Create Chart Data with enhanced colors
      const chartData = {
        labels: data.map((item) => item.city),
        datasets: [
          {
            label: 'Total Prescriptions',
            data: data.map((item) => item.count),
            backgroundColor: 'rgba(223, 38, 38, 0.7)', // Teal color
            borderColor: 'rgba(216, 37, 37, 1)',
            borderWidth: 1,
            borderRadius: 4, // Rounded bars
            hoverBackgroundColor: 'rgba(248, 6, 6, 0.9)',
          },
        ],
      };
      setAmuData(chartData);
    } catch (error) {
      console.error(error);
      // Fallback message if the new endpoint isn't ready yet
      setMessage(`Could not connect to new database at ${NEW_DATABASE_ENDPOINT}. Please verify the API path.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicAmuReport();
  }, []);

  // Chart Options for better visuals
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      // title: { display: true, text: 'Live Prescriptions Data (New DB)' },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
      x: { grid: { display: false } },
    },
  };

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="container.xl">
        
        {/* Dashboard Header */}
        <VStack spacing={2} mb={8} align="start">
          <Heading size="lg" color="gray.700"> Public Dashboard</Heading>
          {/* <Text color="gray.500">Real-time insights from the updated antimicrobial database.</Text> */}
        </VStack>

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
          
          {/* --- Section 1: Area-wise AMU Report (Takes up 2/3rds of space) --- */}
          <Box gridColumn={{ lg: "span 2" }}>
            <Card variant="elevated" bg={cardBg} shadow="md" h="100%">
              <CardHeader pb={0} display="flex" justifyContent="space-between" alignItems="center">
                <Heading size="md" color={primaryColor}>Area-wise AMU Report</Heading>
                <Badge colorScheme="green">Live Data</Badge>
              </CardHeader>
              
              <CardBody>
                {message && (
                  <Alert status="error" mb={4} borderRadius="md">
                    <AlertIcon />
                    {message}
                  </Alert>
                )}

                {isLoading ? (
                  <Center h="300px">
                    <VStack>
                      <Spinner size="xl" color={primaryColor} thickness="4px" />
                      <Text color="gray.500" mt={4}>Fetching new records...</Text>
                    </VStack>
                  </Center>
                ) : amuData ? (
                  <Box h="350px">
                    <Bar data={amuData} options={chartOptions} />
                  </Box>
                ) : (
                  <Center h="350px">
                    <Text color="gray.400">No data found in the new database.</Text>
                  </Center>
                )}
                
                <Button 
                  size="sm" 
                  mt={4} 
                  variant="ghost" 
                  colorScheme="teal" 
                  onClick={fetchPublicAmuReport}
                >
                  Refresh Data
                </Button>
              </CardBody>
            </Card>
          </Box>

          {/* --- Section 2: Product Information (Takes up 1/3rd of space) --- */}
          <Box>
            <Card variant="elevated" bg={cardBg} shadow="md" h="100%">
              <CardHeader>
                <Heading size="md" color={primaryColor}>Verify Product</Heading>
                <Text fontSize="sm" color="gray.500">Check batch </Text>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  {/* <Box w="100%" bg={secondaryColor} p={4} borderRadius="md" mb={2}>
                    {/* <Text fontSize="sm" color="teal.800">
                      Enter the Batch ID found on the medicine packaging to verify its details against our new registry.
                    </Text> */}
                  {/* </Box> */}

                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color="gray.300" />
                    </InputLeftElement>
                    <Input 
                      placeholder="e.g. BTC-2024-X99" 
                      focusBorderColor={primaryColor}
                    />
                  </InputGroup>

                  <Button 
                    colorScheme="teal" 
                    size="lg" 
                    width="100%"
                    shadow="sm"
                  >
                    Get Product Info
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </Box>

        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default PublicDashboard;