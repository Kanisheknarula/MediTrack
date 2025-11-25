// frontend/src/components/SideMenu.jsx
import React from "react";
import { X, Home, FileText, Phone } from "lucide-react";

export default function SideMenu({ open, onClose, user }) {
  return (
    <>
      <div
        className={`sideback ${open ? "sideback--visible" : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={`side-menu ${open ? "side-menu--open" : ""}`}
        role="dialog"
        aria-modal={open}
        aria-hidden={!open}
      >
        <div className="side-menu-header">
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div className="side-logo">MT</div>
            <div>
              <div style={{ fontWeight: 700 }}>{user?.name || "Guest"}</div>
              <div style={{ fontSize: 12, color: "var(--muted, #6b7280)" }}>{user?.role || "Visitor"}</div>
            </div>
          </div>

          <button className="side-close" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="side-nav" aria-label="Main menu">
          <a className="side-link" href="#home" onClick={onClose}><Home size={16}/> <span>Home</span></a>
          <a className="side-link" href="#reports" onClick={onClose}><FileText size={16}/> <span>Reports</span></a>
          <a className="side-link" href="#help" onClick={onClose}><Phone size={16}/> <span>Call Help</span></a>

        
        </nav>

        <div style={{ flex: 1 }} />

        <div className="side-footer">
          <button className="side-cta" onClick={() => { window.location.href = "tel:+911234567890"; }}>
            <Phone size={16} /> Call Help
          </button>
        </div>
      </aside>
    </>
  );
}
