import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import api from "../api/api"; // Ensure this path points to your axios instance
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function PublicDashboard() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRealData();
  }, []);

  const fetchRealData = async () => {
    try {
      setLoading(true);
      // This calls the backend route we created earlier in ml.js
      const res = await api.get("/api/ml/amu_by_city");
      
      const { cities, quantities } = res.data;

      // Check if we actually got data
      if (cities && cities.length > 0) {
        setChartData({
          labels: cities.map(city => city.toUpperCase()), // Capitalize city names
          datasets: [
            {
              label: "Real-Time AMU Usage / Prescriptions",
              data: quantities, 
              backgroundColor: "rgba(255, 99, 132, 0.6)", // Red color
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
          ],
        });
      } else {
        // If database is empty
        setChartData(null); 
      }
    } catch (err) {
      console.error("Error fetching public data:", err);
      setError("Unable to load real-time data from server.");
    } finally {
      setLoading(false);
    }
  };

  const graphOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Total Usage: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantity'
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Public AMU Dashboard</h1>

      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Live Usage Statistics by Area
        </h2>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex justify-center items-center h-64">
             <p className="text-lg text-blue-600 animate-pulse font-medium">Fetching Live Data...</p>
          </div>
        )}

        {/* ERROR STATE */}
        {error && !loading && (
          <div className="flex justify-center items-center h-64 text-red-500">
            <p>{error}</p>
          </div>
        )}

        {/* DATA LOADED STATE */}
        {!loading && !error && chartData && (
          <Bar data={chartData} options={graphOptions} />
        )}

        {/* NO DATA STATE */}
        {!loading && !error && !chartData && (
          <div className="flex justify-center items-center h-64 text-gray-500">
            <p>No data records found in the system yet.</p>
          </div>
        )}
      </div>
      
      <p className="mt-8 text-gray-500 text-sm">
        Data provided by MediTrack Real-Time Monitoring System
      </p>
    </div>
  );
}