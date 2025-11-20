import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import FarmerDashboard from './components/FarmerDashboard';
import VetDashboard from './components/VetDashboard';
import PharmacistDashboard from './components/PharmacistDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import AdminDashboard from './components/AdminDashboard';
import PublicDashboard from './components/PublicDashboard';
import RegistrarDashboard from './components/RegistrarDashboard';
import './App.css'; // <-- We are now using this file

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = (data) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>MediTrack - AMU/MRL Monitoring System</h1>
        {token && (
          <div className="header-user">
            <span>Welcome, {user.name}! <b>({user.role})</b></span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </header>

      <main>
        {token ? (
          // --- IF USER IS LOGGED IN, show dashboards ---
          <div className="dashboard-container">
            {user.role === 'Farmer' && <FarmerDashboard user={user} token={token} />}
            {user.role === 'Vet' && <VetDashboard user={user} token={token} />}
            {user.role === 'Pharmacist' && <PharmacistDashboard user={user} token={token} />}
            {user.role === 'Manager' && <ManagerDashboard user={user} token={token} />}
            {user.role === 'Admin' && <AdminDashboard user={user} token={token} />}
            {user.role === 'Registrar' && <RegistrarDashboard user={user} token={token}/>}
          </div>
        ) : (
          // --- IF USER IS NOT LOGGED IN, show public page & auth ---
          <>
            <PublicDashboard />
            <div className="auth-container container">
              <Auth onLoginSuccess={handleLoginSuccess} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;