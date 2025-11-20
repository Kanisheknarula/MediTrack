const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const TreatmentRequest = require('../models/TreatmentRequest');
const Animal = require('../models/Animal');
const authMiddleware = require('../middleware/authMiddleware');

const User = require('../models/User'); // <-- 1. IMPORT USER MODEL AT THE TOP

// ...

// --- 1. VET: CREATE A NEW PRESCRIPTION ---
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { 
      requestId, 
      vetId, 
      animalId, 
      medicines, 
      withdrawalPeriodDays, 
      notes 
    } = req.body;

    // --- THIS IS THE NEW PART ---
    // 1. Find the Vet who is prescribing
    const vet = await User.findById(vetId);
    if (!vet) {
      return res.status(404).json({ message: 'Veterinarian not found.' });
    }
    // 2. Get their location (city)
    const vetLocation = vet.city;
    // --- END OF NEW PART ---

    // --- (1) Create the Prescription ---
    const newPrescription = new Prescription({
      requestId,
      vetId,
      animalId,
      location: vetLocation, // <-- 3. SAVE THE LOCATION
      medicines,
      withdrawalPeriodDays,
      notes
    });
    const savedPrescription = await newPrescription.save();

    // ... (rest of the function is the same)
    // --- (2) Update the original TreatmentRequest ---
    await TreatmentRequest.findByIdAndUpdate(requestId, {
      status: 'Completed', 
      prescriptionId: savedPrescription._id 
    });

    // --- (3) CRITICAL: Calculate and set the MRL (Withdrawal) Date ---
    const withdrawalDate = new Date(); 
    withdrawalDate.setDate(withdrawalDate.getDate() + withdrawalPeriodDays);

    await Animal.findByIdAndUpdate(animalId, {
      withdrawalUntil: withdrawalDate, 
      status: 'Healthy' 
    });

    res.status(201).json({ 
      message: 'Prescription created successfully!', 
      prescription: savedPrescription 
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

module.exports = router;