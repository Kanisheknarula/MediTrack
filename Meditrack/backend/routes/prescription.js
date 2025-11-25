// backend/routes/prescription.js

const express = require("express");
const router = express.Router();

const Prescription = require("../models/Prescription");
const TreatmentRequest = require("../models/TreatmentRequest");
const Animal = require("../models/Animal");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// Blockchain service
const { addEvent } = require("../blockchain/blockchainService");


// =====================================================================
//  COMMON HANDLER for creating a prescription + blockchain logging
// =====================================================================
async function handleCreatePrescription(req, res) {
  try {
    const {
      requestId,
      vetId,
      animalId,
      medicines,
      withdrawalPeriodDays,
      notes,
    } = req.body;

    // A. Validate Vet
    const vet = await User.findById(vetId);
    if (!vet) {
      return res.status(404).json({ success: false, message: "Veterinarian not found." });
    }
    const vetLocation = vet.city || "Unknown";

    // B. Create Prescription
    const newPrescription = new Prescription({
      requestId,
      vetId,
      animalId,
      location: vetLocation,
      medicines,
      withdrawalPeriodDays,
      notes,
    });

    const savedPrescription = await newPrescription.save();

    // C. Update TreatmentRequest
    if (requestId) {
      await TreatmentRequest.findByIdAndUpdate(requestId, {
        status: "Completed",
        prescriptionId: savedPrescription._id,
      });
    }

    // D. Update Animal MRL Date
    if (animalId && withdrawalPeriodDays != null) {
      const withdrawalDate = new Date();
      withdrawalDate.setDate(withdrawalDate.getDate() + Number(withdrawalPeriodDays));

      await Animal.findByIdAndUpdate(animalId, {
        withdrawalUntil: withdrawalDate,
        status: "Healthy",
      });
    }

    // E. Blockchain Logging
    let txHash = null;
    try {
      const recordPayload = JSON.stringify({
        type: "PrescriptionCreated",
        prescriptionId: savedPrescription._id.toString(),
        animalId,
        vetId,
        location: vetLocation,
        createdAt: new Date().toISOString(),
      });

      txHash = await addEvent("PrescriptionCreated", animalId, recordPayload);
      console.log("✅ Prescription logged on blockchain:", txHash);
    } catch (err) {
      console.error("⚠️ Blockchain error:", err.message);
    }

    // F. Response
    return res.status(201).json({
      success: true,
      message: "Prescription created successfully!",
      prescription: savedPrescription,
      txHash,
    });

  } catch (error) {
    console.error("❌ Error in /prescription/create:", error);
    return res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
}


// =====================================================================
//  ROUTES
// =====================================================================
router.post("/create", authMiddleware, handleCreatePrescription);
router.post("/add", authMiddleware, handleCreatePrescription); // alias route

module.exports = router;
