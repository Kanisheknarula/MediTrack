import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Flex,
  Heading,
  Text,
  Select,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  HStack,
  Spinner,
  Divider,
  VStack
} from "@chakra-ui/react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";

import { Bar, Line } from "react-chartjs-2";
import jsPDF from "jspdf";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

// VITE FIX
const ML_BASE = import.meta.env.VITE_ML_BASE || "http://localhost:8001";

export default function AdminDashboard() {
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [cityData, setCityData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);

  // LOAD AREAS
  useEffect(() => {
    loadAreas();
  }, []);

  async function loadAreas() {
    try {
      const res = await axios.get(`${ML_BASE}/list_areas`);
      setAreas(res.data);

      if (res.data.length > 0) {
        setSelectedArea(res.data[0]);
        loadTrend(res.data[0]);
        loadCityData();
      }

      setLoading(false);
    } catch (err) {
      console.log("AREA ERROR", err);
      setLoading(false);
    }
  }

  // LOAD CITY DATA
  async function loadCityData() {
    try {
      const res = await axios.get(`${ML_BASE}/amu_by_city`);
      setCityData(res.data);
    } catch (err) {
      console.log("CITY ERROR", err);
    }
  }

  // LOAD DAILY TREND
  async function loadTrend(area) {
    try {
      const res = await axios.post(`${ML_BASE}/area_amu_report`, { area });
      setTrendData(res.data);
    } catch (err) {
      console.log("TREND ERROR", err);
    }
  }

  // AI PDF GENERATOR
  function generatePDF() {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("AMU/MRL AI Insights Report", 10, 10);

    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 10, 20);
    doc.text(`Area: ${selectedArea.toUpperCase()}`, 10, 30);

    // CITY SUMMARY
    if (cityData) {
      doc.setFontSize(14);
      doc.text("City-wise AMU Summary", 10, 45);

      doc.setFontSize(12);
      cityData.cities.forEach((city, i) => {
        doc.text(`${city.toUpperCase()}: ${cityData.quantities[i]}`, 12, 55 + i * 7);
      });
    }

    // TREND SUMMARY
    if (trendData) {
      doc.setFontSize(14);
      doc.text("Trend Summary", 10, 95);

      doc.setFontSize(12);

      doc.text(`Total Records: ${trendData.total_records}`, 12, 105);
      doc.text(`Mean Usage: ${trendData.mean_quantity}`, 12, 115);
      doc.text(`Std Dev: ${trendData.std_quantity}`, 12, 125);

      let maxValue = Math.max(...trendData.daily_trend.quantities);
      let maxIndex = trendData.daily_trend.quantities.indexOf(maxValue);
      let peakDay = trendData.daily_trend.dates[maxIndex];

      doc.text(`Peak Usage Day: ${peakDay}`, 12, 135);
    }

    // MONTHLY SUMMARY (AUTO)
    doc.setFontSize(14);
    doc.text("Monthly Summary (Auto Estimated)", 10, 155);

    doc.setFontSize(12);
    doc.text(
      `Month: ${new Date().toLocaleString("default", { month: "long" })}`,
      12,
      165
    );
    doc.text(`Estimated Monthly Mean: ${trendData?.mean_quantity}`, 12, 175);
    doc.text(`Estimated Monthly Std Dev: ${trendData?.std_quantity}`, 12, 185);

    // DOWNLOAD
    doc.save(`AI_Insights_${selectedArea}.pdf`);
  }

  if (loading) {
    return (
      <Flex h="100vh" justify="center" align="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>
        Admin Dashboard
      </Heading>

      {/* AREA SELECT */}
      <Box mb={4} maxW="300px">
        <Text>Select Area</Text>
        <Select
          value={selectedArea}
          onChange={(e) => {
            setSelectedArea(e.target.value);
            loadTrend(e.target.value);
          }}
        >
          {areas.map((a) => (
            <option key={a} value={a}>
              {a.toUpperCase()}
            </option>
          ))}
        </Select>
      </Box>

      <Divider my={4} />

      {/* STATS */}
      {trendData && (
        <Flex gap={4} mb={6}>
          <StatBox label="Total Records" value={trendData.total_records} />
          <StatBox label="Mean Usage" value={trendData.mean_quantity} />
          <StatBox label="Std Dev" value={trendData.std_quantity} />
        </Flex>
      )}

      <Divider my={4} />

      {/* CITY BAR CHART */}
      <Box mb={8}>
        <Heading size="md" mb={2}>
          AMU by City
        </Heading>

        {cityData ? (
          <Bar
            data={{
              labels: cityData.cities,
              datasets: [
                {
                  label: "AMU",
                  data: cityData.quantities,
                  backgroundColor: "rgba(255,0,0,0.4)", // RED
                  borderColor: "red",
                  borderWidth: 2
                }
              ]
            }}
          />
        ) : (
          <Text>No data</Text>
        )}
      </Box>

      <Divider my={4} />

      {/* DAILY TREND */}
      <Box>
        <Heading size="md" mb={2}>
          Daily Trend ({selectedArea})
        </Heading>

        {trendData ? (
          <Line
            data={{
              labels: trendData.daily_trend.dates,
              datasets: [
                {
                  label: "Quantity",
                  data: trendData.daily_trend.quantities,
                  borderColor: "red",
                  backgroundColor: "rgba(255,0,0,0.3)",
                  borderWidth: 2
                }
              ]
            }}
          />
        ) : (
          <Text>No trend data</Text>
        )}
      </Box>

      <Divider my={4} />

      {/* AI PDF BUTTON */}
      <Box mt={6}>
        <Button colorScheme="purple" onClick={generatePDF}>
          Download AI Insights Report
        </Button>
      </Box>
    </Box>
  );
}

// STAT CARD
function StatBox({ label, value }) {
  return (
    <Box p={4} borderWidth="1px" borderRadius="md" minW="150px">
      <Stat>
        <StatLabel>{label}</StatLabel>
        <StatNumber>{value ?? "-"}</StatNumber>
      </Stat>
    </Box>
  );
}
