const Animal = require('../models/Animal');
const User = require('../models/User');

// Helper function to generate Unique Animal ID (e.g., ANI-2026-0001)
const generateAnimalId = async () => {
    const count = await Animal.countDocuments(); // Count how many animals exist
    const year = new Date().getFullYear();
    // Creates a 4-digit number, e.g., 0001, 0002
    const sequence = (count + 1).toString().padStart(4, '0'); 
    return `ANI-${year}-${sequence}`;
};

// @desc    Register a new animal
// @route   POST /api/animals/register
// @access  Private (Only for Registrars)
const registerAnimal = async (req, res) => {
    try {
        const { farmerPhone, animalType, breed, age, weight, group } = req.body;

        // 1. Find the Farmer using the phone number provided in the request
        const farmer = await User.findOne({ phoneNumber: farmerPhone, role: 'Farmer' });

        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found with this phone number' });
        }

        // 2. Generate the unique Animal ID
        const newAnimalId = await generateAnimalId();

        // 3. Create the Animal record
        const animal = await Animal.create({
            farmer: farmer._id, // Link to the farmer's hidden database ID
            animalId: newAnimalId,
            animalType,
            breed,
            age,
            weight,
            group,
            registeredBy: req.user._id // req.user comes from our 'protect' middleware!
        });

        res.status(201).json(animal);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in farmer's animals
// @route   GET /api/animals/my-animals
// @access  Private (Only for Farmers)
const getMyAnimals = async (req, res) => {
    try {
        const animals = await Animal.find({ farmer: req.user._id });
        res.json(animals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerAnimal, getMyAnimals };