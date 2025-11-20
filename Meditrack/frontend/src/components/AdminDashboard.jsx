import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  RadialLinearScale, PointElement, LineElement, Filler
} from 'chart.js';
// --- NEW ---
import {
  List,
  ListItem,
  ListIcon,
  Spinner,
  Center,
  Text
} from '@chakra-ui/react';
import { MdLocationCity, MdPerson } from 'react-icons/md';
// --- END NEW ---

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  RadialLinearScale, PointElement, LineElement, Filler
);

const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [amuData, setAmuData] = useState(null); 
  const [cityData, setCityData] = useState([]); 
  const [professionals, setProfessionals] = useState([]); 
  const [selectedCity, setSelectedCity] = useState(''); 
  const [medicineData, setMedicineData] = useState(null);
  const [message, setMessage] = useState('');
  
  // --- NEW ---
  const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(false);
  // --- END NEW ---

  // --- Fetch AMU by City (for Charts & Lists) ---
  const fetchAmuByCity = async () => {
    try {
      const response = await axios.get('/api/admin/amu-by-city');
      const data = response.data;
      setCityData(data); // Save raw data for lists

      const chartData = {
        labels: data.map(item => item.city),
        datasets: [{
          label: 'Total Prescriptions',
          data: data.map(item => item.count),
          backgroundColor: 'rgba(52, 152, 219, 0.7)',
        }]
      };
      setAmuData(chartData);
    } catch (error) {
      setMessage('Could not fetch AMU stats.');
    }
  };

  // --- Fetch Medicine Usage (for Radar Chart) ---
  const fetchMedicineUsage = async () => {
    try {
      const response = await axios.get('/api/admin/medicine-usage');
      const data = response.data;
      const chartData = {
        labels: data.map(item => item.medicine),
        datasets: [{
          label: 'Usage Count',
          data: data.map(item => item.count),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
        }],
      };
      setMedicineData(chartData);
    } catch (error) {
      setMessage('Could not fetch medicine usage data.');
    }
  };

  useEffect(() => {
    fetchAmuByCity();
    fetchMedicineUsage();
  }, []);

  // --- Handle City Click (for both High & Low tabs) ---
  const handleCityClick = async (cityName) => {
    setMessage('');
    setSelectedCity(cityName); 
    setProfessionals([]); // Clear old list
    
    // --- NEW ---
    setIsLoadingProfessionals(true); // Show spinner
    // --- END NEW ---
    
    try {
      const response = await axios.get(
        `/api/admin/professionals-by-city/${cityName}`
      );
      setProfessionals(response.data); 
    } catch (error) {
      setMessage('Could not fetch professionals for this city.');
    } finally {
      // --- NEW ---
      setIsLoadingProfessionals(false); // Hide spinner
      // --- END NEW ---
    }
  };

  // --- Helper to render the tabs ---
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <h4>Area-wise AMU Report (Total Prescriptions)</h4>
            {amuData ? (
              <div style={{ height: '350px' }}>
                <Bar data={amuData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} />
              </div>
            ) : <p>Loading chart data...</p>}
          </div>
        );

      case 'high-usage':
        return (
          <div className="admin-list-layout">
            <div className="city-list">
              {/* --- NEW: Clearer Label --- */}
              <h4>Prescription Count by City</h4>
              <List spacing={3} mt={4}>
                {cityData.map(item => (
                  <ListItem 
                    key={item.city} 
                    onClick={() => handleCityClick(item.city)}
                    className={selectedCity === item.city ? 'selected' : ''}
                    style={{ cursor: 'pointer', padding: '8px', borderRadius: '4px' }}
                  >
                    <ListIcon as={MdLocationCity} color="gray.500" />
                    {item.city} (Count: {item.count})
                  </ListItem>
                ))}
              </List>
            </div>
            <div className="professionals-list">
              {/* --- NEW: Clearer Label --- */}
              <h4>Registered Professionals in {selectedCity || '...'}</h4>
              {/* --- NEW: Loading Spinner --- */}
              {isLoadingProfessionals ? (
                <Center h="100px">
                  <Spinner size="lg" />
                </Center>
              ) : (
                <List spacing={3} mt={4}>
                  {professionals.length > 0 ? (
                    professionals.map(prof => (
                      <ListItem key={prof._id}>
                        <ListIcon as={MdPerson} color="blue.500" />
                        {prof.name} ({prof.role})
                      </ListItem>
                    ))
                  ) : <Text>No professionals found or no city selected.</Text>}
                </List>
              )}
            </div>
          </div>
        );

      case 'low-usage':
        const lowUsageData = [...cityData].reverse();
        return (
          <div className="admin-list-layout">
            <div className="city-list">
              {/* --- NEW: Clearer Label --- */}
              <h4>Prescription Count by City</h4>
              <List spacing={3} mt={4}>
                {lowUsageData.map(item => (
                  <ListItem 
                    key={item.city} 
                    onClick={() => handleCityClick(item.city)}
                    className={selectedCity === item.city ? 'selected' : ''}
                    style={{ cursor: 'pointer', padding: '8px', borderRadius: '4px' }}
                  >
                    <ListIcon as={MdLocationCity} color="gray.500" />
                    {item.city} (Count: {item.count})
                  </ListItem>
                ))}
              </List>
            </div>
            <div className="professionals-list">
              {/* --- NEW: Clearer Label --- */}
              <h4>Registered Professionals in {selectedCity || '...'}</h4>
              {/* --- NEW: Loading Spinner --- */}
              {isLoadingProfessionals ? (
                <Center h="100px">
                  <Spinner size="lg" />
                </Center>
              ) : (
                <List spacing={3} mt_={4}>
                  {professionals.length > 0 ? (
                    professionals.map(prof => (
                      <ListItem key={prof._id}>
                        <ListIcon as={MdPerson} color="blue.500" />
                        {prof.name} ({prof.role})
                      </ListItem>
                    ))
                  ) : <Text>No professionals found or no city selected.</Text>}
                </List>
              )}
            </div>
          </div>
        );

      case 'compare':
        return (
          <div>
            <h4>Medicine Usage Comparison</h4>
            {medicineData ? (
              <div style={{ height: '350px' }}>
                <Radar data={medicineData} options={{ maintainAspectRatio: false }} />
              </div>
            ) : <p>Loading medicine data...</p>}
          </div>
        );
      default:
        return null;
    }
  };

  // --- MAIN RETURN ---
  return (
    <div className="container"> 
      <h3>Admin Dashboard</h3>
      {message && <p style={{color: 'red'}}>{message}</p>}

      <nav className="admin-nav">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          AMU Dashboard
        </button>
        <button 
          className={activeTab === 'high-usage' ? 'active' : ''}
          onClick={() => setActiveTab('high-usage')}
        >
          High AMU Areas
        </button>
        <button 
          className={activeTab === 'low-usage' ? 'active' : ''}
          onClick={() => setActiveTab('low-usage')}
        >
          Low AMU Areas
        </button>
        <button 
          className={activeTab === 'compare' ? 'active' : ''}
          onClick={() => setActiveTab('compare')}
        >
          Compare Medicines
        </button>
      </nav>

      <div className="admin-tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;