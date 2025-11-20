const express = require('express');
const router = express.Router();
const Animal = require('../models/Animal');
const authMiddleware = require('../middleware/authMiddleware'); // Import the lock

// --- 1. ADD A NEW ANIMAL ---
// URL: POST http://localhost:5000/api/animals/add
router.post('/add', authMiddleware, async (req, res) => {
  try {
    // --- THIS IS THE FIX ---
    // 1. Get the farmer's ID from the token (req.user)
    const ownerId = req.user.userId; 
    
    // 2. Get the animal data from the body
    const { animalTagId, type, breed, age, weight, groupName } = req.body;
    // -------------------------

    // Check if this farmer already has an animal with this tag ID
    const existingAnimal = await Animal.findOne({ ownerId, animalTagId });
    if (existingAnimal) {
      return res.status(400).json({ message: 'You already have an animal with this Tag ID.' });
    }

    const newAnimal = new Animal({
      ownerId, // This is now the secure ID from the token
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

// --- 2. GET ALL ANIMALS FOR A SPECIFIC FARMER ---
// (We must also update this route to be secure)
// URL: GET http://localhost:5000/api/animals/my-animals/:farmerId
router.get('/my-animals/:farmerId', authMiddleware, async (req, res) => {
  try {
    // Check if the logged-in user (from the token) is the same
    // as the farmer they are trying to get animals for.
    if (req.user.userId !== req.params.farmerId) {
      return res.status(403).json({ message: 'Forbidden: You can only view your own animals.' });
    }
    
    // Find all animals where the 'ownerId' matches the farmer's ID
    const animals = await Animal.find({ ownerId: req.params.farmerId });

    if (!animals) {
      return res.status(404).json({ message: 'No animals found for this farmer.' });
    }

    res.status(200).json(animals); // Send the list of animals

  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// This line MUST be at the very end
module.exports = router;