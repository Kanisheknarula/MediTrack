import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // <-- This was the missing link!
import { AppSettingsProvider } from './context/AppSettingsContext';
import AppSettingsControls from './components/AppSettingsControls';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard'; // <-- NEW IMPORT
import FarmerDashboard from './pages/FarmerDashboard';
import VetDashboard from './pages/VetDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import RegistrarDashboard from './pages/RegistrarDashboard';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-transition">
      <Routes location={location}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
        <Route path="/vet-dashboard" element={<VetDashboard />} />
        <Route path="/pharmacist-dashboard" element={<PharmacistDashboard />} />
        <Route path="/registrar-dashboard" element={<RegistrarDashboard />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AppSettingsProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppSettingsControls />
          <AnimatedRoutes />
        </BrowserRouter>
      </AuthProvider>
    </AppSettingsProvider>
  );
}

export default App;
