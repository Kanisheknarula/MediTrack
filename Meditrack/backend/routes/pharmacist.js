const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const Bill = require('../models/Bill');
const authMiddleware = require('../middleware/authMiddleware');

// --- 1. PHARMACIST: GET ALL NEW PRESCRIPTIONS (Dashboard) ---
// URL: GET http://localhost:5000/api/pharmacist/new-prescriptions
router.get('/new-prescriptions', authMiddleware, async (req, res) => {
  try {
    // Find all prescriptions that do NOT have a billId yet
    const newPrescriptions = await Prescription.find({ billId: null })
      .populate('vetId', 'name') // Show vet's name
      .populate('animalId', 'animalTagId'); // Show animal's tag

    res.status(200).json(newPrescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// --- 2. PHARMACIST: CREATE A BILL ---
// URL: POST http://localhost:5000/api/pharmacist/create-bill
router.post('/create-bill', authMiddleware, async (req, res) => {
  try {
    const { prescriptionId, pharmacistId, items, totalAmount } = req.body;

    // 1. Create the new bill
    const newBill = new Bill({
      prescriptionId,
      pharmacistId,
      items, // The 'items' array should have prices added
      totalAmount,
    });
    const savedBill = await newBill.save();

    // 2. Update the Prescription to link it to this new bill
    await Prescription.findByIdAndUpdate(prescriptionId, {
      billId: savedBill._id,
    });

    res.status(201).json({ message: 'Bill created successfully.', bill: savedBill });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

module.exports = router;