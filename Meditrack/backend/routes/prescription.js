// backend/routes/prescription.js

const express = require("express");
const router = express.Router();
const Prescription = require("../models/Prescription");
const TreatmentRequest = require("../models/TreatmentRequest");
const Animal = require("../models/Animal");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { addEvent } = require("../blockchain/blockchainService");

// =====================================================================
// CREATE PRESCRIPTION (Fixed to use Token ID)
// =====================================================================
async function handleCreatePrescription(req, res) {
  try {
    const {
      requestId,
      // vetId,  <-- REMOVE THIS. Don't trust the body.
      animalId,
      medicines,
      withdrawalPeriodDays,
      notes,
    } = req.body;

    // USE THE TOKEN ID (Ensures it matches the fetch route)
   const vetId = req.user.userId;

    console.log("--- CREATING PRESCRIPTION ---");
    console.log("Vet ID from Token:", vetId);
    console.log("Animal ID:", animalId);

    // Validate vet exists
    const vet = await User.findById(vetId);
    if (!vet) {
      return res.status(404).json({ success: false, message: "Vet not found" });
    }

    const vetLocation = vet.city || "Unknown";

    const newPrescription = new Prescription({
      requestId,
      vetId, // Saved using the Token ID
      animalId,
      medicines,
      withdrawalPeriodDays,
      notes,
      location: vetLocation,
    });

    const saved = await newPrescription.save();
    console.log("✅ Prescription Saved with ID:", saved._id);

    // Update Treatment Request
    if (requestId) {
      await TreatmentRequest.findByIdAndUpdate(requestId, {
        status: "Completed",
        prescriptionId: saved._id,
      });
    }

    // Update Animal Status
    if (animalId && withdrawalPeriodDays != null) {
      const withdrawalDate = new Date();
      withdrawalDate.setDate(withdrawalDate.getDate() + Number(withdrawalPeriodDays));
      await Animal.findByIdAndUpdate(animalId, {
        withdrawalUntil: withdrawalDate,
        status: "Healthy",
      });
    }

    // Blockchain Log
    try {
      await addEvent("PrescriptionCreated", animalId, JSON.stringify({
          prescriptionId: saved._id.toString(),
          animalId,
          vetId,
          location: vetLocation,
          createdAt: new Date().toISOString(),
        })
      );
    } catch (err) {
      console.log("Blockchain log failed:", err.message);
    }

    return res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription: saved,
    });

  } catch (err) {
    console.error("Create prescription error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// =====================================================================
// GET RECENT PRESCRIPTIONS
// =====================================================================
router.get("/vet/recent", authMiddleware, async (req, res) => {
  try {
    const vetId = req.user.userId;
    console.log("--- FETCHING RECENT ---");
    console.log("Searching for Vet ID:", vetId);

    const limit = parseInt(req.query.limit) || 5;

    const recent = await Prescription.find({ vetId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("animalId", "animalTagId");

    console.log(`Found ${recent.length} prescriptions.`);

    return res.json({
      success: true,
      prescriptions: recent,
    });
  } catch (err) {
    console.error("Recent prescription fetch error:", err);
    return res.status(500).json({ success: false, message: "Error fetching recent prescriptions" });
  }
});

// Routes Export
router.post("/create", authMiddleware, handleCreatePrescription);
router.post("/add", authMiddleware, handleCreatePrescription);

module.exports = router;