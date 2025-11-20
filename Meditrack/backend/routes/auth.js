const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import the User model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// --- 1. REGISTRATION ENDPOINT ---
// URL: POST http://localhost:5000/api/auth/register
router.post('/register', async (req, res) => {
  try {
    // Get user info from the request body
    const { name, phone, password, role, city } = req.body; // <-- 1. ADD 'city' HERE

    // Check if user (phone number) already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      // 400 = Bad Request
      return res.status(400).json({ message: 'User with this phone number already exists.' });
    }

    // We already hashed the password in the User.js model (using the 'pre-save' hook)
    // So we can just create the new user
    const newUser = new User({
      name,
      phone,
      password,
      role,
      city // <-- 2. ADD 'city' HERE
    });

    // Save the new user to the database
    const savedUser = await newUser.save();

    // 201 = Created
    res.status(201).json({ message: 'User registered successfully!', userId: savedUser._id });

  } catch (error) {
    // 500 = Internal Server Error
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
});

// --- 2. LOGIN ENDPOINT ---
// URL: POST http://localhost:5000/api/auth/login
router.post('/login', async (req, res) => {
  try {
    // Get login info from the request body
    const { phone, password } = req.body;

    // Find the user by their phone number
    const user = await User.findOne({ phone });
    if (!user) {
      // 404 = Not Found
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the password is correct
    // 'bcrypt.compare' will hash the "password" from req.body and compare it to the "user.password" from the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // 401 = Unauthorized
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // If password is correct, create a "token"
    const token = jwt.sign(
      { userId: user._id, role: user.role }, // This is the data we're putting in the token
      process.env.JWT_SECRET, // This is the secret key from your .env file
      { expiresIn: '1d' } // Token expires in 1 day
    );

    // Send the token and user info back to the client
    res.status(200).json({
      message: 'Login successful!',
      token: token,
      user: {
        userId: user._id,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
});


module.exports = router; // Export the router