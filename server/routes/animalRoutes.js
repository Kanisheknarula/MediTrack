const express = require('express');
const router = express.Router();
const { registerAnimal , getMyAnimals} = require('../controllers/animalController');

// Import our two bouncers
const { protect, authorize } = require('../middlewares/authMiddleware');

// @route   POST /api/animals/register
// @access  Private / Registrar Only
router.post(
    '/register', 
    protect,               // Bouncer 1: Are you logged in?
    authorize('Registrar'), // Bouncer 2: Are you a Registrar?
    registerAnimal         // The actual logic
);
// Farmer Route
router.get('/my-animals', protect, authorize('Farmer'), getMyAnimals);

module.exports = router;