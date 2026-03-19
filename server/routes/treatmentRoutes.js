const express = require('express');
const router = express.Router();
const {createTreatmentRequest, getPendingTreatments, 
    respondToTreatment, addPrescription,getFarmerTreatments , getVetHistory} = require('../controllers/treatmentController');
    

// Import our bouncers
const { protect, authorize } = require('../middlewares/authMiddleware');

// @route   POST /api/treatments/request
// @access  Private / Farmer Only
router.post(
    '/request', 
    protect,              // Bouncer 1: Must be logged in
    authorize('Farmer'),  // Bouncer 2: Must be a Farmer
    createTreatmentRequest
);
router.get('/my-requests', protect, authorize('Farmer'), getFarmerTreatments); // NEW ROUTE

// Vet Routes
router.get('/pending', protect, authorize('Vet'), getPendingTreatments);
router.put('/:id/respond', protect, authorize('Vet'), respondToTreatment);
router.put('/:id/prescribe', protect, authorize('Vet'), addPrescription);
router.get('/vet-history', protect, authorize('Vet'), getVetHistory);

module.exports = router;