// src/App.jsx
import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import FarmerDashboard from './components/FarmerDashboard';
import VetDashboard from './components/VetDashboard';
import PharmacistDashboard from './components/PharmacistDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import AdminDashboard from './components/AdminDashboard';
import PublicDashboard from './components/PublicDashboard';
import RegistrarDashboard from './components/RegistrarDashboard';
import Navbar from "./components/Navbar";

import './App.css';

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null
  );

  // ---------- THEME STATE ----------
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;

    const saved = localStorage.getItem("theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;

    // fallback to system preference
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // load token + user from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // apply theme to <html> element
  useEffect(() => {
    const root = document.documentElement;

    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  const handleLoginSuccess = (data) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <div className={isDark ? "App dark" : "App"}>
      {/* Top navbar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onToggleTheme={toggleTheme}
        isDark={isDark}
      />

      <header className="App-header">
        <h1>MediTrack - AMU/MRL Monitoring System</h1>
        {token && (
          <div className="header-user">
            <span>
              Welcome, {user.name}! <b>({user.role})</b>
            </span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </header>

      <main>
        {token ? (
          <div className="dashboard-container">
            {user.role === "Farmer" && (
              <FarmerDashboard user={user} token={token} />
            )}
            {user.role === "Vet" && (
              <VetDashboard user={user} token={token} />
            )}
            {user.role === "Pharmacist" && (
              <PharmacistDashboard user={user} token={token} />
            )}
            {user.role === "Manager" && (
              <ManagerDashboard user={user} token={token} />
            )}
            {user.role === "Admin" && (
              <AdminDashboard user={user} token={token} />
            )}
            {user.role === "Registrar" && (
              <RegistrarDashboard user={user} token={token} />
            )}
          </div>
        ) : (
          <>
            {/* Public dashboard on top */}
            <PublicDashboard />
            {/* Login section for navbar “Login” link */}
            <div
              id="login"
              className="auth-container container"
              style={{ scrollMarginTop: "90px" }}  // so it doesn’t hide behind navbar
            >
              <Auth onLoginSuccess={handleLoginSuccess} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
