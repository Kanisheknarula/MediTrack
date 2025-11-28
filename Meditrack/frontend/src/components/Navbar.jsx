// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Sun, Moon, Menu, LogOut, User, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import SideMenu from "./SideMenu";

export default function Navbar({
  user = null,
  onLogout = () => {},
  onToggleTheme = null,
  isDark = false,
}) {
  const [open, setOpen] = useState(false);

  // close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // allow global events to open menu (optional)
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-side-menu", handler);
    return () => window.removeEventListener("open-side-menu", handler);
  }, []);

  const handleLoginClick = (e) => {
    e.preventDefault();
    const el = document.getElementById("login");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.hash = "#login";
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="premium-navbar"
        role="navigation"
        aria-label="Main navigation"
      >
        <div
          className="nav-inner container-wide"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {/* Left: menu / logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              className="nav-icon-btn"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="nav-logo" aria-hidden>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: "linear-gradient(135deg,#16a34a,#f59e0b)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 800,
                  }}
                >
                  MT
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: "var(--navy-900, #0f172a)",
                  }}
                >
                  MediTrack
                </div>
              
              </div>
            </div>
          </div>

          {/* Middle: quick info */}
          {/* <div
            className="nav-middle"
            style={{ display: "flex", alignItems: "center", gap: 12 }} */}
          {/* > */}
            {/* <div className="nav-pill" title="Your area">
              <MapPin size={14} />
              <span style={{ marginLeft: 8, fontSize: 13 }}>Harda, MP</span>
            </div>
            <div className="nav-pill" title="Reports">
              <span style={{ fontSize: 13 }}>AMU (Demo)</span>
            </div>
          </div> */}

          {/* Right: user & actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {onToggleTheme && (
              <button
                className="nav-icon-btn"
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                onClick={onToggleTheme}
              >
                {isDark ? <Moon size={16} /> : <Sun size={16} />}
              </button>
            )}

            {user ? (
              <>
                <div
                  className="nav-user"
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <div
                    className="avatar"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#0f172a",
                      fontWeight: 700,
                    }}
                  >
                    <User size={18} />
                  </div>
                  <div style={{ fontSize: 14 }}>
                    <div style={{ fontWeight: 700 }}>
                      {user.name || "Guest"}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--muted, #6b7280)",
                      }}
                    >
                      {user.role || "Farmer"}
                    </div>
                  </div>
                </div>
                <button
                  className="btn-logout"
                  onClick={onLogout}
                  aria-label="Logout"
                >
                  <LogOut size={16} />
                  <span style={{ marginLeft: 8 }}>Logout</span>
                </button>
              </>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <a
                  href="#login"
                  onClick={handleLoginClick}
                  className="nav-cta"
                  style={{ textDecoration: "none" }}
                >
                  Login
                </a>
              </div>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Side menu component */}
      <SideMenu open={open} onClose={() => setOpen(false)} user={user} />
    </>
  );
}



