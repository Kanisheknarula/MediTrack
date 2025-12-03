const express = require('express');
const router = express.Router();
const Animal = require('../models/Animal');
const authMiddleware = require('../middleware/authMiddleware');

// --- 1. ADD A NEW ANIMAL ---
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const ownerId = req.user.userId; 
    const { animalTagId, type, breed, age, weight, groupName } = req.body;

    const existingAnimal = await Animal.findOne({ ownerId, animalTagId });
    if (existingAnimal) {
      return res.status(400).json({ message: 'You already have an animal with this Tag ID.' });
    }

    const newAnimal = new Animal({
      ownerId,
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

// --- 2. GET ALL ANIMALS (Fixed to prevent White Screen) ---
router.get('/my-animals/:farmerId', authMiddleware, async (req, res) => {
  try {
    const requestedFarmerId = req.params.farmerId;
    const requestingUser = req.user;

    // --- PERMISSION CHECK ---
    const isOwner = requestingUser.userId === requestedFarmerId;
    const isProfessional = ['Vet', 'Admin', 'Registrar', 'Pharmacist'].includes(requestingUser.role);

    if (!isOwner && !isProfessional) {
      // ⚠️ FIX: Return empty array [] instead of 403 Error
      return res.status(200).json([]); 
    }
    
    const animals = await Animal.find({ ownerId: requestedFarmerId });
    return res.status(200).json(animals || []);

  } catch (error) {
    console.error("Error fetching animals:", error);
    // ⚠️ FIX: Return empty array [] on crash too
    return res.status(200).json([]); 
  }
});

module.exports = router;