const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Animal = require('../models/Animal');
const Prescription = require('../models/Prescription');

// Import our two "locks"
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// --- 1. ADMIN: Get Key Stats ---
router.get('/stats', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const [
      totalFarmers,
      totalVets,
      totalAnimals,
      totalPrescriptions,
      totalMRLActive
    ] = await Promise.all([
      User.countDocuments({ role: 'Farmer' }),
      User.countDocuments({ role: 'Vet' }),
      Animal.countDocuments(),
      Prescription.countDocuments(),
      Animal.countDocuments({ withdrawalUntil: { $gt: new Date() } }) 
    ]);

    res.status(200).json({
      totalFarmers,
      totalVets,
      totalAnimals,
      totalPrescriptions,
      totalMRLActive
    });

  } catch (error) {
    console.error('Error in /stats:', error.message);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// --- 2. ADMIN: Get AMU (Prescription) Count by City ---
router.get('/amu-by-city', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const amuData = await Prescription.aggregate([
      {
        $match: { 
          location: { 
            $ne: null, 
//           $exists: true, (This is correct)
            $type: "string"
          } 
        }
      },
      {
        $group: { _id: '$location', count: { $sum: 1 } }
      },
      { 
        $match: { _id: { $ne: "" } }
      },
      { 
        $project: { _id: 0, city: '$_id', count: 1 } 
      },
      { 
        $sort: { count: -1 } 
      }
    ]);
    res.status(200).json(amuData);
  } catch (error) {
    console.error('Error in /amu-by-city:', error.message);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// --- 3. ADMIN: Get Professionals by City ---
router.get('/professionals-by-city/:city', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const cityName = req.params.city;

    const professionals = await User.find({
      city: cityName,
      role: { $in: ['Vet', 'Pharmacist'] } 
     }).select('name role'); 

    res.status(200).json(professionals);

  } catch (error) {
    console.error('Error in /professionals-by-city:', error.message);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// --- 4. ADMIN: Get Medicine Usage Count ---
router.get('/medicine-usage', [authMiddleware, adminMiddleware], async (req, res) => {
   try {
    const medicineData = await Prescription.aggregate([
      { $unwind: '$medicines' },
      {
        $group: {
          _id: '$medicines.name', 
          count: { $sum: 1 }   
        }
      },
      {
        $project: {
          _id: 0,
          medicine: '$_id',
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json(medicineData);

  } catch (error) {
    console.error('Error in /medicine-usage:', error.message);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// --- 5. PUBLIC ROUTE: Get AMU Count by City ---
router.get('/public-amu-report', async (req, res) => {
  try {
    const amuData = await Prescription.aggregate([
      {
        $match: { 
          location: { 
            $ne: null, 
            $exists: true,
            $type: "string" 
          } 
        }
     },
      {
        $group: { _id: '$location', count: { $sum: 1 } }
      },
      { 
        $match: { _id: { $ne: "" } }
      },
      { 
          $project: { _id: 0, city: '$_id', count: 1 } 
      },
      { 
        $sort: { count: -1 } 
      }
    ]);

    res.status(200).json(amuData);
  } catch (error) {
    console.error('Error in /public-amu-report:', error.message);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

module.exports = router;