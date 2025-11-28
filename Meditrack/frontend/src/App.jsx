// src/App.jsx
import React, { useState, useEffect } from "react";

import Navbar from "./components/Navbar";
import PublicDashboard from "./components/PublicDashboard";
import Auth from "./components/Auth";

import FarmerDashboard from "./components/FarmerDashboard";
import VetDashboard from "./components/VetDashboard";
import PharmacistDashboard from "./components/PharmacistDashboard";
import ManagerDashboard from "./components/ManagerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import RegistrarDashboard from "./components/RegistrarDashboard";

import "./App.css";

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // ---------- THEME STATE ----------
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;

    const saved = localStorage.getItem("theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;

    // fallback to system preference
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  // ---------- LOAD TOKEN + USER ONCE ----------
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  // ---------- APPLY THEME ----------
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

  const toggleTheme = () => setIsDark((prev) => !prev);

  // ---------- LOGIN SUCCESS ----------
  const handleLoginSuccess = (data) => {
    const { token: newToken, user: newUser } = data;

    setToken(newToken);
    setUser(newUser);

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    // go to top when logged in
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---------- LOGOUT ----------
  const handleLogout = () => {
    // clear state
    setToken(null);
    setUser(null);

    // clear storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // remove #login hash if present
    if (window.location.hash) {
      window.location.hash = "";
    }

    // scroll back to top (public dashboard)
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isLoggedIn = Boolean(token && user);

  return (
    <div className={isDark ? "App dark" : "App"}>
      {/* Top navbar (shows Logout if user exists) */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onToggleTheme={toggleTheme}
        isDark={isDark}
      />

      {/* This green header is just a title now (logout removed here) */}
      <header className="App-header">
        <h1>MediTrack - AMU/MRL Monitoring System</h1>
        {isLoggedIn && user && (
          <div className="header-user">
            <span>
              Welcome, {user.name}! <b>({user.role})</b>
            </span>
          </div>
        )}
      </header>

      <main>
        {isLoggedIn ? (
          // ---------- DASHBOARDS WHEN LOGGED IN ----------
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
          // ---------- PUBLIC VIEW + LOGIN ----------
          <>
            <PublicDashboard />
            <div
              id="login"
              className="auth-container container"
              style={{ scrollMarginTop: "90px" }}
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
