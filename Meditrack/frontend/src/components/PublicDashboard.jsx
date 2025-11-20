import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';

// 1. Import Chakra components
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
  AlertIcon
} from '@chakra-ui/react';

const PublicDashboard = () => {
  const [amuData, setAmuData] = useState(null);
  const [message, setMessage] = useState('');

  const fetchPublicAmuReport = async () => {
    try {
      // Note: The baseURL is already set in main.jsx
      const response = await axios.get('/api/admin/public-amu-report');
      const data = response.data;

      const chartData = {
        labels: data.map(item => item.city),
        datasets: [{
          label: 'Total Prescriptions',
          data: data.map(item => item.count),
          backgroundColor: 'rgba(231, 76, 60, 0.7)', 
          borderColor: 'rgba(231, 76, 60, 1)',
          borderWidth: 1
        }]
      };
      setAmuData(chartData);
    } catch (error) {
      setMessage('Could not fetch public AMU report.');
    }
  };

  useEffect(() => {
    fetchPublicAmuReport();
  }, []);

  return (
    // 2. Use Chakra components for layout
    <VStack spacing={8} align="stretch" p={4}>
      {/* --- Area-wise AMU Report --- */}
      <Card variant="outline">
        <CardHeader>
          <Heading size="md">Area-wise AMU Report</Heading>
        </CardHeader>
        <CardBody>
          {message && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {message}
            </Alert>
          )}
          {amuData ? (
            <Box h="300px">
              <Bar
                data={amuData}
                options={{
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true } }
                }}
              />
            </Box>
          ) : (
            <Center h="300px">
              <Spinner size="xl" color="blue.500" />
              <Text ml={4}>Loading public report...</Text>
            </Center>
          )}
        </CardBody>
      </Card>

      {/* --- Product Information Section --- */}
      <Card variant="outline">
        <CardHeader>
          <Heading size="md">Product Information</Heading>
        </CardHeader>
        <CardBody>
          <Text mb={4}>Enter Batch ID (This is a non-functional demo):</Text>
          <Input placeholder="Enter Batch ID" mb={4} />
          <Button colorScheme="blue">Get Product Information</Button>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default PublicDashboard;