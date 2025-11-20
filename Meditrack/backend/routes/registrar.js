const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Animal = require('../models/Animal');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware'); // We can re-use this!

// A middleware to check if the user is a Registrar OR an Admin
const registrarOrAdminMiddleware = (req, res, next) => {
  if (req.user && (req.user.role === 'Registrar' || req.user.role === 'Admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Registrar or Admin role required.' });
  }
};

// --- 1. REGISTRAR: Get all farmers ---
// This route is locked: must be logged in AND be a Registrar or Admin
router.get('/all-farmers', [authMiddleware, registrarOrAdminMiddleware], async (req, res) => {
  try {
    // Find all users whose role is 'Farmer' and only return their name and ID
    const farmers = await User.find({ role: 'Farmer' }).select('name _id');
    res.status(200).json(farmers);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// --- 2. REGISTRAR: Add a new animal for a farmer ---
// This route is also locked
router.post('/add-animal', [authMiddleware, registrarOrAdminMiddleware], async (req, res) => {
  try {
    // Get the data from the form
    const { ownerId, animalTagId, type, breed, age, weight, groupName } = req.body;

    // Check if this farmer already has an animal with this tag ID
    const existingAnimal = await Animal.findOne({ ownerId, animalTagId });
    if (existingAnimal) {
      return res.status(400).json({ message: 'This farmer already has an animal with this Tag ID.' });
    }

    const newAnimal = new Animal({
      ownerId, // This is the Farmer's ID from the dropdown
      animalTagId,
      type,
      breed,
      age,
      weight,
      groupName
    });

    const savedAnimal = await newAnimal.save();
    res.status(201).json({ message: 'Animal added successfully!', animal: savedAnimal });

  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

module.exports = router;