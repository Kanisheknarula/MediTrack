// frontend/src/components/PublicDashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";            // ✅ correct path
import { Bar } from "react-chartjs-2";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function PublicDashboard() {
  const [chartData, setChartData] = useState(null);
  const [loadingChart, setLoadingChart] = useState(true);
  const [chartError, setChartError] = useState("");
  const [batchInput, setBatchInput] = useState("");
  const [batchResult, setBatchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Demo fallback data (if backend is down)
  // const mockData = [
  //   { city: "Pune", count: 2 },
  //   { city: "Bhopal", count: 2 },
  //   { city: "Harda", count: 1 },
  //   { city: "Bin", count: 1 },
  // ];

  useEffect(() => {
    const fetchChart = async () => {
      setLoadingChart(true);
      try {
        const res = await api.get("/api/admin/public-amu-report");
        const data =
          Array.isArray(res.data) && res.data.length ? res.data : mockData;
        setChartData(formatChart(data));
        setChartError("");
      } catch (err) {
        console.warn("Chart fetch failed, using demo data.", err);
        setChartData(formatChart(mockData, "Total Prescriptions (Demo)"));
        setChartError("Could not fetch live report — showing demo data.");
      } finally {
        setLoadingChart(false);
      }
    };
    fetchChart();
    // eslint-disable-next-line
  }, []);

  function formatChart(data, label = "Total Prescriptions") {
    const labels = data.map((d) => d.city);
    const values = data.map((d) => d.count);

    return {
      labels,
      datasets: [
        {
          label,
          data: values,
          backgroundColor: "rgba(225,29,72,0.9)", // red bars
          borderColor: "rgba(160,18,45,1)",
          borderWidth: 1,
          borderRadius: 10,
          barPercentage: 0.6,
        },
      ],
    };
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { boxWidth: 14, boxHeight: 8, padding: 8 },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const v = context.parsed.y ?? context.parsed;
            return ` ${v} AMU`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "var(--muted, #6b7280)", font: { size: 14 } },
        grid: { display: false },
      },
      y: {
        ticks: { color: "var(--muted, #6b7280)", font: { size: 14 } },
        grid: {
          color: "rgba(15,23,42,0.06)",
          borderDash: [3, 3],
        },
      },
    },
  };

  const handleSearch = async () => {
    if (!batchInput.trim()) {
      setSearchError("Please enter a Batch ID.");
      return;
    }
    setSearchError("");
    setSearchLoading(true);
    setBatchResult(null);

    try {
      const res = await api.get(
        `/api/product/${encodeURIComponent(batchInput.trim())}`
      );
      setBatchResult(res.data || { message: "No details returned." });
    } catch (err) {
      console.error("Batch search error:", err);
      setSearchError("Could not fetch product info. Try again or use demo.");
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="site-bg">
      <motion.div
        className="container max-width-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header */}
        <header className="page-header" style={{ marginBottom: 18 }}>
          <div>
            <h1 className="page-title">Area-wise AMU Report</h1>
            <p className="page-sub">
              Easy-to-read dashboard for farmers & livestock managers
            </p>
          </div>
          <div className="meta" style={{ textAlign: "right" }}>
            <div className="meta-item small-muted">
              Updated: <strong>Demo</strong>
            </div>
            <div className="meta-item small-muted">Live</div>
          </div>
        </header>

        {/* Chart Card (glass) */}
        <motion.section
          className="card glass-card chart-card"
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <h2 className="section-title">AMU by Area</h2>
            <div className="small-muted">Overview</div>
          </div>

          {loadingChart ? (
            <div className="chart-placeholder" style={{ height: 340 }} />
          ) : (
            <>
              {chartError && <div className="notice error">{chartError}</div>}
              <div className="chart-wrap" style={{ height: 360 }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </>
          )}
        </motion.section>

        {/* Search Card (glass) */}
        <motion.section
          className="card glass-card search-card"
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ marginTop: 18 }}
        >
          <h3 className="section-title">Search Product</h3>

          <div className="search-row" style={{ marginBottom: 12 }}>
            <input
              className="big-input"
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              placeholder="Enter Batch ID"
              aria-label="Enter Batch ID"
            />

            <button
              className="btn-primary"
              onClick={handleSearch}
              disabled={searchLoading}
              style={{ minWidth: 140 }}
            >
              {searchLoading ? (
                "Searching…"
              ) : (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Search size={18} />{" "}
                  <span style={{ fontWeight: 700 }}>Search</span>
                </span>
              )}
            </button>
          </div>

          {searchError && <div className="notice error">{searchError}</div>}

          <div className="result-box">
            {!batchResult ? (
              <p className="muted">
                Enter a Batch ID above to view details.
              </p>
            ) : typeof batchResult === "object" ? (
              <div className="result-grid">
                {Object.entries(batchResult).map(([k, v]) => (
                  <div key={k} className="result-row">
                    <div className="result-key">
                      {k.replace(/_/g, " ")}
                    </div>
                    <div className="result-val">{String(v)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="muted">{String(batchResult)}</div>
            )}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}





