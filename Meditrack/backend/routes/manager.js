const express = require('express');
const router = express.Router();
const Animal = require('../models/Animal'); // We need the Animal model
const authMiddleware = require('../middleware/authMiddleware');

// --- 1. MANAGER: Check Animal MRL Status ---
// URL: GET http://localhost:5000/api/manager/check-animal/[ANIMAL_TAG_ID]
// NOTE: We will search by the "animalTagId" (e.g., "COW-101")
// This is easier for a manager than using the database _id.
router.get('/check-animal/:tagId', authMiddleware, async (req, res) => {
  try {
    const animalTagId = req.params.tagId;

    // Find the animal by its tag ID
    const animal = await Animal.findOne({ animalTagId: animalTagId });

    if (!animal) {
      return res.status(404).json({ message: 'Animal with this Tag ID not found in the system.' });
    }

    // --- This is the CORE MRL CHECK ---
    const currentDate = new Date();
    
    // Check if a withdrawal date exists AND if it is in the future
    if (animal.withdrawalUntil && animal.withdrawalUntil > currentDate) {
      
      // If the date is in the future, the animal is NOT safe
      return res.status(200).json({
        safeToBuy: false,
        message: `STOP: DO NOT BUY. Animal is under a withdrawal period.`,
        animalTagId: animal.animalTagId,
        type: animal.type,
        withdrawalEndDate: animal.withdrawalUntil.toISOString() // Show the exact date
      });

    } else {
      
      // If withdrawalUntil is null OR in the past, the animal is SAFE
      return res.status(200).json({
        safeToBuy: true,
        message: 'SAFE TO BUY. Animal has no active withdrawal period.',
        animalTagId: animal.animalTagId,
        type: animal.type,
        withdrawalEndDate: animal.withdrawalUntil // Will be null or a past date
      });
    }

  } catch (error)
 {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

module.exports = router;