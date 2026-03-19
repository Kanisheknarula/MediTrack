import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // <-- This was the missing link!
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard'; // <-- NEW IMPORT
import FarmerDashboard from './pages/FarmerDashboard';
import VetDashboard from './pages/VetDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import RegistrarDashboard from './pages/RegistrarDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> {/* NEW */}

          
          <Route path="/admin-dashboard" element={<AdminDashboard />} /> {/* <-- NEW ROUTE */}
          <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
          <Route path="/vet-dashboard" element={<VetDashboard />} />
          <Route path="/pharmacist-dashboard" element={<PharmacistDashboard />} />
          <Route path="/registrar-dashboard" element={<RegistrarDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;