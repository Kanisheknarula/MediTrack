const express = require("express");
const router = express.Router();
const AMU = require("../models/AMU"); // This imports the correct model file (AMU.js)

// ------------------------------
// 1. GET LIST OF AREAS (Cities)
// ------------------------------
router.get("/list_areas", async (req, res) => {
  try {
    // Get all unique area names from the 'amu' collection
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
    // Aggregate: Sum up 'quantity' for each 'area'
    const stats = await AMU.aggregate([
      { 
        $group: {
          _id: "$area",
          total_quantity: { $sum: "$quantity" } 
        }
      },
      { $sort: { total_quantity: -1 } }
    ]);

    const cities = stats.map(s => s._id);
    const quantities = stats.map(s => s.total_quantity);

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

    // Find all records for the selected area, sorted by date
    // We use a case-insensitive regex just in case "Indore" vs "indore"
    const records = await AMU.find({ area: { $regex: new RegExp("^" + area + "$", "i") } })
                             .sort({ date: 1 });

    if (!records || records.length === 0) {
      return res.status(404).json({ error: "No data for this area" });
    }

    // Extract dates and quantities for the chart
    const dates = records.map(r => r.date);
    const quantities = records.map(r => r.quantity);

    // --- DYNAMIC CALCULATIONS ---
    
    // 1. Total
    const total_records = quantities.reduce((a, b) => a + b, 0);
    
    // 2. Mean (Average)
    const mean = total_records / (quantities.length || 1);
    
    // 3. Standard Deviation
    const variance = quantities.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (quantities.length || 1);
    const std_dev = Math.sqrt(variance);

    // Return the calculated data structure the frontend expects
    return res.json({
      daily_trend: { dates, quantities },
      mean_quantity: parseFloat(mean.toFixed(2)),
      std_quantity: parseFloat(std_dev.toFixed(2)),
      total_records,
      anomalies: [] 
    });

  } catch (error) {
    console.error("Error fetching trend:", error);
    res.status(500).json({ error: "Server error fetching trend" });
  }
});

module.exports = router;