const express = require('express');
const router = express.Router();
const path = require('path');
const upload = require('../middleware/uploads');

// Models
const TreatmentRequest = require('../models/TreatmentRequest');

// ==========================================
// 1. CREATE REQUEST (Farmer)
// ==========================================
router.post('/create', upload.single('photo'), async (req, res) => {
  try {
    const { farmerId, animalId, problemDescription } = req.body;

    if (!farmerId || !animalId || !problemDescription) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    const newRequest = new TreatmentRequest({
      farmerId,
      animalId,
      problemDescription,
      photoUrl,
      status: 'Pending', // Default status
    });

    await newRequest.save();
    res.status(201).json({ message: 'Request created successfully', request: newRequest });

  } catch (err) {
    console.error("Create Request Error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// 2. GET PENDING REQUESTS (Vet Dashboard)
// ==========================================
router.get('/pending', async (req, res) => {
  try {
    // Find all requests where status is 'Pending'
    // .populate() fills in the details for farmer and animal so you see names, not just IDs
    const requests = await TreatmentRequest.find({ status: 'Pending' })
      .populate('farmerId', 'name phone city')
      .populate('animalId', 'animalTagId type breed')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error("Fetch Pending Error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// 3. GET MY ACCEPTED CASES (Vet Dashboard)
// ==========================================
router.get('/my-accepted/:vetId', async (req, res) => {
  try {
    const { vetId } = req.params;
    
    const requests = await TreatmentRequest.find({ status: 'Accepted', vetId: vetId })
      .populate('farmerId', 'name phone')
      .populate('animalId', 'animalTagId type')
      .sort({ updatedAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error("Fetch Accepted Error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// 4. ACCEPT REQUEST (Vet Action)
// ==========================================
router.post('/accept', async (req, res) => {
  try {
    const { requestId, vetId } = req.body;

    await TreatmentRequest.findByIdAndUpdate(requestId, {
      status: 'Accepted',
      vetId: vetId
    });

    res.json({ message: 'Request Accepted' });
  } catch (err) {
    console.error("Accept Error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// 5. DECLINE REQUEST (Vet Action)
// ==========================================
router.post('/decline', async (req, res) => {
  try {
    const { requestId, reason } = req.body;

    await TreatmentRequest.findByIdAndUpdate(requestId, {
      status: 'Declined',
      declineReason: reason
    });

    res.json({ message: 'Request Declined' });
  } catch (err) {
    console.error("Decline Error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// 6. GET REQUESTS FOR FARMER (Farmer Dashboard)
// ==========================================
router.get('/my-requests/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    const requests = await TreatmentRequest.find({ farmerId })
      .populate('vetId', 'name')
      .populate('animalId', 'animalTagId')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (err) {
    console.error("Farmer Requests Error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;