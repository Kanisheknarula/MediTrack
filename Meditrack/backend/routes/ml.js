const express = require("express");
const router = express.Router();
const AMU = require("../models/amuModel");

// ------------------------------
// PUBLIC: SAME DATA AS ADMIN
// ------------------------------

// Public → AMU by city (for graph)
router.get("/amu_by_city", async (req, res) => {
  try {
    const docs = await AMU.find({});
    const cities = docs.map(d => d.area);
    const quantities = docs.map(d => d.total_prescriptions);
    return res.json({ cities, quantities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "server error" });
  }
});

// Public → Daily trend for a selected area
router.post("/area_amu_report", async (req, res) => {
  try {
    const { area } = req.body;
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
    res.status(500).json({ error: "server error" });
  }
});

module.exports = router;
