// frontend/src/components/SideMenu.jsx
import React, { useState } from "react";
import {
  X,
  Info,
  HelpCircle,
  MessageCircle,
  AlertTriangle,
  Phone,
  Share2,
} from "lucide-react";

export default function SideMenu({ open, onClose, user }) {
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (type) => {
    setActiveModal(type);
    onClose(); 
  };

  const closeModal = () => setActiveModal(null);

  const handleShare = () => {
    const url = window.location.href;

    if (navigator.share) {
      navigator
        .share({
          title: "MediTrack AMU/MRL Dashboard",
          text: "Check this AMU/MRL public dashboard",
          url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url).catch(() => {});
      alert("Dashboard link copied!");
    }

    onClose();
  };

  const handleContact = () => {
    onClose();
    window.location.href = "tel:+911234567890";
  };

  const handleCallHelp = () => {
    onClose();
    window.location.href = "tel:+911234567890";
  };

  // Modal Component
  const InfoModal = () => {
    if (!activeModal) return null;

    let title = "";
    let content = null;

    if (activeModal === "about") {
      title = "About AMU";
      content = (
        <>
          <p>
            AMU means <strong>Antimicrobial Use</strong> — how often antibiotics
            are used in animals.
          </p>
          <p style={{ marginTop: 8 }}>
            High or incorrect AMU may lead to{" "}
            <strong>Antimicrobial Resistance (AMR)</strong>.
          </p>
        </>
      );
    } else if (activeModal === "how") {
      title = "How to use this Dashboard";
      content = (
        <ol
          style={{ paddingLeft: "1.2rem", lineHeight: 1.7, marginTop: 6 }}
        >
          <li>See the bar chart for area-level medicine usage.</li>
          <li>Use Batch ID search to check product details.</li>
          <li>Use data as guidance, not as medical advice.</li>
        </ol>
      );
    } else if (activeModal === "faq") {
      title = "FAQ";
      content = (
        <div style={{ lineHeight: 1.7 }}>
          <p>
            <strong>1. Why track AMU?</strong>
            <br />
            To prevent resistance and ensure safe medicine use.
          </p>
          <p style={{ marginTop: 6 }}>
            <strong>2. What is withdrawal period?</strong>
            <br />
            The time after medicine use when animal products shouldn’t be used.
          </p>
        </div>
      );
    } else if (activeModal === "disclaimer") {
      title = "Disclaimer";
      content = (
        <>
          <p>
            This dashboard is for <strong>information only</strong>. Always
            consult a licensed veterinarian for treatment decisions.
          </p>
        </>
      );
    }

    return (
      <div
        onClick={closeModal}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,23,42,0.45)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1400,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "90%",
            maxWidth: 480,
            background: "white",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h2>
            <button
              onClick={closeModal}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 14,
              color: "#4b5563",
            }}
          >
            {content}
          </div>

          <div style={{ textAlign: "right", marginTop: 15 }}>
            <button
              onClick={closeModal}
              style={{
                padding: "6px 14px",
                background: "#0EA5A4",
                color: "white",
                borderRadius: 999,
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`sideback ${open ? "sideback--visible" : ""}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className={`side-menu ${open ? "side-menu--open" : ""}`}>
        {/* Header */}
        <div className="side-menu-header">
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div className="side-logo">MT</div>
            <div>
              <div style={{ fontWeight: 700 }}>
                {user?.name || "Guest User"}
              </div>
              <div
                style={{ fontSize: 12, color: "var(--muted, #6b7280)" }}
              >
                {user?.role || "Visitor"}
              </div>
            </div>
          </div>

          <button className="side-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Menu */}
        <nav className="side-nav">
          <button className="side-link" onClick={() => openModal("about")}>
            <Info size={16} /> <span>About AMU</span>
          </button>

          <button className="side-link" onClick={() => openModal("how")}>
            <HelpCircle size={16} /> <span>How to Use Dashboard</span>
          </button>

          <button className="side-link" onClick={() => openModal("faq")}>
            <MessageCircle size={16} /> <span>FAQ</span>
          </button>

          <button
            className="side-link"
            onClick={() => openModal("disclaimer")}
          >
            <AlertTriangle size={16} /> <span>Disclaimer / Safety</span>
          </button>

          <button className="side-link" onClick={handleContact}>
            <Phone size={16} /> <span>Contact Support / Helpline</span>
          </button>

          <button className="side-link" onClick={handleShare}>
            <Share2 size={16} /> <span>Share Dashboard</span>
          </button>
        </nav>

        {/* FOOTER — CALL HELP (ADDED BACK) */}
        <div style={{ marginTop: "auto", padding: 20 }}>
          <button
            className="side-cta"
            onClick={handleCallHelp}
            style={{
              width: "100%",
              padding: "10px 16px",
              background: "#0EA5A4",
              color: "white",
              borderRadius: 10,
              border: "none",
              fontSize: 15,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: "pointer",
            }}
          >
            <Phone size={18} />
            Call Help
          </button>

          <p
            style={{
              fontSize: 12,
              color: "var(--muted, #6b7280)",
              marginTop: 10,
              textAlign: "center",
            }}
          >
            MediTrack Public Dashboard
          </p>
        </div>
      </aside>

      {/* MODAL */}
      <InfoModal />
    </>
  );
}


