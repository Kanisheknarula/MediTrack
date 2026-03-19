const Treatment = require('../models/Treatment');
const AMULog = require('../models/AMULog');
// const AMULog = require('../models/AMULog');

// @desc    Get nearby completed prescriptions waiting for billing
// @route   GET /api/pharmacist/pending-bills
// @access  Private (Only for Pharmacists)
const getPendingBills = async (req, res) => {
    try {
        // Find treatments that are Completed but NO bill is generated yet
        const treatments = await Treatment.find({ 
            status: 'Completed', 
            billGenerated: false 
        })
        .populate({
            path: 'farmer',
            match: { city: req.user.city }, // Only match Farmers in the Pharmacist's city!
            select: 'name phoneNumber city'
        })
        .populate('animal', 'animalId animalType')
        .populate('vet', 'name');

        // Filter out any treatments where the farmer is null (because they are in a different city)
        const nearbyPrescriptions = treatments.filter(t => t.farmer !== null);

        res.json(nearbyPrescriptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate bill and log AMU data
// @route   POST /api/pharmacist/generate-bill
// @access  Private (Only for Pharmacists)
const generateBill = async (req, res) => {
    try {
        const { treatmentId, dispensedMedicines, totalBillAmount } = req.body;

        // 1. Find the treatment and grab the farmer's details (we need their city!)
        const treatment = await Treatment.findById(treatmentId).populate('farmer');

        if (!treatment) {
            return res.status(404).json({ message: 'Treatment not found' });
        }

        // 2. Prevent double billing
        if (treatment.billGenerated) {
            return res.status(400).json({ message: 'A bill has already been generated for this prescription.' });
        }

        // 3. Create the AMU Log (The Government Data Point)
        const amuLog = await AMULog.create({
            pharmacist: req.user._id,
            treatment: treatment._id,
            farmer: treatment.farmer._id,
            animal: treatment.animal,
            city: treatment.farmer.city, // MAGIC: We lock this log to the Farmer's city for easy graphing later!
            dispensedMedicines,
            totalBillAmount
        });

        // 4. Update the Treatment ticket so it disappears from the 'Pending Bills' list
        treatment.billGenerated = true;
        await treatment.save();

        res.status(201).json({ 
            message: 'Bill generated successfully! AMU data logged for government analytics.',
            amuLog 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all bills processed by this Pharmacist
// @route   GET /api/pharmacist/history
// @access  Private (Pharmacist Only)
const getPharmacistHistory = async (req, res) => {
    try {
        const history = await AMULog.find({ pharmacist: req.user._id })
            .populate({
                path: 'treatment',
                populate: { path: 'farmer animal vet', select: 'name animalType breed' }
            })
            .sort({ createdAt: -1 }); // Newest bills first
            
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPendingBills, generateBill , getPharmacistHistory};