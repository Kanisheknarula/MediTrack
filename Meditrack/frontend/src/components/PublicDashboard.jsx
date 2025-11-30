import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function PublicDashboard() {
  // STATIC WORKING DATA
  const graphData = {
    labels: ["Indore", "Bhopal", "Ujjain"],
    datasets: [
      {
        label: "AMU/Animal Entries",
        data: [12, 7, 4], // You can change these anytime
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
      },
    ],
  };

  const graphOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">Public Dashboard</h1>

      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-4">AMU Entries by City</h2>
        <Bar data={graphData} options={graphOptions} />
      </div>
    </div>
  );
}
