// backend/routes/prescription.js

const express = require("express");
const router = express.Router();
const Prescription = require("../models/Prescription");
const TreatmentRequest = require("../models/TreatmentRequest");
const Animal = require("../models/Animal");
const User = require("../models/User");
// const AMU = require("../models/AMU"); // Graph Model
const AMU = require("../models/amuModel"); // Matches your actual filename
const authMiddleware = require("../middleware/authMiddleware");
const { addEvent } = require("../blockchain/blockchainService");

// =====================================================================
// CREATE PRESCRIPTION (Robust & Graph Connected)
// =====================================================================
async function handleCreatePrescription(req, res) {
  try {
    console.log("📝 Incoming Prescription Request Body:", req.body);

    // 1. SAFETY CHECK: Ensure User is Authenticated
    if (!req.user || !req.user.userId) {
      console.error("❌ Error: User not authenticated (req.user missing)");
      return res.status(401).json({ success: false, message: "Unauthorized: User not found" });
    }

    const vetId = req.user.userId;
    const { requestId, animalId, medicines, withdrawalPeriodDays, notes } = req.body;

    // 2. SAFETY CHECK: Validate Vet Exists & Get Location
    const vet = await User.findById(vetId);
    if (!vet) {
      return res.status(404).json({ success: false, message: "Vet not found in database" });
    }

    // Handle missing city gracefully (Prevents crash if city is undefined)
    const vetLocation = (vet.city && vet.city.trim() !== "") ? vet.city : "Unknown";

    // 3. Create & Save Prescription
    const newPrescription = new Prescription({
      requestId,
      vetId,
      animalId,
      medicines,
      withdrawalPeriodDays,
      notes,
      location: vetLocation, // Saves "Delhi"
    });

    const saved = await newPrescription.save();
    console.log("✅ Prescription Saved with ID:", saved._id);

    // ==================================================================
    // 🔥 CRITICAL FIX: Update AMU (Graph Data) Automatically 🔥
    // ==================================================================
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Find existing record for this City + Date
      let amuRecord = await AMU.findOne({ area: vetLocation, date: today });

      if (amuRecord) {
        // Increment quantity if exists
        amuRecord.quantity += 1;
        await amuRecord.save();
        console.log(`📈 AMU Updated: +1 for ${vetLocation} on ${today}`);
      } else {
        // Create new record if missing
        amuRecord = new AMU({
          area: vetLocation,
          date: today,
          quantity: 1,
        });
        await amuRecord.save();
        console.log(`📊 AMU Created: New entry for ${vetLocation}`);
      }
    } catch (amuErr) {
      // Log error but DO NOT crash the request
      console.error("⚠️ Warning: Failed to update AMU Graphs:", amuErr.message);
    }
    // ==================================================================

    // 4. Update Treatment Request Status
    if (requestId) {
      await TreatmentRequest.findByIdAndUpdate(requestId, {
        status: "Completed",
        prescriptionId: saved._id,
      });
    }

    // 5. Update Animal Status
    if (animalId && withdrawalPeriodDays != null) {
      const withdrawalDate = new Date();
      withdrawalDate.setDate(withdrawalDate.getDate() + Number(withdrawalPeriodDays));
      await Animal.findByIdAndUpdate(animalId, {
        withdrawalUntil: withdrawalDate,
        status: "Healthy",
      });
    }

    // 6. Blockchain Logging (Wrapped to prevent crashes)
    try {
      addEvent("PrescriptionCreated", animalId, JSON.stringify({
          prescriptionId: saved._id.toString(),
          vetId,
          location: vetLocation,
          date: new Date().toISOString(),
        })
      );
    } catch (bcErr) {
      console.error("⚠️ Blockchain log failed:", bcErr.message);
    }

    // 7. SUCCESS RESPONSE
    return res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription: saved, // Frontend needs this!
    });

  } catch (err) {
    console.error("❌ SERVER ERROR in create prescription:", err);
    return res.status(500).json({ success: false, message: "Server error: " + err.message });
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

    return res.json({ success: true, prescriptions: recent });
  } catch (err) {
    console.error("Fetch recent error:", err);
    return res.status(500).json({ success: false, message: "Error fetching data" });
  }
});

router.post("/create", authMiddleware, handleCreatePrescription);
router.post("/add", authMiddleware, handleCreatePrescription);

module.exports = router;