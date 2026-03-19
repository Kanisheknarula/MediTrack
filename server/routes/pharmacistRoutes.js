const express = require('express');
const router = express.Router();
const { getPendingBills , generateBill, getPharmacistHistory} = require('../controllers/pharmacistController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Pharmacist Routes
router.get('/pending-bills', protect, authorize('Pharmacist'), getPendingBills);
// const { getPendingBills, generateBill } = require('../controllers/pharmacistController');
router.post('/generate-bill', protect, authorize('Pharmacist'), generateBill);
router.get('/history', protect, authorize('Pharmacist'), getPharmacistHistory);

module.exports = router;