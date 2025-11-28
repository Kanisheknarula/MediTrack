// backend/routes/request.js
const express = require('express');
const router = express.Router();
const path = require('path');

// try to use your actual Request model if present
let RequestModel;
try {
  RequestModel = require('../models/Request');
} catch (err) {
  RequestModel = null; // we'll use an in-memory array as fallback
}

// multer upload middleware

// new — matches your file upload filename uploads.js
const upload = require('../middleware/uploads');


// demo in-memory store (fallback if no DB model)
let demoRequests = [];

/**
 * POST /api/requests/create
 * Accepts either:
 *  - multipart/form-data with field "photo" (camera upload) AND other fields in form-data, OR
 *  - application/json body
 *
 * Required fields: farmerId, animalId, problemDescription
 * Returns the created request as JSON. If photo uploaded, returns photoUrl = /uploads/<filename>
 */
router.post('/create', upload.single('photo'), async (req, res) => {
  try {
    const farmerId = req.body.farmerId || req.body.farmerID || req.body.farmer;
    const animalId = req.body.animalId || req.body.animalID || req.body.animal;
    const problemDescription = req.body.problemDescription || req.body.problem || "";

    if (!farmerId || !animalId || !problemDescription.trim()) {
      return res.status(400).json({ message: 'farmerId, animalId and problemDescription are required' });
    }

    let photoUrl = null;
    if (req.file && req.file.filename) {
      // file saved to backend/uploads/<filename>
      photoUrl = `/uploads/${req.file.filename}`;
    }

    // If you have a Request mongoose model, save to DB
    if (RequestModel && typeof RequestModel.create === 'function') {
      const payload = {
        farmerId,
        animalId,
        problemDescription,
        photoUrl,
        status: 'Pending',
        createdAt: new Date()
      };

      const created = await RequestModel.create(payload);
      // If your model uses different fields or population for prescription, adapt as needed
      return res.status(201).json(created);
    }

    // FALLBACK: push to demoRequests (in-memory)
    const newReq = {
      _id: `req_${Date.now()}`,
      farmerId,
      animalId,
      problemDescription,
      photoUrl,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    demoRequests.unshift(newReq);
    return res.status(201).json(newReq);

  } catch (err) {
    console.error('Error in /api/requests/create:', err);
    return res.status(500).json({ message: 'Server error while creating request' });
  }
});

/**
 * GET /api/requests/my-requests/:farmerId
 * Returns list of requests for a farmer (most recent first)
 */
router.get('/my-requests/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    if (!farmerId) return res.status(400).json({ message: 'farmerId required' });

    if (RequestModel && typeof RequestModel.find === 'function') {
      // adapt populate keys if you have related models
      const list = await RequestModel.find({ farmerId }).sort({ createdAt: -1 }).lean();
      return res.json(list);
    }

    // fallback from demoRequests
    const list = demoRequests.filter(r => r.farmerId === farmerId);
    return res.json(list);
  } catch (err) {
    console.error('Error in /api/requests/my-requests/:farmerId', err);
    return res.status(500).json({ message: 'Server error fetching requests' });
  }
});

/**
 * DELETE /api/requests/:id
 * Removes a request (and deletes uploaded photo if present).
 * NOTE: protect this route with auth in production.
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: 'id required' });

    // If using DB
    if (RequestModel && typeof RequestModel.findByIdAndDelete === 'function') {
      const found = await RequestModel.findByIdAndDelete(id).lean();
      if (found && found.photoUrl) {
        // delete the file
        const fname = path.basename(found.photoUrl);
        const fs = require('fs');
        const fp = path.join(__dirname, '..', 'uploads', fname);
        fs.unlink(fp, (err) => { /* ignore errors */ });
      }
      return res.json({ message: 'removed' });
    }

    // fallback in-memory
    const prevLen = demoRequests.length;
    demoRequests = demoRequests.filter(r => r._id !== id);
    if (demoRequests.length === prevLen) {
      return res.status(404).json({ message: 'not found' });
    }
    return res.json({ message: 'removed' });

  } catch (err) {
    console.error('Error deleting request:', err);
    return res.status(500).json({ message: 'server error' });
  }
});

module.exports = router;
