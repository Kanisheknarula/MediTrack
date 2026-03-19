// const User = require('../models/User');
// const Animal = require('../models/Animal');
// const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Animal = require('../models/Animal');
const bcrypt = require('bcryptjs');

const onboardOfflineFarmer = async (req, res) => {
    try {
        // NEW: We now extract breed, age, and weight from the request
        const { name, phoneNumber, animalType, breed, age, weight } = req.body;
        
        let farmer = await User.findOne({ phoneNumber });
        
        if (!farmer) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('EcoVet123!', salt);
            
            farmer = await User.create({
                name,
                phoneNumber,
                password: hashedPassword,
                role: 'Farmer',
                city: req.user.city
            });
        }

        const animalId = `ANI-${Math.floor(1000 + Math.random() * 9000)}`;
        
        // NEW: Save the actual details to the database
        await Animal.create({
            farmer: farmer._id,
            animalId,
            animalType,
            breed: breed || 'Unknown',
            age: Number(age) || 0,
            weight: Number(weight) || 0,
            registeredBy: req.user._id
        });

        res.status(201).json({ message: 'Success! Farmer and Animal officially registered.' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get all animals registered by this specific registrar
// @route   GET /api/registrar/history
// @access  Private (Registrar Only)
const getRegistrarHistory = async (req, res) => {
    try {
        const history = await Animal.find({ registeredBy: req.user._id })
            .populate('farmer', 'name phoneNumber city')
            .sort({ createdAt: -1 }); // Newest first
            
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { onboardOfflineFarmer,getRegistrarHistory };

