const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware'); // Import our bouncer

// Map the POST request to the controller function
router.post('/register', registerUser);
router.post('/login', loginUser); // New login route
router.get('/profile', protect, getUserProfile); // New profile route
module.exports = router;