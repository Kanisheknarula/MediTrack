const express = require('express');
const router = express.Router();
const TreatmentRequest = require('../models/TreatmentRequest');
const Animal = require('../models/Animal'); // We need this to update the animal's status
const authMiddleware = require('../middleware/authMiddleware'); // <-- ADD THIS

// --- 1. FARMER: CREATE A NEW TREATMENT REQUEST ---
// URL: POST http://localhost:5000/api/requests/create
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { farmerId, animalId, problemDescription } = req.body;
    // (We'll add mediaUrl later)

    // Create the new request
    const newRequest = new TreatmentRequest({
      farmerId,
      animalId,
      problemDescription,
      status: 'Pending', // Set status to Pending
    });
    
    const savedRequest = await newRequest.save();

    // IMPORTANT: Also update the animal's status to "Under Treatment"
    await Animal.findByIdAndUpdate(animalId, { status: 'Under Treatment' });

    res.status(201).json({ message: 'Treatment request submitted.', request: savedRequest });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// --- 2. FARMER: VIEW ALL MY REQUESTS ---
// URL: GET http://localhost:5000/api/requests/my-requests/:farmerId
router.get('/my-requests/:farmerId', authMiddleware, async (req, res) => {
  try {
    const requests = await TreatmentRequest.find({ farmerId: req.params.farmerId })
      .sort({ createdAt: -1 }) 
      // This 'populate' section is now much more powerful
      .populate('animalId', 'animalTagId type') 
      .populate({
        path: 'prescriptionId',
        model: 'Prescription', // Tell mongoose which model to use
        populate: {
          path: 'billId', // Inside the prescription, also populate the bill
          model: 'Bill'
        }
      })
      .populate('vetId', 'name'); // Also get the vet's name
    
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// --- 3. VET: VIEW ALL PENDING REQUESTS (Dashboard) ---
// URL: GET http://localhost:5000/api/requests/pending
router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const pendingRequests = await TreatmentRequest.find({ status: 'Pending' })
      .sort({ createdAt: 'asc' }) // Show oldest first
      .populate('farmerId', 'name phone') // Show farmer's name/phone
      .populate('animalId', 'animalTagId type breed'); // Show animal's info
    
    res.status(200).json(pendingRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// --- 4. VET: ACCEPT A REQUEST ---
// URL: POST http://localhost:5000/api/requests/accept
router.post('/accept', authMiddleware, async (req, res) => {
  try {
    const { requestId, vetId } = req.body;
    
    const updatedRequest = await TreatmentRequest.findByIdAndUpdate(
      requestId,
      { 
        status: 'Accepted', // Change status
        vetId: vetId      // Assign the vet
      },
      { new: true } // 'new: true' returns the updated document
    );

    res.status(200).json({ message: 'Request accepted.', request: updatedRequest });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// --- 5. VET: DECLINE A REQUEST ---
// URL: POST http://localhost:5000/api/requests/decline
router.post('/decline', authMiddleware, async (req, res) => {
  try {
    const { requestId, reason } = req.body;
    
    const updatedRequest = await TreatmentRequest.findByIdAndUpdate(
      requestId,
      { 
        status: 'Declined',
        declineReason: reason
      },
      { new: true }
    );
    
    // Also set the animal's status back to 'Healthy'
    await Animal.findByIdAndUpdate(updatedRequest.animalId, { status: 'Healthy' });

    res.status(200).json({ message: 'Request declined.', request: updatedRequest });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// This line was already here, leave it at the end
// module.exports = router;

// --- 6. VET: GET *MY* ACCEPTED REQUESTS ---
// URL: GET http://localhost:5000/api/requests/my-accepted/:vetId
router.get('/my-accepted/:vetId',authMiddleware, async (req, res) => {
  try {
    const myRequests = await TreatmentRequest.find({
      vetId: req.params.vetId,
      status: 'Accepted' // Only find "Accepted" ones
    })
      .sort({ createdAt: 'asc' })
      .populate('farmerId', 'name')
      .populate('animalId', 'animalTagId type');
      
    res.status(200).json(myRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// module.exports = router; // This line is already at the bottom

module.exports = router;