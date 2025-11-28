// backend/routes/pharmacist.js

const express = require('express');
const router = express.Router();

const Prescription = require('../models/Prescription');
const Bill = require('../models/Bill');
const Animal = require('../models/Animal'); // for farmerName / tag
const authMiddleware = require('../middleware/authMiddleware');

// ------------------------------------------------------
// 1. New prescriptions (no bill yet) – for dashboard list
//    GET /api/pharmacist/new-prescriptions
// ------------------------------------------------------
router.get('/new-prescriptions', authMiddleware, async (req, res) => {
  try {
    // All prescriptions that do NOT have a bill linked yet
    const newPrescriptions = await Prescription.find({ billId: null })
      .populate('vetId', 'name')
      .populate('animalId', 'animalTagId');

    return res.status(200).json(newPrescriptions);
  } catch (error) {
    console.error('❌ Error in /pharmacist/new-prescriptions:', error);
    return res.status(500).json({
      message: 'Server error.',
      error: error.message,
    });
  }
});

// ------------------------------------------------------
// 2. Create a bill for a prescription
//    POST /api/pharmacist/create-bill
// ------------------------------------------------------
router.post('/create-bill', authMiddleware, async (req, res) => {
  try {
    const { prescriptionId, pharmacistId, items, totalAmount } = req.body;

    if (!prescriptionId || !pharmacistId) {
      return res.status(400).json({
        success: false,
        message: 'prescriptionId and pharmacistId are required.',
      });
    }

    // 2.1 Load the prescription (for display fields)
    const prescription = await Prescription.findById(prescriptionId).populate(
      'animalId',
      'animalTagId'
    );
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found.',
      });
    }

    // 2.2 Optional: also fetch farmer name from Animal if present
    let farmerName = '';
    try {
      const animal = await Animal.findById(prescription.animalId);
      if (animal && animal.ownerName) {
        farmerName = animal.ownerName;
      }
    } catch (e) {
      // ignore if not present
    }

    // 2.3 Create bill document
    const bill = new Bill({
      prescriptionId: prescription._id,
      pharmacistId, // IMPORTANT for "recent bills"
      farmerName,
      animalTagId: prescription.animalId?.animalTagId || '',
      items: items || [],
      totalAmount,
      status: 'Paid',
    });

    const savedBill = await bill.save();

    // 2.4 Mark prescription as billed (so it disappears from "new list")
    prescription.isBilled = true;
    prescription.billId = savedBill._id;
    await prescription.save();

    return res.status(201).json({
      success: true,
      message: 'Bill created successfully!',
      bill: savedBill,
    });
  } catch (err) {
    console.error('❌ Error in /pharmacist/create-bill:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating bill.',
    });
  }
});

// ------------------------------------------------------
// 3. Recent Bills for CURRENT pharmacist (last N, default 5)
//    GET /api/pharmacist/bills/recent?limit=5
// ------------------------------------------------------
router.get('/bills/recent', authMiddleware, async (req, res) => {
  try {
    // From JWT token (see authMiddleware + login)
    const pharmacistId = req.user.userId;
    const limit = Number(req.query.limit) || 5;

    const bills = await Bill.find({ pharmacistId })
      .populate({
        path: 'prescriptionId',
        populate: { path: 'animalId' },
      })
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.json({
      success: true,
      bills,
    });
  } catch (err) {
    console.error('❌ Error in /pharmacist/bills/recent:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching recent bills.',
    });
  }
});

module.exports = router;
