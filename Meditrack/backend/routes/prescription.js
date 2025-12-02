// backend/routes/prescription.js

const express = require("express");
const router = express.Router();
const Prescription = require("../models/Prescription");
const TreatmentRequest = require("../models/TreatmentRequest");
const Animal = require("../models/Animal");
const User = require("../models/User");
// --- NEW IMPORT: Essential for connecting prescriptions to graphs ---
const AMU = require("../models/AMU"); 
const authMiddleware = require("../middleware/authMiddleware");
const { addEvent } = require("../blockchain/blockchainService");

// =====================================================================
// CREATE PRESCRIPTION (Fixed to update AMU/Graphs automatically)
// =====================================================================
async function handleCreatePrescription(req, res) {
  try {
    const {
      requestId,
      animalId,
      medicines,
      withdrawalPeriodDays,
      notes,
    } = req.body;

    // USE THE TOKEN ID
    const vetId = req.user.userId;

    console.log("--- CREATING PRESCRIPTION ---");
    console.log("Vet ID:", vetId);
    console.log("Animal ID:", animalId);

    // 1. Validate vet exists & Get Location
    const vet = await User.findById(vetId);
    if (!vet) {
      return res.status(404).json({ success: false, message: "Vet not found" });
    }

    // Ensure we have a valid city. Default to 'Unknown' if missing.
    const vetLocation = vet.city && vet.city.trim() !== "" ? vet.city : "Unknown";

    // 2. Save the Prescription
    const newPrescription = new Prescription({
      requestId,
      vetId,
      animalId,
      medicines,
      withdrawalPeriodDays,
      notes,
      location: vetLocation, // This saves "Delhi" to prescriptions collection
    });

    const saved = await newPrescription.save();
    console.log("✅ Prescription Saved with ID:", saved._id);

    // ------------------------------------------------------------------
    // 🔥 CRITICAL FIX: Update AMU Collection for Graphs 🔥
    // ------------------------------------------------------------------
    try {
      // Get today's date in YYYY-MM-DD format (matches your DB screenshot)
      const today = new Date().toISOString().split('T')[0];
      
      // Check if we already have a stats entry for this City + Date
      let amuRecord = await AMU.findOne({ area: vetLocation, date: today });

      if (amuRecord) {
        // If exists, just increment the quantity
        amuRecord.quantity += 1;
        await amuRecord.save();
        console.log(`📈 AMU Updated: Incrementing count for ${vetLocation} on ${today}`);
      } else {
        // If NOT exists (e.g., first prescription in Delhi today), create it
        amuRecord = new AMU({
          area: vetLocation,
          date: today,
          quantity: 1, // Start with 1
          // Add other fields if your schema requires strict validation
        });
        await amuRecord.save();
        console.log(`📊 AMU Created: New entry for ${vetLocation} on ${today}`);
      }
    } catch (amuErr) {
      // We log this but don't stop the request if stats fail
      console.error("❌ Warning: Failed to update AMU/Graph stats:", amuErr.message);
    }
    // ------------------------------------------------------------------


    // 3. Update Treatment Request
    if (requestId) {
      await TreatmentRequest.findByIdAndUpdate(requestId, {
        status: "Completed",
        prescriptionId: saved._id,
      });
    }

    // 4. Update Animal Status
    if (animalId && withdrawalPeriodDays != null) {
      const withdrawalDate = new Date();
      withdrawalDate.setDate(withdrawalDate.getDate() + Number(withdrawalPeriodDays));
      await Animal.findByIdAndUpdate(animalId, {
        withdrawalUntil: withdrawalDate,
        status: "Healthy",
      });
    }

    // 5. Blockchain Log
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
    const limit = parseInt(req.query.limit) || 5;

    const recent = await Prescription.find({ vetId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("animalId", "animalTagId");

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