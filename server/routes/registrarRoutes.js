const express = require('express');
const router = express.Router();
const { onboardOfflineFarmer, getRegistrarHistory } = require('../controllers/registrarController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Only Government Registrars can use this route
router.post('/onboard', protect, authorize('Registrar'), onboardOfflineFarmer);
router.get('/history', protect, authorize('Registrar'), getRegistrarHistory); // <-- NEW ROUTE

module.exports = router;