// backend/routes/amuRoutes.js

const express = require("express");
const router = express.Router();

const AMUModel = require("../models/amuModel");
const { addEvent } = require("../blockchain/blockchainService");

// Simple debug route: GET /api/amu/ping
router.get("/ping", (req, res) => {
  res.json({ ok: true, message: "amuRoutes is working ✅" });
});

// POST /api/amu/add
router.post("/add", async (req, res) => {
  try {
    const { actionType, animalId, recordHash } = req.body;

    console.log("Incoming AMU request body:", req.body);

    if (!actionType || !animalId || !recordHash) {
      return res.status(400).json({
        success: false,
        message: "actionType, animalId and recordHash are required",
      });
    }

    // 1. Save AMU/MRL Data in MongoDB
    const newRecord = new AMUModel({ actionType, animalId, recordHash });
    await newRecord.save();

    // 2. Push event to blockchain
    const txHash = await addEvent(actionType, animalId, recordHash);
    console.log("Blockchain TX Hash:", txHash);

    return res.status(200).json({
      success: true,
      message: "Data stored on MongoDB + Blockchain",
      txHash,
    });
  } catch (error) {
    console.error("Error in /api/amu/add:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
