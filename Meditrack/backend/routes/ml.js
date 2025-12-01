const express = require("express");
const router = express.Router();
const AMU = require("../models/AMU"); // Make sure this imports the correct model file (AMU.js)

// ------------------------------
// 1. GET LIST OF AREAS (Cities)
// ------------------------------
router.get("/list_areas", async (req, res) => {
  try {
    // Find all unique 'area' names from the AMU collection
    const areas = await AMU.distinct("area");
    res.json(areas);
  } catch (error) {
    console.error("Error fetching areas:", error);
    res.status(500).json({ error: "Server error fetching areas" });
  }
});

// ------------------------------
// 2. GET AMU BY CITY (For Bar Chart)
// ------------------------------
router.get("/amu_by_city", async (req, res) => {
  try {
    const docs = await AMU.find({});
    const cities = docs.map(d => d.area);
    const quantities = docs.map(d => d.total_prescriptions);
    return res.json({ cities, quantities });
  } catch (error) {
    console.error("Error fetching city data:", error);
    res.status(500).json({ error: "Server error fetching city data" });
  }
});

// ------------------------------
// 3. GET DAILY TREND (For Line Chart)
// ------------------------------
router.post("/area_amu_report", async (req, res) => {
  try {
    const { area } = req.body;
    if (!area) return res.status(400).json({ error: "Area is required" });

    const doc = await AMU.findOne({ area: area.toLowerCase() });

    if (!doc) return res.status(404).json({ error: "Area not found" });

    return res.json({
      daily_trend: doc.daily_trend,
      mean_quantity: doc.mean_quantity,
      std_quantity: doc.std_quantity,
      total_records: doc.total_prescriptions,
      anomalies: doc.anomalies || []
    });
  } catch (error) {
    console.error("Error fetching trend:", error);
    res.status(500).json({ error: "Server error fetching trend" });
  }
});

module.exports = router;