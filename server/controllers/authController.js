const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, phoneNumber, password, role, city, address } = req.body;

        // 1. Check if user already exists
        const userExists = await User.findOne({ phoneNumber });

        if (userExists) {
            return res.status(400).json({ message: 'User with this phone number already exists' });
        }

        // 2. Create the user in the database
        const user = await User.create({
            name,
            phoneNumber,
            password,
            role,
            city,
            address
        });

        // 3. If successful, send back the user data AND their token
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                role: user.role,
                city: user.city,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data received' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;

        // 1. Find the user by phone number AND explicitly grab the hidden password
        const user = await User.findOne({ phoneNumber }).select('+password');

        // 2. Check if user exists AND if the entered password matches the database
        if (user && (await user.matchPassword(password))) {
            // 3. Send back the profile and a fresh token
            res.json({
                _id: user._id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                role: user.role,
                city: user.city,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid phone number or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/profile
// @access  Private (Requires Token)
const getUserProfile = async (req, res) => {
    try {
        // req.user is provided by our 'protect' middleware!
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                role: user.role,
                city: user.city
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, getUserProfile };