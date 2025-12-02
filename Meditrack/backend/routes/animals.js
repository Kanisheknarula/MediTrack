const express = require('express');
const router = express.Router();
const Animal = require('../models/Animal');
const authMiddleware = require('../middleware/authMiddleware'); // Import the lock

// --- 1. ADD A NEW ANIMAL ---
// URL: POST http://localhost:5000/api/animals/add
router.post('/add', authMiddleware, async (req, res) => {
  try {
    // 1. Get the farmer's ID from the token (req.user)
    const ownerId = req.user.userId; 
    
    // 2. Get the animal data from the body
    const { animalTagId, type, breed, age, weight, groupName } = req.body;

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
// URL: GET http://localhost:5000/api/animals/my-animals/:farmerId
router.get('/my-animals/:farmerId', authMiddleware, async (req, res) => {
  try {
    const requestedFarmerId = req.params.farmerId;
    const requestingUser = req.user; // Contains { userId, role }

    // --- PERMISSION CHECK ---
    // Allow if:
    // 1. User is the owner (Farmer themselves)
    // 2. OR User is a 'Vet' (Need to see animals to prescribe)
    // 3. OR User is 'Admin' or 'Registrar' or 'Pharmacist'
    
    const isOwner = requestingUser.userId === requestedFarmerId;
    const isProfessional = ['Vet', 'Admin', 'Registrar', 'Pharmacist'].includes(requestingUser.role);

    if (!isOwner && !isProfessional) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to view these animals.' });
    }
    // ------------------------
    
    // Find all animals where the 'ownerId' matches the farmer's ID
    const animals = await Animal.find({ ownerId: requestedFarmerId });

    // Return empty array instead of 404 to prevent frontend crashes if list is empty
    if (!animals) {
      return res.status(200).json([]); 
    }

    res.status(200).json(animals); // Send the list of animals

  } catch (error) {
    console.error("Error fetching animals:", error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

module.exports = router;